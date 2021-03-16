'use strict'

// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!
// REFACTOR: Mutable random number generator system must be part of the app store,
// or will not be able to save/undo app store and repeat the same behavior!

// *** Our imports
import {
    selectWeight,
    sum,
} from '../utils.js';


// *** Our random number generator state, defined with 0 seed
let randGen = {
    seed: 0,
}


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
//  incIntType: number of seeds to step ahead
// returns the future seed
export const rand_getNextSeed = seedIntType => incIntType =>
    // step ahead more than one seed?
    (incIntType > 1)
        // yes: get the next seed, apply this function to it, decrement applications remaining
        ? rand_getNextSeed
            (rand_getNextSeed(seedIntType)(1))
            (incIntType - 1)

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
export const seededRand = minFloatType => maxFloatType => seedIntType => ({
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
