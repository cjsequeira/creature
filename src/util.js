'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// greater than or equal to
export const geThan = x => y => (y >= x);


// **** Numerical utilities
// seeded random number
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export const seededRand = (seed = 0, min = 0.0, max = 1.0) => {
    // return [seed, value]
    return [
        (seed * 9301 + 49297) % 233280,

        min +
        ((seed * 9301 + 49297) % 233280) / 233280 *
        (max - min)
    ];
};

// within given range, as (min, max)
export const withinRange = (num, min = 0.0, max = 1.0) => (num > min) && (num < max);


// *** UI utilities
// update simulator status box with given HTML message
export function updateStatusBox(statusBox, message) {
    // get status box scroll bar information
    let statusScrollTop = statusBox.scrollTop;
    let statusScrollHeight = statusBox.scrollHeight;
    let statusInnerHeight = statusBox.clientHeight;

    // push message into status box
    statusBox.innerHTML = statusBox.innerHTML + message + '<br />';

    // adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}