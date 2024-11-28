import { DynamicElement } from "./nexus.elements.js"
import { StyleInjector } from "./nexus.styles.js";

export class UserPanel {

    constructor() {

        this.active = 0

        this.panel = new DynamicElement({
            id: 'nexus-player-panel',
            tag: 'div',
            visible: false,
            styles: {
                "width": "100%",
                "height": "100vh",
                "display": "flex",
                "align-items": "center",
                "justify-content": "center",
                "box-sizing": "border-box",
                "position": "absolute",
                "left": "0",
                "top": "0",
                "z-index": "10000"
            },
            childrens: [
                new DynamicElement({
                    id: 'nexus-player-panel-table',
                    tag: 'div',
                    visible: true,
                    styles: {
                        "width": "832px",
                        "display": "flex",
                        "flex-direction": "column",
                        "border-radius": "6px",
                        "box-sizing": "border-box"
                    },
                    childrens: [
                        new DynamicElement({
                            id: 'nexus-player-panel-table-body',
                            tag: 'div',
                            visible: true,
                            styles: {
                                "width": "100%",
                                "display": "flex",
                                "flex-direction": "column",
                                "align-items": "center",
                                "justify-content": "flex-start",
                                "color": "#a3a3a3",
                                "font-family": "Calibri",
                                "font-weight": "600",
                                "gap": "12px",
                                "padding-bottom": "12px",
                                "box-sizing": "border-box",
                                "background": "rgba(54,54,54,0.8)",
                                "border-radius": "6px",
                                "box-shadow": "4px 8px 8px rgba(0,0,0,0.5)",
                                "max-height": "540px",
                                "overflowY": "auto"
                            }
                        }),
                        new StyleInjector({
                            styles: {
                                "#nexus-player-panel .table-row": {
                                    "width": "100%",
                                    "display": "grid",
                                    "align-items": "center",
                                    "grid-template-columns": "20% 60% 20%",
                                    "justify-content": "space-between",
                                },
                                "#nexus-player-panel .table-row:first-child": {
                                    "width": "100%",
                                    "color": "#a3a3a3",
                                    "padding": "16px 0",
                                    "background": "rgb(0,0,0,0.6)",
                                    "border-top-left-radius": "6px",
                                    "border-top-right-radius": "6px",
                                    "position": "sticky",
                                    "top": "0",
                                },
                                "#nexus-player-panel .table-row .table-row-child": {
                                    "display": "flex",
                                    "justify-content": "flex-start",
                                    "gap": "12px",
                                    "padding-left": "12px",
                                    "width": "100%"
                                },
                                "#nexus-player-panel .table-row-child button": {
                                    "border": "none",
                                    "padding": "6px 12px",
                                    "border-radius": "3px",
                                    "cursor": "pointer",
                                    "background": "rgba(94,94,94)",
                                    "color": "#a1a1a1",
                                },
                                "#nexus-player-panel .table-row-child button:active": {
                                    "opacity": "0.8"
                                },
                                "#nexus-player-panel .table-row-child button[active='1'][label='spectate']": {
                                    "background": "#218c74",
                                    "color": "#fafafa"
                                },
                                "#nexus-player-panel .table-row-child button[active='1'][label='editor']": {
                                    "background": "#474787",
                                    "color": "#fafafa"
                                },
                                "#nexus-player-panel .table-row-child button[active='1'][label='mouse']": {
                                    "background": "#cd6133",
                                    "color": "#fafafa"
                                },
                                "#nexus-player-panel .table-row-child button[active='1'][label='queue']": {
                                    "background": "#6F1E51",
                                    "color": "#fafafa"
                                }
                            }
                        })
                    ]
                })
            ],
        })
        this.onCommandReceived = null
        this.buttons = []
        this.columns = []
    }

    addColumnsToPanel(columns) {

        this.columns = columns

    }

    addRowsToPanel(rows, callbacks, values, data) {

        let tbody = this.panel.childrens[0].childrens[0];
        tbody.removeChildrens();
        this.buttons = []

        const tr = document.createElement('div');
        tr.className = "table-row";

        this.columns.forEach(heading => {
            const th = document.createElement('span');
            th.className = "table-row-child"
            th.textContent = heading;
            tr.appendChild(th)
        });

        tbody.addChild(tr)

        rows.forEach((row, i) => {
            const tr = document.createElement('div');
            tr.className = "table-row";

            row.forEach((cell, j) => {

                let td = document.createElement('span');
                td.className = "table-row-child"

                let hascomma = cell.indexOf(",") > -1
                let hascolon = cell.indexOf(":") > -1

                let content = []

                if (hascomma) {
                    content = cell.split(',')
                    content.forEach((elm, k) => {
                        let elmcontent = elm.split(':')
                        this.addChildToParent(elmcontent, td, callbacks, values, data, i, j, k)
                    })
                }
                else if (hascolon) {
                    content = cell.split(':')
                    this.addChildToParent(content, td, callbacks, values, data, i, j, -1)
                } else {
                    td.textContent = cell
                }
                tr.appendChild(td);

            });
            tbody.addChild(tr)
        });
    }

    addChildToParent(content, td, callbacks, values, data, i, j, k) {
        //console.log(content, td, callbacks, values, data, i, j, k)
        switch (content[0]) {
            case 'button':
                let btn = document.createElement('button');
                if (content[1] == 'none') {
                    btn.className = "none"
                }
                if (!this.buttons.includes(btn)) {
                    this.buttons.push(btn)
                }
                btn.textContent = content[1]
                if (callbacks[i] && callbacks[i][j] && values[i][j] && data[i][j]) {
                    let inner_values = values[i][j].split(',')
                    let inner_data = data[i][j].split(',')
                    if (k != -1) {
                        btn.setAttribute('data', inner_data[k]);
                        btn.setAttribute('active', inner_values[k]);
                    } else {
                        btn.setAttribute('data', data[i][j]);
                        btn.setAttribute('active', values[i][j]);
                    }
                    btn.setAttribute('kind', content[0]);
                    btn.setAttribute('label', content[1]);
                    if (content[1] != 'none') {
                        btn.onclick = callbacks[i][j].bind(this);
                    }
                }
                td.appendChild(btn)
                break;
        }

    }

    disableButtons(label) {
        this.buttons.forEach(btn => {
            let btn_kind = btn.getAttribute('kind')
            let btn_data = btn.getAttribute('data')
            let btn_active = parseInt(btn.getAttribute('active'))
            let btn_label = btn.getAttribute('label')
            if (btn_label == label) {
                if (btn_active == 1) {
                    btn.setAttribute('active', 0)
                    //console.log(btn_kind, btn_label, btn_data, 0)
                    if (this.onCommandReceived) {
                        this.onCommandReceived(btn_kind, btn_label, btn_data, 0)
                    }
                }
            }
        })
    }

    onclick(e) {

        let kind = e.target.getAttribute('kind')
        let data = e.target.getAttribute('data')
        let label = e.target.getAttribute('label')
        let active = parseInt(e.target.getAttribute('active'))
        if (kind == "button") {
            if (label == "spectate") {
                this.disableButtons(label)
            }
            if (active == 0) {
                e.target.setAttribute('active', 1)
            } else if (active == 1) {
                e.target.setAttribute('active', 0)
            }
        }
        active = parseInt(e.target.getAttribute('active'))
        //console.log(kind, label, data, active)
        if (this.onCommandReceived) {
            this.onCommandReceived(kind, label, data, active)
        }
    }
}