'use strict'

// ****** Web worker that updates the simulator ******

// *** Worker message processing code
let timerId = null;
const UPDATE_FREQ_SIM = 50;

// worker message processor
self.onmessage = (message) => {
    // is message a start message?
    if (message.data === 'start') {
        // is timerId null?
        if (timerId === null) {
            // start regular message posting
            timerId = setInterval(() => { self.postMessage('advance') }, UPDATE_FREQ_SIM);
        }
    }

    // is message a stop message?
    if (message.data === 'stop') {
        // is timerId not null?
        if (timerId !== null) {
            // stop regular message posting
            clearInterval(timerId);

            timerId = null;
        }
    }
};