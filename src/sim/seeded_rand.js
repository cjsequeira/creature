'use strict'

import { TYPE_RANDTYPE, TYPE_RANDTYPE_OBJ } from '../const_vals.js';
// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!
// REFACTOR: Mutable random number generator system must be part of the app store,
// or will not be able to save/undo app store and repeat the same behavior!

// *** Our imports
import {
    compose,
    selectWeight,
    sum,
} from '../utils.js';


// *** Our random number generator state, defined with 0 seed
let randGen = {
    seed: 0,
}


// *** Mutable random number utils
// init random number generator
// MUTABLE: Mutates randGen
// takes: 
//  initSeedIntType: numerical seed, as int
// returns the given seed
export function mutableRandGen_initRandGen(initSeedIntType) {
    // MUTABLE: Store given seed in random number generator
    randGen.seed = initSeedIntType;

    return initSeedIntType;
};

// get seeded random number
// MUTABLE: Mutates randGen
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
// takes:
//  minFloatType: minimum bound of random number range, as float
//  maxFloatType: maximum bound of random number range, as float
// returns number, as float
export function mutableRandGen_seededRand(minFloatType, maxFloatType) {
    // calculate random value using current seed
    const value = minFloatType +
        ((randGen.seed * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType);

    // MUTABLE: generate new seed and save in random generator mutable state
    randGen.seed = (randGen.seed * 9301 + 49297) % 233280;

    // return calculated random value
    return value;
};

// using input rand generator and weights list, generate a random number
//  to use for weight selection based on the weights list
// MUTABLE: Mutates randGen
// takes:
//  weightsFloatType: array of weights, as float
// returns number: numerical index into weights list, as int
export const mutableRandGen_seededWeightedRand = (weightsFloatType) =>
    selectWeight
        (weightsFloatType)
        (mutableRandGen_seededRand(0, sum(weightsFloatType)));






// *** randType immutable random number utilities
// given an input seed, get a future seed
// takes:
//  seedIntType: numerical input seed, as int
//  incIntType: number of seeds to skip
// returns the future seed
export const rand_getNextSeed = seedIntType => skipIntType =>
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
//  seed: the seed to use
// returns randType
export const rand_seededRand = minFloatType => maxFloatType => seedIntType => ({
    [TYPE_RANDTYPE]: true,

    value: minFloatType +
        ((seedIntType * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType),

    nextSeed: rand_getNextSeed(seedIntType)(1),
});


// *** randType monad utilities
// randType monad unit func
// takes: 
//  valFloatType: the value to wrap into randType
// returns: randType with 0 seed
// total signature: (float) => randType
export const rand_unit = valFloatType => ({
    [TYPE_RANDTYPE]: true,
    value: valFloatType,
    nextSeed: rand_getNextSeed(0)(0),
});

// randType monad bind func
// takes:
//  func: the function to bind, of signature (float) => randType
// returns function with signature (randType) => randType
// total signature: (float => randType) => (randType => randType)
const rand_bind = func =>
    randType => ({
        ...func(randType.value),
        nextSeed: randType.nextSeed,
    });

// randType monad unit object func
// builds a randType object by converting given prop-vals to randTypes
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
// returns object of:
//  {
//      ...objAnyType,
//      ...{property1: randType1, property2: randType2, ...},
//      nextSeed
//  }
export const rand_unitObj = (objAnyType) => (objForRand) =>
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
                nextSeed: rand_getNextSeed(0)(i),
            }

        }),
        // the initial object to accumulate upon, consisting of objAnyType and 
        //  the next seed to be used
        {
            ...objAnyType,
            [TYPE_RANDTYPE_OBJ]: true,
            nextSeed: rand_getNextSeed(0)(Object.entries(objForRand).length - 1),
        }
    );


// *** randType support functions
// randType lift func
// takes:
//  func: the function to lift, of signature (float) => float
// returns function with signature (float) => randType
// total signature: (float => float) => (float => randType)
const rand_lift = func =>
    floatType => compose(rand_unit)(func)(floatType);

// randType unwrap func
// takes:
//  randType
// returns float
// total signature: (randType) => float
const rand_unwrapRandType = randType => randType.value;

// randType object random number generator function
// builds a randType object by generating randType random values for the given props
// takes: 
//  objAnyType: the object to bundle randTypes into
//  objForRand: an object with properties and randomType generators, as:
//
//  {
//      property1: randGen1,
//      property2: randGen2,
//      ...
//  }
//
//      where randGen1, randGen2, ... are of signature (seedIntType) => randType
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
export const rand_genRandTypeObj = (objAnyType) => (objForRand) => (seedIntType) =>
    // build an object out of entries
    Object.entries(objForRand).reduce(
        (accumProp, propGenPair, i) =>
        ({
            // object built so far
            ...accumProp,

            // the property to assign a randType to
            // and, the randType assigned to the property, using i to get the appropriate seed
            [propGenPair[0]]: propGenPair[1](rand_getNextSeed(seedIntType)(i))
        }),
        // the initial object to accumulate upon, consisting of objAnyType and 
        //  the next seed to be used
        {
            ...objAnyType,
            [TYPE_RANDTYPE_OBJ]: true,
            nextSeed: rand_getNextSeed(seedIntType)(Object.entries(objForRand).length + 1),
        }
    );

// randType object array random number generator function
// builds an array of randType objects by generating randType random values for the given props
// each object in the array has the appropriate seed, with the final object in the array
//  having the most advanced seed
// takes: 
//  objAnyType: the object to bundle randTypes into
//  objForRand: an object with properties and randomType generators, as:
//
//  {
//      property1: randGen1,
//      property2: randGen2,
//      ...
//  }
//
//      where randGen1, randGen2, ... are of signature (seedIntType) => randType
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
export const rand_genRandTypeObjArray = (...objArrayAnyType) => (objForRand) => (seedIntType) =>
    // for all objects in the given array...
    objArrayAnyType.flat(Infinity).reduce((accumArray, thisObj) =>
        [
            // array of randTypeObj objects built so far
            ...accumArray,

            // build another randTypeObj object out of property-value entries,
            //  being sure to assign the proper starting seed
            rand_genRandTypeObj
                (thisObj)
                (objForRand)
                ((accumArray.slice(-1)[0] || { nextSeed: seedIntType }).nextSeed),
        ],
        // start with an empty array
        []);

// unwrap the floating-point values in a randTypeObj
// takes:
//  randTypeObj
// returns object with randType prop-vals unwrapped into float
// total signature: (randTypeObj) => objAnyType
export const rand_unwrapRandTypeObj = (randTypeObj) =>
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
                        ? rand_unwrapRandType(propGenPair[1])
                        : propGenPair[1]
            }),
            // start reduction with an empty object
            {});
