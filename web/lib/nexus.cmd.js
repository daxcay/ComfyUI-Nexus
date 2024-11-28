import { nexusLogin, nexusVerify, getPermissionById, postPermissionById, getUserSpecificWorkflowsMeta, getUserSpecificWorkflow } from "./nexus.api.js"
import { addChatWindowMessage, inputMain, chatWindow } from "./nexus.chat.js"
import { UserPanel } from "./nexus.panel.js"
import { WorkflowPanel } from "./nexus.workflow.panel.js"

export class NexusCommands {

    constructor(app, api, nexusSocket, color, mouseManger, workflowManager, promptControl) {

        this.color = color

        this.colors = {
            "join": "#ff6e4d",
            "info": "#fba510",
            "personal": "#fba510",
            "name": "#00fa00",
            "none": "#ffffff"
        }

        this.inputMain = inputMain
        this.nexusSocket = nexusSocket

        this.app = app
        this.api = api

        this.workflowManager = workflowManager
        this.promptControl = promptControl
        this.mouseManger = mouseManger

        this.nexusSocket.onConnected.push(this.handleConnect.bind(this))
        this.nexusSocket.onMessageReceive.push(this.handleMessageReceive.bind(this))

        this.inputMain.addEventListener('message', this.handleMessage.bind(this))

        document.addEventListener('keydown', this.handleChatWindow.bind(this));

        this.disableComfyThings = this.disableComfyThings.bind(this);
        this.enableComfyThings = this.enableComfyThings.bind(this);
        this.disableGraphSelectionWithExtremePrejudice = this.disableGraphSelectionWithExtremePrejudice.bind(this);

        this.comfyThings = [
            '#extraOptions',
            '#queue-button',
            '#comfy-save-button',
            '#comfy-file-input',
            '#comfy-clear-button',
            '#comfy-load-default-button',
            '.queue-tab-button.side-bar-button',
            '.queue-tab-button.side-bar-button',
            '#comfy-refresh-button',
            '#queue-front-button',
            '#comfy-view-queue-button',
            '#comfy-view-history-button'
        ];

        chatWindow.childrens[3].softUpdate('#nexus-chat-window', 'pointer-events', 'none')
        chatWindow.show()

        setInterval((chatWindow) => {
            chatWindow.childrens[0].childrens[1].el.textContent = Object.keys(this.nexusSocket.userManager.users).length
        }, 1000, chatWindow);

        this.up = new UserPanel()
        this.up.onCommandReceived = this.onPanelCommandReceived.bind(this)

        this.wp = new WorkflowPanel()
        this.wp.onCommandReceived = this.onWFPanelCommandReceived.bind(this)

        this.spectating = null
        this.lastkey = null

    }

    timeAgo(timeString) {
        const now = new Date(); // current time
        const time = new Date(timeString); // input time
    
        const diff = Math.floor((now - time) / 1000); // difference in seconds
    
        const minutes = Math.floor(diff / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
    
        if (minutes < 1) return "just now";
        if (minutes === 1) return "1 minute ago";
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours === 1) return "1 hour ago";
        if (hours < 24) return `${hours} hours ago`;
        if (days === 1) return "1 day ago";
        
        return `${days} days ago`;
    }

    async verifyLogin() {

        this.disableComfyThings()

        let token = localStorage.getItem('nexus-socket-token');
        if (token) {
            let user = await nexusVerify(token)
            if (user && this.nexusSocket.uuid == user.user_id) {
                this.enableComfyThings()
                this.promptControl.handleControl(true)
                this.promptControl.handleEditor(true)
                this.workflowManager.handleWorkflowEvents(true)
                this.nexusSocket.admin = true
                addChatWindowMessage("", "You are now an admin!", this.color.info, this.colors.personal, true)
                this.workflowManager.saveManager(60)
            }
            else {
                this.promptControl.handleControl(false)
                this.promptControl.handleEditor(false)
                this.workflowManager.handleWorkflowEvents(false)
                this.workflowManager.removeSaveManager()
                addChatWindowMessage("", "You are a viewer!", this.color.info, this.colors.info, true)
            }
        }
        else {

            let permissions = await getPermissionById(this.nexusSocket.uuid)

            if (permissions) {

                let editor = permissions.editor ? permissions.editor : false
                let queue = permissions.queue ? permissions.queue : false

                this.workflowManager.handleWorkflowEvents(editor)

                this.promptControl.handleEditor(editor)
                this.promptControl.handleControl(queue)

                this.nexusSocket.queue = queue
                this.nexusSocket.editor = editor

                if (editor) {
                    this.workflowManager.saveManager(60)
                }
                else {
                    this.workflowManager.removeSaveManager()
                }

                addChatWindowMessage("", `Permission: Workflow Editor ${editor ? "Yes" : "No"} | Queue Prompt ${queue ? "Yes" : "No"} `, this.color.info, this.colors.personal, true)

                if (queue) {
                    addChatWindowMessage("", `You can now queue prompt press CTRL+Enter`, this.color.info, this.colors.personal, true)
                }

            }

        }

        this.workflowManager.loadLatestWorkflow()
    }

    handleConnect() {

        let name = this.nexusSocket.userManager.get(this.nexusSocket.uuid, "name")
        this.nexusSocket.sendMessage('chat-join', { name }, false)
        this.verifyLogin()

    }

    findChildrenAfterHr(parentClass) {
        const parentDiv = document.querySelector(`.${parentClass}`);
        const childElementsAfterHr = [];
        if (parentDiv) {
            const hr = parentDiv.querySelector('hr');
            if (hr) {
                let sibling = hr.nextElementSibling;
                while (sibling) {
                    childElementsAfterHr.push(sibling);
                    sibling = sibling.nextElementSibling;
                }
            }
        }
        return childElementsAfterHr;
    }

    disableGraphSelectionWithExtremePrejudice() {
        if (!this.nexusSocket.admin && !this.nexusSocket.editor) {
            if (this.app.graph && this.app.graph.list_of_graphcanvas && this.app.graph.list_of_graphcanvas.length > 0) {
                this.app.graph.list_of_graphcanvas[0].deselectAllNodes()
            }
        }
    }

    disableComfyThings() {

        this.comfyThings.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                element.disabled = true;
                element.style.pointerEvents = 'none';
            });
        });

        document.querySelectorAll('.comfy-settings-btn').forEach(button => {
            button.disabled = true;
            button.style.pointerEvents = 'none';
        });

        const children = this.findChildrenAfterHr('comfy-menu');

        children.forEach(element => {
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.disabled = true;
            }
        });

        document.querySelector(`.comfy-menu`).style.display = 'none';
        document.querySelector(`.comfy-menu`).style.pointerEvents = 'none';


        clearInterval(this.disableComfyThingsTimer)

        this.disableComfyThingsTimer = setInterval(() => {


            this.comfyThings.forEach((selector) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element) => {
                    element.disabled = true;
                    element.style.pointerEvents = 'none';
                });
            });

            document.querySelectorAll('.comfy-settings-btn').forEach(button => {
                button.disabled = true;
                button.style.pointerEvents = 'none';
            });

            const children = this.findChildrenAfterHr('comfy-menu');

            children.forEach(element => {
                if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                    element.disabled = true;
                }
            });

            document.querySelector(`.comfy-menu`).style.display = 'none';
            document.querySelector(`.comfy-menu`).style.pointerEvents = 'none';

            this.promptControl.handleEditor(this.nexusSocket.editor ? this.nexusSocket.editor : false)
            this.promptControl.handleControl(this.nexusSocket.queue ? this.nexusSocket.queue : false)

        }, 500);

        this.disableGraphSelectionWithExtremePrejudiceTimer = setInterval(this.disableGraphSelectionWithExtremePrejudice, 50)

    }

    enableComfyThings() {

        clearInterval(this.disableComfyThingsTimer)
        clearInterval(this.disableGraphSelectionWithExtremePrejudiceTimer)

        this.comfyThings.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                element.disabled = false;
                element.style.pointerEvents = 'all';
            });
        });

        document.querySelectorAll('.comfy-settings-btn').forEach(button => {
            button.disabled = false;
            button.style.pointerEvents = 'all';
        });

        const children = this.findChildrenAfterHr('comfy-menu');

        children.forEach(element => {
            if (element.tagName === 'BUTTON' || element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                element.disabled = false;
            }
        });

        document.querySelector(`.comfy-menu`).style.display = 'flex';
        document.querySelector(`.comfy-menu`).style.pointerEvents = 'all';

    }


    handleChatWindow(event) {

        let key = event.key
        let label = inputMain.childrens[0]
        let input = inputMain.childrens[1]

        let active = {
            tag: document.activeElement.tagName,
            el: document.activeElement,
            chat: document.activeElement == input.el
        }

        function activateChat() {
            let allowedTags = ['INPUT', 'TEXTAREA']
            if (!allowedTags.includes(active.tag) && input.visible == false) {
                event.preventDefault();
                label.show()
                input.show()
                input.el.focus()
                input.el.value = ""
                input.focusTimer = setInterval((parent, input) => {
                    if (document.activeElement != input && parent.visible == true)
                        input.focus()
                }, 500, input, input.el);
                chatWindow.childrens[3].softUpdate('#nexus-chat-window', 'pointer-events', 'all')
            }
        }

        function deactivateChat() {
            if (!active.chat) return;
            label.hide()
            input.el.blur();
            input.el.value = ""
            input.hide()
            clearTimeout(input.focusTimer)
            chatWindow.childrens[3].softUpdate('#nexus-chat-window', 'pointer-events', 'none')
        }

        function sendMessage() {
            if (!active.chat) return;
            let message = input.el.value
            inputMain.dispatchEvent(new CustomEvent('message', { detail: { message } }))
            deactivateChat()
        }

        switch (key) {
            case 't':
            case 'T':
                activateChat()
                this.togglePlayerTab(true)
                this.toggleWFTab(true)
                break;
            case 'Escape':
                deactivateChat()
                break;
            case 'Enter':
                sendMessage()
                break;
            case 'p':
            case 'P':
                if (event.altKey && event.shiftKey) {
                    if (!active.chat)
                        this.togglePlayerTab()
                }
                break;
            case 'o':
            case 'O':
                if (event.altKey && event.shiftKey) {
                    if (!active.chat)
                        this.toggleWFTab()
                }
                break;

        }

        return active
    }

    toggleWFTab(forceHide, forceReload) {
        if (this.nexusSocket.admin || this.nexusSocket.editor) {

            if (forceHide) {
                this.wp.active = 0
                this.wp.panel.hide()
            } else if (forceReload) {
                this.prepareWFPanel()
            }
            else {
                if (this.wp.active == 0) {
                    this.wp.active = 1
                    this.wp.panel.show()
                    this.prepareWFPanel()
                } else if (this.wp.active == 1) {
                    this.wp.active = 0
                    this.wp.panel.hide()
                }
            }

            if (this.wp.active == 1) {
                this.workflowManager.removeSaveManager()
            }
            else {
                this.workflowManager.saveManager(this.workflowManager.saveTime || 60)
            }

        }
    }

    togglePlayerTab(forceHide, forceReload) {

        if (forceHide) {
            this.up.active = 0
            this.up.panel.hide()
        } else if (forceReload) {
            this.preparePanel(this.nexusSocket.admin)
        } else {
            if (this.up.active == 0) {
                this.up.active = 1
                this.up.panel.show()
                this.preparePanel(this.nexusSocket.admin)
            } else if (this.up.active == 1) {
                this.up.active = 0
                this.up.panel.hide()
            }
        }

    }

    async onWFPanelCommandReceived(kind, label, data, active) {

        switch (kind) {
            case 'button':
                if (label == "load") {
                    let wfid = data // workflowid is data 
                    let wf = await getUserSpecificWorkflow(this.nexusSocket.uuid, wfid)
                    if (wf) {
                        wf.clear = true
                        let message = {
                            name: "workflow",
                            from: this.nexusSocket.uuid,
                            data: { workflow: wf }
                        }
                        this.nexusSocket.onMessageReceive.forEach(f => { f(message); });
                        if (this.nexusSocket.admin) {
                            this.nexusSocket.sendMessage('workflow', { workflow: wf }, false)
                        }
                    }
                }
                break;
        }

    }

    async onPanelCommandReceived(kind, label, data, active) {

        switch (kind) {
            case 'button':
                if (label == "spectate") {
                    this.nexusSocket.sendMessage("spectate", { on: active, receiver: data }, false)
                    if (active == 1) {
                        this.spectating = data // userid is data 
                    }
                    else {
                        this.spectating = null
                    }
                } else if (label == "editor") {
                    if (this.nexusSocket.admin) {
                        let token = localStorage.getItem('nexus-socket-token');
                        await postPermissionById(data, this.nexusSocket.uuid, { editor: active ? true : false }, token) // userid is data                         
                        this.nexusSocket.sendMessage("permission", { receiver: data }, false)
                    }
                } else if (label == "queue") {
                    if (this.nexusSocket.admin) {
                        let token = localStorage.getItem('nexus-socket-token');
                        await postPermissionById(data, this.nexusSocket.uuid, { queue: active ? true : false }, token) // userid is data                         
                        this.nexusSocket.sendMessage("permission", { receiver: data }, false)
                    }
                }
                else if (label == "mouse") {
                    this.nexusSocket.sendMessage("mouse_view_toggle", { on: active, receiver: data }, false)
                    this.nexusSocket.userManager.set(data, 'hide_mouse', active)
                }
                break;
        }

    }

    async prepareWFPanel() {

        const columns = ['Name', 'Created', 'Action'];

        this.wp.addColumnsToPanel(columns);

        let meta = await getUserSpecificWorkflowsMeta(this.nexusSocket.uuid)

        const rows = [];
        const callbacks = [];
        const values = [];
        const data = [];

        for (let id = 0; id < meta.length; id++) {

            const file = meta[id];

            let fn = file.file_name + ""

            let name = (fn.includes('lt') ? 'Long Term ' : 'Short Term ')
            // let time = file.last_saved.split(':')
            // time = time.join("|")

            // console.log(time)
            let time = this.timeAgo(file.last_saved)

            rows.push([name, time, 'button:load'])
            callbacks.push([null, null, this.wp.onclick])
            values.push([null, null, '0'])
            data.push([null, null, file.file_name])

        }

        this.wp.addRowsToPanel(rows, callbacks, values, data);
    }

    async preparePanel(admin) {

        const columns = ['Name', 'Actions', 'Online'];
        this.up.addColumnsToPanel(columns);

        const users = this.nexusSocket.userManager.users;
        const usersIds = Object.keys(users);

        const rows = [];
        const callbacks = [];
        const values = [];
        const data = [];

        for (const id of usersIds) {

            const user = users[id];
            const name = id === this.nexusSocket.uuid ? `${user.name} (You)` : user.name;
            const self = id === this.nexusSocket.uuid;

            const status = user.status === "online" || self ? '🟢' : '🔴';
            const hide_mouse = user.hide_mouse ? 0 : 1;
            const permissions = await getPermissionById(id);
            const spectating = id == this.spectating ? 1 : 0

            callbacks.push([null, self ? 'none' : this.up.onclick, null]);

            let powers = 'button:spectate,button:editor,button:queue,button:mouse'

            if (!admin) {
                powers = 'button:spectate,button:mouse'
            }

            rows.push([name, self ? 'button:none' : powers, status]);

            let row_values = `${spectating},${permissions.editor ? 1 : 0},${permissions.queue ? 1 : 0},${hide_mouse}`
            if (!admin) {
                row_values = `${spectating},${hide_mouse}`
            }

            values.push([null, row_values, null]);

            let row_data = `${id},${id},${id},${id}`
            if (!admin) {
                row_data = `${id},${id}`
            }

            data.push([null, row_data, null]);

        }

        this.up.addRowsToPanel(rows, callbacks, values, data);
    }

    handleMessageReceive(message) {

        let name = message.name;
        let from = message.from;
        let data = message.data

        // console.log(name, data, from)

        if (name == "chat") {

            let user_name = this.nexusSocket.userManager.get(from, "name") || "User";
            let mouse = this.nexusSocket.userManager.get(from, "mouse") || "#0f0";
            let message = data.message
            addChatWindowMessage(user_name, message, mouse[3], this.colors.none)

        } else if (name == "nick") {

            let old_name = data.old_name
            let new_name = data.new_name

            addChatWindowMessage(old_name + " is now known as ", new_name, this.colors.personal, this.colors.personal, true)
            this.nexusSocket.userManager.set(from, "name", new_name)

        } else if (name == "chat-join") {

            let name = data.name
            addChatWindowMessage(name + " joined the server", "", this.colors.personal, this.colors.personal, true)
            this.nexusSocket.userManager.set(from, "name", name)

            name = this.nexusSocket.userManager.get(this.nexusSocket.uuid, "name")
            this.nexusSocket.sendMessage('name', { name }, false)

            if (this.up.active) {
                this.togglePlayerTab(false, true)
            }

        } else if (name == "name") {

            let name = data.name
            this.nexusSocket.userManager.set(from, "name", name)
            //console.log("Received name:", name)

            if (this.up.active) {
                this.togglePlayerTab(false, true)
            }

        } else if (name == 'afk' || name == 'online') {

            this.nexusSocket.userManager.set(from, "status", name)

            if (this.up.active) {
                this.togglePlayerTab(false, true)
            }

        } else if (name == 'permission') {


            // window.location.reload()

            this.verifyLogin()

            if (this.up.active) {
                this.togglePlayerTab(false, true)
            }

        }

    }

    async handleMessage(evt) {

        let message = evt.detail.message
        message = this.cleanMessage(message)

        if (message) {

            let startsWithCommand = this.startsWithCommand(message)

            if (startsWithCommand) {
                let parts = this.extractCommandAndValue(message)
                let cmds = { 'nick': true, 'login': true, 'logout': true }
                let cmd = parts.command
                let values = parts.values

                if (cmds[cmd]) {
                    switch (cmd) {
                        case 'nick':
                            let new_name = this.cleanMessage(values[0], 16)
                            let old_name = this.nexusSocket.userManager.get(this.nexusSocket.uuid, "name") || "User"
                            if (!new_name) {
                                addChatWindowMessage("", "Name is invalid", this.colors.info, this.colors.info, true)
                            }
                            else {
                                localStorage.setItem('nexus-socket-name', new_name);
                                this.nexusSocket.sendMessage('nick', { old_name, new_name })
                            }
                            break;
                        case 'login':

                            let account = this.cleanMessage(values[0], 16)
                            let password = this.cleanMessage(values[1], 16)
                            let uuid = this.nexusSocket.uuid
                            let token = await nexusLogin(uuid, account, password)
                            if (token) {
                                localStorage.setItem('nexus-socket-token', token.token);
                                // addChatWindowMessage("", "You are now an admin!", this.color.info, this.colors.info, true)
                                this.verifyLogin()
                                // window.location.reload()
                            }
                            else {
                                addChatWindowMessage("", "Admin account/password invalid!", this.color.info, this.colors.info, true)
                            }
                            break;
                        case 'logout':
                            let usertoken = localStorage.getItem('nexus-socket-token')
                            if (this.nexusSocket.admin) {
                                await postPermissionById(this.nexusSocket.uuid, this.nexusSocket.uuid, { admin: false, queue: false, editor: false }, usertoken)
                                localStorage.removeItem('nexus-socket-token');
                                window.location.reload()
                            }
                            break;

                        default:
                            break;
                    }
                }

            }
            else {
                addChatWindowMessage("You", message, this.color, this.colors.none)
                this.nexusSocket.sendMessage('chat', { message }, false)
            }

        }

    }

    cleanMessage(message, length = 512) {
        message = message.substr(0, length);
        if (message.length === 0) {
            return null;
        } else {
            let msg = "";
            const nonAsciiRe = /[^\x00-\x7F]/;
            const emojiRe = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/u;
            const htmlTagRe = /<\/?[^>]+(>|$)/g;
            message = message.replace(htmlTagRe, '');
            for (let char of message) {
                if (!(nonAsciiRe.test(char) && !emojiRe.test(char))) {
                    msg += char;
                }
            }
            return msg;
        }
    }

    startsWithCommand(str) {
        const commandPattern = /^\/\w+(\s+\S+)?/;
        return commandPattern.test(str);
    }

    extractCommandAndValue(str) {
        const commandPattern = /^\/(\w+)\s*(.*)/;
        const match = str.match(commandPattern);
        if (match) {
            const command = match[1];
            const values = match[2].trim() ? match[2].split(/\s+/) : [];
            return {
                command,
                values
            };
        } else {
            return null;
        }
    }


} 