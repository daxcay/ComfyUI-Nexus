import { NexusSocket } from "./lib/nexus.sockets.js";
import { NexusMouseManager } from "./lib/nexus.mouse.js";
import { NexusWorkflowManager } from "./lib/nexus.workflow.js";
import { NexusPromptControl } from "./lib/nexus.comfy.js";
import { NexusCommands } from "./lib/nexus.cmd.js";

let app = window.comfyAPI.app.app;
let api = window.comfyAPI.api.api;
let nexusSocket = new NexusSocket()

let nexus = {
    name: "ComfyUI-Nexus",
    async setup(app) {
        app = app
        let mouseManager = new NexusMouseManager(nexusSocket, app, 10)
        let workflowManager = new NexusWorkflowManager(app, api, nexusSocket)
        let nexusPromptControl = new NexusPromptControl(api, app, nexusSocket)
        new NexusCommands(app, api, nexusSocket, mouseManager.color, mouseManager, workflowManager, nexusPromptControl)
        nexusSocket.connect()        
    },
    async beforeConfigureGraph() {
    }
}

app.registerExtension(nexus);