import { StyleInjector } from "./nexus.styles.js";

export class DynamicElement extends EventTarget {
    id = '';
    tag = '';
    styles = {};
    hoverStyles = {};
    focusStyles = {};
    activeStyles = {};
    attrs = {};
    childrens = [];
    events = {};
    appendTo = document.body;
    visible = false;
    afterChildrenAppend = null;
    afterCreated = null;
    defaultDisplay = 'initial';
    el = null;

    constructor({
        id,
        tag,
        styles = {},
        hoverStyles = {},
        focusStyles = {},
        activeStyles = {},
        attrs = {},
        childrens = [],
        events = {},
        appendTo = document.body,
        afterChildrenAppend = null,
        afterCreated = null,
        visible = false
    } = {}) {

        super() 

        this.id = id;
        this.tag = tag;
        this.styles = styles;
        this.hoverStyles = hoverStyles;
        this.focusStyles = focusStyles;
        this.activeStyles = activeStyles;
        this.attrs = attrs;
        this.childrens = childrens;
        this.events = events;
        this.appendTo = appendTo;
        this.afterChildrenAppend = afterChildrenAppend;
        this.afterCreated = afterCreated;
        this.visible = visible

        this.createElement();
    }

    createElement() {
        if (!this.tag) {
            throw new Error('Tag is required to create an element.');
        }

        this.el = document.createElement(this.tag);
        if (this.id) this.el.id = this.id;
        this.appendTo.appendChild(this.el);

        this.addStyles();
        this.addAttrs();
        this.addChildrens();
        this.addEvents();
        this.addStateStyles();

        if (!this.visible) {
            this.hide()
        }

        if (this.afterCreated) {
            this.afterCreated(this)
        }
    }

    removeElement() {
        if (!this.el) return;
        this.removeAttrs();
        this.removeEvents();
        this.removeStyles();
        this.removeChildrens();
        this.el.remove();
        this.el = null;
    }

    updateStyles(styles = {}) {
        this.styles = { ...this.styles, ...styles };
        this.addStyles();
    }

    addStyles() {
        if (!this.el) return;
        Object.entries(this.styles).forEach(([style, value]) => {
            if (style === 'display') {
                this.defaultDisplay = value;
            }
            this.el.style[style] = value;
        });
    }

    removeStyles() {
        if (!this.el) return;
        Object.keys(this.styles).forEach(style => {
            this.el.style[style] = '';
        });
        this.styles = {};
    }

    updateAttrs(attrs = {}) {
        this.attrs = { ...this.attrs, ...attrs };
        this.addAttrs();
    }

    addAttrs() {
        if (!this.el) return;
        Object.entries(this.attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value);
        });
    }

    removeAttrs() {
        if (!this.el) return;
        Object.keys(this.attrs).forEach(attr => {
            this.el.removeAttribute(attr);
        });
        this.attrs = {};
    }

    addChildrens() {
        if (!this.el) return;
        this.childrens.forEach(child => {
            if (typeof child === 'string') {
                this.el.insertAdjacentHTML('beforeend', child);
            } else if (child instanceof Node) {
                this.el.appendChild(child);
            } else if (child instanceof StyleInjector) {
                this.el.appendChild(child.el);
            } else if (child instanceof DynamicElement) {
                this.el.appendChild(child.el);
            }
        });
        if (this.afterChildrenAppend) {
            requestAnimationFrame(() => this.afterChildrenAppend(this.childrens, this));
        }
    }

    addChild(child) {
        if (!this.el) return;
        if (typeof child === 'string') {
            this.el.insertAdjacentHTML('beforeend', child);
        } else if (child instanceof Node) {
            this.el.appendChild(child);
        } else if (child instanceof DynamicElement) {
            this.el.appendChild(child.el);
        }
        if(!this.childrens.includes(child)) {
            this.childrens.push(child)
        }
        if (this.afterChildrenAppend) {
            this.afterChildrenAppend(this.childrens, this);
        }
    }

    removeChildrens() {
        if (!this.el) return;
        this.el.innerHTML = '';
        this.childrens = [];
    }

    addEvents() {
        if (!this.el) return;
        Object.entries(this.events).forEach(([event, handler]) => {
            this.el.addEventListener(event, (e) => { handler(e, this.parent) });
        });
    }

    removeEvents() {
        if (!this.el) return;
        Object.entries(this.events).forEach(([event, handler]) => {
            this.el.removeEventListener(event, handler);
        });
        this.events = {};
    }

    show() {
        if (!this.el) return;
        this.el.style.display = this.defaultDisplay;
        this.visible = true;
    }

    hide() {
        if (!this.el) return;
        this.el.style.display = 'none';
        this.visible = false;
    }

    addStateStyles() {
        if (!this.el) return;

        this.el.addEventListener('mouseenter', () => this.applyStyles(this.hoverStyles));
        this.el.addEventListener('mouseleave', () => this.applyStyles(this.styles));
        this.el.addEventListener('focus', () => this.applyStyles(this.focusStyles), true);
        this.el.addEventListener('blur', () => this.applyStyles(this.styles), true);
        this.el.addEventListener('mousedown', () => this.applyStyles(this.activeStyles));
        this.el.addEventListener('mouseup', () => this.applyStyles(this.styles));
    }

    applyStyles(stateStyles) {
        if (!this.visible) return
        Object.entries(stateStyles).forEach(([style, value]) => {
            this.el.style[style] = value;
        });
    }
}
