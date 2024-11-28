export class NexusMouseManager {

    hexColors = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#f1c40f","#e67e22","#e74c3c","#ecf0f1"]

    createMouseSvg(color) {
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 96 96" shape-rendering="geometricPrecision" text-rendering="geometricPrecision"
            width="96" height="96">
            <path d="M22.311034,9.174631v81.070373L48,71.061684l35.530843-8.173761L22.311034,9.174631Z"
                transform="translate(0-1.709817)" stroke="${color}" fill="${color}" stroke-width="7" stroke-linecap="round"
                stroke-linejoin="round" />
        </svg>`
    }

    svgStringToImage(svgString) {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.src = url;
        return image;
    }

    hex2rgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    getRandomHexColor() {
        return this.hexColors[Math.floor(Math.random() * this.hexColors.length)];
    }

    constructor(nexusSocket, app, fps) {

        this.color = this.getRandomHexColor()

        this.app = app
        this.fps = fps

        this.canSendMouse = false

        this.nexusSocket = nexusSocket
        this.nexusSocket.onConnected.push(this.handleConnect.bind(this))
        this.nexusSocket.onMessageReceive.push(this.handleMessageReceive.bind(this))

        document.addEventListener("visibilitychange", this.handleVisiblityChange.bind(this))
        document.addEventListener('mousemove', this.handleSendMouseControl.bind(this));
        this.app.graph.list_of_graphcanvas[0].onDrawForeground = this.handlePointerDraw.bind(this)

        setInterval(this.handleSendMouse.bind(this), 1000 / this.fps)

    }

    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function (...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    handleCanvasDraw() {
        if (this.app.graph && this.app.graph.list_of_graphcanvas && this.app.graph.list_of_graphcanvas.length > 0) {
            this.app.graph.list_of_graphcanvas[0].draw(true, true);
        }
    }

    handleConnect() {
        this.drawTimer = setInterval(this.handleCanvasDraw.bind(this), 1000 / this.fps)
    }

    handleMessageReceive(message) {

        let name = message.name;
        let from = message.from;
        let data = message.data

        if (name == "mouse") {
            let mouse = this.nexusSocket.userManager.get(from, "mouse");
            let pointer = this.nexusSocket.userManager.get(from, "pointer");
            if (!pointer) {
                this.nexusSocket.userManager.set(from, "pointer", this.svgStringToImage(this.createMouseSvg(data.mouse[3])));
            } else if (pointer && mouse && mouse[3] != data.mouse[3]) {
                this.nexusSocket.userManager.set(from, "pointer", this.svgStringToImage(this.createMouseSvg(data.mouse[3])));
            }
            this.nexusSocket.userManager.set(from, "mouse", data.mouse)
        } else if (name == "hide_mouse") {
            this.nexusSocket.userManager.set(from, "mouse", null)
        } else if (name== "mouse_view_toggle") {
            this.nexusSocket.userManager.set(from, "mouse_view", data.on)
            if(data.on == 0){
                this.nexusSocket.sendMessage("hide_mouse", { receiver: from }, false)
            }
        }

    }

    handleVisiblityChange() {
        if (document.visibilityState === "hidden") {
            clearInterval(this.drawTimer)
            this.nexusSocket.sendMessage("hide_mouse", {}, false)
            this.nexusSocket.sendMessage("afk", {}, false)
        } else {
            this.handleConnect()
            this.nexusSocket.sendMessage("online", {}, false)
        }
    }

    handleSendMouse = function () {
        if (this.app.graph && this.app.graph.list_of_graphcanvas && this.app.graph.list_of_graphcanvas.length > 0) {
            this.mouse = this.app.graph.list_of_graphcanvas[0].canvas_mouse
            this.scale = this.app.graph.list_of_graphcanvas[0].ds.scale
        }
        this.mouse[3] = this.color
        this.mouse[4] = this.scale / 10

        if (this.canSendMouse) {
            let users = Object.keys(this.nexusSocket.userManager.users)
            for (let index = 0; index < users.length; index++) {
                let user_id = users[index]
                let view = this.nexusSocket.userManager.get(user_id, "mouse_view");                   
                if(view != null) {
                    if(view == 1) {
                        this.nexusSocket.sendMessage('mouse', { mouse: this.mouse, receiver: user_id }, false)
                    } 
                }   
                else {
                    this.nexusSocket.sendMessage('mouse', { mouse: this.mouse, receiver: user_id }, false)
                }
            }
            this.canSendMouse = false
        }

    }

    handleSendMouseControl() {
        this.canSendMouse = true
    }

    handlePointerDraw = function (ctx) {
        Object.keys(this.nexusSocket.userManager.users).forEach(id => {
            if (id != this.nexusSocket.uuid) {

                let mouse = this.nexusSocket.userManager.get(id, "mouse");
                let name = this.nexusSocket.userManager.get(id, "name") || "User";
                let pointerImage = this.nexusSocket.userManager.get(id, "pointer");
                let hidden = this.nexusSocket.userManager.get(id, "mouse_hidden");  

                if(hidden == 0) {
                    mouse = null
                }

                if (mouse && mouse.length > 0) {

                    let mouseX = mouse[0] - 4;
                    let mouseY = mouse[1] - 4;
                    let scale = 1 - mouse[4];

                    ctx.drawImage(pointerImage, mouseX, mouseY, 18, 18);
                    ctx.font = '14px Arial';
                    ctx.fillStyle = mouse[3];
                    ctx.fillText(name, mouseX + 22, mouseY + 16);

                    let color = this.hex2rgb(mouse[3])

                    ctx.beginPath();
                    ctx.arc(mouseX, mouseY, scale * 600, 0, 2 * Math.PI, false);
                    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},0.1)`;
                    ctx.lineWidth = 2;                    
                    ctx.stroke();
                
                }
            }

        });
    }
}