'use strict'

// ****** Immutable pseudo-random number functions ******

// *** Our imports
import { TYPE_RANDTYPE, TYPE_RANDTYPE_OBJ } from '../const_vals.js';

import {
    compose,
    selectWeight,
    sum,
} from '../utils.js';


// *** randType immutable random number generation utilities
// given an input seed, get a future seed
// takes:
//  seedIntType: numerical input seed, as int
//  incIntType: number of seeds to skip
// returns the future seed
export const rand_getNextSeed = (seedIntType) => (skipIntType) =>
    // skip one or more seeds?
    (skipIntType > 0)
        // yes: get the next seed, apply this function to it, decrement applications remaining
        ? rand_getNextSeed
            (rand_getNextSeed(seedIntType)(0))
            (skipIntType - 1)

        // no: return the seed to use
        : (seedIntType * 9301 + 49297) % 233280;

// get seeded random number
// takes:
//  minFloatType: minimum bound of random number range, as float
//  maxFloatType: maximum bound of random number range, as float
//  seedIntType: the seed to use
// returns randType
export const rand_seededRand = (minFloatType) => (maxFloatType) => (seedIntType) => ({
    [TYPE_RANDTYPE]: true,

    value: minFloatType +
        ((seedIntType * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType),

    // REFACTOR BUG: Seed skip should be 0! Must check ALL users of rand_seededRand
    nextSeed: rand_getNextSeed(seedIntType)(1),
});

// generate a random index into a weights list
// WARNING: The customer must externally advance the seed by one increment!!!!
// takes:
//  weightsFloatType: array of weights, as float
//  seedIntType: the seed to use
// returns number: numerical index into weights list, as int
export const rand_chooseWeight = (weightsFloatType) => (seedIntType) =>
    selectWeight
        (weightsFloatType)
        (
            rand_val(
                rand_seededRand
                    (0.0)
                    (sum(weightsFloatType))
                    (seedIntType)
            )
        );


// *** randType monad utilities
// randType monad unit func
// takes: 
//  valAnyType: the value to wrap into randType
// returns: randType with 0 seed
// total signature: (any) => randType
export const rand_unit = (valAnyType) =>
({
    [TYPE_RANDTYPE]: true,
    value: valAnyType,
    nextSeed: 0,
});

// randType monad bind func
// takes:
//  func: the function to bind, of signature (any) => randType
// returns function with signature (randType) => randType
// total signature: (any => randType) => (randType => randType)
export const rand_bind = func =>
    randType =>
    ({
        ...func(randType.value),
        nextSeed: randType.nextSeed,
    });

// randTypeObj monad unit object func
// builds a randTypeObj object by converting given prop-vals to randTypes
// takes: 
//  objAnyType: the object to bundle randTypes into
//  objForRand: an object with numerical properties, as:
//
//  {
//      property1: value1,
//      property2: value2,
//      ...
//  }
//
//  seedIntType: the seed to use
//  
// returns randTypeObj object of:
//  {
//      ...objAnyType,
//      ...{property1: randType1, property2: randType2, ...},
//      nextSeed
//  }
// REFACTOR: Do we need to pass in seedIntType? DO we need rand_unitObj at all??
export const rand_unitObj = (objAnyType) => (objForRand) => (seedIntType) =>
    // build an object out of entries
    Object.entries(objForRand).reduce(
        (accumProp, propValPair, i) =>
        ({
            // object built so far
            ...accumProp,

            // the property to assign a randType to
            [propValPair[0]]:

            // the unit randType assigned to the property, using i to get the appropriate seed
            {
                ...rand_unit(propValPair[1]),
                nextSeed: rand_getNextSeed(seedIntType)(i),
            }
        }),
        // the initial object to accumulate upon, consisting of objAnyType and 
        //  the next seed to be used
        {
            ...objAnyType,
            [TYPE_RANDTYPE_OBJ]: true,
            nextSeed: rand_getNextSeed(seedIntType)(Object.entries(objForRand).length - 1),
        }
    );


// *** randType support functions
// randType lift func
// takes:
//  func: the function to lift, of signature (any) => any
// returns function with signature (any) => randType
// total signature: (any => any) => (any => randType)
export const rand_lift = func =>
    anyType => compose(rand_unit)(func)(anyType);

// randType unwrap func
// takes:
//  randType
// returns any
// total signature: (randType) => any
export const rand_val = randType => randType.value;

// randType object random number generator function
// builds a randType object by generating randType random values for the given props
// takes: 
//  objAnyType: the object to bundle randTypes into
//  ...gensForRand: an array of functions with properties and randomType generators, as:
//
//  [
//      (seed1): {property1a: randGen1a(seed1), property1b: randGen1b(seed1), ... }
//      (seed2): {property2a: randGen2a(seed2), property2b: randGen2b(seed2), ... }
//      ...
//  ]
//
//      where randGen1a, randGen1b, ... are of signature (seedIntType) => randType
//      for example, seededRand(0.0)(1.0) would have the appropriate signature 
//          while seededRand(0.0)(1.0)(0) would NOT have the appropriate signature
//
//  seedIntType: the seed to start with
//  
// returns object of:
//  {
//      ...objAnyType,
//      ...{property1: randType1, property2: randType2, ...},
//      [TYPE_RANDTYPE_OBJ]: true,
//      nextSeed
//  }
export const rand_genRandTypeObj = (objAnyType) => (...gensForRand) => (seedIntType) =>
    // build an object by applying each generator function
    gensForRand.flat(Infinity).reduce((accumObj, thisGenFunc, i) =>
    ({
        ...accumObj,

        // get randTypes for requested properties by applying generator functions
        ...thisGenFunc(rand_getNextSeed(seedIntType)(i)),

        // store the proper next seed
        nextSeed: rand_getNextSeed(seedIntType)(i + 2),
    }),
        // start with a template object
        {
            ...objAnyType,
            [TYPE_RANDTYPE_OBJ]: true,
        });

// randType object array random number generator function
// builds an array of randType objects by generating randType random values for the given props
// each object in the array has the appropriate seed, with the final object in the array
//  having the most advanced seed
// takes: 
//  objAnyType: the object to bundle randTypes into
//  ...gensForRand: an array of functions with properties and randomType generators, as:
//
//  [
//      (seed1): {property1a: randGen1a(seed1), property1b: randGen1b(seed1), ... }
//      (seed2): {property2a: randGen2a(seed2), property2b: randGen2b(seed2), ... }
//      ...
//  ]
//
//      where randGen1a, randGen1b, ... are of signature (seedIntType) => randType
//      for example, seededRand(0.0)(1.0) would have the appropriate signature 
//          while seededRand(0.0)(1.0)(0) would NOT have the appropriate signature
//
//  seedIntType: the seed to start with
//  
// returns object of:
//  {
//      ...objAnyType,
//      ...{property1: randType1, property2: randType2, ...},
//      nextSeed
//  }
export const rand_genRandTypeObjArray = (...objArrayAnyType) => (...gensForRand) => (seedIntType) =>
    // for all objects in the given array...
    objArrayAnyType.flat(Infinity).reduce((accumArray, thisObj) =>
        [
            // array of randTypeObj objects built so far
            ...accumArray,

            // build another randTypeObj object out of property-value entries,
            //  being sure to assign the proper starting seed
            rand_genRandTypeObj
                (thisObj)
                (gensForRand)
                ((accumArray.slice(-1)[0] || { nextSeed: seedIntType }).nextSeed),
        ],
        // start with an empty array
        []);

// unwrap the floating-point values in a randTypeObj
// takes:
//  randTypeObj
// returns object with randType prop-vals unwrapped into float
// total signature: (randTypeObj) => objAnyType
export const rand_valObj = (randTypeObj) =>
    // build an object out of entries
    Object.entries(randTypeObj)
        // filter out markers of randTypeObj
        .filter((propGenPair) => propGenPair[0] !== TYPE_RANDTYPE_OBJ)
        .filter((propGenPair) => propGenPair[0] !== 'nextSeed')

        // reduce the remaining entries
        .reduce(
            (accumProp, propGenPair) =>
            ({
                // object built so far
                ...accumProp,

                // property name to add
                [propGenPair[0]]:
                    // unwrap randTypes and leave others as is
                    ({ ...propGenPair[1] }.hasOwnProperty(TYPE_RANDTYPE))
                        ? rand_val(propGenPair[1])
                        : propGenPair[1]
            }),
            // start reduction with an empty object
            {});
