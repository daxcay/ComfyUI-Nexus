export class StyleInjector {

    constructor({ styles }) {
        this.el = null
        this.styles = styles;
        this.create()
    }

    create() {
        this.el = document.createElement('style');
        let cssString = "";
        for (const selector in this.styles) {
            cssString += `${selector} { `;
            for (const property in this.styles[selector]) {
                cssString += `${property}: ${this.styles[selector][property]}; `;
            }
            cssString += `} `;
        }
        this.el.textContent = cssString;
    }

    softUpdate(selector, property, value) {
        let cssString = "";
        for (const key in this.styles) {
            cssString += `${key} { `;
            for (const property in this.styles[key]) {
                cssString += `${property}: ${this.styles[key][property]}; `;
            }
            if(key == selector) {
                cssString += `${property}: ${value}; `;
            }
            cssString += `} `;
        }
        this.el.textContent = cssString;
    }

}