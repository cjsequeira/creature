'use strict'

// ****** Simple Creature code ******

// *** Imports
import { geThan, seededRand } from '../util.js';
import { ResolveRules } from '../rulebook.js';


// *** Behavior functions unique to this creature
// main dispatch function
// returns physicalContainerType
export const ActAsSimpleCreature = (physicalContainerType) => {
    switch (physicalContainerType.physicalElem.conds.behavior) {
        case 'idling': return ActIdling(physicalContainerType)
        case 'eating': return ActEating(physicalContainerType)
        case 'sleeping': return ActSleeping(physicalContainerType)
        case 'wandering': return ActWandering(physicalContainerType)
        default: return physicalContainerType
    }
};

// idling behavior function
// returns physicalContainerType
const ActIdling = (physicalContainerType) => {
    return CheckBehavior(
        // pass in physicalContainerType object with specific glucose, neuro, and random velocity
        {
            ...physicalContainerType,
            physicalElem: {
                ...physicalContainerType.physicalElem,
                conds: {
                    ...physicalContainerType.physicalElem.conds,
                    glucose: physicalContainerType.physicalElem.conds.glucose - 1.0,
                    neuro: physicalContainerType.physicalElem.conds.neuro + 0.5,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () =>
                0.2,
            'wandering': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.glucose < 40.0) ? 4.0 : 0.2,
            'sleeping': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.neuro > 85.0) ? 4.0 : 0.2,
        }
    );
};

// wandering behavior function
// returns physicalContainerType
const ActWandering = (physicalContainerType) => {
    // declare: random acceleration
    const rand_a = seededRand(physicalContainerType.physicalElem.seed, -2.0, 2.0);

    // declare: random heading nudge
    const rand_hdg_nudge = seededRand(rand_a[0], -0.3, 0.3);

    return CheckBehavior(
        // pass in physicalContainerType object with specific glucose, neuro, and random acceleration
        {
            ...physicalContainerType,
            physicalElem: {
                ...physicalContainerType.physicalElem,
                seed: rand_hdg_nudge[0],
                conds: {
                    ...physicalContainerType.physicalElem.conds,
                    glucose: physicalContainerType.physicalElem.conds.glucose - 1.6,
                    neuro: physicalContainerType.physicalElem.conds.neuro + 1.6,

                    heading: physicalContainerType.physicalElem.conds.heading + rand_hdg_nudge[1],
                    accel: rand_a[1],
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'wandering': () =>
                4.0,
            'idling': () =>
                0.2,
            'eating': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.glucose < 20.0) ? 4.0 : 0.2,
            'sleeping': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.neuro > 85.0) ? 4.0 : 0.2,
        }
    );
};

// eating behavior function
// returns physicalContainerType
const ActEating = (physicalContainerType) =>
    CheckBehavior(
        // pass in physicalContainerType object with specific glucose and neuro
        {
            ...physicalContainerType,
            physicalElem: {
                ...physicalContainerType.physicalElem,
                conds: {
                    ...physicalContainerType.physicalElem.conds,
                    glucose: physicalContainerType.physicalElem.conds.glucose + 4.0,
                    neuro: physicalContainerType.physicalElem.conds.neuro + 1.0,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                1.0,
            'idling': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.glucose > 50.0) ? 2.0 : 0.2
        }
    );

// sleeping behavior function
// returns physicalContainerType
const ActSleeping = (physicalContainerType) =>
    CheckBehavior(
        // pass in physicalContainerType object with specific glucose and neuro
        {
            ...physicalContainerType,
            physicalElem: {
                ...physicalContainerType.physicalElem,
                conds: {
                    ...physicalContainerType.physicalElem.conds,
                    glucose: physicalContainerType.physicalElem.conds.glucose - 0.3,
                    neuro: physicalContainerType.physicalElem.conds.neuro - 2.2,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                1.0,
            'idling': (physicalContainerType) =>
                (physicalContainerType.physicalElem.conds.neuro < 50.0) ? 2.0 : 0.2
        }
    );


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// returns physicalContainerType
export const CheckBehavior = (physicalContainerType, desireFuncType) => {
    // declare: numerical desires as evaluation of each desire func with nifty shorthand
    const numbers = Object.values(desireFuncType).map(f => f(physicalContainerType));

    // declare: numerical desires as cumulative array
    const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

    // declare: max value in cumulative array
    const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

    // declare: random number in range of max value, as [0, max_cum_numbers]
    // note: seededRand returns [seed, value]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = seededRand(physicalContainerType.physicalElem.seed, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange[1])(x));

    // return physicalContainerType object with: 
    //      lastRule: the rule node applied to this creature
    //      physicalElem: the creature, as a creatureType with:
    //          updated seed
    //          behavior indicated via rulebook review of chosen desire
    return ResolveRules({
        ...physicalContainerType,
        physicalElem: {
            ...physicalContainerType.physicalElem,
            seed: randInRange[0],
            conds: {
                ...physicalContainerType.physicalElem.conds,
                behavior_request: Object.keys(desireFuncType)[chosenIndex]
            }
        }
    });
};