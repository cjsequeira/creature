'use strict'

// ****** Pseudo-random number generator ******
// THIS IS THE ONLY PART OF THE APPLICATION THAT CONTAINS ITS OWN SEPARATE MUTABLE STATE!

// *** Our imports
import { selectWeight, sum } from '../util.js';


// *** Our random number generator state, defined with null seed
export let randGen = {
    seed: null
}


// *** Random number utils
// init random number generator
// MUTABLE: Mutates inRandGen argument
// takes random number generator, numerical seed
// returns the given seed
export function mutableRandGen_initRandGen(inRandGen, initSeed = 0) {
    // MUTABLE: Store given seed in random number generator
    inRandGen.seed = initSeed;

    return initSeed;
};

// get seeded random number
// MUTABLE: Mutates inRandGen argument
// reference: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
export function mutableRandGen_seededRand(inRandGen, min = 0.0, max = 1.0) {
    // calculate random value using current seed
    const value = min + ((inRandGen.seed * 9301 + 49297) % 233280) / 233280 * (max - min);

    // MUTABLE: generate new seed and save in in random generator mutable state
    inRandGen.seed = (inRandGen.seed * 9301 + 49297) % 233280;

    // return calculated random value
    return value;
};

// using input rand generator and weights list, generate a random number
//  to use for weight selection based on the weights list
// MUTABLE: Mutates inRandGen argument
// takes random number generator, numerical array of weights
// returns numerical index into weights list
export function mutableRandGen_seededWeightedRand(inRandGen, weightsList) {
    return selectWeight(weightsList)(mutableRandGen_seededRand(inRandGen, 0, sum(weightsList)));
}
