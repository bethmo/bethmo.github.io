// ForestFire game.  Initial game concept and graphics by Jan Moursund, coding and additional design by Beth Moursund. Creative commons copyright 2016.

const GAME_WIDTH = 700;
const GAME_HEIGHT = 700;
const MINIMAP_RATIO = 14;
const VIEWPORT_MARGIN = 50; // viewport will move if object with focus gets less than this distance from edge
const COPTER_BASE_SPEED = 3;
const BACKGROUND_IMAGE_FILE = "resources/RotatedForestBg.jpg";
const COPTER_IMAGE_FILE = "resources/newRedHelos.png";
const COPTER_SIZE_X = 120;
const COPTER_SIZE_Y = 100;
const COPTER_FRAMES = 5;
const COPTER_TICKS_PER_FRAME = 6;
const FIRE_IMAGE_FILE = "resources/smoke.png";
const FIRE_TILE_SIZE = 80;
const FIRE_TILES_ACROSS_SHEET = 4;
const FIRE_TICKS_PER_STAGE = 15;
const FIRE_STAGE_MAX = 3;
const FIRE_STAGE_AFTER_MAX = 0;
const WATER_IMAGE_FILE = "resources/NewSplash.png";
const WATER_FRAMES = 5;
const WATER_TILE_SIZE_X = 150;
const WATER_TILE_SIZE_Y = 100;
const WATER_TILES_ACROSS_SHEET = 5;
const WATER_TICKS_PER_STAGE = 5;
const BURNED_SPOT_IMAGE_FILE = "resources/burnBrown.png";
const BURNED_TILE_SIZE = 100;
const BURNED_TILES_ACROSS_SHEET = 4;
const FIRE_OVERLAP = 15; // ignore this much distance when checking for new fire intersection -- mom thinks it looks better if they overlap

const DROP_OFFSET = 20;
const WATER_TANK_MAX = 10;
const FIRE_INTERVAL_IN_SECONDS = 2;
const NEW_FIRE_PROBABILITY = 0.2; // modified by number of fires currently burning -- the more fires, the less chance of starting another.
const MAX_FIRES_FOR_NEW_FIRE = 30;
const MAX_TRIES_TO_START_FIRE = 100;
const SPREAD_CHANCE = 0.55;
const BURN_OUT_CHANCE = 0.1;
const GAME_DURATION_IN_SECONDS = 180;

var imagesLoaded = 0;
var imagesNeeded = 0;
var allImagesLoaded = false;
var soundsLoaded = false;
var drawingSurface;
var backgroundImage;
var keysDown = {}; // map keycode to true or false
var fires = [];
var waters = [];
var waterSources = [{ x: 140, y: 2776, radius: 140 }];
var burnedSpots = [];
var waterTank = WATER_TANK_MAX;
var numberDoused = 0;
var paused = false;
var pausedTimeRemaining = 0;
var gameOver = false;
var mute = false;
var startSeconds;
var beepedAtSeconds = 0;


const SPLASH_SOUND = "resources/water-splash-3.mp3";
const COPTER_SOUND = "resources/lawn-mower-trimmed.mp3";
const LOAD_WATER_SOUND = "resources/water.mp3";
const OUT_OF_WATER_SOUND = "resources/slurp.mp3";

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

$(document).ready(function () {
    initSound();
    setUpCanvas();
    copter.init();
    masterFire.init();
    masterWater.init();
    masterBurnedSpot.init();
    setUpEventHandlers();
    $("#mainScreen").hide();
    $("#rulesScreen").hide();
    $("#endScreen").hide();
    $("#instructionsButton").click(showRulesScreen);
    $("#startGame").click(startGameFirstTime).hide();
    $("#restartGame").click(restartGame);
});

function somethingFinishedInit() {
    if (!allImagesLoaded || !soundsLoaded) {
        return;
    }
    $("#startGame").show();

    $("#pleaseWait").hide();
}

function initSound() {
    sounds.load([
      SPLASH_SOUND,
      COPTER_SOUND,
      LOAD_WATER_SOUND,
      OUT_OF_WATER_SOUND
    ]);
    sounds.whenLoaded = function () {
        // Any additional initialization goes here.  Leaving this null throws an exception.
        sounds[COPTER_SOUND].loop = true;
        sounds[COPTER_SOUND].volume = 0.1;
        soundsLoaded = true;
        somethingFinishedInit();
    }
    $(".unmute").hide();
    $(".soundToggle").click(function () {
        mute = !mute;
        if (mute) {
            $(".mute").hide();
            $(".unmute").show();
        } else {
            $(".mute").show();
            $(".unmute").hide();
        }
        adjustCopterSound();
    });

}

function adjustCopterSound() {
    var quiet = (mute || paused || gameOver);
    if (quiet && sounds[COPTER_SOUND].playing) {
        sounds[COPTER_SOUND].pause();
    } else if (!quiet && !sounds[COPTER_SOUND].playing) {
        sounds[COPTER_SOUND].play();
    }
}

function startLoadingImage(filename) {
    imagesNeeded++;
    var image = new Image();
    image.addEventListener("load", whenImagesHaveLoaded, false);
    image.src = filename;
    return image;
}

function showRulesScreen() {
    $("#startScreen").hide();
    $("#rulesScreen").show();
    $("#exitRulesScreen").click(function() {
        $("#exitRulesScreen").off('click');
        $("#startScreen").show();
        $("#rulesScreen").hide();
    })
}

function playDropWaterSound() {
    //splashSound.pause();
    //splashSound.currentTime = 0;
    //splashSound.play();
    if (!mute) {
        sounds[SPLASH_SOUND].play();
    }
}

function playLoadWaterSound() {
    if (!mute) {
        sounds[LOAD_WATER_SOUND].play();
    }
}

function playOutOfWaterSound() {
    if (!mute) {
        sounds[OUT_OF_WATER_SOUND].play();
    }
}

function beep() {
    if (!mute) {
        soundEffect(
            1046.5, //frequency 
            0.1, //attack 
            0.1, //decay 
            'sine', //waveform 
            1, //volume 
            0, //pan 
            0, //wait before playing 
            0, //pitch bend amount 
            false, //reverse 
            0, //random pitch range 
            0, //dissonance 
            undefined, //echo: [delay, feedback, filter] 
            undefined //reverb: [duration, decay, reverse?] 
        );;
    }
}

var copter = {
    // Note: Copter x and y are the center of the copter, not the topleft
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    radius: COPTER_SIZE_X / 2,
    image: null,
    flip: false, // true if we most recently moved rightward -- flip the direction copter is pointing
    ticks: 0,
    init: function () {
        this.image = startLoadingImage(COPTER_IMAGE_FILE);
    },
    move: function () {
        var speed = (keysDown[SHIFT] ? COPTER_BASE_SPEED * 2 : COPTER_BASE_SPEED);
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
            frame * COPTER_SIZE_X, (this.flip ? 0 : COPTER_SIZE_Y),
            COPTER_SIZE_X, COPTER_SIZE_Y,
            drawX, drawY,
            COPTER_SIZE_X, COPTER_SIZE_Y
        );
        this.ticks = (this.ticks + 1) % (COPTER_FRAMES * COPTER_TICKS_PER_FRAME);
    }
}

var masterItem = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    radius: 0,
    imageSheet: null,
    tilesPerRow: 1,
    ticksPerStage: 0,
    maxStage: 0,
    stageAfterMax: -1,
    stage: 0, // image to display; may also affect how much water it takes to extinguish
    age: 0, // number of ticks fire has been displaying current image
    callbackAfterMaxStage: null, // if this exists and returns false, item is finished and should be deleted
    collection: null, // place where this type of items are stored
    init: function (imageFile, width, height, tilesPerRow, collection) {
        this.width = width;
        this.height = height;
        this.radius = Math.max(width, height) / 2;
        this.tilesPerRow = tilesPerRow;
        this.imageSheet = startLoadingImage(imageFile);
        this.collection = collection;
    },
    render: function () {
        var drawX = this.x - viewport.x - this.width/2;
        var drawY = this.y - viewport.y - this.height/2;

        var sheetX = (this.stage % this.tilesPerRow) * this.width;
        var sheetY = Math.floor(this.stage / this.tilesPerRow) * this.height;
        drawingSurface.drawImage(
            this.imageSheet,
            sheetX, sheetY,
            this.width, this.height,
            drawX, drawY,
            this.width, this.height
        );
    },
    tick: function () {
        if (!this.ticksPerStage) {
            // Single image item, no aging
            return true;
        }
        // Age the item by one tick.  Return true to keep item, false if item is finished and should be deleted.
        this.age++;
        if (this.age > this.ticksPerStage) {
            this.stage++;
            this.age = 0;
        }
        if (this.stage > this.maxStage) {
            if (this.callbackAfterMaxStage) {
                if (!this.callbackAfterMaxStage()) {
                    return false;
                }
            }
            if (this.stageAfterMax >= 0) {
                this.stage = this.stageAfterMax;
            } else {
                return false;
            }
        }
        return true;
    },
    createAt: function (x, y) {
        // Create and return a new item of this type. If collection exists, also add it to collection.
        var item = Object.create(this);
        item.x = x;
        item.y = y;
        if (this.collection) {
            this.collection.push(item);
        }
        return item;
    }
}

function isInBounds(x, y, margin) {
    if (margin == undefined) {
        margin = 0;
    }
    return ((x >= margin) && (y >= margin) && (x < backgroundImage.width - margin) && (y < backgroundImage.height - margin));
}

const DIRECTION_VECTORS = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, -1], [1, 0], [1, 1]];

var masterFire = Object.create(masterItem);
masterFire.init = function() {
    this.__proto__.init.call(this, FIRE_IMAGE_FILE, FIRE_TILE_SIZE, FIRE_TILE_SIZE, FIRE_TILES_ACROSS_SHEET, fires);
    this.ticksPerStage = FIRE_TICKS_PER_STAGE;
    this.maxStage = FIRE_STAGE_MAX;
    this.stageAfterMax = FIRE_STAGE_AFTER_MAX;
    this.callbackAfterMaxStage = function () {
        if (Math.random() <= SPREAD_CHANCE) {
            this.spread();
        }
        if (Math.random() <= BURN_OUT_CHANCE) {
            this.burnOut();
            return false;
        }
        return true;
    };
    this.spread = function () {
        // Start another fire in a random direction, if there's not already a fire, burned out spot, or water source there
        var angle = Math.random() * Math.PI * 2;
        var distance = this.radius + this.radius - FIRE_OVERLAP + 1;
        var temp = {
            x: this.x + Math.cos(angle) * distance,
            y: this.y + Math.sin(angle) * distance,
            radius: this.radius
        };
        if (isInBounds(temp.x, temp.y) && !findOverlappingItem(temp, fires, FIRE_OVERLAP) && !findOverlappingItem(temp, burnedSpots, FIRE_OVERLAP) && !findOverlappingItem(temp, waterSources)) {
            masterFire.createAt(temp.x, temp.y);
        }
    };
    this.burnOut = function () {
        masterBurnedSpot.createAt(this.x, this.y);
    };
}

var masterWater = Object.create(masterItem);
masterWater.init = function() {
    this.__proto__.init.call(this, WATER_IMAGE_FILE, WATER_TILE_SIZE_X, WATER_TILE_SIZE_Y, WATER_TILES_ACROSS_SHEET, waters);
    this.ticksPerStage = WATER_TICKS_PER_STAGE;
    this.maxStage = WATER_TILES_ACROSS_SHEET - 1;
}

var masterBurnedSpot = Object.create(masterItem);
masterBurnedSpot.init = function () {
    this.__proto__.init.call(this, BURNED_SPOT_IMAGE_FILE, BURNED_TILE_SIZE, BURNED_TILE_SIZE, BURNED_TILES_ACROSS_SHEET, burnedSpots);
    // Burned spots don't animate, but there are several different versions. Pick a random one at create time.
    this.ticksPerStage = 0;
    this.createAt = function (x, y) {
        var item = this.__proto__.createAt.call(this, x, y);
        item.stage = Math.floor(Math.random() * BURNED_TILES_ACROSS_SHEET);
    }
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
        drawRect(this.drawingSurface, 0, 0, this.canvas.width, this.canvas.height, null, "green");
        if (!gameOver) {
            this.drawingSurface.setLineDash([5]);
            drawRect(this.drawingSurface, viewport.x / MINIMAP_RATIO, viewport.y / MINIMAP_RATIO, viewport.width / MINIMAP_RATIO, viewport.height / MINIMAP_RATIO,
                "white", null);
            this.drawingSurface.setLineDash([]);
        }
        var ctx = this.drawingSurface;
        fires.forEach(function (fire) {
            drawCircle(ctx, fire.x / MINIMAP_RATIO, fire.y / MINIMAP_RATIO,
                fire.radius / MINIMAP_RATIO,
                null, "red");
        })
        waterSources.forEach(function (water) {
            drawCircle(ctx, water.x / MINIMAP_RATIO, water.y / MINIMAP_RATIO,
                water.radius / MINIMAP_RATIO,
                null, "aqua");
        })
        burnedSpots.forEach(function (burn) {
            drawCircle(ctx, burn.x / MINIMAP_RATIO, burn.y / MINIMAP_RATIO,
                burn.radius / MINIMAP_RATIO,
                null, "black");
        })
    }
}


function setUpCanvas() {
    var canvas = document.getElementById('myCanvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    drawingSurface = canvas.getContext('2d');

    drawingSurface.font = "30px Arial";
    drawingSurface.textAlign = "center";
    drawingSurface.fillText("Loading, please wait...", canvas.width / 2, canvas.height / 2);

    backgroundImage = startLoadingImage(BACKGROUND_IMAGE_FILE);
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
    allImagesLoaded = true;
    somethingFinishedInit();
}

function startTimer() {
    startSeconds = Math.floor(new Date().getTime() / 1000);
}

function getTimeRemaining() {
    var currentSeconds = Math.floor(new Date().getTime() / 1000);
    var timeElapsed = currentSeconds - startSeconds;
    return GAME_DURATION_IN_SECONDS - timeElapsed;
}

// Update the time display. Return true if game is over.
function updateTimer() {
    var timeRemaining = getTimeRemaining();
    if (timeRemaining > 0) {
        var minutesRemaining = Math.floor(timeRemaining / 60);
        var secondsRemaining = timeRemaining % 60;
        $("#timeDisplay").text(minutesRemaining + ":" + (secondsRemaining < 10 ? "0" : "") + secondsRemaining);
        if ((timeRemaining <= 10) && (beepedAtSeconds != timeRemaining)) {
            beepedAtSeconds = timeRemaining;
            beep();
            if (timeRemaining == 10) {
                $("#timeDisplay").addClass("ending");
            }
        }
        return false;
    }
    $("#timeDisplay").text("Game Over");
    return true;
}

function startGameFirstTime() {
    $("#startScreen").hide();
    $("#mainScreen").show();
    $("#pauseButton").click(togglePause);
    minimap.init();

    setInterval(startRandomFire, FIRE_INTERVAL_IN_SECONDS * 1000);
    startGame();
}

function startGame() {
    fires.length = 0;
    waters.length = 0;
    burnedSpots.length = 0;
    numberDoused = 0;
    waterTank = WATER_TANK_MAX;
    startTimer();
    displayWaterLevel();

    // start in center of screen for now.  Later we may have a home base at a fixed location.
    copter.x = backgroundImage.width / 2;
    copter.y = backgroundImage.height / 2;
    viewport.centerOn(copter);
    adjustCopterSound();
    // create the first fire near copter; the rest will be random
    masterFire.createAt(copter.x + 200, copter.y - 100);

    update();
}

function restartGame() {
    gameOver = false;
    $("#endScreen").hide();
    $("#mainScreen").show();
    $("#timeDisplay").removeClass("ending");
    $("#gameMinimapHolder").append($("#minimapCanvas"));
    startGame();
}

function getRandomFireLocation() {
    return {
        x: Math.random() * (backgroundImage.width - 100) + 50,
        y: Math.random() * (backgroundImage.height - 100) + 50
    };
}

function startRandomFire() {
    if (paused || gameOver) {
        return;
    }

    if ((fires.length > 0) && (Math.random() > (1 - fires.length / MAX_FIRES_FOR_NEW_FIRE) * NEW_FIRE_PROBABILITY)) {
        return;
    }
    var location = getRandomFireLocation();
    var fire = masterFire.createAt(location.x, location.y);
    for (var i = 0; i < MAX_TRIES_TO_START_FIRE; i++) {
        if (findOverlappingItem(fire, waterSources) == null && findOverlappingItem(fire, burnedSpots) == null && findOverlappingItem(fire, fires) == fire) {
            return;
        }
        location = getRandomFireLocation();
        fire.x = location.x;
        fire.y = location.y;
    }
    // TODO: Most of the forest is either on fire or burned out.  This is probably a good spot to end the game!
}

function keyDownHandler(event) {
    keysDown[event.keyCode] = true;
    // Add code here for things that trigger on keypress
    switch (event.keyCode) {
        case ESC:
            togglePause();
            break;
        case SPACEBAR:
            dropOrGetWater();
            break;
    }
}

function keyUpHandler(event) {
    keysDown[event.keyCode] = false;
}

function togglePause() {
    if (paused) {
        paused = false;
        $("#pauseButton").text("Pause");
        var currentSeconds = Math.floor(new Date().getTime() / 1000);
        startSeconds = currentSeconds - GAME_DURATION_IN_SECONDS + pausedTimeRemaining;
        pausedTimeRemaining = 0;
        update();
    } else {
        paused = true;
        pausedTimeRemaining = getTimeRemaining();
        $("#pauseButton").text("Continue")
        drawingSurface.font = "80px Arial bold";
        drawingSurface.fillStyle = "DeepSkyBlue";
        drawingSurface.textAlign = "center";
        drawingSurface.fillText("Paused", GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    adjustCopterSound();
    $("#pauseButton").blur();
}

function removeItem(collection, item) {
    var i = collection.indexOf(item);
    if (i >= 0) {
        collection.splice(i, 1);
    }
}

function findOverlappingItem(target, arrayOfItems, ignoreRadius) {
    // Given that items have x, y, and radius, find the first item in array that overlaps target
    // if ignoreRadius is provided, ignore that much of the overlap (so they need to be closer together to count as overlapping)
    if (ignoreRadius == undefined) {
        ignoreRadius = 0;
    }
    for (var i = 0; i < arrayOfItems.length; i++) {
        var dx = target.x - arrayOfItems[i].x;
        var dy = target.y - arrayOfItems[i].y;
        var distanceSquared = (dx * dx) + (dy * dy);
        var maxDistanceForOverlap = target.radius + arrayOfItems[0].radius - ignoreRadius;
        // Just compare the squares rather than taking square root of each
        if (maxDistanceForOverlap * maxDistanceForOverlap >= distanceSquared) {
            return arrayOfItems[i];
        }
    }
    return null;
}

function displayWaterLevel() {
    var fillPercent = waterTank / WATER_TANK_MAX * 100;
    $("#waterTankFillGraphic").height(fillPercent + "%");
}

function displayFireStats() {
    $("#doused").text(numberDoused);
    $("#burnt").text(burnedSpots.length);
}

function dropOrGetWater() {
    var waterSource = findOverlappingItem(copter, waterSources);
    if (waterSource != null) {
        playLoadWaterSound();
        waterTank = WATER_TANK_MAX;
        displayWaterLevel();
    } else if (waterTank > 0) {
        playDropWaterSound();
        waterTank--;
        displayWaterLevel();
        var water = masterWater.createAt(copter.x, Math.min(copter.y + DROP_OFFSET, backgroundImage.height));
        var fire = findOverlappingItem(water, fires);
        while (fire) {
            numberDoused++;
            removeItem(fires, fire);
            fire = findOverlappingItem(water, fires);
        }
    } else {
        playOutOfWaterSound();
    }
}

function tickAndRemoveFinishedItems(collection) {
    for (var i = collection.length - 1; i >= 0; i--) {
        if (!collection[i].tick()) {
            collection.splice(i, 1);
        }
    }
}

function update() {
    if (paused || gameOver) {
        return;
    }

    gameOver = updateTimer();
    if (gameOver) {
        endGame();
        return;
    }

    copter.move();
    tickAndRemoveFinishedItems(fires);
    tickAndRemoveFinishedItems(waters);
    tickAndRemoveFinishedItems(burnedSpots);

    drawingSurface.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    viewport.renderBackground();
    burnedSpots.forEach(function (item) { item.render(); })
    fires.forEach(function (item) { item.render(); })
    waters.forEach(function (item) { item.render(); })
    copter.render();
    minimap.render();
    displayFireStats();

    requestAnimFrame(update);
}

function endGame() {
    adjustCopterSound();
    minimap.render();
    $("#mainScreen").hide();
    $("#endScreen").show();
    $("#endMinimapHolder").append($("#minimapCanvas"));
    var score = 100 + numberDoused * 10 - burnedSpots.length * 2 - fires.length;
    $("#finalScore").text("Score: " + score);
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

function drawCircle(ctx, x, y, radius, borderColor, fillColor) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, false);
    if (fillColor != null) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (borderColor != null) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
    }
    ctx.closePath();
    }