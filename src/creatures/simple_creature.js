'use strict'

// ****** Simple Creature code ******

// *** Imports
import { geThan, seededRand } from '../util.js';
import { ResolveRules } from '../rulebook.js';


// *** Behavior functions unique to this creature
// main dispatch function
// returns creatureType
export const ActAsSimpleCreature = (creatureType) => {
    switch (creatureType.conds.behavior) {
        case 'idling': return ActIdling(creatureType)
        case 'eating': return ActEating(creatureType)
        case 'sleeping': return ActSleeping(creatureType)
        default: return creatureType
    }
};

// idling behavior function
// returns creatureType
const ActIdling = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 2.4,
                neuro: creatureType.conds.neuro + 1.2,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () => 1.0,
            'eating': (creatureType) => (creatureType.conds.glucose < 30.0) ? 4.0 : 0.2,
            'sleeping': (creatureType) => (creatureType.conds.neuro > 70.0) ? 4.0 : 0.2,
        }
    );

// eating behavior function
// returns creatureType
const ActEating = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose + 4.0,
                neuro: creatureType.conds.neuro + 2.6,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.glucose > 45.0) ? 2.0 : 0.2
        }
    );

// sleeping behavior function
// returns creatureType
const ActSleeping = (creatureType) =>
    CheckBehavior(
        // pass in creatureType object with specific glucose and neuro
        {
            ...creatureType,
            conds: {
                ...creatureType.conds,
                glucose: creatureType.conds.glucose - 1.0,
                neuro: creatureType.conds.neuro - 2.2,
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () => 1.0,
            'idling': (creatureType) => (creatureType.conds.neuro < 60.0) ? 2.0 : 0.2
        }
    );


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// returns creatureType
export const CheckBehavior = (creatureType, desireFuncType) => {
    // declare: numerical desires as evaluation of each desire func with nifty shorthand
    const numbers = Object.values(desireFuncType).map(f => f(creatureType));

    // declare: desires as cumulative array
    const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

    // declare: max value in cumulative array
    const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

    // declare: random number in range of max value, as [0, max_cum_numbers]
    // note: seededRand returns [seed, value]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = seededRand(creatureType.seed, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange[1])(x));

    // return creatureType object with: 
    //      updated seed
    //      behavior indicated via rulebook review of chosen desire
    return ResolveRules({
        ...creatureType,
        seed: randInRange[0],
        conds: {
            ...creatureType.conds,
            behavior: Object.keys(desireFuncType)[chosenIndex]
        }
    });
};