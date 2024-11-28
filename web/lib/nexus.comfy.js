export class NexusPromptControl extends EventTarget {

    constructor(api, app, nexusSocket) {

        super()

        this.app = app
        this.api = api
        this.runningNodeId = null
        this.nexusSocket = nexusSocket
        this.comfy_events = ['b_preview', 'progress', 'executing', 'executed', 'execution_start', 'execution_error', 'execution_cached'];

        let oqp = api.queuePrompt;
        this.apiWrapper = {
            oqp: oqp,
            enableApi: false,
            api: api,
            qp: async function (number, data) {
                if (!this.enableApi) {
                    return {
                        "node_errors": {}
                    };
                }
                return this.oqp.call(this.api, number, { output: data.output, workflow: data.workflow });
            }
        };

        this.api.queuePrompt = this.apiWrapper.qp.bind(this.apiWrapper);
        this.nexusSocket.onMessageReceive.push(this.handleMessageReceive.bind(this))

        this.addEventListeners();
        this.comfy_events.forEach((event) => {
            this.api.addEventListener(event, this.handleComfyEvents.bind(this));
        });

        this.handleProgressDraw()
        this.handleControl(false)
        this.handleEditor(false)

    }

    handleProgressDraw() {

        const origDrawNodeShape = LGraphCanvas.prototype.drawNodeShape;
        const self = this.app;
        const self2 = this;

        LGraphCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {

            const res = origDrawNodeShape.apply(this, arguments);
            const nodeErrors = self.lastNodeErrors?.[node.id];

            let color = null;
            let lineWidth = 1;

            if (node.id === +self2.runningNodeId) {
                color = "#0f0";
            } else if (self.dragOverNode && node.id === self.dragOverNode.id) {
                color = "dodgerblue";
            }
            else if (nodeErrors?.errors) {
                color = "red";
                lineWidth = 2;
            }
            else if (self.lastExecutionError && self.lastExecutionError.node_id === node.id) {
                color = "#f0f";
                lineWidth = 2;
            }

            if (color) {
                const shape = node._shape || node.constructor.shape || LiteGraph.ROUND_SHAPE;
                ctx.lineWidth = lineWidth;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                if (shape == LiteGraph.BOX_SHAPE)
                    ctx.rect(-6, -6 - LiteGraph.NODE_TITLE_HEIGHT, 12 + size[0] + 1, 12 + size[1] + LiteGraph.NODE_TITLE_HEIGHT);
                else if (shape == LiteGraph.ROUND_SHAPE || (shape == LiteGraph.CARD_SHAPE && node.flags.collapsed))
                    ctx.roundRect(
                        -6,
                        -6 - LiteGraph.NODE_TITLE_HEIGHT,
                        12 + size[0] + 1,
                        12 + size[1] + LiteGraph.NODE_TITLE_HEIGHT,
                        this.round_radius * 2
                    );
                else if (shape == LiteGraph.CARD_SHAPE)
                    ctx.roundRect(
                        -6,
                        -6 - LiteGraph.NODE_TITLE_HEIGHT,
                        12 + size[0] + 1,
                        12 + size[1] + LiteGraph.NODE_TITLE_HEIGHT,
                        [this.round_radius * 2, this.round_radius * 2, 2, 2]
                    );
                else if (shape == LiteGraph.CIRCLE_SHAPE)
                    ctx.arc(size[0] * 0.5, size[1] * 0.5, size[0] * 0.5 + 6, 0, Math.PI * 2);
                ctx.strokeStyle = color;
                ctx.stroke();
                ctx.strokeStyle = fgcolor;
                ctx.globalAlpha = 1;
            }

            if (self.progress && node.id === +self2.runningNodeId) {
                ctx.fillStyle = "green";
                ctx.fillRect(0, 0, size[0] * (self.progress.value / self.progress.max), 6);
                ctx.fillStyle = bgcolor;
            }

            // Highlight inputs that failed validation
            if (nodeErrors) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "red";
                for (const error of nodeErrors.errors) {
                    if (error.extra_info && error.extra_info.input_name) {
                        const inputIndex = node.findInputSlot(error.extra_info.input_name)
                        if (inputIndex !== -1) {
                            let pos = node.getConnectionPos(true, inputIndex);
                            ctx.beginPath();
                            ctx.arc(pos[0] - node.pos[0], pos[1] - node.pos[1], 12, 0, 2 * Math.PI, false)
                            ctx.stroke();
                        }
                    }
                }
            }

            return res;
        }

    }

    handleMessageReceive(message) {
        try {
            this.dispatchEvent(new CustomEvent(message.name, { detail: message }));
        } catch (e) {
            console.error('Error handling message:', e);
        }
    }

    handleComfyEvents(evt) {
        if (evt.type === "b_preview") {
            this.blobToBase64(evt.detail).then((result) => {
                this.nexusSocket.sendMessage(evt.type, { detail: result }, false)
            });
        } else {
            this.nexusSocket.sendMessage(evt.type, { detail: evt.detail }, false)
        }
    }

    addEventListeners() {

        this.addEventListener("progress", ({ detail }) => {
            detail = detail.data.detail
            this.app.progress = detail;
            this.app.graph.setDirtyCanvas(true, false);
        });

        this.addEventListener("executing", ({ detail }) => {
            detail = detail.data.detail
            this.app.progress = null;
            this.runningNodeId = detail;
            this.app.graph.setDirtyCanvas(true, false);
            delete this.app.nodePreviewImages[this.runningNodeId];
        });

        this.addEventListener("executed", ({ detail }) => {
            detail = detail.data.detail
            const output = this.app.nodeOutputs[detail.node];
            if (detail.merge && output) {
                for (const k in detail.output ?? {}) {
                    const v = output[k];
                    if (v instanceof Array) {
                        output[k] = v.concat(detail.output[k]);
                    } else {
                        output[k] = detail.output[k];
                    }
                }
            } else {
                this.app.nodeOutputs[detail.node] = detail.output;
            }
            const node = this.app.graph.getNodeById(detail.node);
            if (node && node.onExecuted) {
                node.onExecuted(detail.output);
            }
        });

        this.addEventListener("execution_start", ({ detail }) => {
            detail = detail.data.detail
            this.runningNodeId = null;
            this.app.lastExecutionError = null;
            this.app.graph._nodes.forEach((node) => {
                if (node.onExecutionStart) {
                    node.onExecutionStart();
                }
            });
        });

        this.addEventListener("execution_error", ({ detail }) => {
            detail = detail.data.detail
            this.app.lastExecutionError = detail;
            const formattedError = this.formatExecutionError(detail);
            this.app.ui.dialog.show(formattedError);
            this.app.canvas.draw(true, true);
        });

        this.addEventListener("b_preview", ({ detail }) => {
            detail = detail.data.detail
            const id = this.runningNodeId;
            if (id == null) return;
            const blob = this.base64ToBlob(detail);
            const blobUrl = URL.createObjectURL(blob);
            this.app.nodePreviewImages[id] = [blobUrl];
        });
    }

    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    base64ToBlob(dataUrl) {
        const [header, base64] = dataUrl.split(',');
        const mime = header.match(/:(.*?);/)[1];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    }

    formatExecutionError(error) {
        if (error == null) {
            return "(unknown error)";
        }

        const traceback = error.traceback.join("");
        const nodeId = error.node_id;
        const nodeType = error.node_type;

        return `Error occurred when executing ${nodeType}:\n\n${error.exception_message}\n\n${traceback}`;
    }

    handleEditor(oN) {

        this.app.canvas.allow_dragnodes = oN;
        this.app.canvas.allow_interaction = oN;
        this.app.canvas.allow_reconnect_links = oN;
        this.app.canvas.allow_searchbox = oN;

    }

    handleControl(oN) {
        this.apiWrapper.enableApi = oN;
    }

}