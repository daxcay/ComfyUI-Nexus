import logging
import json
import os
import shutil
import datetime
import uuid
from aiohttp import web
from server import PromptServer

from .classes.WebSocketManager import WebSocketManager

DATA_FOLDER = './nexus'

PERMISSIONS_FILE = os.path.join(DATA_FOLDER, 'permissions.json')
ADMINS_FILE = os.path.join(DATA_FOLDER, 'admins.json')
TOKENS_FILE = os.path.join(DATA_FOLDER, 'tokens.json')
NAMES_FILE = os.path.join(DATA_FOLDER, 'names.json')

SERVER_FILE = os.path.join(DATA_FOLDER, 'server.json')
WORKFLOWS_DIR = os.path.join(DATA_FOLDER, 'workflows')

if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

if not os.path.exists(ADMINS_FILE):
    with open(ADMINS_FILE, 'w') as f:
        admins_data = {'epic': 'comfynexus'}
        json.dump(admins_data, f, indent=4)

for file_path in [PERMISSIONS_FILE, ADMINS_FILE, TOKENS_FILE, NAMES_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump({}, f)

if not os.path.exists(WORKFLOWS_DIR):
    os.makedirs(WORKFLOWS_DIR)

if not os.path.exists(SERVER_FILE):
    with open(SERVER_FILE, 'w') as f:
        default_config = {
            "name": "Default Nexus Server",
            "max_user": 15,
            "config": {
                "last_saved_user_id": "id"
            }
        }
        json.dump(default_config, f, indent=4)


if hasattr(PromptServer, 'instance'):
    server = PromptServer.instance
    routes = web.RouteTableDef()
    socket_manager = WebSocketManager()

    async def broadcast_message(message, sender):
        for id, socket in socket_manager.sockets.items():
            if id != sender:
                try:
                    await socket.send_str(json.dumps(message))
                except Exception as e:
                    logging.error(f"[ComfyUI-Nexus]: Error sending message to {id}: {e}")

    async def broadcast_message_except(message, excluder):
        for id, socket in socket_manager.sockets.items():
            if id != excluder:
                try:
                    await socket.send_str(json.dumps(message))
                except Exception as e:
                    logging.error(f"[ComfyUI-Nexus]: Error sending message to {id}: {e}")

    async def broadcast_message_all(message):
        for id, socket in socket_manager.sockets.items():
            try:
                await socket.send_str(json.dumps(message))
            except Exception as e:
                logging.error(f"[ComfyUI-Nexus]: Error sending message to {id}: {e}")

    async def send_message(message, sender, receiver):
        for id, socket in socket_manager.sockets.items():
            if id == receiver and sender != receiver:
                try:
                    await socket.send_str(json.dumps(message))
                except Exception as e:
                    logging.error(f"[ComfyUI-Nexus]: Error sending message to {id}: {e}")

    @routes.get("/nexus")
    async def websocket_handler(request):
        id = request.query.get("id")
        socket = web.WebSocketResponse()
        await socket.prepare(request)

        socket_manager.set(id, socket)
        logging.info(f"[ComfyUI-Nexus]: Socket {id} connected")

        try:
            async for msg in socket:
                if msg.type == web.WSMsgType.TEXT:
                    
                    data = json.loads(msg.data)
                    event_name = data.get('name')
                    event_data = data.get('data')

                    sender = data.get("from")
                    all = data.get('all')
                    receiver = data.get('receiver')
                    exclude = data.get('exclude')

                    # logging.info(f"[ComfyUI-Nexus]: Received {sender} {all} {receiver} {exclude}")
                    
                    if event_name == "chat-join":
                        user_id = data.get("from")
                        user_name = event_data.get("name")

                        with open(NAMES_FILE, 'r+') as f:
                            names = json.load(f)
                            names[user_id] = user_name
                            f.seek(0)
                            json.dump(names, f, indent=4)
                            f.truncate()

                    if event_name == "nick":
                        user_id = data.get("from")
                        user_name = event_data.get("new_name")

                        with open(NAMES_FILE, 'r+') as f:
                            names = json.load(f)
                            names[user_id] = user_name
                            f.seek(0)
                            json.dump(names, f, indent=4)
                            f.truncate()

                    if all:
                        await broadcast_message_all(data)
                    elif receiver:
                        await send_message(data, sender, receiver)
                    elif exclude:
                        await broadcast_message_except(data, exclude)
                    else:
                        await broadcast_message(data, sender)

                elif msg.type == web.WSMsgType.ERROR:
                    logging.error(f"[ComfyUI-Nexus]: WebSocket error: {msg.exception()}")
        except Exception as e:
            logging.error(f"[ComfyUI-Nexus]: WebSocket error: {e}")
        finally:
            logging.info(f"[ComfyUI-Nexus]: Socket {id} disconnected")
            socket_manager.delete(id)

        return socket

    @routes.post("/nexus/workflows")
    async def get_user_specific_workflows(request):

        user_id = (await request.json()).get('user_id')
        if not user_id:
            return web.json_response({'error': 'User ID required'}, status=400)

        with open(PERMISSIONS_FILE, 'r') as f:
            permissions = json.load(f)

        user_permissions = permissions.get(user_id, {})
        if not user_permissions.get('editor', False):
            return web.json_response({'error': 'Forbidden'}, status=403)

        user_workflow_dir = os.path.join(WORKFLOWS_DIR, user_id)
        if not os.path.exists(user_workflow_dir):
            return web.json_response({'error': 'User not found'}, status=404)

        workflows = {}
        for file_name in sorted([f for f in os.listdir(user_workflow_dir) if f.isdigit()], key=int):
            file_path = os.path.join(user_workflow_dir, file_name)
            with open(file_path, 'r') as f:
                workflows[file_name] = json.load(f)

        return web.json_response(workflows)

    @routes.post("/nexus/workflows/meta")
    async def get_user_specific_workflows_meta(request):
 
        user_id = (await request.json()).get('user_id')
        if not user_id:
            return web.json_response({'error': 'User ID required'}, status=400)
        with open(PERMISSIONS_FILE, 'r') as f:
            permissions = json.load(f)

        user_permissions = permissions.get(user_id, {})
        if not user_permissions.get('editor', False):
            return web.json_response({'error': 'Forbidden'}, status=403)

        user_workflow_dir = os.path.join(WORKFLOWS_DIR, user_id)
        if not os.path.exists(user_workflow_dir):
            return web.json_response({'error': 'User not found'}, status=404)

        meta_data = []
        for file_name in sorted([f for f in os.listdir(user_workflow_dir) if f.isdigit()], key=int):
            file_path = os.path.join(user_workflow_dir, file_name)
            last_modified_time = os.path.getmtime(file_path)
            last_modified_readable = datetime.datetime.fromtimestamp(last_modified_time).strftime('%Y-%m-%d %H:%M:%S')

            meta_data.append({
                'file_name': file_name,
                'last_saved': last_modified_readable
            })

        return web.json_response(meta_data)    
    
    @routes.post("/nexus/workflows/{id}")
    async def get_user_specific_workflow(request):
        user_id = (await request.json()).get('user_id')
        workflow_id = request.match_info.get('id')

        if not user_id:
            return web.json_response({'error': 'User ID required'}, status=400)
        if not workflow_id:
            return web.json_response({'error': 'Workflow ID required'}, status=400)

        with open(PERMISSIONS_FILE, 'r') as f:
            permissions = json.load(f)

        user_permissions = permissions.get(user_id, {})
        if not user_permissions.get('editor', False):
            return web.json_response({'error': 'Forbidden'}, status=403)

        user_workflow_dir = os.path.join(WORKFLOWS_DIR, user_id)
        if not os.path.exists(user_workflow_dir):
            return web.json_response({'error': 'User not found'}, status=404)

        workflow_file_path = os.path.join(user_workflow_dir, workflow_id)
        if not os.path.exists(workflow_file_path):
            return web.json_response({'error': 'Workflow not found'}, status=404)

        with open(workflow_file_path, 'r') as f:
            workflow = json.load(f)

        return web.json_response(workflow)

    @routes.post("/nexus/workflow")
    async def post_workflow(request):
        user_id = (await request.json()).get('user_id')
        if not user_id:
            return web.json_response({'error': 'User ID required'}, status=400)

        with open(PERMISSIONS_FILE, 'r') as f:
            permissions = json.load(f)

        user_permissions = permissions.get(user_id, {})
        if not user_permissions.get('editor', False):
            return web.json_response({'error': 'Forbidden'}, status=403)

        new_data = await request.json()

        user_workflow_dir = os.path.join(WORKFLOWS_DIR, user_id)
        if not os.path.exists(user_workflow_dir):
            os.makedirs(user_workflow_dir)

        existing_files = sorted([f for f in os.listdir(user_workflow_dir) if f.isdigit()], key=int)

        if len(existing_files) == 5:
            os.remove(os.path.join(user_workflow_dir, existing_files[0]))
            existing_files.pop(0)

        for i, file_name in enumerate(existing_files):
            new_name = str(i + 1)
            shutil.move(os.path.join(user_workflow_dir, file_name), os.path.join(user_workflow_dir, new_name))

        new_file_path = os.path.join(user_workflow_dir, '5')
        with open(new_file_path, 'w') as f:
            json.dump(new_data, f, indent=4)

        # Update the server.json file with the last saved user_id
        with open(SERVER_FILE, 'r+') as f:
            server_config = json.load(f)
            server_config['config']['last_saved_user_id'] = user_id
            f.seek(0)
            json.dump(server_config, f, indent=4)
            f.truncate()

        return web.json_response({'status': 'success'}, status=200)
    
    @routes.get("/nexus/workflow")
    async def get_latest_workflow(request):
        with open(SERVER_FILE, 'r') as f:
            server_config = json.load(f)
        
        last_saved_user_id = server_config['config'].get('last_saved_user_id')
        if not last_saved_user_id:
            return web.json_response({'error': 'No workflow saved'}, status=404)

        user_workflow_dir = os.path.join(WORKFLOWS_DIR, last_saved_user_id)
        if not os.path.exists(user_workflow_dir):
            return web.json_response({'error': 'User not found'}, status=404)

        last_file_path = os.path.join(user_workflow_dir, '5')
        if not os.path.exists(last_file_path):
            return web.json_response({'error': 'Workflow not found'}, status=404)

        with open(last_file_path, 'r') as f:
            workflow_data = json.load(f)

        return web.json_response(workflow_data)
    
    @routes.get("/nexus/permission/{id}")
    async def get_permission_by_id(request):
        user_id = request.match_info['id']
        with open(PERMISSIONS_FILE, 'r') as f:
            data = json.load(f)
        user_permission = data.get(user_id)
        if user_permission:
            return web.json_response(user_permission)
        else:
            return web.json_response({'error': 'User not found'}, status=404)

    @routes.post("/nexus/permission/{id}")
    async def post_permission_by_id(request):
        user_id = request.match_info['id']
        data = await request.json()
        admin_id = data.get('admin_id')
        if not admin_id:
            return web.json_response({'error': 'Admin ID required'}, status=400)

        token = request.headers.get('Authorization')
        if not token:
            return web.json_response({'error': 'Authorization token required'}, status=400)

        with open(TOKENS_FILE, 'r') as f:
            tokens = json.load(f)

        if tokens.get(token) != admin_id:
            return web.json_response({'error': 'Invalid or expired token'}, status=403)

        new_permission = data.get('data')
        if not new_permission:
            return web.json_response({'error': 'Permission data required'}, status=400)

        with open(PERMISSIONS_FILE, 'r+') as f:
            permissions = json.load(f)

            if not permissions.get(admin_id, {}).get('admin', False):
                return web.json_response({'error': 'Forbidden'}, status=403)

            # Merge the new permissions with the existing ones
            existing_permissions = permissions.get(user_id, {})
            existing_permissions.update(new_permission)

            # Save the updated permissions
            permissions[user_id] = existing_permissions
            f.seek(0)
            json.dump(permissions, f, indent=4)
            f.truncate()

        return web.json_response({'status': 'success'}, status=200)

    @routes.post("/nexus/login")
    async def post_login(request):

        credentials = await request.json()
        user_id = credentials.get('uuid')
        account = credentials.get('account')
        password = credentials.get('password')

        with open(ADMINS_FILE, 'r') as f:
            admins = json.load(f)

        if admins.get(account) == password:
            token = str(uuid.uuid4())

            with open(TOKENS_FILE, 'r+') as f:
                tokens = json.load(f)
                tokens[token] = user_id
                f.seek(0)
                json.dump(tokens, f, indent=4)
                f.truncate()

            with open(PERMISSIONS_FILE, 'r+') as f:
                permissions = json.load(f)
                permissions[user_id] = {'editor': True, 'admin': True}
                f.seek(0)
                json.dump(permissions, f, indent=4)
                f.truncate()

            return web.json_response({'token': token}, status=200)

        else:
            return web.json_response({'error': 'Invalid credentials'}, status=401)

    @routes.post("/nexus/verify")
    async def post_verify(request):
        credentials = await request.json()
        token = credentials.get('token')

        with open(TOKENS_FILE, 'r') as f:
            tokens = json.load(f)

        user_id = tokens.get(token)
        if user_id:
            with open(PERMISSIONS_FILE, 'r') as f:
                permissions = json.load(f)

            user_permissions = permissions.get(user_id, {})
            return web.json_response({'user_id': user_id, 'permissions': user_permissions}, status=200)
        else:
            return web.json_response({'error': 'Invalid token'}, status=401)

    @routes.get("/nexus/name/{id}")
    async def get_name_by_id(request):
        user_id = request.match_info['id']
        with open(NAMES_FILE, 'r') as f:
            names = json.load(f)
        user_name = names.get(user_id)
        if user_name:
            return web.json_response({'name': user_name})
        else:
            return web.json_response({'error': 'User not found'}, status=404)

    server.app.add_routes(routes)

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"