const vasara = function () {
    /** @type {{x: number, y: number}} The current position of the mouse */
    const mousePosition = { x: 0, y: 0 };
    /** @type {Map.<number, boolean>} The current state of the mouse */
    const mouseButtons = new Map();

    document.addEventListener('mousemove', (event) => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    });

    document.addEventListener('mousedown', (event) => {
        mouseButtons.set(event.button, true);
    });

    document.addEventListener('mouseup', (event) => {
        mouseButtons.set(event.button, false);
    });

    /** @type {Map<string, boolean>} The current state of the keyboard */
    const keyboardKeys = new Map();
    /** @type {Map<string, Function>} Keybindings; key format: "key1+key2+key3" */
    const globalKeybindings = new Map();

    /**
     * @description Registers a keybinding
     * @param {string} keyCombo The key combination to bind to
     * @param {(event: KeyboardEvent) => void} func The function to call when the key combination is pressed
     */
    this.registerKeybinding = (keyCombo, func) => {
        keyCombo = keyCombo.split('+').sort().join('+').toLowerCase();

        if (!globalKeybindings.has(keyCombo)) globalKeybindings.set(keyCombo, []);

        globalKeybindings.get(keyCombo).push(func);
    }

    document.addEventListener('keydown', (event) => {
        keyboardKeys.set(event.key.toLowerCase(), true);

        const keyCombo = [...keyboardKeys.keys()].sort().join('+');
        const funcs = globalKeybindings.get(keyCombo);
        if (funcs?.length) funcs.forEach(f => f(event));
    });

    /**
     * @description Deregisters a keybinding
     * @param {string} keyCombo The key combination to deregister
     * @param {Function} func The function to deregister
     */
    this.deregisterKeybinding = (keyCombo, func) => {
        keyCombo = keyCombo.split('+').sort().join('+').toLowerCase();

        if (!globalKeybindings.has(keyCombo)) return;

        const funcs = globalKeybindings.get(keyCombo);
        if (funcs.length === 1) globalKeybindings.delete(keyCombo);
        else {
            const index = funcs.indexOf(func);
            if (index === -1) return;
            funcs.splice(index, 1);
        }
    }

    document.addEventListener('keyup', (event) => {
        keyboardKeys.delete(event.key.toLowerCase());
    });

    window.addEventListener('blur', () => {
        keyboardKeys.clear();
    });

    /**
     * @description Shorthand function for creating an element and appending it to a parent
     * @param {string} type The type of element to create 
     * @param {string} className The class name(s) to add to the element 
     * @param {string} alt The alt text for the element
     * @param {HTMLElement} parent The parent element to append the new element to 
     * @returns {HTMLElement} The newly created element
     */
    this.createElem = (type, className = '', title, parent) => {
        const elem = document.createElement(type);
        elem.className = className.split(' ').map(hcn).join(' ');
        elem.title = title;
        parent?.appendChild(elem);
        return elem;
    }

    const titleDuplicateCounts = {};

    /**
     * @description Generates a modal window
     * @param {{title: string, content: string | HTMLElement, width: number, height: number, resizable: boolean}} options The options for the modal window
     * @returns {HTMLElement} The modal window element
     */
    this.generateModalWindow = ({
        title = 'Modal Window',
        content = '',
        width = 400,
        height = 300,
        resizable = false,
        disableTitleStacking = false,
        enableGhostButton = true,
        enableCloseButton = true,
        tag = '',
    } = {}) => {
        if (content instanceof HTMLElement) content = content.outerHTML;

        const modal = this.createElem('div', 'modal-window', '', document.body);
        const header = this.createElem('div', 'modal-window-header', '', modal);
        const titleElem = this.createElem('div', 'modal-window-header-title', '', header);
        const buttons = this.createElem('div', 'modal-window-header-buttons', '', header);

        const bringToFront = () => {
            const modals = document.querySelectorAll('.' + hcn('modal-window'));
            modals.forEach(m => m.style.zIndex = 0);
            modal.style.zIndex = 1;
        }

        modal.addEventListener('click', bringToFront);

        let x1 = 0, y1 = 0, x2 = 0, y2 = 0, dragging = false;
        header.addEventListener('mousedown', e => {
            [x2, y2, dragging] = [e.clientX, e.clientY, true];
            bringToFront();
        });
        document.addEventListener('mouseup', e => {
            dragging = e.button !== 0 ? dragging : false;
        });
        document.addEventListener('mousemove', e => {
            if (dragging) {
                [x1, y1] = [x2 - e.clientX, y2 - e.clientY];
                [x2, y2] = [e.clientX, e.clientY];
                modal.style.top = `${modal.offsetTop - y1}px`;
                modal.style.left = `${modal.offsetLeft - x1}px`;
            }
        });

        if (!disableTitleStacking) {
            const titleElements = document.querySelectorAll('.' + hcn('modal-window-header-title'));
            let matched = 0;

            for (const elem of titleElements) {
                if (elem.getAttribute('originalTitle') === title) {
                    matched++;
                }
            }

            if (matched <= 0) {
                titleDuplicateCounts[title] = 0;
            }

            titleDuplicateCounts[title]++;

            if (titleDuplicateCounts[title] > 1) {
                title += ` (${titleDuplicateCounts[title]})`;
            }
        }

        titleElem.innerText = title;
        titleElem.setAttribute('originalTitle', title);
        if (enableGhostButton) createElem('div', 'modal-window-header-button ghost-button', 'Toggle window shimmer', buttons).addEventListener('click', () => modal.classList.toggle(hcn('ghosted')));
        if (enableCloseButton) createElem('div', 'modal-window-header-button close-button', 'Close window', buttons).addEventListener('click', e => {
            e.stopPropagation();
            modal.remove()
        });
        const contentElem = this.createElem('div', 'modal-window-content', '', modal);
        contentElem.innerHTML = content;

        Object.assign(modal.style, { width: `${width}px`, height: `${height}px` });
        if (resizable) modal.classList.add(hcn('resizable'));

        if (tag) modal.setAttribute('tag', tag)

        modal.generateLabel = function ({
            text = '',
            htmlfor = '',
        } = {}) {
            const label = document.createElement('label');

            label.textContent = text;
            label.htmlFor = htmlfor;

            contentElem.appendChild(label);
            return modal;
        }

        modal.generateNumberInput = function ({
            id = '',
            value = 0,
            oninput = null,
        } = {}) {
            const input = document.createElement('input');

            input.type = 'number';
            input.id = id;
            input.value = value;
            input.oninput = oninput;

            contentElem.appendChild(input);
            return modal;
        }

        modal.generateColorInput = function ({
            id = '',
            value = '',
            oninput = null
        } = {}) {
            const input = document.createElement('input');

            input.type = 'color';
            input.id = id;
            input.value = value;
            input.oninput = oninput;

            contentElem.appendChild(input);
            return modal;
        }

        modal.generateStringInput = function ({
            id = '',
            value = '',
            oninput = null
        } = {}) {
            const input = document.createElement('input');

            input.type = 'text';
            input.id = id;
            input.value = value;
            input.oninput = oninput;

            contentElem.appendChild(input);
            return modal;
        }

        modal.generateButton = function ({
            text,
            onclick
        } = {}) {
            const button = document.createElement('button');

            button.textContent = text;
            button.onclick = onclick;

            contentElem.appendChild(button);
            return modal;
        }

        modal.putNewline = function () {
            const newline = document.createElement('br');
            contentElem.appendChild(newline);
            return modal;
        }

        modal.appendElement = function (element) {
            contentElem.appendChild(element);
            return modal;
        }

        return modal;
    }

    const hcn = className => 'vasara-' + className.split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0).toString(36);
    const injectCss = (css) => {
        const hashedCSS = css.replace(/\.([a-zA-Z][a-zA-Z0-9_-]*)/g, (_, className) => `.${hcn(className)}`);
        const minifiedCSS = css.replace(/\n/g, '');

        const styleSheetElem = document.createElement('style');

        if (styleSheetElem.styleSheet) {
            styleSheetElem.styleSheet.cssText = minifiedCSS;
        } else {
            styleSheetElem.appendChild(document.createTextNode(hashedCSS));
        }

        document.head.appendChild(styleSheetElem);
    }


    const css = `
.modal-window button,
.modal-window input {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.modal-window {
    position        : fixed;
    top             : 50%;
    left            : 50%;
    transform       : translate(-50%, -50%);
    border          : 1px solid #ccc;
    background-color: #fff;
    z-index         : 1000;
    box-shadow      : 0 2px 10px rgba(0, 0, 0, 0.1);
    font-family     : system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.modal-window-header {
    display         : flex;
    justify-content : space-between;
    align-items     : center;
    background-color: #f5f5f5;
    padding         : 10px;
    cursor          : move;
}

.modal-window-header-title {
    flex: 1;
}

.modal-window-header-buttons {
    display: flex;
}

.modal-window-header-button {
    width        : 15px;
    height       : 15px;
    border-radius: 50%;
    margin-left  : 5px;
    cursor       : pointer;
}

.ghost-button {
    background-color: #ffcc00;
}

.close-button {
    background-color: #ff4d4d;
}

.modal-window-content {
    padding: 20px;
}

.modal-window-content button {
    border          : none;
    border-radius   : 15px;
    background-color: #f5f5f5;
    cursor          : pointer;
}

.modal-window-content button:hover {
    background-color: #e9e9e9;
}

.modal-window-content button:active {
    background-color: #ccc;
}

.modal-window-content input {
    padding      : 8px, 1px;
    border       : 1px solid #ccc;
    border-radius: 4px;
}

.resizable {
    resize  : both;
    overflow: auto;
}

.ghosted {
    opacity: 0.4;
}`;

    injectCss(css);

    return this;
};