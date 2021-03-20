'use strict'

// ****** Code utilities ******

// *** Functional programming utilities
// compose two functions f and g of a specific one-argument signature
// takes:
//  f: function of signature (typeA) => typeA
//  g: function of signature (any) => typeA
// returns: composed function of signature (any) => typeA
export const compose = f => g =>
    anyType => f(g(anyType));

// compose two functions f and g of a specific two-argument signature
// takes:
//  f: function of signature (typeB) => (typeA) => typeA
//  g: function of signature (typeB) => (any) => typeA
// returns: composed function of signature (typeA) => typeA
export const compose2 = f => g =>
    (typeB) => (anyType) => f(typeB)(g(typeB)(anyType))

// flatten, concatenate element, slice to a limit, and map using a mapping function
// takes:
//  lenLimitIntType: slice input (PRESERVED SIGN), as int
//  mapFunc: mapping function returning any
//  concatElemAnyType: element to concat, as any
//  arrAnyType: array to concat onto, as any
// returns processed array, as array type
export const concatSliceMap = (lenLimitIntType) => (mapFunc) => (concatElemAnyType) => (arrAnyType) =>
    arrAnyType.flat(Infinity).concat(concatElemAnyType).slice(lenLimitIntType).map(mapFunc);

// is x greater than or equal to y?
// takes: 
//  xFloatType: as float
//  yFloatType: as float
// returns: bool
export const geThan = (xFloatType) => (yFloatType) => (yFloatType >= xFloatType);

// given a function, a target, and an array of args, apply function to the target 
//  and first argument, then apply the same function to the result along with the next argument
//  and so on until all arguments are exhausted
// the array of arguments will be completely flattened
// assumes function is of signature (argAnyType) => targetAnyType
// takes:
//  func: function to apply
//  targetAnyType: target that function applies to, as any
//  argsAnyType: the array of arguments to use in function application, as any
// returns type of target
export const applyArgChain = (func) => (targetAnyType) => (...argsAnyType) =>
    argsAnyType.flat(Infinity).reduce((accum, cur) => func(accum || targetAnyType)(cur), null);

// given an array of functions and one argument, apply each function to the argument
// assumes function is of signature (argAnyType) => any
// returns array of function application results
export const applyFuncArray = (...funcs) => (argAnyType) =>
    funcs.flat(Infinity).map((f) => f(argAnyType));

// given a target and an array of functions, apply the first function to the target,
//  then apply the next function to the result of the first function, and so on until 
//  all arguments are exhausted
// the array of functions will be completely flattened
// assumes function is of signature (argAnyType) => targetAnyType
// takes:
//  targetAnyType: target that functions apply to, as any
//  funcs: array of functions to apply
// returns type of target
export const applyFuncChain = (targetAnyType) => (...funcs) =>
    funcs.flat(Infinity).reduce((funcAccum, thisFunc) => thisFunc(funcAccum || targetAnyType), null);

// get the value at a nested property of an object
// takes:
//  objAnyType: the object to look at, as any
//  propStringType: the nested property, as a string, e.g. 'nest1.nest2.property'
// will also work with a non-nested property, e.g. 'toplevelproperty'
// returns the value at the nested property - could be undefined
export const getNestedProp = (objAnyType) => (propStringType) =>
    propStringType.split('.').reduce(
        (accum_obj, this_prop) => accum_obj[this_prop],
        objAnyType);

// REFACTOR: Not needed? Use Array
// given an input, return an array with the input repeated n times
// takes:
//  inputAnyType: input, as any
//  nIntType: number of times to repeat, as int
// returns array of input type
export const repeat = (...inputAnyType) => (nIntType) =>
    (nIntType > 0)
        ? [...[inputAnyType], repeat(inputAnyType)(nIntType - 1)].flat(Infinity)
        : inputAnyType;

// REFACTOR: Not needed? Use Array
// given a function, along with an argument, return an array with 
//  the function applied to the argument n times
// takes:
//  func: function of signature (argAnyType) => any
//  argAnyType: argument, as any
//  nIntType: number of times to repeat, as int
// returns array of function output type
export const repeatFunc = (func) => (argAnyType) => (nIntType) =>
    (nIntType > 0)
        ? [...[func(argAnyType)], repeatFunc(func)(argAnyType)(nIntType - 1)].flat(Infinity)
        : func(argAnyType);

// given a function and a list of arguments, apply the function to enclose each argument
// e.g. rollArgs(x => y => x + y)(1, 2) = (1 + 2) = 3
// e.g. rollArgs(x => y => x + y)(1) = (y=> 1 + y)
// takes:
//  func: function of arbitrary signature
//  args: list of args to apply
// returns any (could be a function or could be an evaluation)
export const rollArgs = (f) => (...args) =>
    args.flat(Infinity).reduce((fArgs, thisArg) => fArgs(thisArg), f);

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
export const splice = (deleteCountIntType) => (startIntType) => (arrAnyType) => (...itemsAnyType) => [
    ...arrAnyType.slice(0, startIntType),
    ...itemsAnyType,
    ...arrAnyType.slice(startIntType + deleteCountIntType)
];

// given an array of test functions that take one argument and return boolean, 
//  construct a single function to "or" all function results together
// takes:
//  ...testFuncs: array of test functions returning boolean
// returns function that takes one argument and returns boolean
export const orTests = (...testFuncs) =>
    (arg) => testFuncs.flat(Infinity).reduce(
        (accum, curTest) => accum || curTest(arg), testFuncs.flat(Infinity)[0](arg))

// given an array of test functions that take one argument and return boolean, 
//  construct a single function to "and" all function results together
// takes:
//  ...testFuncs: array of test functions returning boolean
// returns function that takes one argument and returns boolean
export const andTests = (...testFuncs) =>
    (arg) => testFuncs.flat(Infinity).reduce(
        (accum, curTest) => accum && curTest(arg), testFuncs.flat(Infinity)[0](arg))


// *** Numerical utilities
// bound num to [minFloatType, maxFloatType]
// takes:
//  minFloatType: lower bound, as float
//  maxFloatType: upper bound, as float
//  numFloatType: number to bound, as float
// returns number, as float
export const boundToRange = (minFloatType) => (maxFloatType) => (numFloatType) =>
    (numFloatType < minFloatType)
        ? minFloatType
        : (numFloatType > maxFloatType)
            ? maxFloatType
            : numFloatType;

// bump num so that it falls outside the given bound around 0.0
// if num is zero, bumps input to positive bound
// takes:
//  boundFloatType: positive and negative boundary around 0.0, as float
//  numFloatType: number to check and possibly bump, as float
// returns float
export const excludeRange = (boundFloatType) => (numFloatType) =>
    (numFloatType > 0.0)
        ? boundToRange(boundFloatType)(+Infinity)(numFloatType)
        : (numFloatType < 0.0)
            ? boundToRange(-Infinity)(-boundFloatType)(numFloatType)

            // bump to positive bound if num is 0.0
            : boundToRange(boundFloatType)(+Infinity)(numFloatType);

// round num to given number of digits
// takes:
//  digits: number of digits to round to, as number
//  num: number to round, as number
// returns number
export const roundTo = (digits) => (num) =>
    (digits > 0)
        ? Math.round(num * Math.pow(10.0, digits)) / Math.pow(10.0, digits)
        : Math.round(num);

// return an index into a list of weights, given a numerical selector
// takes: 
//  weightFloatTypes: array of numerical weights, as float
//  selectorFloatType: selector, as float
// returns number: index into list of weights based on selector, as int
// returns -1 if the selector is not in the range of the cumulative weights
export const selectWeight = (weightFloatTypes) => (selectorFloatType) =>
    // build cumulative array of weights
    weightFloatTypes.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], [])
        // find the first cumulative weight that "holds" the selector
        //  returns -1 if the selector is not in the range of the cumulative weights
        .findIndex(x => geThan(selectorFloatType)(x));

// sum array elements
// takes: 
//  numFloatTypes: array of numbers, as float
// returns number
export const sum = (numFloatTypes) => numFloatTypes.reduce((a, b) => a + b, 0)

// num contained within (minFloatType, maxFloatType)?
//  minFloatType: lower bound, as float
//  maxFloatType: upper bound, as float
//  numFloatType: number to test, as float
// returns bool
export const withinRange = (minFloatType) => (maxFloatType) => (numFloatType) =>
    (numFloatType > minFloatType) && (numFloatType < maxFloatType);


// *** UI utilities
// return given chart parameters with different title
// takes:
//  chartParams: ChartJS chart parameters
//  titleStringType: title to set, as string
// returns ChartJS chart parameters
export const chartParamsUseTitle = (chartParams) => (titleStringType) => ({
    ...chartParams,
    options: {
        ...chartParams.options,
        title: {
            ...chartParams.options.title,
            text: titleStringType
        }
    }
});

// return chart data excluding all elements less than provided x
// assumes x monotonically increases with increasing data array index
// takes: 
//  xFloatType: lower bound for testing, as float
//  data: array of ChartJS data elements
// returns ChartJS chart data array
export const chartShiftData = (xFloatType) => (data) =>
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
export const interpRGBA = (faderFloatType) => (hexEndStringType) => (hexStartStringType) => {
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
            ? interpRGBA(0.3)('#cccccc00')(arrStringType[indexIntType + 1])

            // no: map color at current index to itself
            : arrStringType[indexIntType]

        // no: map color at current index to itself
        : arrStringType[indexIntType];
