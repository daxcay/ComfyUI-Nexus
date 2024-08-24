![COMFYUI-NEXUS](https://github.com/user-attachments/assets/6548c010-649b-4e6c-8ae1-f05e3f523f31)

# ComfyUI-Nexus

![Version](https://img.shields.io/badge/version-1.0.1-green) ![Last Update](https://img.shields.io/badge/last_update-Aug_2024-green)

A ComfyUI node designed to enable seamless multi-user workflow collaboration. This innovative tool allows teams to work together both locally and remotely, making collaboration a breeze. 

Install and setup this node on a server PC.
Get Url, share and use.
No Need to install comfyui on other PCs. 

![Untitled design (2)](https://github.com/user-attachments/assets/ce10622d-e210-4e13-b226-fde501c2a94b)
<br>

**Features Video**: https://www.youtube.com/watch?v=RnYIUG59oTM
<br>

## Key Features

- **multiuser collaboration**: enable multiple users to work on the same workflow simultaneously.
- **local and remote access**: use tools like ngrok or other tunneling software to facilitate remote collaboration. A local IP address on WiFi will also work 😎.
- **enhanced teamwork**: streamline your team's workflow management and collaboration process.
- **real-time chat**: communicate directly within the platform to ensure smooth and efficient collaboration.
- **spectate mode**: allow team members to observe the workflow in real-time without interfering—perfect for training or monitoring progress.
- **admin permissions**: admins can control who can edit the workflow and who can queue prompts, ensuring the right level of access for each team member.
- **workflow backup**: in case of any mishap, you can reload an old backup. The node saves 5 workflows, each 60 seconds apart.
<br>

> Note: When Opening the Comfyui Workspace for the first time, It will be locked, Login as admin to enable editing. 

## Key Binds

- **activate chat**: press **`t`**
- **show/hide users panel**: press **`LAlt + p`**
- **show/hide backups panel**: press **`LAlt + o`** (for editors only)

## Chat Commands

- `/nick <name>`: changes your nickname
- `/login account password`: this command is used to become admin.
- `/logout`: logout the admin.
<br>

# Installation

- This Node should be only installed/maintained on the Server Hosting PC. 
- **No need** to install this node on Client Side Users.
- Comfy UI is also **NOT NEEDED** to run this on Client Side Users. Only Url will be shared which will connect with the server to run/view comfy.


### Using `comfy-cli`
- `comfy node registry-install ComfyUI-Nexus`
- [Node Registry](https://registry.comfy.org/publishers/daxcay/nodes/comfyui-nexus)

### Manual Method

- Go to your ComfyUI > Custom Nodes folder path > Run CMD
- Copy and paste this command: `git clone https://github.com/daxcay/ComfyUI-Nexus.git`
- Then go inside `ComfyUI-Nexus` with CMD or open a new one.
- Type `pip install -r requirements.txt` to install the dependencies.

### Automatic Method with [Comfy Manager](https://github.com/ltdrdata/ComfyUI-Manager)

- Inside ComfyUI > Click the Manager Button on the side.
- Click `Custom Nodes Manager` and search for `Nexus`, then install this node.

**Restart ComfyUI to make all the necessary first time file before making admin list**
<br>

### Setting Admin and Password

- Open the file `comfyui`> `nexus`>`admins.json` in notepad.

  ![image](https://github.com/user-attachments/assets/9632115f-12dc-4530-9d5b-b51988898c9d)

  ![admins.json example](https://github.com/user-attachments/assets/0159397d-bf1e-436e-a822-b02ca4dec3b1)

- Write any <AccountName> and <password>, but make sure not to use spaces.
- DO NOT SHARE ACCOUNT AND PASSWORD IN PUBLIC. 

  ![admins.json example 2](https://github.com/user-attachments/assets/7ef767b0-ffa0-4bde-8e87-8ab3fc2ba535)

### Save this file and Restart ComfyUI to complete setup.

# Getting Shareable URL

Use Ngrok or any other tunneling software supporting http/https to Host a Global Server. Also you can host locally over wifi/lan.  

### Getting Url Port 
Open Comfyui in your browser:

![image](https://github.com/user-attachments/assets/b430d5b7-dcb9-4a7f-948f-d257147b597a)

In your url tab, Last digits after Colon is your port.   

  
Example:

![image](https://github.com/user-attachments/assets/82ff2d9e-9eb6-4846-97c6-e3e321101fef)

The port for the above url will be **8188**


## Method 1) Remote Access - To Obtain Global Shareable Link

### Ngrok Setup: 

- Go to this https://dashboard.ngrok.com/signup?ref=home-hero to sign up.
- After signing up and logging in, go to this https://dashboard.ngrok.com/get-started/setup/windows to set up ngrok.
- After installing and setting up ngrok,
- Run CMD and enter this command: `ngrok http <port>`

  ![Ngrok Output Example](https://github.com/user-attachments/assets/66f9b4a4-1d63-4756-8d57-64420fdc151a)
  ![Ngrok URL Example](https://github.com/user-attachments/assets/075613e2-d3f0-4a9d-b844-dc06f3c4adf3)

- "Forwarding" is the Remote Url, Share this url with your peers.


## Method 2) Local Wifi/Lan Url: 

### Using Your IP Address to Host Server

- Open a cmd and write `ipconfig`.

  ![ipconfig Example](https://github.com/user-attachments/assets/043f2d9b-eccd-46cb-a333-ec483222b6d4)


- Now copy this address. For example, if it's `http://192.168.1.45:<comfy_port>`, the final URL will be: `http://192.168.1.45:5000`


> Ngrok and WiFi address will change if you restart the machine. Follow above steps again to get the new url.


## Permissions in ComfyUI-Nexus

- **viewer**: default permission given to a person joining.
- **editor**: person having permission to edit the workflow.
- **queue prompt**: person having permission to queue the workflow.
<br>

> Admin has all permissions by default.
<br>

## Real-Time Chat Window

When you join ComfyUI for the first time, you will see this chat window in the top left corner:

![Chat Window Example](https://github.com/user-attachments/assets/9d8be82d-1e76-46e1-b902-ba8248ccbb26)

To chat, press `t`, then write the message and press 'Enter'.

![Chat Message Example](https://github.com/user-attachments/assets/6b908ade-cd01-43d4-831c-6af2c6c461cf)
<br>

### Chat Commands

- `/nick <name>`: changes your nickname
- `/login <account> <password>`: this command is used to become admin.
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

