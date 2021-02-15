'use strict'

// ****** Simple Creature code ******

// *** Imports
import { geThan, seededRand, pctGetCond, pctUseConds } from '../util.js';
import { ResolveRules } from '../rulebook.js';


// *** Behavior functions unique to this creature
// main dispatch function
// returns physicalContainerType
export const ActAsSimpleCreature = (pct) => {
    switch (pct.physicalElem.conds.behavior) {
        case 'idling': return ActIdling(pct)
        case 'eating': return ActEating(pct)
        case 'sleeping': return ActSleeping(pct)
        case 'wandering': return ActWandering(pct)
        default: return pct
    }
};

// idling behavior function
// returns physicalContainerType
const ActIdling = (pct) => {
    return CheckBehavior(
        // pass in physicalContainerType object with specific glucose, neuro, and random velocity
        {
            ...pct,
            physicalElem: {
                ...pct.physicalElem,
                conds: {
                    ...pct.physicalElem.conds,
                    glucose: pctGetCond(pct, 'glucose') - 1.0,
                    neuro: pctGetCond(pct, 'neuro') + 0.5,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'idling': () =>
                0.2,
            'wandering': (pct) =>
                (pctGetCond(pct, 'glucose') < 40.0) ? 4.0 : 0.2,
            'sleeping': (pct) =>
                (pctGetCond(pct, 'neuro') > 85.0) ? 4.0 : 0.2,
        }
    );
};

// wandering behavior function
// returns physicalContainerType
const ActWandering = (pct) => {
    // declare: random acceleration
    const rand_a = seededRand(pct.physicalElem.seed, -2.0, 2.0);

    // declare: random heading nudge
    const rand_hdg_nudge = seededRand(rand_a[0], -0.3, 0.3);

    return CheckBehavior(
        // pass in physicalContainerType object with specific glucose, neuro, and random acceleration
        {
            ...pct,
            physicalElem: {
                ...pct.physicalElem,
                seed: rand_hdg_nudge[0],
                conds: {
                    ...pct.physicalElem.conds,
                    glucose: pctGetCond(pct, 'glucose') - 1.6,
                    neuro: pctGetCond(pct, 'neuro') + 1.6,

                    heading: pctGetCond(pct, 'heading') + rand_hdg_nudge[1],
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
            'eating': (pct) =>
                (pctGetCond(pct, 'glucose') < 20.0) ? 4.0 : 0.2,
            'sleeping': (pct) =>
                (pctGetCond(pct, 'neuro') > 85.0) ? 4.0 : 0.2,
        }
    );
};

// eating behavior function
// returns physicalContainerType
const ActEating = (pct) =>
    CheckBehavior(
        // pass in physicalContainerType object with specific glucose and neuro
        {
            ...pct,
            physicalElem: {
                ...pct.physicalElem,
                conds: {
                    ...pct.physicalElem.conds,
                    glucose: pctGetCond(pct, 'glucose') + 4.0,
                    neuro: pctGetCond(pct, 'neuro') + 1.0,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'eating': () =>
                1.0,
            'idling': (pct) =>
                (pctGetCond(pct, 'glucose') > 50.0) ? 2.0 : 0.2
        }
    );

// sleeping behavior function
// returns physicalContainerType
const ActSleeping = (pct) =>
    CheckBehavior(
        // pass in physicalContainerType object with specific glucose and neuro
        {
            ...pct,
            physicalElem: {
                ...pct.physicalElem,
                conds: {
                    ...pct.physicalElem.conds,
                    glucose: pctGetCond(pct, 'glucose') - 0.3,
                    neuro: pctGetCond(pct, 'neuro') - 2.2,
                }
            }
        },
        // pass in behavior change desires specific to this behavior function
        {
            'sleeping': () =>
                1.0,
            'idling': (pct) =>
                (pctGetCond(pct, 'neuro') < 50.0) ? 2.0 : 0.2
        }
    );


// *** Code common to all simple creatures
// function to review and return appropriate behavior
// returns physicalContainerType
export const CheckBehavior = (pct, desireFuncType) => {
    // declare: numerical desires as evaluation of each desire func with nifty shorthand
    const numbers = Object.values(desireFuncType).map(f => f(pct));

    // declare: numerical desires as cumulative array
    const cum_numbers = numbers.reduce((a, x, i) => [...a, x + (a[i - 1] || 0)], []);

    // declare: max value in cumulative array
    const max_cum_numbers = cum_numbers.reduce((a, x) => Math.max(a, x));

    // declare: random number in range of max value, as [0, max_cum_numbers]
    // note: seededRand returns [seed, value]
    // note: if max_cum_numbers = 0.0, value will be 0.0
    const randInRange = seededRand(pct.physicalElem.seed, 0, max_cum_numbers);

    // declare: first desire "box" that holds random number "target"
    const chosenIndex = cum_numbers.findIndex(x => geThan(randInRange[1])(x));

    // return physicalContainerType object with: 
    //      lastRule: the rule node applied to this creature
    //      physicalElem: the creature, as a creatureType with:
    //          updated seed
    //          behavior indicated via rulebook review of chosen desire
    return ResolveRules({
        ...pct,
        physicalElem: {
            ...pct.physicalElem,
            seed: randInRange[0],
            conds: {
                ...pct.physicalElem.conds,
                behavior_request: Object.keys(desireFuncType)[chosenIndex]
            }
        }
    });
};