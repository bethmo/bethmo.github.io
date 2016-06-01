// JavaScript source code

const gameWidth = 500;
const gameHeight = 400;
const wallSize = 2;
const ballRadius = 5;
const paddleWidth = 60;
const paddleHeight = 2;
const paddleSpeed = 5;
const startingBallSpeed = 5;

const beep = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");


var context;
var boingSound;
var balls = [];
var leftKeyDown = false;
var rightKeyDown = false;
var paused = false;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

$(document).ready(function () {
    var canvas = document.getElementById('myCanvas');
    canvas.width = gameWidth;
    canvas.height = gameHeight;
    context = canvas.getContext('2d');

    boingSound = document.getElementById('boing');

    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);

    //setInterval(update, 1000 / 60);
    (function animloop() {
        requestAnimFrame(animloop);
        update();
    })();
});

function keyDownHandler() {
    switch (event.keyCode) {
        case 37:
            leftKeyDown = true;
            break;
        case 39:
            rightKeyDown = true;
            break;
        case 27:
            togglePause();
            break;
        case 32:
            launchBall();
    }
}

function keyUpHandler() {
    switch (event.keyCode) {
        case 37:
            leftKeyDown = false;
            break;
        case 39:
            rightKeyDown = false;
            break;
    }
}

function togglePause() {
    if (paused) {
        paused = false;
    } else {
        paused = true;

        context.font = "80px Arial bold";
        context.fillStyle = "MediumPurple";
        context.textAlign = "center";
        context.fillText("Paused", gameWidth / 2, gameHeight / 2);
    }
}

function launchBall() {
    var newBall = Object.create(Ball);
    newBall.x = paddle.x + paddle.width / 2;
    newBall.y = paddle.y - Ball.radius;
    newBall.vy = -startingBallSpeed;
    newBall.vx = 0;
    balls.push(newBall);
    jumpSound();
}

function clearCanvas() {
    context.clearRect(0, 0, gameWidth, gameHeight);
}

var Ball = {
    x: gameWidth/2,
    y: gameHeight/2,

    radius: ballRadius,
    color: "red",

    // Velocity components
    vx: 2,
    vy: startingBallSpeed,

    draw: function () {
        // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
        //context.lineWidth = 1;
        //context.strokeStyle = 'black';
        //context.stroke();
        context.closePath();
    }

};

var paddle = {
    x: (gameWidth - paddleWidth) / 2,
    y: gameHeight - 10,
    width: paddleWidth,
    height: 2,
    deflectBallIfHit: function (ball) {
        // Ball only interacts with paddle while moving downward in the paddle's row
        if ((ball.vy < 0) || (ball.y + ball.radius < paddle.y) || (ball.y - ball.radius > paddle.y)) {
            return;
        }

        if ((ball.x + ball.radius >= this.x) && (ball.x - ball.radius <= this.x + this.width)) {
            ball.vy = -ball.vy;

            // Deflect the ball in a direction based solely on where it hit, regardless of incoming direction
            var fractionOfPaddleWidthFromCenter = ((ball.x - this.x) / this.width) - 0.5;
            console.log("paddle x: " + this.x + ", ball: " + ball.x + ", fraction: " + fractionOfPaddleWidthFromCenter);
            ball.vx = startingBallSpeed * fractionOfPaddleWidthFromCenter * 2;
            beep.play();
        }
    },
    draw: function () {
        drawRectWithBorder(this.x, this.y, this.width, this.height, "black");
    },
    move: function () {
        if (leftKeyDown && rightKeyDown) {
            return;
        }
        if (leftKeyDown) {
            this.x = Math.max(0, this.x - paddleSpeed);
        } else if (rightKeyDown) {
            this.x = Math.min(gameWidth - paddleWidth, this.x + paddleSpeed);
        }
    }
}

function update() {
    if (paused) {
        return;
    }
    clearCanvas();
    drawWalls();
    paddle.move();
    paddle.draw();

    // Process balls in reverse order so we can delete lost balls in middle of loop
    for (i = balls.length - 1; i >= 0; i--) {
        var ball = balls[i];
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - ball.radius < 0 || ball.x + ball.radius > gameWidth) {
            ball.vx = -ball.vx;
            beep.play();
        }
        if (ball.y - ball.radius < 0) {
            ball.vy = -ball.vy;
            beep.play();
        }

        paddle.deflectBallIfHit(ball);

        if (ball.y + ball.radius > gameHeight) {
            // Lose ball off bottom of screen
            balls.splice(i, 1);
        } else {
            ball.draw();
        }

    }

}

function drawWalls() {
    drawRectWithBorder(0, 0, gameWidth, wallSize, "black");
    drawRectWithBorder(0, 0, wallSize, gameHeight, "black");
    drawRectWithBorder(gameWidth - wallSize, 0, wallSize, gameHeight, "black");
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

// color is an optional string in the form "#123456" representing hex. If not provided, color is random.
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

//The jump sound
function jumpSound() {
    soundEffect(
      523.25,       //frequency
      0.05,         //attack
      0.2,          //decay
      "sine",       //waveform
      3,            //volume
      0.8,          //pan
      0,            //wait before playing
      600,          //pitch bend amount
      true,         //reverse
      100,          //random pitch range
      0,            //dissonance
      undefined,    //echo: [delay, feedback, filter]
      undefined     //reverb: [duration, decay, reverse?]
    );
}