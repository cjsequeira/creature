'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// compose two functions f and g of a specific one-parameter signature
// takes:
//  f: function of signature (typeA) => typeA
//  g: function of signature (any) => typeA
// returns: composed function of signature (any) => typeA
export const compose = f => g =>
    anyType => f(g(anyType));

// enclose one argument into the first slot of a COMMA-SEPARATED two-parameter function
// takes:
//  func: the two-parameter function to use, signature (any, any) => any
//  arg1AnyType: the argument to enclose into the first slot, signature any
// returns: a function of signature (any) => any
export const partial2 = (func, arg1AnyType) =>
    (arg2AnyType) => func(arg1AnyType, arg2AnyType);

// enclose two arguments into the first and second slots of a COMMA-SEPARATED three-parameter function
// takes:
//  func: the three-parameter function to use, signature (any, any, any) => any
//  arg1AnyType: the argument to enclose into the first slot, signature any
//  arg2AnyType: the argument to enclose into the second slot, signature any
// returns: a function of signature (any) => any
export const partial3 = (func, arg1AnyType, arg2AnyType) =>
    (arg3AnyType) => func(arg1AnyType, arg2AnyType, arg3AnyType);

// flatten, concatenate element, slice to a limit, and map using a mapping function
// takes:
//  lenLimitIntType: slice input (PRESERVED SIGN), as int
//  mapFunc: mapping function returning any
//  concatElemAnyType: element to concat, as any
//  arrAnyType: array to concat onto, as any
// returns processed array, as array type
export const concatSliceMap = (lenLimitIntType, mapFunc, concatElemAnyType, arrAnyType) =>
    arrAnyType.flat(Infinity).concat(concatElemAnyType).slice(lenLimitIntType).map(mapFunc);

// is x greater than or equal to y?
// takes: 
//  xFloatType: as float
//  yFloatType: as float
// returns: bool
export const geThan = (xFloatType, yFloatType) =>
    (yFloatType >= xFloatType);

// given a target, an array of ONE-PARAMETER functions, and an input argument of typeA,
//  apply the first function to the input argument, then apply the next function to
//  the result of the first function, and so on until all functions are applied
// the array of functions will be completely flattened
// ALL functions must be of signature (typeA) => typeA
// takes:
//  inputAnyType: input argument that functions apply to, as any
//  funcs: array of functions to apply - will be applied LEFT TO RIGHT! (i.e. 0 to top index)
// returns RESULT of signature typeA
export const pipe = (inputAnyType, ...funcs) =>
    funcs.flat(Infinity).reduce((accumTypeA, thisFunc) => thisFunc(accumTypeA), inputAnyType);

// given a "typeB", a target, and an array of COMMA-SEPARATED TWO-PARAMETER functions, 
//  apply the first function to the target, then apply the 
//  next function to the result of the first function, and so on until all 
//  functions are applied
// the array of functions will be completely flattened
// first function must be of signature (typeB, any) => typeA
// all remaining functions must be of signature (typeB, typeA) => typeA
// takes:
//  targetAnyType: target that functions apply to, as any
//  funcs: array of functions to apply - will be applied LEFT TO RIGHT! (i.e. 0 to top index)
// returns function of signature (typeB, any) => typeA
export const pipe2 = (typeB, targetAnyType, ...funcs) =>
    funcs.flat(Infinity).reduce
        (
            (funcAccum, thisFunc) => thisFunc(typeB, funcAccum || targetAnyType),
            null
        );

// given a delete count, an insertion index, an array, and a list of items to insert,
//  return an array with the elements spliced into the array at the index
//  and the specified number of items removed at that index
// based on https://vincent.billey.me/pure-javascript-immutable-array/#splice
// takes:
//  deleteCountIntType: number of items to delete at "start" index, as int
//  startIntType: index to start at, as int
//  arrAnyType: array to work on, as any
//  itemsAnyType: array of items to splice in at "start" index
// returns array of arrAnyType
export const splice = (deleteCountIntType, startIntType, arrAnyType, ...itemsAnyType) =>
    [
        ...arrAnyType.slice(0, startIntType),
        ...itemsAnyType,
        ...arrAnyType.slice(startIntType + deleteCountIntType)
    ];

// given an array of COMMA-SEPARATED TWO-PARAMETER test functions that return boolean, 
//  construct a single function to "or" all function results together
// takes:
//  ...testFuncs: array of test functions of signature (typeA, typeB) => boolean
// returns function that takes two comma-separated arguments and returns boolean
export const orTests2 = (...testFuncs) =>
    (typeA, typeB) => testFuncs.flat(Infinity).reduce
        (
            (accum, curTest) => accum || curTest(typeA, typeB),
            testFuncs.flat(Infinity)[0](arg)
        )


// *** Numerical utilities
// bound num to [minFloatType, maxFloatType]
// takes:
//  minFloatType: lower bound, as float
//  maxFloatType: upper bound, as float
//  numFloatType: number to bound, as float
// returns number, as float
export const boundToRange = (minFloatType, maxFloatType, numFloatType) =>
    // given number less than lower bound?
    (numFloatType < minFloatType)
        // yes: return lower bound
        ? minFloatType

        // no: given number greater than upper bound?
        : (numFloatType > maxFloatType)
            // yes: return upper bound
            ? maxFloatType

            // no: return given number
            : numFloatType;

// bump num so that it falls outside the given bound around 0.0
// if num is zero, bumps input to positive bound
// takes:
//  boundFloatType: positive and negative boundary around 0.0, as float
//  numFloatType: number to check and possibly bump, as float
// returns float
export const excludeRange = (boundFloatType, numFloatType) =>
    // given number greater than 0.0?
    (numFloatType > 0.0)
        // yes: bound to range: [given bound, +Infinity]
        ? boundToRange(boundFloatType, +Infinity, numFloatType)

        // no: given number less than 0.0?
        : (numFloatType < 0.0)
            // yes: bound to range: (-Infinity, -given bound]
            ? boundToRange(-Infinity, -boundFloatType, numFloatType)

            // no: bump to positive bound if num is 0.0
            : boundToRange(boundFloatType, +Infinity, numFloatType);

// round num to given number of digits
// takes:
//  digits: number of digits to round to, as number
//  num: number to round, as number
// returns number
export const roundTo = (digits, num) =>
    (digits > 0)
        ? Math.round(num * Math.pow(10.0, digits)) / Math.pow(10.0, digits)
        : Math.round(num);

// return an index into a list of weights, given a numerical selector
// takes: 
//  weightFloatTypes: array of numerical weights, as float
//  selectorFloatType: selector, as float
// returns number: index into list of weights based on selector, as int
// returns -1 if the selector is not in the range of the cumulative weights
export const selectWeight = (weightFloatTypes, selectorFloatType) =>
    // build cumulative array of weights
    weightFloatTypes.reduce
        (
            (a, x, i) => [...a, x + (a[i - 1] || 0)],
            []
        )
        // find the first cumulative weight that "holds" the selector
        //  returns -1 if the selector is not in the range of the cumulative weights
        .findIndex(x => geThan(selectorFloatType, x));

// sum array elements
// takes: 
//  numFloatTypes: array of numbers, as float
// returns number
export const sum = (numFloatTypes) =>
    numFloatTypes.reduce((a, b) => a + b, 0);

// num contained within (minFloatType, maxFloatType)?
//  minFloatType: lower bound, as float
//  maxFloatType: upper bound, as float
//  numFloatType: number to test, as float
// returns bool
export const isWithinRange = (minFloatType, maxFloatType, numFloatType) =>
    (numFloatType > minFloatType) && (numFloatType < maxFloatType);


// *** UI utilities
// return chart data excluding all elements less than provided x
// assumes x monotonically increases with increasing data array index
// takes: 
//  xFloatType: lower bound for testing, as float
//  data: array of ChartJS data elements
// returns ChartJS chart data array
export const chartShiftData = (xFloatType, data) =>
    // count how many points are less than the given x and should be excluded; could be zero
    // then return data with excluded elements
    data.slice(data.filter(elem => elem.x < xFloatType).length);

// fade RGBA hex color between hexStart and hexEnd, controlled by a [0, 1] fader
// based on https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
// takes:
//  faderFloatType: fader fraction between hexEndStringType and hexStartStringType, as float
//  hexEndStringType: color at fader = 1.0, as string
//  hexStartStringType: color at fader = 0.0, as string
// returns string: RGBA hex color as a string
export const interpRGBA = (faderFloatType, hexEndStringType, hexStartStringType) => {
    // REFACTOR into separate functions
    const rStart = parseInt(hexStartStringType.slice(1, 3), 16),
        gStart = parseInt(hexStartStringType.slice(3, 5), 16),
        bStart = parseInt(hexStartStringType.slice(5, 7), 16),
        aStart = parseInt(hexStartStringType.slice(7, 9), 16);

    const rEnd = parseInt(hexEndStringType.slice(1, 3), 16),
        gEnd = parseInt(hexEndStringType.slice(3, 5), 16),
        bEnd = parseInt(hexEndStringType.slice(5, 7), 16),
        aEnd = parseInt(hexEndStringType.slice(7, 9), 16);

    return ('#' +
        ('00' + Math.round(rStart + faderFloatType * (rEnd - rStart)).toString(16)).slice(-2) +
        ('00' + Math.round(gStart + faderFloatType * (gEnd - gStart)).toString(16)).slice(-2) +
        ('00' + Math.round(bStart + faderFloatType * (bEnd - bStart)).toString(16)).slice(-2) +
        ('00' + Math.round(aStart + faderFloatType * (aEnd - aStart)).toString(16)).slice(-2)
    )
};

// fade colors to transparent gray if array length at least 2
// meant for use in Javascript array.prototype.map
// takes:
//  "don't care", 
//  indexIntType: index into array being mapped, as int
//  arrStringType: array of RGBA colors to map, as string
// returns array with colors faded
export const fadeColors = (_, indexIntType, arrStringType) =>
    // is array length at least 2?
    (arrStringType.length >= 2)
        // yes: is current index less than the last array element?
        ? (indexIntType < (arrStringType.length - 1))
            // yes: map color at current index to a faded color in between the 
            //  color at the next index and a transparent gray
            ? interpRGBA(0.3, '#cccccc00', arrStringType[indexIntType + 1])

            // no: map color at current index to itself
            : arrStringType[indexIntType]

        // no: map color at current index to itself
        : arrStringType[indexIntType];
