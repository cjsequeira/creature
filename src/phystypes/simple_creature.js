'use strict'

// ****** Simple Creature code ******

// *** Imports
import {
    getPhysTypeCond,
    usePhysTypeConds,
    getSimTimeStep
} from '../reduxlike/store_getters.js';

import { event_replaceCreatureType } from '../rulebook/event_creators.js';

import {
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';


// *** Default Simple Creature assembler
// WARNING: Establishes object with null ID!
// takes: 
//  don't care
// returns Simple Creature
export const getDefaultSimpleCreature = (_) =>
({
    name: 'New Simple Creature',
    color: '#bb0000ff',
    id: null,
    act: actAsSimpleCreature,
    conds: {
        // internal biology
        glucose: 50.0,
        neuro: 50.0,

        // behavior
        behavior: 'idling',
        behavior_request: null,

        // location
        x: WORLD_SIZE_X / 2.0,
        y: WORLD_SIZE_Y / 2.0,

        // heading, speed, acceleration
        heading: 0.0,
        speed: 1.0,
        accel: 0.0,
    },
});


// *** Behavior functions unique to Simple Creature
// main behavior function
// this function works by using the creatureType behavior to select a function to apply
// if behavior is not a key in the object, 'behavior' bracket search gives null,
//  causing return of identity function (_ => x => x), which returns given physType unaltered
// takes: 
//  storeType
//  physType
// returns eventType
export const actAsSimpleCreature = (storeType) => (physType) =>
    (
        {
            'idling': actIdling,
            'eating': actEating,
            'sleeping': actSleeping,
            'wandering': actWandering,
        }[getPhysTypeCond(physType)('behavior')] || (_ => x => x)
    )(storeType)(physType);

// idling behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actIdling = (storeType) => (physType) =>
    event_replaceCreatureType
        // pass in physType object with specific glucose, neuro, accel
        (usePhysTypeConds
            (physType)
            ({
                glucose: getPhysTypeCond(physType)('glucose') - 3.0 * getSimTimeStep(storeType),
                neuro: getPhysTypeCond(physType)('neuro') + 2.0 * getSimTimeStep(storeType),
                accel: 0.0
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'idling': (_) =>
                30.0,
            'wandering': (physType) =>
                (getPhysTypeCond(physType)('glucose') < 85.0) ? 3.0 : 0.1,
            'sleeping': (physType) =>
                (getPhysTypeCond(physType)('neuro') > 85.0) ? 9.0 : 0.1,
        });

// wandering behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actWandering = (_) => (physType) =>
    event_replaceCreatureType
        // for 'wandering', the rulebook will assign conditions
        (physType)
        // pass in behavior change desires specific to this behavior function
        ({
            'wandering': (_) =>
                20.0,
            'idling': (_) =>
                (getPhysTypeCond(physType)('speed') > 30.0) ? 100.0 : 0.1,
            'sleeping': (physType) =>
                (getPhysTypeCond(physType)('neuro') > 85.0) ? 10.0 : 0.1,
        });


// eating behavior function
// THE ONLY WAY TO GET HERE IS BY RULEBOOK BEHAVIOR ASSIGNMENT!
// takes: 
//  storeType
//  physType
// returns physType
const actEating = (storeType) => (physType) =>
    event_replaceCreatureType
        // pass in physType object with specific glucose and neuro
        (usePhysTypeConds
            (physType)
            ({
                glucose: getPhysTypeCond(physType)('glucose') + 30.0 * getSimTimeStep(storeType),
                neuro: getPhysTypeCond(physType)('neuro') + 20.0 * getSimTimeStep(storeType),
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'idling': (_) =>
                30.0,
            'wandering': (physType) =>
                (getPhysTypeCond(physType)('glucose') < 85.0) ? 6.0 : 0.1,
            'sleeping': (physType) =>
                (getPhysTypeCond(physType)('neuro') > 85.0) ? 4.0 : 0.1,
        });

// sleeping behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actSleeping = (storeType) => (physType) =>
    event_replaceCreatureType
        // pass in physType object with specific glucose and neuro
        (usePhysTypeConds
            (physType)
            ({
                glucose: getPhysTypeCond(physType)('glucose') - 1.4 * getSimTimeStep(storeType),
                neuro: getPhysTypeCond(physType)('neuro') - 6.2 * getSimTimeStep(storeType),
            })
        )
        // pass in behavior change desires specific to this behavior function
        ({
            'sleeping': (_) =>
                8.0,
            'idling': (physType) =>
                (getPhysTypeCond(physType)('neuro') < 60.0) ? 9.0 : 0.1
        });
