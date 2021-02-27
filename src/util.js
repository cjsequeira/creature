'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// flatten, concatenate element, slice to a limit, and map using a mapping function
// takes:
//  lenLimit: slice input (PRESERVED SIGN)
//  mapFunc: mapping function
//  concatElem: element to concat
//  arr: array to concat onto
// returns processed array
export const concatSliceMap = (lenLimit) => (mapFunc) => (concatElem) => (arr) =>
    arr.flat().concat(concatElem).slice(lenLimit).map(mapFunc);

// is x greater than or equal to y?
// takes: 
//  x: as number
//  y: as number
// returns: bool
export const geThan = (x) => (y) => (y >= x);

// given a function, a target, and an array of args, apply function to the target 
//  and first argument, then apply the same function to the result along with the next argument
//  and so on until all arguments are exhausted
// the array of arguments will be flattened up to three times
// assumes function always returns the type of the target
// takes:
//  func: function to apply
//  target: target that function applies to
//  args: the array of arguments to use in function application
// returns type of target
export const makeArgChain = (func) => (target) => (...args) =>
    args.flat(3).reduce((accum, cur) => func(accum || target, cur), null);

// given a target and an array of functions, apply the first function to the target,
//  then apply the next function to the result of the first function, and so on until 
//  all arguments are exhausted
// the array of functions will be flattened up to three times
// assumes all functions return the type of the target
// takes:
//  target: target that functions apply to
//  funcs: array of functions to apply
// returns type of target
export const makeFuncChain = (target) => (...funcs) =>
    funcs.flat(3).reduce((funcAccum, thisFunc) => thisFunc(funcAccum || target), null);

// given an input of a single element or an array, return an array with the
//  input repeated n times
// takes:
//  input: any type
//  n: number of times to repeat
// returns type of input
export const repeat = (input) => (n) =>
    (n > 0)
        ? [...[input], repeat(input)(n - 1)].flat()
        : input;

// given a delete count, an insertion index, an array, and a list of items to insert,
//  return an array with the elements spliced into the array at the index
//  and the specified number of items removed at that index
// based on https://vincent.billey.me/pure-javascript-immutable-array/#splice
// takes:
//  deleteCount: number of items to delete at "start" index
//  start: index to start at
//  arr: array to work on
//  items: array of items to splice in at "start" index
// returns array of any type
export const splice = (deleteCount) => (start) => (arr) => (...items) => [
    ...arr.slice(0, start),
    ...items,
    ...arr.slice(start + deleteCount)
];


// *** Numerical utilities
// bound num to [min, max]
// takes:
//  min: lower bound, as number
//  max: upper bound, as number
//  num: number to bound, as number
// returns number
export const boundToRange = (min) => (max) => (num) =>
    (num < min)
        ? min
        : (num > max)
            ? max
            : num;

// bump num so that it falls outside the given bound around 0.0
// if num is zero, bumps input to positive bound
// takes:
//  bound: positive and negative boundary around 0.0, as number
//  num: number to check and possibly bump, as number
// returns number
export const excludeRange = (bound) => (num) =>
    (num > 0.0)
        ? boundToRange(bound)(+Infinity)(num)
        : (num < 0.0)
            ? boundToRange(-Infinity)(-bound)(num)

            // bump to positive bound if num is 0.0
            : boundToRange(bound)(+Infinity)(num);

// round num to given number of digits
// takes:
//  digits: number of digits to round to, as number
//  num: number to round, as number
// returns number
export const roundTo = (digits) => (num) =>
    Math.round(num * Math.pow(10.0, digits)) / Math.pow(10.0, digits);

// return an index into a list of weights, given a selector
// takes: 
//  weightsList: array of numerical weights 
//  selector: selector, as number
// returns number: index into list of weights based on selector
// returns -1 if the selector is not in the range of the cumulative weights
export const selectWeight = (weightsList) => (selector) =>
    // build cumulative array of weights
    weightsList.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], [])

        // find the first cumulative weight that "holds" the selector
        //  returns -1 if the selector is not in the range of the cumulative weights
        .findIndex(x => geThan(selector)(x));

// sum array elements
// takes: array of numbers
// returns number
export const sum = (arr) => arr.reduce((a, b) => a + b, 0)

// num contained within (min, max)?
//  min: lower bound, as number
//  max: upper bound, as number
//  num: number to test, as number
// returns bool
export const withinRange = (min) => (max) => (num) => (num > min) && (num < max);


// *** UI utilities
// return given chart parameters with different title
// takes:
//  chartParams: ChartJS chart parameters
//  title: title to set, as string
// returns ChartJS chart parameters
export const chartParamsUseTitle = (chartParams) => (title) => ({
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
// assumes x monotonically increases with increasing data array index
// takes: 
//  x: lower bound for testing
//  data: array of ChartJS data elements
// returns ChartJS chart data array
export const chartShiftData = (x) => (data) =>
    // count how many points are less than the given x and should be excluded; could be zero
    // then return data with excluded elements
    data.slice(data.filter(elem => elem.x < x).length);

// fade RGBA hex color between hexStart and hexEnd, controlled by a [0, 1] fader
// based on https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
// takes:
//  fader: fader fraction between hexEnd and hexStart, as number
//  hexEnd: color at fader = 1.0
//  hexStart: color at fader = 0.0
// returns string: RGBA hex color as a string
export const interpRGBA = (fader) => (hexEnd) => (hexStart) => {
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
// meant for use in Javascript array.prototype.map
// takes:
//  "don't care", 
//  index: index into array being mapped, 
//  arr: array of RGBA colors to map
// returns array with colors faded
export const fadeColors = (_, i, arr) =>
    // is array length at least 2?
    (arr.length >= 2)
        // yes: is current index less than the last array element?
        ? (i < (arr.length - 1))
            // yes: map color at current index to a faded color in between the 
            //  color at the next index and a transparent gray
            ? interpRGBA(0.3)('#cccccc00')(arr[i + 1])

            // no: map color at current index to itself
            : arr[i]

        // no: map color at current index to itself
        : arr[i];
