'use strict'

// ****** Code to create application events ******

// *** Our imports
import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_UPDATE_CREATURETYPE,
    EVENT_UPDATE_PHYSTYPE
} from '../const_vals.js';


// *** PhysType events
// update all physTypes in given store
// takes:
//  physTypeStore: array of physTypes
// returns eventType
export const event_updateAllPhysTypes = (physTypeStore) =>
({
    type: EVENT_UPDATE_ALL_PHYSTYPES,
    physTypeStore,
});

// update creatureType of the same ID as the given creatureType
// takes:
//  physType
//  desireFuncType: behaviors with associated desire weights
// returns eventType
export const event_updateCreatureType = (physType) => (desireFuncType) =>
({
    type: EVENT_UPDATE_CREATURETYPE,
    physType,
    desireFuncType,
});

// update physType of the same ID as the given physType
// takes:
//  physType
// returns eventType
export const event_updatePhysType = (physType) =>
({
    type: EVENT_UPDATE_PHYSTYPE,
    physType,
});
