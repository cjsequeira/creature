'use strict'

// ****** Simulation rulebook: test nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports

import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_REPLACE_CREATURETYPE,
    EVENT_INSERT_FOODTYPES,
    EVENT_INSERT_CREATURETYPES,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    getPhysTypeAct,
    getPhysTypeCond,
} from '../reduxlike/store_getters.js';

import { rand_val } from '../sim/seeded_rand.js';


// *** Rulebook test nodes
export const isBehaviorRequestIdling = {
    name: 'isBehaviorRequestIdling',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'idling',
};

export const isBehaviorRequestSleeping = {
    name: 'isBehaviorRequestSleeping',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'sleeping',
};

export const isBehaviorRequestWandering = {
    name: 'isBehaviorRequestWandering',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'wandering',
};

export const isSimpleCreature = {
    name: 'isSimpleCreature',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_val(rand_eventType).physType) === actAsSimpleCreature,
};

export const isCreatureTouchingCreature = {
    name: 'isCreatureTouchingCreature',
    testFunc: (_) => (rand_eventType) =>
        rand_val(rand_eventType)[EVENT_INSERT_CREATURETYPES].length > 0,
};

export const isCreatureTouchingFood = {
    name: 'isCreatureTouchingFood',
    testFunc: (_) => (rand_eventType) =>
        rand_val(rand_eventType)[EVENT_INSERT_FOODTYPES].length > 0,
};

export const isEventUpdateAllPhysTypes = {
    name: 'isEventUpdateAllPhysTypes',
    testFunc: (_) => (rand_eventType) => rand_val(rand_eventType).type === EVENT_UPDATE_ALL_PHYSTYPES,
};

export const isEventReplaceCreatureType = {
    name: 'isEventReplaceCreatureType',
    testFunc: (_) => (rand_eventType) => rand_val(rand_eventType).type === EVENT_REPLACE_CREATURETYPE,
};

export const isGlucoseNeuroInRange = {
    name: 'isGlucoseNeuroInRange',
    testFunc: (_) => (rand_eventType) =>
        (getPhysTypeCond(rand_val(rand_eventType).physType)('glucose') > 0.0) &&
        (getPhysTypeCond(rand_val(rand_eventType).physType)('neuro') < 100.0),
};
