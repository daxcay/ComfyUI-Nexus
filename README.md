![COMFYUI-NEXUS](https://github.com/user-attachments/assets/6548c010-649b-4e6c-8ae1-f05e3f523f31)

# ComfyUI-Nexus

![Version](https://img.shields.io/badge/version-1.0.1-green) ![Last Update](https://img.shields.io/badge/last_update-Aug_2024-green)

A ComfyUI node designed to enable seamless multi-user workflow collaboration. This innovative tool allows teams to work together both locally and remotely, making collaboration a breeze.

![Untitled design](https://github.com/user-attachments/assets/e92d9476-7683-43cb-9100-c8e6050a776f)

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

## Key Binds

- **activate chat**: press **`t`**
- **show/hide users panel**: press **`LAlt + p`**
- **show/hide backups panel**: press **`LAlt + o`** (for editors only)

## Chat Commands

- `/nick <name>`: changes your nickname
- `/login account password`: this command is used to become admin.
- `/logout`: logout the admin.
<br>

## Installation

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

### Restart ComfyUI, and it should be good to go.
<br>

## One-Time Setup

> **Note**: Only for someone hosting the ComfyUI server.

### Setting Admin Password

- Go to the `comfyui` folder > `nexus` folder > open `admins.json` in notepad.

  ![image](https://github.com/user-attachments/assets/9632115f-12dc-4530-9d5b-b51988898c9d)

  ![admins.json example](https://github.com/user-attachments/assets/0159397d-bf1e-436e-a822-b02ca4dec3b1)

- Write any account name and password, but make sure not to use spaces.

  ![admins.json example 2](https://github.com/user-attachments/assets/7ef767b0-ffa0-4bde-8e87-8ab3fc2ba535)

### Restart ComfyUI, and it should be good to go.

### Using Ngrok to Host Server

- Go to this [link](https://dashboard.ngrok.com/signup?ref=home-hero) to sign up.
- After signing up and logging in, go to this [link](https://dashboard.ngrok.com/get-started/setup/windows) to set up ngrok.
- After installing and setting up ngrok, just run this command: `ngrok http <your_comfy_url_port>`

  ![Ngrok Setup Example](https://github.com/user-attachments/assets/c3b33d6c-5be5-4200-b9e3-df433b420e34)
  ![Ngrok Output Example](https://github.com/user-attachments/assets/66f9b4a4-1d63-4756-8d57-64420fdc151a)
  ![Ngrok URL Example](https://github.com/user-attachments/assets/075613e2-d3f0-4a9d-b844-dc06f3c4adf3)

- Share this with your brother or friends for collaboration.

### Using Your IP Address to Host Server

- Open a cmd and write `ipconfig`.

  ![ipconfig Example](https://github.com/user-attachments/assets/043f2d9b-eccd-46cb-a333-ec483222b6d4)

- Now copy this address. For example, if it's `http://192.168.1.45:<comfy_port>`, the final URL will be: `http://192.168.1.45:5000`
- Share this with your brother or friends for collaboration.

> Ngrok and WiFi address will change if you restart the machine or application. so follow above steps if somthing goes wrong.
<br>

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
- `/login account password`: this command is used to become admin.
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

- **editor**: give/revoke editor permission to/from that user. Anyone with this permission can edit the workflow.
- **queue**: give/revoke queue permission to/from that user. Anyone with this permission can queue the workflow.
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

# Contact and Support

### Support My Mission:

By becoming a Patron, you'll gain exclusive benefits, including:

- Early Access: Get early access to development releases and resources.
- Feature Voting: Participate in polls to guide my development.
- Exclusive Perks: Receive a special role in our Discord Server.

Join me in my goal of creating a more robust and intuitive AI collaboration experience for everyone. Your support will help drive innovation and improve the ComfyUI ecosystem.

### Daxton Caylor - ComfyUI Node Developer 

  - ### Contact
     - **Email** - daxtoncaylor@gmail.com
     - **Discord** - daxtoncaylor
     - **DiscordServer**: https://discord.gg/Z44Zjpurjp
    
  - ### Support
     - **Patreon**: [link](https://patreon.com/daxtoncaylor)
     - **Reddit**: [link](https://www.reddit.com/user/daxtoncaylor)
     - **Buy me a coffee**: https://buymeacoffee.com/daxtoncaylor
     - **Support me on paypal**: https://paypal.me/daxtoncaylor

