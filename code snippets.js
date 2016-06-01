
function drawBrick(brick, color) {
    drawRectWithBorder(brick.left, brick.top, brick.width, brick.height, brick.color);
}

function test() {
    drawBrick({ left: 0, top: 0, width: 30 * 15, height: 30 * 15 }, "#ffffff"); // cheat for screen boundary
    var brick = {
        top: 50,
        width: 30,
        height: 10
    };
    for (var i = 0; i < 15; i++) {
        brick.left = i * 30;
        drawBrick(brick);
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawRectWithBorder(left, top, width, height, color) {
    context.beginPath();
    context.rect(left, top, width, height);
    context.fillStyle = (color == undefined) ? getRandomColor() : color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
}
