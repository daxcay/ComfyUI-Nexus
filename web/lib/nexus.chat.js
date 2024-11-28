import { DynamicElement } from "./nexus.elements.js"
import { StyleInjector } from "./nexus.styles.js";

let chatMain = new DynamicElement({
    id: 'nexus-chat-main',
    tag: 'div',
    visible: true,
    styles: {
        width: '512px',
        minHeight: '170px',
        maxHeight: '170px',
        overflow: 'hidden',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid rgba(94,94,94,0.5)'
    },
    hoverStyles: {
        overflowY: 'scroll'
    },
    afterChildrenAppend: function (childrens, me) {
        if (childrens.length > 50) {
            childrens[0].removeElement()
            childrens.shift()
        }
        me.el.scrollTop = me.el.scrollHeight
    }
})

let inputMain = new DynamicElement({
    id: 'nexus-input-main',
    tag: 'div',
    visible: true,
    styles: {
        width: '100%',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
    },
    childrens: [
        new DynamicElement({
            id: 'nexus-input-label',
            tag: 'span',
            visible: false,
            styles: {
                fontFamily: 'Calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                display: 'block',
                fontSize: '14px',
                lineHeight: '14px',
                fontWeight: 600,
                color: 'white',
                padding: '0',
                margin: '0',
                textShadow: '1pt 1pt #000',
            },
            childrens: ['Say:']
        }),
        new DynamicElement({
            id: 'nexus-input',
            tag: 'input',
            visible: false,
            styles: {
                fontFamily: 'Calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '14px',
                fontWeight: 600,
                width: '100%',
                color: 'white',
                padding: '0',
                margin: '0',
                border: 'none',
                background: "transparent",
                flexGrow: 1,
                outline: 'none',
                textIndent: '4pt',
                caretColor: 'transparent',
                textShadow: '1pt 1pt #000',
            }
        })
    ]
})

let chatWindow = new DynamicElement({
    id: 'nexus-chat-window',
    tag: 'div',
    styles: {
        position: 'absolute',
        left: "16px",
        top: '100px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
    },
    childrens: [
        new DynamicElement({
            id: "nexus-total-players",
            tag: "div",
            visible: true,
            styles: {
                fontFamily: 'Calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '14px',
                fontWeight: 600,
                left: "16px",
                top: '80px',
                color: "#a5a5a5",
                width: "100%",
                paddingBottom: "12px",
                textAlign: "right"
            },
            childrens: ['Users Online: ', new DynamicElement({ id: "nexus-total-players-count", visible: true, tag: "span", childrens:['0'] })]
        }),
        chatMain,
        inputMain,
        new StyleInjector({
            styles: {
                '#nexus-chat-main::-webkit-scrollbar': {
                    'display': 'none',
                    'scrollbar-width': 'none',
                    '-ms-overflow-style': 'none',
                },
                "#nexus-chat-window" : {
                    // for pointer events
                }
            }
        })
    ]
})

let addChatWindowMessage = function (subject, message, subject_color, message_color, merge) {
    let msg = ""
    if (merge) {
        msg = `<span style="color: ${subject_color ? subject_color : "#fff"};">${subject}</span> <span style="color: ${message_color ? message_color : "#fff"};">${message}</span>`
    }
    else {
        msg = `<span style="color: ${subject_color ? subject_color : "#fff"};">${subject}</span>: <span style="color: ${message_color ? message_color : "#fff"};">${message}</span>`
    }

    let chatElement = new DynamicElement({
        tag: 'span',
        visible: true,
        styles: {
            fontFamily: 'Calibri, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            display: 'block',
            fontSize: '14px',
            lineHeight: '14px',
            fontWeight: 600,
            width: '100%',
            color: 'white',
            padding: '0',
            margin: '0',
            textShadow: '1pt 1pt #000',
            marginBottom: '1pt',
            lineBreak: 'anywhere'
        },
        childrens: [msg],
    })
    chatMain.addChild(chatElement)
}

export { chatMain, inputMain, chatWindow, addChatWindowMessage }