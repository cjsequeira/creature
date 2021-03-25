'use strict'

// ****** Immutable pseudo-random number functions, featuring randM and randMObj monads ******
// Many functions are nested arrow functions with the seed as the LAST parameter,
//  allowing composition of random number "generators"

// *** Our imports
import {
    TYPE_RANDM,
    TYPE_RANDM_OBJ
} from '../const_vals.js';

import {
    compose,
    selectWeight,
    sum,
} from '../utils.js';


// *** randM immutable random number generation utilities
// given an input seed, get a future seed
// takes:
//  seedIntType: numerical input seed, as int
//  incIntType: number of seeds to skip
// returns the future seed
export const randM_getNextSeed = (seedIntType, skipIntType) =>
    // skip one or more seeds?
    (skipIntType > 0)
        // yes: get the next seed, apply this function to it, decrement applications remaining
        ? randM_getNextSeed
            (
                randM_getNextSeed(seedIntType, 0),
                skipIntType - 1
            )

        // no: return the seed to use
        : (seedIntType * 9301 + 49297) % 233280;

// get seeded random number
// includes one nested arrow function to enable production of generators, e.g.:
//  
//      myGenerator = randM_seededRand(0.0, 1.0); 
//      myRandM = myGenerator(seed);
//
// takes:
//  minFloatType: minimum bound of random number range, as float
//  maxFloatType: maximum bound of random number range, as float
//  seedIntType: the seed to use
// returns randM
export const randM_seededRand = (minFloatType, maxFloatType) => (seedIntType) =>
({
    [TYPE_RANDM]: true,

    value: minFloatType +
        ((seedIntType * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType),

    nextSeed: randM_getNextSeed(seedIntType, 0),
});

// generate a random index into a weights list
// WARNING: The customer must externally advance the seed by one increment!!!!
// takes:
//  weightsFloatType: array of weights, as float
//  seedIntType: the seed to use
// returns number: numerical index into weights list, as int
// REFACTOR: A better way to do this by returning a randM instead of number?
export const randM_chooseWeight = (weightsFloatType) => (seedIntType) =>
    selectWeight
        (
            // use the given weights list
            weightsFloatType,

            // as the selector, use: 
            // get the random numerical value...
            randM_val
                (

                    // ...from the randType generated by randM_seededRand...
                    (randM_seededRand(0.0, sum(weightsFloatType)))

                        // ...using the given seed as the argument
                        (seedIntType)
                )
        );


// *** randM monad utilities
// randM monad unit func
// takes: 
//  valAnyType: the value to wrap into randM
// returns: randM with 0 seed
// total signature: (any) => randM
export const randM_unit = (valAnyType) =>
({
    [TYPE_RANDM]: true,
    value: valAnyType,
    nextSeed: 0,
});

// randM monad bind func
// takes:
//  func: the function to bind, of signature (any) => randM
// returns function with signature (randM) => randM
// total signature: (any => randM) => (randM => randM)
export const randM_bind = (func) =>
    randM =>
    ({
        [TYPE_RANDM]: true,
        ...func(randM.value),
        nextSeed: randM.nextSeed,
    });


// *** randMObj monad utilities
// unit object func
// builds a randMObj object by converting given prop-vals to randMs
// takes: 
//  objAnyType: the object to bundle randMs into
//  objForRand: an object with numerical properties, as:
//
//  {
//      property1: value1,
//      property2: value2,
//      ...
//  }
//  
// returns randMObj object of:
//  {
//      ...objAnyType,
//      ...{property1: randM1, property2: randM2, ...},
//      nextSeed
//  }
// REFACTOR: DO we need randMObj_unit at all??
export const randMObj_unit = (objAnyType, objForRand) =>
    // build an object out of entries
    Object.entries(objForRand).reduce(
        (accumProp, propValPair, i) => ({
            // object built so far
            ...accumProp,

            // the property to assign a randM to
            [propValPair[0]]:
            // the unit randM assigned to the property, using i to get the appropriate seed
            {
                ...randM_unit(propValPair[1]),
                nextSeed:
                    (
                        (i > 0)
                            ? randM_getNextSeed(0, i - 1)
                            : 0
                    )
            }
        }),
        // the initial object to accumulate upon, consisting of objAnyType and
        //  the next seed to be used
        {
            ...objAnyType,
            [TYPE_RANDM_OBJ]: true,
            nextSeed:
                (
                    (Object.entries(objForRand).length > 1)
                        ? randM_getNextSeed(0, Object.entries(objForRand).length - 2)
                        : 0
                )
        }
    );


// *** randM support functions
// randM concatenation function
// ASSUMES that prototype.concat() is defined for lhs!
// e.g. this function could concatenate two randMs with arrays as values 
// takes:
//  lhs: the randM on the left-hand side
//  rhs: the randM to concat: THE SEED FROM RHS WILL BE USED!
// returns: randM with:
//  {
//      value: randM_val(lhs) + randM_val(rhs)
//      nextSeed: randM_nextSeed(rhs)    
//  }
export const randM_concat = (lhs, rhs) =>
({
    [TYPE_RANDM]: true,
    value: randM_val(lhs).concat(randM_val(rhs)),
    nextSeed: randM_nextSeed(rhs),
});

// randM lift func
// takes:
//  func: the function to lift, of signature (any) => any
// returns function with signature (any) => randM
// total signature: (any => any) => (any => randM)
export const randM_lift = (func) =>
    anyType => compose(randM_unit)(func)(anyType);

// randM func to lift and then bind
// takes:
//  func: the function to lift and then bind, of signature (any) => any
// returns function with signature (randM) => randM
// total signature: (any => any) => (randM => randM)
export const randM_liftBind = (func) =>
    randM => compose(randM_bind)(randM_lift)(func)(randM);

// randM value unwrap func
// takes:
//  randM
// returns any
// total signature: (randM) => any
export const randM_val = (randM) => randM.value;

// randM seed unwrap func
// takes:
//  randM
// returns int
// total signature: (randM) => int
export const randM_nextSeed = (randM) => randM.nextSeed;

// *** randM generators
// randM generator func - builds a randM from a given value and given seed
// takes:
//  valueAnyType: the value to use
//  seedIntType: the seed to use as the next seed
export const randM_genRandM = (valueAnyType) => (seedIntType) =>
({
    [TYPE_RANDM]: true,
    value: valueAnyType,
    nextSeed: seedIntType,
});


// *** randMObj support functions
// randMObj random number generator function
// builds a randM object by generating randM random values for the given props
// takes: 
//  objAnyType: the object to bundle randMs into
//  ...gensForRand: an array of functions with properties and randomType generators, as:
//
//  [
//      (seed1): {property1a: randGen1a(seed1), property1b: randGen1b(seed1), ... }
//      (seed2): {property2a: randGen2a(seed2), property2b: randGen2b(seed2), ... }
//      ...
//  ]
//
//      where randGen1a, randGen1b, ... are of signature (seedIntType) => randM
//      for example, seededRand(0.0)(1.0) would have the appropriate signature 
//          while seededRand(0.0)(1.0)(0) would NOT have the appropriate signature
//
//  seedIntType: the seed to start with
//  
// returns object of:
//  {
//      ...objAnyType,
//      ...{property1: randM1, property2: randM2, ...},
//      [TYPE_RANDM_OBJ]: true,
//      nextSeed
//  }
export const randMObj_genRandMObj = (objAnyType, ...gensForRand) => (seedIntType) =>
    // build an object by applying each generator function
    gensForRand.flat(Infinity).reduce(
        (accumObj, thisGenFunc, i) => ({
            ...accumObj,

            // get randMs for requested properties by applying generator functions
            ...thisGenFunc(
                (i > 0)
                    ? randM_getNextSeed(seedIntType, i - 1)
                    : seedIntType
            )
        }),
        // start with a template object
        {
            ...objAnyType,
            [TYPE_RANDM_OBJ]: true,
            nextSeed: (
                (gensForRand.flat(Infinity).length > 0)
                    ? randM_getNextSeed(seedIntType, gensForRand.flat(Infinity).length - 1)
                    : seedIntType
            )
        }
    );

// unwrap the floating-point values in a randMObj
// takes:
//  randMObj
// returns object with randM prop-vals unwrapped into float
// total signature: (randMObj) => objAnyType
export const randMObj_val = (randMObj) =>
    // build an object out of entries
    Object.entries(randMObj)
        // filter out markers of randMObj
        .filter((propGenPair) => propGenPair[0] !== TYPE_RANDM_OBJ)
        .filter((propGenPair) => propGenPair[0] !== 'nextSeed')

        // reduce the remaining entries
        .reduce(
            (accumProp, propGenPair) =>
            ({
                // object built so far
                ...accumProp,

                // property name to add
                [propGenPair[0]]:
                    // unwrap randMs and leave others as is
                    ({ ...propGenPair[1] }.hasOwnProperty(TYPE_RANDM))
                        ? randM_val(propGenPair[1])
                        : propGenPair[1]
            }),
            // start reduction with an empty object
            {});
