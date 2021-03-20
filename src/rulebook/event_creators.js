'use strict'

// ****** Code to create application events ******

// *** Our imports
import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_REPLACE_CREATURETYPE,
    EVENT_REPLACE_PHYSTYPE
} from '../const_vals.js';


// *** PhysType events
// update all physTypes in store
// takes:
//  physTypeStore: array of physTypes
// returns eventType
export const event_updateAllPhysTypes = (_) =>
({
    type: EVENT_UPDATE_ALL_PHYSTYPES,
});

// replace creatureType of the same ID as the given creatureType
// takes:
//  physType
//  desireFuncType: behaviors with associated desire weights
// returns eventType
export const event_replaceCreatureType = (physType) => (desireFuncType) =>
({
    type: EVENT_REPLACE_CREATURETYPE,
    physType,
    desireFuncType,
});

// replace physType of the same ID as the given physType
// takes:
//  physType
// returns eventType
export const event_replacePhysType = (physType) =>
({
    type: EVENT_REPLACE_PHYSTYPE,
    physType,
});

// *** Event helpers
// insert data into an event
// takes:
//  eventType: the eventType object to insert into
//  insertType: the data type of the data being inserted
//  insertData: the data to insert
// returns eventType
export const eventInsert_insertData = (eventType) => (insertType) => (insertData) =>
({
    ...eventType,
    [insertType]: insertData,
});
