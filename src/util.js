'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// greater than or equal to
export const geThan = x => y => (y >= x);

// given a function, an array of arguments, and a target, apply the target and first argument 
//  to the function, then apply the result to the function along with the next argument
//  and so on until all arguments are exhausted
// the array of arguments will be flattened once, allowing arrays of arrays of arguments
//  (but not arrays of arrays of arrays of arguments, or deeper)
export const makeChain = func => (...args) => target =>
    args.flat().reduce((accum, cur) => func(accum || target, cur), null);

    
// *** Numerical utilities
// seeded random number
// returns [seed, value]
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
// returns bool
export const withinRange = (num, min = 0.0, max = 1.0) => (num > min) && (num < max);


// *** UI utilities
// return provided chart parameters with different title
export const chartParamsUseTitle = (chartParams, title) => ({
    ...chartParams,
    options: {
        ...chartParams.options,
        title: {
            ...chartParams.options.title,
            text: title
        }
    }
});

// fade one RGBA hex color to another, controlled by a [0, 1] fader
// returns RGBA hex color
// based on https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const hexRGBAFade = (fader, hexStart = '#ffffffff', hexEnd = '#08080800') => {
    const rStart = parseInt(hexStart.slice(1, 3), 16),
        gStart = parseInt(hexStart.slice(3, 5), 16),
        bStart = parseInt(hexStart.slice(5, 7), 16),
        aStart = parseInt(hexStart.slice(7, 9), 16);

    const rEnd = parseInt(hexEnd.slice(1, 3), 16),
        gEnd = parseInt(hexEnd.slice(3, 5), 16),
        bEnd = parseInt(hexEnd.slice(5, 7), 16),
        aEnd = parseInt(hexEnd.slice(7, 9), 16);

    return ('#' +
        ('00' + Math.round(rStart + fader * (rEnd - rStart)).toString(16)).slice(-2) +
        ('00' + Math.round(gStart + fader * (gEnd - gStart)).toString(16)).slice(-2) +
        ('00' + Math.round(bStart + fader * (bEnd - bStart)).toString(16)).slice(-2) +
        ('00' + Math.round(aStart + fader * (aEnd - aStart)).toString(16)).slice(-2)
    )
};