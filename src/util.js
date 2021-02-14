'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// greater than or equal to
export const geThan = x => y => (y >= x);


// *** Numerical utilities
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

// within given range? as (min, max)
export const withinRange = (num, min = 0.0, max = 1.0) => (num > min) && (num < max);


// *** UI utilities
// fade one RGBA hex color to another, controlled by a [0, 1] fader
// based on https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const hexRGBAFade = (hexStart = '#ffffffff', fader = 0.5, hexEnd = '#08080800') => {
    const rStart = parseInt(hexStart.slice(1, 3), 16),
        gStart = parseInt(hexStart.slice(3, 5), 16),
        bStart = parseInt(hexStart.slice(5, 7), 16),
        aStart = parseInt(hexStart.slice(7, 9), 16);

    const rEnd = parseInt(hexEnd.slice(1, 3), 16),
        gEnd = parseInt(hexEnd.slice(3, 5), 16),
        bEnd = parseInt(hexEnd.slice(5, 7), 16),
        aEnd = parseInt(hexEnd.slice(7, 9), 16);

    return ('#' +
        Math.round(rStart + (1.0 - fader) * (rEnd - rStart)).toString(16) +
        Math.round(gStart + (1.0 - fader) * (gEnd - gStart)).toString(16) +
        Math.round(bStart + (1.0 - fader) * (bEnd - bStart)).toString(16) +
        Math.round(aStart + (1.0 - fader) * (aEnd - aStart)).toString(16)
    )
};