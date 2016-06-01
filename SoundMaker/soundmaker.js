// SoundMaker - Utility for use with sound.js to create sounds

$(document).ready(function () {
    $("#playSound").click(createAndPlaySound);
    $("#saveSound").click(createSoundButtonsFromInputs);
    createButtonsForSound("shoot", shootSound);
    createButtonsForSound("jump", jumpSound);
    createButtonsForSound("explosion", explosionSound);
});

const shootSound = {
    frequencyValue: 1046.5,
    attack: 0,
    decay: 0.3,
    waveform: "sawtooth",
    volumeValue: 1,
    panValue: -0.8,
    wait: 0,
    pitchBendAmount: 1200,
    reverse: false,
    randomValue: 0,
    dissonance: 25,
    echo: [0.2, 0.2, 2000],  //echo: [delay, feedback, filter]
    reverb: undefined   //reverb: [duration, decay, reverse?]
};

const jumpSound = {
    frequencyValue: 523.25,
    attack: 0.05,
    decay: 0.2,
    waveform: "sine",
    volumeValue: 3,
    panValue: 0.8,
    wait: 0,
    pitchBendAmount: 600,
    reverse: true,
    randomValue: 100,
    dissonance: 0,
    echo: undefined,
    reverb: undefined
}

//The explosion sound
const explosionSound = {
    frequencyValue: 16,          //frequency
    attack: 0,           //attack
    decay:   1,           //decay
    waveform:  "sawtooth",  //waveform
    volumeValue: 1,           //volume
    panValue:   0,           //pan
    wait: 0,           //wait before playing
    pitchBendAmount:   0,           //pitch bend amount
    reverse:  false,       //reverse
    randomValue:   0,           //random pitch range
    dissonance: 50,          //dissonance
    echo: undefined,   //echo: [delay, feedback, filter]
    reverb: undefined    //reverb: [duration, decay, reverse?]
}

function createAndPlaySound() {
    var newSound = createSoundFromInputs();
    var play = playFunctionFromSoundObject(newSound);
    play();
}

function playFunctionFromSoundObject(sound) {
    return function () {
        soundEffect(
            sound.frequencyValue,       //frequency
            sound.attack,         //attack
            sound.decay,          //decay
            sound.waveform,       //waveform
            sound.volumeValue,            //volume
            sound.panValue,          //pan
            sound.wait,            //wait before playing
            sound.pitchBendAmount,          //pitch bend amount
            sound.reverse,         //reverse
            sound.randomValue,          //random pitch range
            sound.dissonance,            //dissonance
            sound.echo,    //echo: [delay, feedback, filter]
            sound.reverb     //reverb: [duration, decay, reverse?]
//        timeout     //maximum duration
        );
    };
}

function createButtonsForSound(soundName, sound) {
    var play = playFunctionFromSoundObject(sound);
    var retrieve = function () { fillInputsFromSoundObject(sound); }

    var buttonRow = $("#buttonRowTemplate").clone().removeAttr("id").show();
    $("#playButtons").append(buttonRow);
    buttonRow.find(".buttonRowLabel").text(soundName);
    buttonRow.find(".playButton").click(play);
    buttonRow.find(".retrieveButton").click(retrieve);
    buttonRow.find(".deleteButtonRow").click(function () { buttonRow.remove(); })
}

var soundNumber = 1;
function createSoundButtonsFromInputs() {
    var newSound = createSoundFromInputs();
    var soundName = $("#soundName").val();
    if (soundName == "") {
        soundName = "Sound " + soundNumber;
    }
    soundNumber = soundNumber + 1;

    createButtonsForSound(soundName, newSound);
}

function createSoundFromInputs() {
    var echo = [floatFromInput("#echoDelayTime"), floatFromInput("#echoFeedbackTime"), floatFromInput("#echoFilter")];
    if (!echo[0] && !echo[1] && !echo[2]) {
        echo = undefined;
    }

    var reverb = [floatFromInput("#reverbDuration"), floatFromInput("#reverbDecayRate"), boolFromInput("#reverbReverse")];
    if (!reverb[0] && !reverb[1] && !reverb[2]) {
        reverb = undefined;
    }

    var sound = {
        frequencyValue: floatFromInput("#frequencyValue"),
        attack: floatFromInput("#attack"),
        decay: floatFromInput("#decay"),
        waveform: $("#waveform").val(),
        volumeValue: floatFromInput("#volumeValue"),
        panValue: floatFromInput("#panValue"),
        wait: floatFromInput("#wait"),
        pitchBendAmount: floatFromInput("#pitchBendAmount"),
        reverse: boolFromInput("#reverse"),
        randomValue: floatFromInput("#randomValue"),
        dissonance: floatFromInput("#dissonance"),
        echo: echo,
        reverb: reverb
    }

    $("#codeArea").val(textFromSound(sound));

    return sound;
}

function textFromSound(sound) {
    return "function playSound() {\n\tsoundEffect(\n" +
     "\t\t" + sound.frequencyValue + ", //frequency \n" +
     "\t\t" + sound.attack + ", //attack \n" +
     "\t\t" + sound.decay + ", //decay \n" +
     "\t\t'" + sound.waveform + "', //waveform \n" +
     "\t\t" + sound.volumeValue + ", //volume \n" +
     "\t\t" + sound.panValue + ", //pan \n" +
     "\t\t" + sound.wait + ", //wait before playing \n" +
     "\t\t" + sound.pitchBendAmount + ", //pitch bend amount \n" +
     "\t\t" + sound.reverse + ", //reverse \n" +
     "\t\t" + sound.randomValue + ", //random pitch range \n" +
     "\t\t" + sound.dissonance + ", //dissonance \n" +
     "\t\t" + sound.echo + ", //echo: [delay, feedback, filter] \n" +
     "\t\t" + sound.reverb + " //reverb: [duration, decay, reverse?] \n" +
//         "\t\t" + timeout + ", //maximum duration \n" +
    "\t);\n}"
}

function fillInputsFromSoundObject(sound) {
    $("#frequencyValue").val(sound.frequencyValue);
    $("#attack").val(sound.attack);
    $("#decay").val(sound.decay);
    $("#waveform").val(sound.waveform),
    $("#volumeValue").val(sound.volumeValue);
    $("#panValue").val(sound.panValue);
    $("#wait").val(sound.wait);
    $("#pitchBendAmount").val(sound.pitchBendAmount);
    $("#reverse").val(sound.reverse ? "true" : "false");
    $("#randomValue").val(sound.randomValue);
    $("#dissonance").val(sound.dissonance);

    if (sound.echo) {
        $("#echoDelayTime").val(sound.echo[0]);
        $("#echoFeedbackTime").val(sound.echo[1]);
        $("#echoFilter").val(sound.echo[2]);
    } else {
        $("#echoDelayTime").val("");
        $("#echoFeedbackTime").val("");
        $("#echoFilter").val("");
    }

    if (sound.reverb) {
        $("#reverbDuration").val(sound.reverb[0]);
        $("#reverbDecayRate").val(sound.reverb[1]);
        $("#reverbReverse").val(sound.reverb[2] ? "true" : "false");
    } else {
        $("#reverbDuration").val("");
        $("#reverbDecayRate").val("");
        $("#reverbReverse").val("");
    }
}

function floatFromInput(selector) {
    var input = $(selector).val();
    return (input == "" ? 0 : parseFloat(input));
}

function boolFromInput(selector) {
    var input = $(selector).val();
    return (input == "true");
}