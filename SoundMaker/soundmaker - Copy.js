// SoundMaker - Utility for use with sound.js to create sounds

$(document).ready(function () {
    $("#playSound").click(createAndPlaySound);
    $("#saveSound").click(createSoundButton);
});

function createAndPlaySound() {
    var newSound = createSoundFromInputs();
    newSound();
}

var soundNumber = 1;
function createSoundButton() {
    var newSound = createSoundFromInputs();
    var soundName = $("#soundName").val();
    if (soundName == "") {
        soundName = "Sound " + soundNumber;
    }
    var id = "playSound" + soundNumber;
    var button = $("<button id='" + id + "'>" + soundName + "</button>");
    $("#playButtons").append(button);
    button.click(newSound);
    soundNumber = soundNumber + 1;
}

function createSoundFromInputs() {
    var echo = [floatFromInput("#echoDelayTime"), floatFromInput("#echoFeedbackTime"), floatFromInput("#echoFilter")];
    if (!echo[0] && !echo[1] && !echo[2]) {
        echo = undefined;
    }

    var reverb = [floatFromInput("#reverbDuration"), floatFromInput("#reverbDecayRate"), floatFromInput("#reverbReverse")];
    if (!reverb[0] && !reverb[1] && !reverb[2]) {
        reverb = undefined;
    }

    var frequencyValue = floatFromInput("#frequencyValue");
    var attack = floatFromInput("#attack");
    var decay = floatFromInput("#decay");
    var waveform = $("#waveform").val();
    var volumeValue = floatFromInput("#volumeValue");
    var panValue = floatFromInput("#panValue");
    var wait = floatFromInput("#wait");
    var pitchBendAmount = floatFromInput("#pitchBendAmount");
    var reverse = boolFromInput("#reverse");
    var randomValue = floatFromInput("#randomValue");
    var dissonance = floatFromInput("#dissonance");
    //var timeout = floatFromInput("#timeout");


    var codeAsText = "function playSound() {\n\tsoundEffect(\n" +
         "\t\t" + frequencyValue + ", //frequency \n" +
         "\t\t" + attack + ", //attack \n" +
         "\t\t" + decay + ", //decay \n" +
         "\t\t" + waveform + ", //waveform \n" +
         "\t\t" + volumeValue + ", //volume \n" +
         "\t\t" + panValue + ", //pan \n" +
         "\t\t" + wait + ", //wait before playing \n" +
         "\t\t" + pitchBendAmount + ", //pitch bend amount \n" +
         "\t\t" + reverse + ", //reverse \n" +
         "\t\t" + randomValue + ", //random pitch range \n" +
         "\t\t" + dissonance + ", //dissonance \n" +
         "\t\t" + echo + ", //echo: [delay, feedback, filter] \n" +
         "\t\t" + reverb + ", //reverb: [duration, decay, reverse?] \n" +
//         "\t\t" + timeout + ", //maximum duration \n" +
        "\t);\n}"

    $("#codeArea").val(codeAsText);

    var playSound = function () {
        soundEffect(
            frequencyValue,       //frequency
            attack,         //attack
            decay,          //decay
            waveform,       //waveform
            volumeValue,            //volume
            panValue,          //pan
            wait,            //wait before playing
            pitchBendAmount,          //pitch bend amount
            reverse,         //reverse
            randomValue,          //random pitch range
            dissonance,            //dissonance
            echo,    //echo: [delay, feedback, filter]
            reverb     //reverb: [duration, decay, reverse?]
//        timeout     //maximum duration
        );
    };

    return playSound;
}

function floatFromInput(selector) {
    var input = $(selector).val();
    return (input == "" ? 0 : parseFloat(input));
}

function boolFromInput(selector) {
    var input = $(selector).val();
    return (input == "true");
}