import "./nexus.litegraph.js"
import { postWorkflow, postBackupWorkflow, getLatestWorkflow } from "./nexus.api.js";

export class NexusWorkflowManager {

    constructor(app, api, nexusSocket) {

        this.app = app;
        this.api = api;

        this.nexusSocket = nexusSocket;
        this.nexusSocket.onMessageReceive.push(this.handleMessageReceive.bind(this))

        this.init()

        this.spectators = []
        this.saveTime = 0
        setInterval(this.handleSpectators.bind(this), 1000 / 24) // 24 fps

    }

    async init() {
        let workflow = (await this.app.graphToPrompt()).workflow;
        await postBackupWorkflow(this.nexusSocket.uuid, workflow)
        this.app.graph.clear()
    }

    removeSaveManager() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer)
        }
        // document.removeEventListener("visibilitychange", this.handleSaveWorkflowManager.bind(this))
    }

    async saveManager(time) {
        if (this.nexusSocket.admin) {
            this.nexusSocket.sendMessage('workflow:timer', { time: time - 2 }, false)
        }
        this.removeSaveManager()
        this.saveTime = time
        this.saveTimer = setInterval(this.sendWorkFlow.bind(this), time * 1000)
        console.log("Auto Backup Timer Setup:",time)
        // document.addEventListener("visibilitychange", this.handleSaveWorkflowManager.bind(this))
    }

    async sendWorkFlow() {
        let workflow = (await this.app.graphToPrompt()).workflow;
        await postWorkflow(this.nexusSocket.uuid, workflow)
    }

    async loadLatestWorkflow() {
        let workflow = await getLatestWorkflow()
        let links = workflow.links || [];
        let nodes = workflow.nodes || [];
        let groups = workflow.groups || [];
        this.app.graph.updateNodes(nodes);
        this.app.graph.updateLinks(links);
        this.app.graph.updateGroups(groups);
        this.app.graph.updateExecutionOrder();
        this.app.graph.setDirtyCanvas(true, true);
    }

    async handleSaveWorkflowManager() {
        this.sendWorkFlow()
        // if (document.visibilityState === "hidden") {
        //     if (this.saveTimer) {
        //         clearInterval(this.saveTimer)
        //     }
        // }
        // else {
        //     this.saveTimer = setInterval(this.sendWorkFlow.bind(this), this.saveTime * 1000)
        // }
    }

    async handleSpectators() {
        if (this.spectators.length > 0) {
            let workflow = (await this.app.graphToPrompt()).workflow;
            let wfe = workflow.extra
            for (let index = 0; index < this.spectators.length; index++) {
                const id = this.spectators[index];
                this.nexusSocket.sendMessage('workflow:spectate', { workflow: wfe, receiver: id }, false)
            }
        }
    }

    async handleMessageReceive(message) {

        let from = message.from;
        let data = message.data
        let name = message.name;

        switch (name) {
            case "spectate":
                if (data.on == 0) {
                    if (this.spectators.includes(from)) {
                        this.spectators.splice(this.spectators.indexOf(from), 1)
                    }
                } else if (data.on == 1) {
                    if (!this.spectators.includes(from)) {
                        this.spectators.push(from)
                    }
                }
            case "join":
                // this.sendWorkFlow()
                this.saveManager(this.saveTime || 60)
                break;
            case "workflow:spectate":
                let wfe = data.workflow
                if (wfe?.ds) {
                    this.app.canvas.ds.offset = wfe.ds.offset;
                    this.app.canvas.ds.scale = wfe.ds.scale;
                }
                break;
            case "workflow:timer":
                let time = data.time
                this.saveManager(time)
                break;
            case "workflow:update":
                this.handleWorkflowUpdate(from, data)
                break;
            case "workflow":
                let workflow = data.workflow
                if (workflow.clear) {
                    await this.app.graph.clear()
                }
                let links = workflow.links || [];
                let nodes = workflow.nodes || [];
                let groups = workflow.groups || [];
                this.app.graph.updateNodes(nodes);
                this.app.graph.updateLinks(links);
                this.app.graph.updateGroups(groups);
                this.app.graph.updateExecutionOrder();
                this.app.graph.setDirtyCanvas(true, true);
        }

    }

    handleWorkflowEvents(oN) {
        if (oN) {
            this.app.graph.onNodeAdded = this.onNodeAdded.bind(this);
            this.app.graph.onNodeAddedNexus = this.onNodeAddedNexus.bind(this);
            this.app.graph.onNodeRemoved = this.onNodeRemoved.bind(this);
            this.app.canvas.onSelectionChange = this.onSelectionChange.bind(this);
            this.app.canvas.onNodeDeselected = this.onNodeDeselected.bind(this);
            this.app.canvas.onNodeMoved = this.onNodeMoved.bind(this);
            this.app.graph.onGroupAdded = this.onGroupAdded.bind(this);
            this.app.graph.onGroupRemoved = this.onGroupRemoved.bind(this);
            this.app.graph._groups.forEach(group => {
                group.onGroupMoved = this.onGroupMoved.bind(this, group);
                group.onGroupNodeMoved = this.onNodeMoved.bind(this);
            });
            this.app.graph._nodes.forEach(node => {
                node.onWidgetChanged = this.onWidgetChanged.bind(this, node);
                node.onConnectionsChange = this.onNodeConnectionChange.bind(this, node);
            });
        }
        else {
            this.app.graph.onNodeAddedNexus = null;
            this.app.graph.onNodeAdded = null;
            this.app.graph.onNodeRemoved = null;
            this.app.canvas.onSelectionChange = null;
            this.app.canvas.onNodeDeselected = null;
            this.app.canvas.onNodeMoved = null;
            this.app.graph.onGroupAdded = null;
            this.app.graph.onGroupRemoved = null;
            this.app.graph._groups.forEach(group => {
                group.onGroupMoved = null;
                group.onGroupNodeMoved = null;
            });
            this.app.graph._nodes.forEach(node => {
                node.onWidgetChanged = null;
                node.onConnectionsChange = null;
            });
        }
    }

    handleWorkflowUpdate(from, detail) {

        let graph = this.app.graph;
        let canvas = this.app.canvas;
        let update = detail.update;
        let data = detail.data;

        let existingNode;

        switch (update) {
            case "node-added":
                graph.updateNode(data);
                break;
            case "node-removed":
                graph.removeNode(data);
                break;
            case "node-moved":
                graph.updateNode(data);
                break;
            case "node-widget-changed":
                graph.updateNode(data);
                break;
            case "node-selection":
                let nodes = []
                data.forEach(node => {
                    existingNode = graph.getNodeById(node.id);
                    if (existingNode) {
                        nodes.push(existingNode)
                    }
                })
                canvas.selectNodesNexus(nodes, true)
                break;
            case "node-deselection":
                existingNode = graph.getNodeById(data.id);
                if (existingNode)
                    canvas.deselectNodeNexus(existingNode)
                break;
            case "group-added":
                graph.updateGroup(data);
                break;
            case "group-moved":
                graph.updateGroup(data);
                break;
            case "group-removed":
                graph.removeGroup(data);
                break;
            case "node-connection":
                graph.updateLinkManual(detail.change, detail.link, detail.node, graph);
                break;
            default:
                //console.log(update);
                break;
        }

    }

    onNodeAddedNexus(node) {
        node.onWidgetChanged = this.onWidgetChanged.bind(this, node);
        node.onConnectionsChange = this.onNodeConnectionChange.bind(this, node);
    }

    onNodeAdded(node) {
        let data = node.serialize();
        node.onWidgetChanged = this.onWidgetChanged.bind(this, node);
        node.onConnectionsChange = this.onNodeConnectionChange.bind(this, node);
        this.nexusSocket.sendMessage('workflow:update', { update: "node-added", data }, false);
    }

    onWidgetChanged(node) {
        let data = node.serialize();
        this.nexusSocket.sendMessage('workflow:update', { update: "node-widget-changed", data }, false);
    }

    onNodeRemoved(node) {
        let data = node.serialize();
        this.nexusSocket.sendMessage('workflow:update', { update: "node-removed", data }, false);
    }

    async onNodeConnectionChange(node, a, b, c, d, e) {
        let change = c ? "add" : "remove";
        let link = d;
        this.graphData = (await this.app.graphToPrompt()).workflow;
        let data = this.graphData.links;
        //console.log(data)
        node = this.app.graph.getNodeById(node.id);
        node = node ? node.serialize() : null;
        this.nexusSocket.sendMessage('workflow:update', { node, update: "node-connection", link, change, data }, false);
    }

    onSelectionChange(nodes) {
        let data = []
        Object.keys(nodes).forEach(node_id => {
            data.push(nodes[node_id].serialize())
        })
        this.nexusSocket.sendMessage('workflow:update', { update: "node-selection", data }, false);
    }

    onNodeDeselected(node) {
        let data = node.serialize()
        this.nexusSocket.sendMessage('workflow:update', { update: "node-deselection", data }, false);
    }

    onNodeMoved(node) {
        let data = node.serialize();
        this.nexusSocket.sendMessage('workflow:update', { update: "node-moved", data }, false);
    }

    onGroupAdded(group) {
        let data = group.serialize();
        let uuid = localStorage.getItem('nexus-socket-uuid');
        if (uuid) {
            data.owner = uuid
            group.configure(data);
        }
        group.onGroupMoved = this.onGroupMoved.bind(this, group);
        group.onGroupNodeMoved = this.onNodeMoved.bind(this);
        this.nexusSocket.sendMessage('workflow:update', { update: "group-added", data }, false);
    }

    onGroupRemoved(group) {
        let data = group.serialize();
        this.nexusSocket.sendMessage('workflow:update', { update: "group-removed", data }, false);
    }

    onGroupMoved(group) {
        let data = group.serialize();
        this.nexusSocket.sendMessage('workflow:update', { update: "group-moved", data }, false);
    }

}
