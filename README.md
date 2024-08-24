![COMFYUI-NEXUS](https://github.com/user-attachments/assets/93fc7c46-a0b6-417a-a6a2-89ff81430079)

# ComfyUI-Nexus

![image](https://img.shields.io/badge/version-1.0.1-green) ![image](https://img.shields.io/badge/last_update-Aug_2024-green)

A ComfyUI node designed to enable seamless multiuser workflow collaboration. This innovative tool allows teams to work together both locally and remotely, making collaboration a breeze.

### Key Features:

  - **Multiuser Collaboration**: Enable multiple users to work on the same workflow simultaneously.
  - **Local and Remote Access**: Use tools like ngrok or other tunneling software to facilitate remote collaboration. A local IP address on WiFi will also work 😎.
  - **Enhanced Teamwork**: Streamline your team's workflow management and collaboration process.
  - **Real-Time Chat**: Communicate directly within the platform to ensure smooth and efficient collaboration.
  - **Spectate Mode**: Allow team members to observe the workflow in real-time without interfering, perfect for training or monitoring progress.
  - **Admin Permissions**: Admins can control who can edit the workflow and who can queue prompts, ensuring the right level of access for each team member.
  - **Workflow backup**: I case of mishap you can reload a old backup. the node save 5 workflow 60 seconds apart.
<br>

## Installation

#### Using `comfy-cli` (https://github.com/yoland68/comfy-cli)
  - `comfy node registry-install ComfyUI-Nexus`
  - https://registry.comfy.org/publishers/daxcay/nodes/comfyui-nexus
  
#### Manual Method
  - Go to your Comfyui > Custom Nodes folder path > Run CMD
  - Copy and Paste this command git clone ```https://github.com/daxcay/ComfyUI-Nexus.git```
  - Then go inside ComfyUI-Nexus with cmd or open new.
  - type ```pip install -r requirements.txt``` to install the dependencies

#### Automatic Method with [Comfy Manager](https://github.com/ltdrdata/ComfyUI-Manager)
  - Inside ComfyUI > Click Manager Button on Side.
  - Click `Custom Nodes Manager` and  Search for `Nexus` and Install this node:    

#### Restart ComfyUI and it should be good to go

<br>

## First Time Setup

> **Note**: Only for someone hosting the comfy server.

#### Setting admin password
  - Go to comfyui folder > **nexus** folder > admins.json
    
![Account(no spaces)](https://github.com/user-attachments/assets/0159397d-bf1e-436e-a822-b02ca4dec3b1)  

  - Write any account name and password but make sure to not have spaces.

#### Restart ComfyUI and it should be good to go

#### Using Ngrok to host server
  - Go to this link: https://dashboard.ngrok.com/signup?ref=home-hero
  - After signup and login go to this link: https://dashboard.ngrok.com/get-started/setup/windows
  - After installing and setup of ngrok just run this command: `ngrok http <your_comfy_url_port>`

![image](https://github.com/user-attachments/assets/c3b33d6c-5be5-4200-b9e3-df433b420e34)

![image](https://github.com/user-attachments/assets/66f9b4a4-1d63-4756-8d57-64420fdc151a)

![image](https://github.com/user-attachments/assets/075613e2-d3f0-4a9d-b844-dc06f3c4adf3)

  - Share this with your brother or friends in colloboration.
  - I will attach a setup video soon.

#### Using your local ip address

  - Open a cmd and write `ipconfig`

![image](https://github.com/user-attachments/assets/043f2d9b-eccd-46cb-a333-ec483222b6d4)

  - Now copy this address like in my case its `http://192.168.1.45:<comfy_port>` so final url will be: `http://192.168.1.45:5000` 
  - Share this with your brother or friends in colloboration.

#### Ngrok and WiFi address will change if you restart the machine or application itself. 

## Permissions in ComfyUI-Nexus

  - **Viewer**: Default permission given to person joining.
  - **Editor**: Person having permission to edit the workflow
  - **Queue Prompt**: Person having permission to queue the workflow

## Chat Window




