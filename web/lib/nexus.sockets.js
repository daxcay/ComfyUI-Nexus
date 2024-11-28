import { UserManager } from "./nexus.user.manager.js";

export class NexusSocket extends EventTarget {

    getName() {
        let name = localStorage.getItem('nexus-socket-name');
        if (!name) {
            localStorage.setItem('nexus-socket-name', "User");
            name = "User"
        }
        this.userManager.set(this.uuid, "name", name)
        return name
    }

    getUUID() {
        let uuid = localStorage.getItem('nexus-socket-uuid');
        if (!uuid) {
            uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c =>
                (Math.random() * 16 | 0).toString(16)
            );
            localStorage.setItem('nexus-socket-uuid', uuid);
        }
        return uuid;
    }

    constructor() {

        super();
        this.ws = null;
        this.userManager = new UserManager();
        this.uuid = this.getUUID();
        this.admin = false
        this.wsUrl = `ws${window.location.protocol === "https:" ? "s" : ""}://${location.host}/nexus?id=${this.uuid}`;

        this.onConnected = [this.onConnectedHandler.bind(this)];
        this.onDisconnected = [];
        this.onMessageReceive = [this.onMessageReceiveHandler.bind(this)];
        this.onMessageSend = [];
        this.onError = [];
        this.onClose = [];

        this.getName()

    }

    onConnectedHandler() {
        this.userManager.create(this.uuid);
        this.sendMessage('join', { name: this.getName() }, false);
        this.sendMessage("online", {}, false)
    }

    onMessageReceiveHandler(message) {
        let name = message.name;
        let from = message.from;
        switch (name) {
            case "join":
                this.userManager.create(from);
                this.sendMessage('hi', {}, false);
                break;
            case "hi":
                this.userManager.create(from);
                break;
        }
    }

    connect() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.onopen = () => {
                if (this.onConnected) {
                    this.onConnected.forEach(f => { f(); });
                }
            };
            this.ws.onmessage = (msg) => {
                try {
                    const message = JSON.parse(msg.data);
                    if (this.onMessageReceive) {
                        this.onMessageReceive.forEach(f => { f(message); });
                    }
                } catch (e) {
                    console.error('Error handling message:', e);
                }
            };
            this.ws.onerror = (error) => {
                if (this.onError) {
                    this.onError.forEach(f => { f(error); });
                }
                console.error('WebSocket error:', error);
            };
            this.ws.onclose = () => {
                if (this.onDisconnected) {
                    this.onDisconnected.forEach(f => { f(); });
                }
                setTimeout(() => {
                    this.connect();
                }, 5000);
            };
        } catch (e) {
            console.error('Error connecting to WebSocket:', e);
        }
    }

    closeWebSocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        } else {
            console.log('WebSocket is not open.');
        }
    }

    sendMessage(event_name, event_data, all = true) {
        try {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                let data = {}
                if(event_data.receiver) {
                    data.receiver = event_data.receiver
                    delete event_data.receiver
                } else if (event_data.exclude) {
                    data.exclude = event_data.exclude
                    delete event_data.exclude
                }
                data.from = this.uuid
                data.name = event_name
                data.data = event_data
                data.all = all
                this.ws.send(JSON.stringify(data));
                if (this.onMessageSend) {
                    this.onMessageSend.forEach(f => { f(message); });
                }
            }
        } catch (e) {
            console.error(`Error sending ${event_name} message:`, e);
        }
    }
}
