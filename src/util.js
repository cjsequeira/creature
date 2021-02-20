'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// greater than or equal to
export const geThan = x => y => (y >= x);

// given a function, an array of arguments, and a target, apply function to the target and 
//  first argument, then apply the same function to the result along with the next argument
//  and so on until all arguments are exhausted
// the array of arguments will be flattened once, allowing arrays of arrays of arguments
//  (but not arrays of arrays of arrays of arguments, or deeper)
export const makeArgChain = func => (...args) => target =>
    args.flat().reduce((accum, cur) => func(accum || target, cur), null);

// given a target and an array of functions, apply the first function to the target,
//  then apply the next function to the result of the first function, and so on until 
//  all arguments are exhausted
// the array of arguments will be flattened once, allowing arrays of arrays of functions
//  (but not arrays of arrays of arrays of functions, or deeper)
export const makeFuncChain = (...funcs) => target =>
    funcs.flat().reduce((funcAccum, thisFunc) => thisFunc(funcAccum || target), null);


// *** Numerical utilities
// within given range? as (min, max)
// returns bool
export const withinRange = (num, min = 0.0, max = 1.0) => (num > min) && (num < max);

// bound input to [min, max] or [min, +Infinity) or (-Infinity, max]
// returns number
export const boundToRange = (num, min = -Infinity, max = +Infinity) =>
    (num < min)
        ? min
        : (num > max)
            ? max
            : num;

// bump input so that it falls outside the given box around 0.0
// if number is zero, bumps input to positive bound
// returns number
export const excludeRange = (num, bound) =>
    (num > 0.0)
        ? boundToRange(num, bound, +Infinity)
        : (num < 0.0)
            ? boundToRange(num, -Infinity, -bound)
            : boundToRange(num, bound, +Infinity);


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

// return chart data excluding all elements less than provided x
export const chartShiftData = (data, x) => {
    // count how many points are less than the given x and should be excluded; could be zero
    const numPoints = data.filter(elem => elem.x < x).length;

    // return data with excluded elements
    return data.slice(numPoints);
}

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