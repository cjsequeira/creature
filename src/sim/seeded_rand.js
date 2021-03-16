'use strict'

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


// randType monad unit func
// takes: 
//  valFloatType: the value to wrap into randType
// returns: randType with 0 seed
// total signature: (float) => randType
const rand_unit = valFloatType => ({
    value: valFloatType,
    nextSeed: 0,
});

// randType monad bind func
// takes:
//  func: the function to bind, of signature (float) => randType
// returns function with signature (randType) => randType
// total signature: ((float) => randType) => ((randType) => randType)
const rand_bind = func =>
    randType => ({
        ...func(randType.value),
        nextSeed: randType.nextSeed,
    });

// randType lift func
// takes:
//  func: the function to lift, of signature (float) => float
// returns function with signature (float) => randType
// total signature: ((float) => float) => ((float) => randType)
const rand_lift = func =>
    floatType => compose(rand_unit)(func)(floatType);




// *** Random number utils
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

// get seeded random number
// takes:
//  minFloatType: minimum bound of random number range, as float
//  maxFloatType: maximum bound of random number range, as float
//  seed: the seed to use
// returns randType
export const rand_seededRand = minFloatType => maxFloatType => seedIntType => ({
    value: minFloatType +
        ((seedIntType * 9301 + 49297) % 233280) /
        233280 * (maxFloatType - minFloatType),

    nextSeed: rand_getNextSeed(seedIntType)(1),
});

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





const rand_props = obj => (...propGenPairs) =>
({
    ...obj,

    // all props become of type randType
    ...Object.fromEntries(
        // build an array of properties, each with a randType created by given randGen
        propGenPairs.reduce((accumProp, propGenPair, i) =>
            // build an array of properties...
            [
                ...accumProp,
                [
                    // the property
                    propGenPair[0],

                    // the randType assigned to the property, using i to get the appropriate seed
                    propGenPair[1](rand_getNextSeed(0)(i)),
                ]
            ],
            // ...starting with an empty array
            []),
    ),
});

