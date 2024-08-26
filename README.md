
![COMFYUI-NEXUS](https://github.com/user-attachments/assets/6548c010-649b-4e6c-8ae1-f05e3f523f31)

# ComfyUI-Nexus

![Version](https://img.shields.io/badge/version-1.0.1-green) ![Last Update](https://img.shields.io/badge/last_update-Aug_2024-green)

A ComfyUI node designed to enable seamless multi-user workflow collaboration.

![Untitled design (2)](https://github.com/user-attachments/assets/1d1f4b2b-0999-461e-b43c-719d107c54df)

**Features Video**: Coming Soon

<br>

# Important Notes

<br>

- **Install/Maintain on Server Only**: This node should only be installed on the server machine.
- **No Installation Needed for Others**: Other users don’t need to install this node.
- **URL for Connection**: Other users only need the URL to connect locally/remotely.

- **Security**:
  - ComfyUI menu and features are for admins only.
  - ComfyUI shortcuts are for admins only.
  - Prompt Queue shortcut `CTRL+Enter` is for users with queue permission only.

- **Editor Permissions**:
  - Editors can only edit the graph (create/update/delete/move).
  - If an editor has queue permission, they can queue prompts in the workflow.

- **All Admin Server (not recommended)**:
  - One can create a server with all admins to resolve permission issues.
  - Refer to the `Admin Account Setup` section for more details.

<br>

> [!WARNING]
> When opening the ComfyUI workspace for the first time, it will be locked. Login as admin to enable editing.

> [!WARNING]
> Move or disable the ComfyUI-Nexus nodes from the custom nodes folder if you want to return to your normal ComfyUI setup.

<br>

> [!CAUTION]
> Enable the old `litegraph(legacy)` node search box. (New node search box is under development and has bugs)

![Untitled design (4)](https://github.com/user-attachments/assets/336a29e8-f6fb-4730-bd6d-f6b94947941b)


## Disabling ComfyUI-Nexus

<br>

  - Stop ComfyUI and go to `ComfyUI\custom_nodes` folder
  - Rename `ComfyUI-Nexus` like this `ComfyUI-Nexus.disabled` to disable.
  - Restart ComfyUI again.

<br>

## Key Features

<br>

- **Multiuser collaboration**: enable multiple users to work on the same workflow simultaneously.
- **Local and Remote access**: use tools like ngrok or other tunneling software to facilitate remote collaboration. A local IP address on WiFi will also work 😎.
- **Enhanced teamwork**: streamline your team's workflow management and collaboration process.
- **Real-time chat**: communicate directly within the platform to ensure smooth and efficient collaboration.
- **Spectate mode**: allow team members to observe the workflow in real-time without interfering—perfect for training or monitoring progress.
- **Admin permissions**: admins can control who can edit the workflow and who can queue prompts, ensuring the right level of access for each team member.
- **Workflow backup**: in case of any mishap, you can reload an old backup. The node saves 5 workflows, each 60 seconds apart.

<br>

## Key Binds

- **Activate chat**: press **`t`**
- **Show/hide users panel**: press **`LAlt + p`**
- **Show/hide backups panel**: press **`LAlt + o`** (for user with editor permission only)
- **Queue promt**: press **`CTRL+Enter`** (for user with queue permission only)

<br>

## Chat Commands

- `/nick <name>`: changes your nickname
- `/login account password`: this command is used to become admin.
- `/logout`: logout the admin.

<br>

# Node Installation

  - ### Installing Using `comfy-cli`
    - `comfy node registry-install ComfyUI-Nexus`
    - https://registry.comfy.org/publishers/daxcay/nodes/comfyui-nexus
  
  - ### Manual Method
    - Go to your `ComfyUI\custom_nodes` and Run CMD.
    - Copy and paste this command: `git clone https://github.com/daxcay/ComfyUI-Nexus.git`
  
  - ### Automatic Method with [Comfy Manager](https://github.com/ltdrdata/ComfyUI-Manager)
    - Inside ComfyUI > Click the Manager Button on the side.
    - Click `Custom Nodes Manager` and search for `ComfyUI-Nexus`, then install this node.
  
  <br>
  
  >[!IMPORTANT]
  > #### **Restart ComfyUI  before proceeding to next step**

<br>

# Server Setup

  <br>
  
  ### Knowing ComfyUI Port 
  
  - Open Comfyui in your browser:
  
    ![image](https://github.com/user-attachments/assets/b430d5b7-dcb9-4a7f-948f-d257147b597a)
  
  - In your url tab, digits after colon (:) is your port.   
  
    **Example:**
  
    ![image](https://github.com/user-attachments/assets/82ff2d9e-9eb6-4846-97c6-e3e321101fef)
  
    The port for the above URL will be **8188**
  
  <br>

  ### Admin Account Setup
  
  - Open the file `ComfyUI\nexus\admins.json` in notepad.
  
    ![image](https://github.com/user-attachments/assets/2c0f3e6b-8bea-4378-8390-1bb377514e0c)
  
  - **"epic"** is the account name and **"comfynexus"** is password 
  - Replace account and password with your own liking, but make sure not to use spaces.

  ### More than 1 Admin Account Setup
  
  - Open the file `ComfyUI\nexus\admins.json` in notepad. add another account(s) and password(s) like this.
    
    ![image](https://github.com/user-attachments/assets/35461ce1-b1a6-4ddb-8333-5dcf7d6acf55)
    
  - Make sure every password is different, and make sure not to use spaces.
      
  <br>
  
  >[!IMPORTANT]
  >Don't leave the password as "comfynexus" as anyone can login.
  
  >[!NOTE]
  >**DO NOT SHARE ACCOUNT AND PASSWORD IN PUBLIC** 
  
  >[!IMPORTANT]
  > #### Save file and **Restart ComfyUI before proceeding to next step**

<br>

# Hosting Setup

  - One can use Ngrok or any other tunneling software supporting http/https to host a comfyui server remotely. 
  - Also you can host locally over WiFi/Lan. 

  ### Using Ngrok: 
  
  - Go to this https://dashboard.ngrok.com/signup?ref=home-hero to sign up.
  - After signing up and logging in, go to this https://dashboard.ngrok.com/get-started/setup/windows to set up ngrok.
  - After installing and setting up ngrok,
  - Run CMD and enter this command: `ngrok http <port>`
  
   ![Ngrok Output Example](https://github.com/user-attachments/assets/66f9b4a4-1d63-4756-8d57-64420fdc151a)
   ![image](https://github.com/user-attachments/assets/e3ca3d23-a388-4879-8b45-23591a05833c)

  - **Forwarding** is the Remote URL, Share this URL with your peers.
  
  <br>
  
  ### Using Local IP
  
  - Open a cmd and write `ipconfig`.
  
   ![image](https://github.com/user-attachments/assets/56c4c17d-b1dc-40e1-acbc-1e62e8e15b70)
  
  - Now copy IPv4 address ad add comfy port to it. For example, if it's `http://192.168.1.45:<comfy_port>`, the final URL will be: `http://192.168.1.45:5000`
  - Share this URL with your peers.
  
  <br>
  
  >[!NOTE]
  > **Ngrok and WiFi address might change if you restart the machine. Follow above steps again to get the new URL.**
  
  <br>

## Permissions in ComfyUI-Nexus

- **viewer**: default permission given to a person joining the server.
- **editor**: person having editor permission cad edit the workflow.
- **queue prompt**: person having queue permission can queue the workflow.
<br>

>[!NOTE]
> Admin has all permissions by default.

<br>

## Real-Time Chat Window

When you join ComfyUI for the first time, you will see this chat window in the top left corner:

![Chat Message Example](https://github.com/user-attachments/assets/6b908ade-cd01-43d4-831c-6af2c6c461cf)

<br>

To chat, press `t`, then write the message and press 'Enter'.

<br>

### Chat Commands

- `/nick <name>`: changes your nickname
- `/login <account> <password>`: this command is used to become admin. **( account name and password saved in `admins.json` above )**
- `/logout`: logout the admin.

<br>

## User Panel

To show/hide the user panel, press `LAlt + p`.

**For users, the user panel will look like this:**

![User Panel Example](https://github.com/user-attachments/assets/eae8791c-40a8-48d6-b72d-f4f7875d1653)

Users can perform the following actions on a joined user:

![image](https://github.com/user-attachments/assets/94ae776c-b96e-4d3e-8cc3-f01ec9cb4ee2) 

- **mouse**: show/hide the mouse of other players.
- **spectate**: enable/disable spectate mode. Main use case: when you want to see or learn something from another user.

**For admins, the user panel will look like this:**

![Admin Panel Example](https://github.com/user-attachments/assets/0ce11918-4890-4202-a2d0-2df6f3a1fae0)

Admins can perform the following actions on a joined user:

![Admin Panel Actions Example](https://github.com/user-attachments/assets/ff147ca6-a51c-4eea-9e87-6c8db6322311)

- **spectate**: enable/disable spectate mode. Main use case: when you want to see or learn something from another user.
- **editor**: give/revoke editor permission to/from that user. Anyone with this permission can edit the workflow.
- **queue**: give/revoke queue permission to/from that user. Anyone with this permission can queue the workflow.
- **mouse**: show/hide the mouse of other players.

<br>

## Backup Panel (For Admins and Editors Only)

To show/hide the backup panel, press `LAlt + o`.

**The backup panel looks like this:**

![Backup Panel Example](https://github.com/user-attachments/assets/27af5386-b848-4081-a88d-e8d4967a72f0)

- **load**: load the backup on ComfyUI. If the admin presses it, it will load for all users.

> Backups are saved 60 seconds apart. To load a workflow dragged by an admin, the admin will have to wait 60 seconds to let the server make a backup, then load it for all users.

<br>

## Future Updates

- Based on feedback, I will add/update features.
- Multi-room collaboration.
- Users can set their own color for names and mouse cursors.

<br>

### Daxton Caylor - ComfyUI Node Developer 

  - ### Contact
     - **Email** - daxtoncaylor+Github@gmail.com
     - **Discord Server**: https://discord.gg/Z44Zjpurjp
    
  - ### Support
     - **Patreon**: https://patreon.com/daxtoncaylor
     - **Buy me a coffee**: https://buymeacoffee.com/daxtoncaylor


