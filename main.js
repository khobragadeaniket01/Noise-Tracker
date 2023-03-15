
let audioContext = null;
let meter = null;
let canvasContext = null;
let mediaStreamSource = null;
let rafID = null;

let width = 1000;
let height = 200;

window.onload = function () {
    // grab our canvas
    canvasContext = document.getElementById('meter').getContext('2d');

    // update canvas size
    window.addEventListener('resize', resizeCanvas, false);
    resizeCanvas();

    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
            {
                'audio': {
                    'mandatory': {
                        'googEchoCancellation': 'false',
                        'googAutoGainControl': 'false',
                        'googNoiseSuppression': 'false',
                        'googHighpassFilter': 'false'
                    },
                    'optional': []
                },
            }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
};


function resizeCanvas() {
    canvas = document.getElementById("meter");

    width = document.body.clientWidth;
    height = document.body.clientHeight;

    canvas.width = width;
    canvas.height = height;
}

function didntGetStream() {
    alert('Stream generation failed.');
}

function drawLoop(time) {
    // clear the background
    canvasContext.clearRect(0, 0, width, height);

    // check if we're currently clipping
    canvasContext.fillStyle = meter.checkClipping() ? 'red' : 'green'

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume * width * 2, height);

    // set up the next visual callback
    rafID = window.requestAnimationFrame(drawLoop);
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}
