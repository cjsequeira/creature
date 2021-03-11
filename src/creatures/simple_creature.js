'use strict'

// ****** Simple Creature code ******

// *** Imports
import { excludeRange } from '../utils.js';

import {
    physTypeGetCond,
    physTypeUseConds,
    simGetTimeStep
} from '../reduxlike/store_getters.js';

import { event_updatePhysType } from '../rulebook/event_creators.js';

import {
    mutableRandGen_seededRand,
    mutableRandGen_seededWeightedRand
} from '../sim/seeded_rand.js';


// *** Default Simple Creature assembler
// takes: don't care
// returns physType
export const getDefaultSimpleCreature = (_) =>
({
    name: 'New Simple Creature',
    color: '#00bb00ff',
    act: actAsSimpleCreature,
    conds: {
        // internal biology
        glucose: 50.0,
        neuro: 50.0,

        // behavior
        behavior: 'idling',
        behavior_request: null,

        // location
        x: 10.0,
        y: 10.0,

        // heading, speed, acceleration
        heading: 0.0 * Math.PI / 180.0,
        speed: 2.0,
        accel: 0.0,
    },
});


// *** Behavior functions unique to Simple Creature
// main behavior function
// this function works by using the physType behavior to select a function to apply
// if behavior is not a key in the object, 'behavior' bracket search gives null,
//  causing return of identity function (_ => x => x), which returns given physType unaltered
// takes: 
//  storeType
//  physType
// returns physType
export const actAsSimpleCreature = (storeType) => (physType) =>
    (
        {
            'idling': actIdling,
            'eating': actEating,
            'sleeping': actSleeping,
            'wandering': actWandering,
        }[physTypeGetCond(physType)('behavior')] || (_ => x => x)
    )(storeType)(physType);

// idling behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actIdling = (storeType) => (physType) =>
    doBehavior
        (storeType)
        // pass in physType object with specific glucose, neuro, accel
        (physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') - 3.0 * simGetTimeStep(storeType),
                neuro: physTypeGetCond(physType)('neuro') + 2.0 * simGetTimeStep(storeType),
                accel: 0.0
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'idling': () =>
                4.0,
            'wandering': (physType) =>
                (physTypeGetCond(physType)('glucose') < 50.0) ? 7.0 : 0.1,
            'sleeping': (physType) =>
                (physTypeGetCond(physType)('neuro') > 85.0) ? 4.0 : 0.1,
        });

// wandering behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actWandering = (storeType) => (physType) =>
    // return evaluation of anonymous function that takes an acceleration  
    //  and heading nudge value
    (
        (accel) => (hdg_nudge) => doBehavior
            (storeType)
            // pass in physType object with specific glucose, neuro, heading, accel
            // glucose and neuro impacts are more severe with higher accceleration magnitude
            (physTypeUseConds
                (physType)
                ({
                    glucose: physTypeGetCond(physType)('glucose') -
                        (0.3 * Math.abs(accel)) * simGetTimeStep(storeType),
                    neuro: physTypeGetCond(physType)('neuro') +
                        (0.2 * Math.abs(accel)) * simGetTimeStep(storeType),

                    heading: physTypeGetCond(physType)('heading') + hdg_nudge,
                    accel: accel,
                })
            )
            // pass in behavior change desires specific to this behavior function
            ({
                'wandering': () =>
                    7.0,
                'idling': () =>
                    0.1,
                'eating': (physType) =>
                    (physTypeGetCond(physType)('glucose') < 20.0) ? 7.0 : 0.1,
                'sleeping': (physType) =>
                    (physTypeGetCond(physType)('neuro') > 85.0) ? 7.0 : 0.1,
            })
    )
        // anonymous function arguments:
        //  random acceleration at least 2.0 in magnitude...
        //  random heading nudge (in radians)
        (excludeRange(2.0)(mutableRandGen_seededRand(-4.0, 15.0)))      // accel
        (mutableRandGen_seededRand(-0.1, 0.1));                         // heading nudge

// eating behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actEating = (storeType) => (physType) =>
    doBehavior
        (storeType)
        // pass in physType object with specific glucose and neuro
        (physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') + 6.0 * simGetTimeStep(storeType),
                neuro: physTypeGetCond(physType)('neuro') + 4.0 * simGetTimeStep(storeType),
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'eating': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType)('glucose') > 40.0) ? 5.0 : 0.1
        });

// sleeping behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actSleeping = (storeType) => (physType) =>
    doBehavior
        (storeType)
        // pass in physType object with specific glucose and neuro
        (physTypeUseConds
            (physType)
            ({
                glucose: physTypeGetCond(physType)('glucose') - 1.4 * simGetTimeStep(storeType),
                neuro: physTypeGetCond(physType)('neuro') - 6.2 * simGetTimeStep(storeType),
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'sleeping': () =>
                5.0,
            'idling': (physType) =>
                (physTypeGetCond(physType)('neuro') < 60.0) ? 5.0 : 0.1
        });


// *** Code common to all simple creatures
// function to review Simple Creature desires and return an event to be 
//  processed by the rulebook
// takes: 
//  don't care: storeType
//  physType
//  desireFuncType: object of behavior keys with desire functions as property-vals
// returns eventType
const doBehavior = (_) => (physType) => (desireFuncType) =>
    // return an event to update the physType per the behavior request below
    //  which comes from weighted random draw using given desire functions
    // this event needs to be processed by the rulebook, which will return an action
    //  based on the rulebook and current app state
    // the rulebook may assign the requested behavior, 
    //  or may reject the requested behavior and assign a different behavior,
    //  or may return an action totally unrelated to the physType object below!
    event_updatePhysType(
        physTypeUseConds
            // make an object based on the given physType, with a "behavior_request" prop-obj
            (physType)
            ({
                behavior_request:
                    // select behavior request from list of desire funcs using 
                    // a weighted random number selector
                    Object.keys(desireFuncType)[mutableRandGen_seededWeightedRand(
                        // the code below maps each desire function to a numerical weight
                        //  by evaluating it using the given physType
                        Object.values(desireFuncType).map(f => f(physType))
                    )]
            })
    );
