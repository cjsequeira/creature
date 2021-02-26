'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// flatten, concatenate element, slice to a limit, and map using a mapping function
// takes element to concatenate, length limit (PRESERVED SIGN), mapping function, and array
// returns processed array
export const concatSliceMap = concatElem => lenLimit => mapFunc => arr =>
    arr.flat().concat(concatElem).slice(lenLimit).map(mapFunc);

// greater than or equal to
export const geThan = x => y => (y >= x);

// given a function, an array of arguments, and a target, apply function to the target and 
//  first argument, then apply the same function to the result along with the next argument
//  and so on until all arguments are exhausted
// the array of arguments will be flattened up to three times
export const makeArgChain = func => (...args) => target =>
    args.flat(3).reduce((accum, cur) => func(accum || target, cur), null);

// given a target and an array of functions, apply the first function to the target,
//  then apply the next function to the result of the first function, and so on until 
//  all arguments are exhausted
// the array of functions will be flattened up to three times
export const makeFuncChain = (...funcs) => target =>
    funcs.flat(3).reduce((funcAccum, thisFunc) => thisFunc(funcAccum || target), null);

// given an input of a single element or an array, return an array with the
//  input repeated n times
export const repeat = input => n =>
    (n > 0)
        ? [...[input], repeat(input)(n - 1)].flat()
        : input;

// given an array, an index, and a list of elements, 
//  return an array with the elements spliced into the array at the index
// based on https://vincent.billey.me/pure-javascript-immutable-array/#splice
export const splice = (arr, start, deleteCount, ...items) => [
    ...arr.slice(0, start),
    ...items,
    ...arr.slice(start + deleteCount)
];


// *** Numerical utilities
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

// round input to given number of digits
// returns number
export const roundTo = (num, digits = 0) =>
    Math.round(num * Math.pow(10.0, digits)) / Math.pow(10.0, digits);

// return an index into a list of weights, given a selector
// takes an array of numerical weights and a numerical selector
// returns number
// returns -1 if the selector is not in the range of the cumulative weights
export const selectWeight = weightsList => selector =>
    // build cumulative array of weights
    weightsList.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], [])

        // find the first cumulative weight that "holds" the selector
        //  returns -1 if the selector is not in the range of the cumulative weights
        .findIndex(x => geThan(selector)(x));

// sum array elements
// takes array of numbers
// returns number
export const sum = arr => arr.reduce((a, b) => a + b, 0)

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

// return chart data excluding all elements less than provided x
export const chartShiftData = (data, x) => {
    // count how many points are less than the given x and should be excluded; could be zero
    const numPoints = data.filter(elem => elem.x < x).length;

    // return data with excluded elements
    return data.slice(numPoints);
};

// fade one RGBA hex color to another, controlled by a [0, 1] fader
// returns RGBA hex color
// based on https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
export const interpRGBA = (fader, hexStart = '#ffffffff', hexEnd = '#08080800') => {
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

// fade colors to transparent gray if array length at least 2
// takes "don't care", index, array of RGBA colors
// returns array with 
export const fadeColors = (_, i, arr) =>
    // is array length at least 2?
    (arr.length >= 2)
        // yes: is current index less than the last array element?
        ? (i < (arr.length - 1))
            // yes: map color at current index to a faded color in between the 
            //  color at the next index and a transparent gray
            ? interpRGBA(0.5, arr[i + 1], '#cccccc00')

            // no: map color at current index to itself
            : arr[i]

        // no: map color at current index to itself
        : arr[i];
