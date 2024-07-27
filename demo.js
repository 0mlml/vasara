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
    let modalTitle = "Add New Line";

    const line = { x1: "", y1: "", x2: "", y2: "", color: "" };

    const modal = ui.generateModalWindow({
        title: modalTitle,
        width: 500,
        height: 400,
        resizable: true,
    });

    modal.generateLabel({
        text: 'X1:',
    }).generateNumberInput({
        oninput: (e) => { line.x1 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y1:',
    }).generateNumberInput({
        oninput: (e) => { line.y1 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'X2:',
    }).generateNumberInput({
        oninput: (e) => { line.x2 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y2:',
    }).generateNumberInput({
        oninput: (e) => { line.y2 = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Color:',
    }).generateColorInput({
        oninput: (e) => { line.color = e.target.value; },
    }).putNewline();

    modal.generateButton({
        text: 'Add',
        onclick: () => {
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
    let modalTitle = "Add New Box";

    const box = { x: "", y: "", w: "", h: "", color: "" };

    const modal = ui.generateModalWindow({
        title: modalTitle,
        width: 500,
        height: 400,
        resizable: true,
    });

    modal.generateLabel({
        text: 'X:',
    }).generateNumberInput({
        oninput: (e) => { box.x = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Y:',
    }).generateNumberInput({
        oninput: (e) => { box.y = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'w:',
    }).generateNumberInput({
        oninput: (e) => { box.w = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'H:',
    }).generateNumberInput({
        oninput: (e) => { box.h = e.target.value; },
    }).putNewline();

    modal.generateLabel({
        text: 'Color:',
    }).generateColorInput({
        oninput: (e) => { box.color = e.target.value; },
    }).putNewline();

    modal.generateButton({
        text: 'Add',
        onclick: () => {
            for (const key in ['x', 'y', 'w', 'h']) {
                box[key] = parseFloat(box[key]);
            }
            boxes.push(box);
            redraw();
            modal.remove();
        },
    });
}


let mapEditorMainMenu = null;
ui.registerKeybinding('alt+e', e => {
    e.preventDefault();

    if (!mapEditorMainMenu) {
        mapEditorMainMenu = ui.generateModalWindow({
            title: 'Main Menu',
            width: 500,
            height: 300,
            resizable: true,
        });
        mapEditorMainMenu.generateButton({ text: "Add New Line", onclick: openNewLineModal });
        mapEditorMainMenu.generateButton({ text: "Add New Box", onclick: openNewBoxModal });
    } else {
        mapEditorMainMenu.remove();
        mapEditorMainMenu = null;
    }
});