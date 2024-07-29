const ui = vasara();

const lines = [];
const boxes = [];

const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const line of lines) {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
    }

    for (const box of boxes) {
        ctx.strokeStyle = box.color;
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y, box.w, box.h);
    }
}

const openNewLineModal = () => {
    const line = { x1: '', y1: '', x2: '', y2: '', color: '' };

    const modal = ui.generateModalWindow({
        title: 'Add New Line',
        width: 500,
        height: 400,
        resizable: true,
    });

    modal.generateLabel({
        text: 'X1:',
    }).generateNumberInput({
        callback: (e) => { line.x1 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y1:',
    }).generateNumberInput({
        callback: (e) => { line.y1 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'X2:',
    }).generateNumberInput({
        callback: (e) => { line.x2 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y2:',
    }).generateNumberInput({
        callback: (e) => { line.y2 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Color:',
    }).generateColorInput({
        callback: (e) => { line.color = e.target.value; },
    }).putNewline();

    modal.generateButton({
        text: 'Add',
        callback: () => {
            for (const key in ['x1', 'y1', 'x2', 'y2']) {
                line[key] = parseFloat(line[key]);
            }
            lines.push(line);
            redraw();
            modal.remove();
        },
    });
}

const openNewBoxModal = () => {
    let modalTitle = 'Add New Box';

    const box = { x: '', y: '', w: '', h: '', color: '' };

    const modal = ui.generateModalWindow({
        title: modalTitle,
        width: 500,
        height: 400,
        resizable: true,
    });

    modal.generateLabel({
        text: 'X:',
    }).generateNumberInput({
        callback: (e) => { box.x = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y:',
    }).generateNumberInput({
        callback: (e) => { box.y = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'w:',
    }).generateNumberInput({
        callback: (e) => { box.w = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'H:',
    }).generateNumberInput({
        callback: (e) => { box.h = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Color:',
    }).generateColorInput({
        callback: (e) => { box.color = e.target.value; },
    }).putNewline();

    modal.generateButton({
        text: 'Add',
        callback: () => {
            for (const key in ['x', 'y', 'w', 'h']) {
                box[key] = parseFloat(box[key]);
            }
            boxes.push(box);
            redraw();
            modal.remove();
        },
    });
}

ui.registerConfigValue({
    key: 'myCheckbox',
    display: 'Checkbox',
    description: 'A checkbox value',
    type: 'checkbox',
    value: true,
    callback: v => console.log(`Checkbox set to: ${v}`),
});

ui.registerConfigValue({
    key: 'myColorPicker',
    display: 'Color picker',
    description: 'A color value',
    type: 'color',
    value: '#b00ba5',
    callback: v => console.log(`Color set to: ${v}`),
});

const mainMenuHotkeyAction = e => {
    e.preventDefault();

    const modal = ui.generateModalWindow({
        title: 'Main Menu',
        width: 500,
        height: 300,
        resizable: true,
        unique: true,
    });
    if (!modal) return;
    modal.generateButton({ text: 'Add New Line', callback: openNewLineModal });
    modal.generateButton({ text: 'Add New Box', callback: openNewBoxModal });
}

ui.registerConfigValue({
    key: 'myHotkey',
    display: 'Hotkey',
    description: 'A hotkey',
    type: 'hotkey',
    value: 'Alt+w',
    callback: v => console.log(`Hotkey set to: ${v}`),
    action: mainMenuHotkeyAction
});

ui.registerConfigValue({
    key: 'myDropdown',
    display: 'Dropdown',
    description: 'A dropdown selection',
    type: 'dropdown',
    value: 'A',
    options: ['B', 'C', 'D'],
    callback: v => console.log(`Dropdown set to: ${v}`),
});

ui.registerConfigValue({
    key: 'myNumber',
    display: 'Number input',
    description: 'A number input',
    type: 'number',
    value: 500,
    step: 100,
    min: -1000,
    max: 1000,
    callback: v => console.log(`Number set to: ${v}`),
});

ui.registerConfigValue({
    key: 'myText',
    display: 'Text input',
    description: 'A string value',
    type: 'text',
    value: 'Hello world!',
    callback: v => console.log(`Text set to: ${v}`),
});

ui.registerKeybinding('alt+e', e => {
    e.preventDefault();
    let configWindow = ui.generateConfigWindow();
    if (!configWindow) return;

    configWindow.generateButton({
        text: 'Save',
        callback: () => {
            ui.saveConfig();
        }
    });
    configWindow.generateButton({
        text: 'Load',
        callback: () => {
            ui.loadConfig();
        }
    });
});