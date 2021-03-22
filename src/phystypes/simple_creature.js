'use strict'

// ****** Simple Creature code ******

// *** Imports
import {
    getPhysTypeBCElapsed,
    getPhysTypeCond,
    usePhysTypeConds,
    getSimTimeStep
} from '../reduxlike/store_getters.js';

import { event_replaceCreatureType } from '../rulebook/event_creators.js';

import {
    BEHAVIOR_ACHING_TIME,
    BEHAVIOR_EATING_TIME,
    BEHAVIOR_MIN_TIME,
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
        behavior_clock: 0.0,

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
            'aching': actAching,
            'eating': actEating,
            'idling': actIdling,
            'sleeping': actSleeping,
            'wandering': actWandering,
        }[getPhysTypeCond(physType)('behavior')] || (_ => x => x)
    )(storeType)(physType);

// aching behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actAching = (storeType) => (physType) =>
    event_replaceCreatureType
        (
            // pass in physType object with specific glucose and neuro
            usePhysTypeConds
                (physType)
                ({
                    glucose: getPhysTypeCond(physType)('glucose') - 8.0 * getSimTimeStep(storeType),
                    neuro: getPhysTypeCond(physType)('neuro') + 4.0 * getSimTimeStep(storeType),
                }),

            // pass in behavior change desires specific to this behavior function
            // stay in this behavior for a minimum amount of time!
            (getPhysTypeBCElapsed(storeType)(physType) < BEHAVIOR_ACHING_TIME)
                ? { 'aching': (_) => 100.0 }
                : {
                    // can only go to: idling
                    'idling': (_) => 100.0,
                }
        );

// eating behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actEating = (storeType) => (physType) =>
    event_replaceCreatureType
        (
            // pass in physType object with specific glucose and neuro
            usePhysTypeConds
                (physType)
                ({
                    glucose: getPhysTypeCond(physType)('glucose') + 9.0 * getSimTimeStep(storeType),
                    neuro: getPhysTypeCond(physType)('neuro') + 1.4 * getSimTimeStep(storeType),
                }),

            // pass in behavior change desires specific to this behavior function
            // stay in this behavior for a minimum amount of time!
            (getPhysTypeBCElapsed(storeType)(physType) < BEHAVIOR_EATING_TIME)
                ? { 'eating': (_) => 100.0 }
                : {
                    // can only go to: eating or idling
                    'eating': (_) => (getPhysTypeCond(physType)('glucose') < 35.0) ? 70.0 : 0.1,
                    'idling': (_) => 6.0,
                }
        );

// idling behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actIdling = (storeType) => (physType) =>
    event_replaceCreatureType
        (
            // pass in physType object with specific glucose and neuro
            usePhysTypeConds
                (physType)
                ({
                    glucose: getPhysTypeCond(physType)('glucose') - 1.3 * getSimTimeStep(storeType),
                    neuro: getPhysTypeCond(physType)('neuro') + 1.0 * getSimTimeStep(storeType),
                }),

            // pass in behavior change desires specific to this behavior function
            // stay in this behavior for a minimum amount of time!
            (getPhysTypeBCElapsed(storeType)(physType) < BEHAVIOR_MIN_TIME)
                ? { 'idling': (_) => 100.0 }
                : {
                    // can only go to: idling, wandering, sleeping
                    'idling': (_) => 300.0,
                    'wandering': (physType) => (getPhysTypeCond(physType)('glucose') < 85.0) ? 15.0 : 0.1,
                    'sleeping': (physType) => (getPhysTypeCond(physType)('neuro') > 85.0) ? 100.0 : 0.1,
                }
        );

// sleeping behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actSleeping = (storeType) => (physType) =>
    event_replaceCreatureType
        (
            // pass in physType object with specific glucose and neuro
            usePhysTypeConds
                (physType)
                ({
                    glucose: getPhysTypeCond(physType)('glucose') - 0.6 * getSimTimeStep(storeType),
                    neuro: getPhysTypeCond(physType)('neuro') - 6.2 * getSimTimeStep(storeType),
                }),

            // pass in behavior change desires specific to this behavior function
            // stay in this behavior for a minimum amount of time!
            (getPhysTypeBCElapsed(storeType)(physType) < BEHAVIOR_MIN_TIME)
                ? { 'sleeping': (_) => 100.0 }
                : {
                    // can only go to: sleeping or idling
                    'sleeping': (_) => 200.0,
                    'idling': (physType) => (getPhysTypeCond(physType)('neuro') < 60.0) ? 9.0 : 0.1,
                }
        );

// wandering behavior function
// takes: 
//  storeType
//  physType
// returns physType
const actWandering = (_) => (physType) =>
    event_replaceCreatureType
        (
            // for 'wandering', the rulebook will assign conditions
            physType,

            // pass in behavior change desires specific to this behavior function
            {
                // can only go to: wandering, eating, idling
                // if speed really high, creature really wants to idle!
                'wandering': (_) => 40.0,
                'eating': (_) => (getPhysTypeCond(physType)('glucose') < 35.0) ? 60.0 : 0.1,
                'idling': (_) => (getPhysTypeCond(physType)('speed') > 40.0) ? 300.0 : 0.1,
            }
        );
