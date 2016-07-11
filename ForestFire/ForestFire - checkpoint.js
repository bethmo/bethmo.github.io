const GAME_WIDTH = 700;
const GAME_HEIGHT = 700;
const MINIMAP_RATIO = 14;
const VIEWPORT_MARGIN = 50; // viewport will move if object with focus gets less than this distance from edge
const COPTER_BASE_SPEED = 2;
const BACKGROUND_IMAGE_FILE = "RotatedForestBg.png";
const COPTER_IMAGE_FILE = "helos100x100.png";
const COPTER_SIZE = 100;
const COPTER_FRAMES = 5;
const COPTER_TICKS_PER_FRAME = 6;
const FIRE_IMAGE_FILE = "fireTileSheetSmall2.png";
const FIRE_TILE_SIZE = 80;
const FIRE_TILES_ACROSS_SHEET = 4;
const FIRE_TICKS_PER_STAGE = 60;
const FIRE_STAGE_MAX = 7;
const FIRE_STAGE_AFTER_MAX = 4;
const WATER_IMAGE_FILE = "splash.png";
const WATER_FRAMES = 5;
const WATER_TILE_SIZE_X = 150;
const WATER_TILE_SIZE_Y = 100;

var imagesLoaded = 0;
var imagesNeeded = 4;
var drawingSurface;
var backgroundImage;
var keysDown = {}; // map keycode to true or false
var fires = [];
var waterSources = [];
var paused = false;

var copter = {
    // Note: Copter x and y are the center of the copter, not the topleft
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    radius: COPTER_SIZE / 2,
    image: null,
    flip: false, // true if we most recently moved rightward -- flip the direction copter is pointing
    ticks: 0,
    init: function() {
        this.image = new Image();
        this.image.addEventListener("load", whenImagesHaveLoaded, false);
        this.image.src = COPTER_IMAGE_FILE;
    },
    move: function () {
        var speed = (keysDown[SPACEBAR] ? COPTER_BASE_SPEED * 2 : COPTER_BASE_SPEED);
        if (keysDown[LEFT_ARROW] || keysDown[LEFT_UP_KEYPAD] || keysDown[LEFT_DOWN_KEYPAD]) {
            this.x -= speed;
            this.flip = false;
        }
        if (keysDown[RIGHT_ARROW] || keysDown[RIGHT_UP_KEYPAD] || keysDown[RIGHT_DOWN_KEYPAD]) {
            this.x += speed;
            this.flip = true;
        }
        if (keysDown[UP_ARROW] || keysDown[LEFT_UP_KEYPAD] || keysDown[RIGHT_UP_KEYPAD]) {
            this.y -= speed;
        }
        if (keysDown[DOWN_ARROW] || keysDown[LEFT_DOWN_KEYPAD] || keysDown[RIGHT_DOWN_KEYPAD]) {
            this.y += speed;
        }
        this.x = Math.max(0, Math.min(backgroundImage.width, this.x));
        this.y = Math.max(0, Math.min(backgroundImage.height, this.y));
        viewport.adjustToInclude(this);
    },
    render: function () {
        // Temporary code: copter is a circle, blue for normal, red when using turbo speed
        //var drawX = this.x - viewport.x;
        //var drawY = this.y - viewport.y;
        //drawingSurface.beginPath();
        //drawingSurface.arc(drawX, drawY, this.radius, 0, Math.PI * 2, false);
        //drawingSurface.fillStyle = keysDown[SPACEBAR] ? "red" : "blue";
        //drawingSurface.fill();
        //drawingSurface.closePath();

        var drawX = this.x - viewport.x - this.radius;
        var drawY = this.y - viewport.y - this.radius;
        var frame = Math.floor(this.ticks / COPTER_TICKS_PER_FRAME);
        drawingSurface.drawImage(
            this.image,
            frame * COPTER_SIZE, (this.flip ? COPTER_SIZE : 0),
            COPTER_SIZE, COPTER_SIZE,
            drawX, drawY,
            COPTER_SIZE, COPTER_SIZE
        );
        this.ticks = (this.ticks + 1) % (COPTER_FRAMES * COPTER_TICKS_PER_FRAME);
    },
    debugPrint: function() {
        $("#copterX").text(this.x);
        $("#copterY").text(this.y);
    }
}

var masterFire = {
    x: 0,
    y: 0,
    width: FIRE_TILE_SIZE,
    height: FIRE_TILE_SIZE,
    radius: FIRE_TILE_SIZE / 2,
    imageSheet: null,
    stage: 0, // image to display; may also affect how much water it takes to extinguish
    age: 0, // number of ticks fire has been displaying current image
    init: function () {
        this.imageSheet = new Image();
        this.imageSheet.addEventListener("load", whenImagesHaveLoaded, false);
        this.imageSheet.src = FIRE_IMAGE_FILE;
    },
    render: function () {
        var drawX = this.x - viewport.x - this.radius;
        var drawY = this.y - viewport.y - this.radius;

        var sheetX = this.stage % FIRE_TILES_ACROSS_SHEET * FIRE_TILE_SIZE;
        var sheetY = Math.floor(this.stage / FIRE_TILES_ACROSS_SHEET) * FIRE_TILE_SIZE;
        drawingSurface.drawImage(
            this.imageSheet,
            sheetX, sheetY,
            FIRE_TILE_SIZE, FIRE_TILE_SIZE,
            drawX, drawY,
            FIRE_TILE_SIZE, FIRE_TILE_SIZE
        );
    },
    grow: function () {
        this.age++;
        if (this.age > FIRE_TICKS_PER_STAGE) {
            this.stage++;
            this.age = 0;
        }
        if (this.stage > FIRE_STAGE_MAX) {
            this.stage = FIRE_STAGE_AFTER_MAX;
        }
    }
}

var masterWater = {
    x: 0,
    y: 0,
    width: WATER_TILE_SIZE_X,
    height: WATER_TILE_SIZE_Y,
    radius: Math.max(WATER_TILE_SIZE_X, WATER_TILE_SIZE_Y),
    imageSheet: null,
    stage: 0, // image to display
    age: 0, // number of ticks fire has been displaying current image
    init: function () {
        this.imageSheet = new Image();
        this.imageSheet.addEventListener("load", whenImagesHaveLoaded, false);
        this.imageSheet.src = WATER_IMAGE_FILE;
    }
}

function startFireAt(x, y) {
    var fire = Object.create(masterFire);
    fire.x = x;
    fire.y = y;
    fires.push(fire);
}

var viewport = {
    x: 0,
    y: 0,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    margin: VIEWPORT_MARGIN,
    centerOn: function (target) {
        // target must be an object with x and y in game coordinates
        this.x = Math.max(0, Math.min(backgroundImage.width - this.width, target.x - this.width / 2));
        this.y = Math.max(0, Math.min(backgroundImage.height - this.height, target.y - this.height / 2));
    },
    adjustToInclude: function (target) {
        // Move the viewport the minimum amount necessary to put the target within the non-margin portion of the
        // viewport if possible, or the viewport as a whole if not.
        if (target.x - this.x < this.margin) {
            this.x = Math.max(0, target.x - this.margin);
        } else if (this.x + this.width - target.x < this.margin) {
            this.x = Math.min(backgroundImage.width - this.width, target.x + this.margin - this.width);
        }
        if (target.y - this.y < this.margin) {
            this.y = Math.max(0, target.y - this.margin);
        } else if (this.y + this.height - target.y < this.margin) {
            this.y = Math.min(backgroundImage.height - this.height, target.y + this.margin - this.height);
        }
    },
    renderBackground: function () {
        drawingSurface.drawImage(
            backgroundImage,
            this.x, this.y,
            this.width, this.height,
            0, 0,
            this.width, this.height
        );
    },
    debugPrint: function () {
        //debug
        $("#viewportX").text(this.x);
        $("#viewportY").text(this.y);
    }
}

var minimap = {
    canvas: null,
    drawingSurface: null,
    init: function () {
        this.canvas = document.getElementById('minimapCanvas');
        this.drawingSurface = this.canvas.getContext('2d');
        this.canvas.width = backgroundImage.width / MINIMAP_RATIO;
        this.canvas.height = backgroundImage.height / MINIMAP_RATIO;
    },
    render: function () {
        this.drawingSurface.setLineDash([5]);
        drawRect(this.drawingSurface, 0, 0, this.canvas.width, this.canvas.height, null, "green");
        drawRect(this.drawingSurface, viewport.x / MINIMAP_RATIO, viewport.y / MINIMAP_RATIO, viewport.width / MINIMAP_RATIO, viewport.height / MINIMAP_RATIO,
            "white", null);
        this.drawingSurface.setLineDash([]);
        var ctx = this.drawingSurface;
        fires.forEach(function (fire) {
            drawRect(ctx, (fire.x - fire.radius) / MINIMAP_RATIO, (fire.y - fire.radius) / MINIMAP_RATIO,
                fire.width / MINIMAP_RATIO, fire.height / MINIMAP_RATIO,
                null, "red");
        })
    }
}

$(document).ready(function () {
    setUpCanvas();
    copter.init();
    masterFire.init();
    masterWater.init();
    setUpEventHandlers();
});

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function setUpCanvas() {
    var canvas = document.getElementById('myCanvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    drawingSurface = canvas.getContext('2d');

    drawingSurface.font = "30px Arial";
    drawingSurface.textAlign = "center";
    drawingSurface.fillText("Loading, please wait...", canvas.width / 2, canvas.height / 2);

    backgroundImage = new Image();
    backgroundImage.addEventListener("load", whenImagesHaveLoaded, false);
    backgroundImage.src = BACKGROUND_IMAGE_FILE;
}

function setUpCopter() {
    copter.image = new Image();
    copter.image.addEventListener("load", whenImagesHaveLoaded, false);
    copter.image.src = COPTER_IMAGE_FILE;
}

function setUpEventHandlers() {
    $(document).keydown(keyDownHandler);
    $(document).keyup(keyUpHandler);
}

function whenImagesHaveLoaded(event) {
    imagesLoaded++;
    if (imagesLoaded < imagesNeeded) {
        return;
    }
    // start in center of screen for now.  Later we may have a home base at a fixed location.
    copter.x = backgroundImage.width / 2;
    copter.y = backgroundImage.height / 2;
    viewport.centerOn(copter);
    startFireAt(copter.x + 100, copter.y);
    minimap.init();
    (function animloop() {
        requestAnimFrame(animloop);
        update();
    })();
}

function keyDownHandler() {
    keysDown[event.keyCode] = true;
    // Add code here for things that trigger on keypress
    if (event.keyCode == ESC) {
        togglePause();
    } else if (event.key == "w") {
        dropOrGetWater();
    }
}

function keyUpHandler() {
    keysDown[event.keyCode] = false;
}

function togglePause() {
    if (paused) {
        paused = false;
    } else {
        paused = true;

        drawingSurface.font = "80px Arial bold";
        drawingSurface.fillStyle = "MediumPurple";
        drawingSurface.textAlign = "center";
        drawingSurface.fillText("Paused", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
}

function findOverlappingItem(target, arrayOfItems) {
    // Given that items have x, y, and radius, find the first item in array that overlaps target
    var targetRadiusSquared = target.radius * target.radius;
    for (var i = 0; i < arrayOfItems.length; i++) {
        var dx = target.x - arrayOfItems[i].x;
        var dy = target.y - arrayOfItems[i].y;
        var distanceSquared = (dx * dx) + (dy * dy);
        if (targetRadiusSquared + arrayOfItems[i].radius * arrayOfItems[i].radius < distanceSquared) {
            return arrayOfItems[i];
        }
    }
    return null;
}

function dropOrGetWater() {
    var water = findOverlappingItem(copter, waterSources);
    if (water != null) {
        fillTank(water);
    } else {
        var fire = findOverlappingItem(copter, fires);
        fire.water();
        // TODO: remove some water from tank
    }
}

function fillTank() {
    //TODO
}

function update() {
    if (paused) {
        return;
    }
    copter.move();
    fires.forEach(function(fire) { fire.grow(); })

    drawingSurface.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    viewport.renderBackground();
    fires.forEach(function (fire) { fire.render(); })
    copter.render();
    minimap.render();

    viewport.debugPrint();
    copter.debugPrint();
}

function drawRect(ctx, left, top, width, height, borderColor, fillColor) {
    ctx.beginPath();
    ctx.rect(left, top, width, height);
    if (fillColor != null) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (borderColor != null) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
}
