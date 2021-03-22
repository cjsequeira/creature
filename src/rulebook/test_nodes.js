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
const isBehaviorRequestIdling_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'idling';

export const isBehaviorRequestIdling = {
    name: 'isBehaviorRequestIdling',
    testFunc: isBehaviorRequestIdling_func,
};

const isBehaviorRequestEating_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'eating';

export const isBehaviorRequestEating = {
    name: 'isBehaviorRequestSleeping',
    testFunc: isBehaviorRequestEating_func,
};

const isBehaviorRequestSleeping_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'sleeping';

export const isBehaviorRequestSleeping = {
    name: 'isBehaviorRequestSleeping',
    testFunc: isBehaviorRequestSleeping_func,
};

const isBehaviorRequestWandering_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior_request') === 'wandering';

export const isBehaviorRequestWandering = {
    name: 'isBehaviorRequestWandering',
    testFunc: isBehaviorRequestWandering_func,
};

const isSimpleCreature_func = (_, rand_eventType) =>
    getPhysTypeAct(rand_val(rand_eventType).physType) === actAsSimpleCreature;

export const isSimpleCreature = {
    name: 'isSimpleCreature',
    testFunc: isSimpleCreature_func,
};

const isCreatureAching_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior') === 'aching';

export const isCreatureAching = {
    name: 'isCreatureAching',
    testFunc: isCreatureAching_func,
};

const isCreatureEating_func = (_, rand_eventType) =>
    getPhysTypeCond(rand_val(rand_eventType).physType)('behavior') === 'eating';

export const isCreatureEating = {
    name: 'isCreatureEating',
    testFunc: isCreatureEating_func,
};

const isCreatureTouchingCreature_func = (_, rand_eventType) =>
    rand_val(rand_eventType)[EVENT_INSERT_CREATURETYPES].length > 0;

export const isCreatureTouchingCreature = {
    name: 'isCreatureTouchingCreature',
    testFunc: isCreatureTouchingCreature_func,
};

export const isCreatureTouchingFood_func = (_, rand_eventType) =>
    rand_val(rand_eventType)[EVENT_INSERT_FOODTYPES].length > 0;

export const isCreatureTouchingFood = {
    name: 'isCreatureTouchingFood',
    testFunc: isCreatureTouchingFood_func,
};

const isEventUpdateAllPhysTypes_func = (_, rand_eventType) =>
    rand_val(rand_eventType).type === EVENT_UPDATE_ALL_PHYSTYPES;

export const isEventUpdateAllPhysTypes = {
    name: 'isEventUpdateAllPhysTypes',
    testFunc: isEventUpdateAllPhysTypes_func,
};

const isEventReplaceCreatureType_func = (_, rand_eventType) =>
    rand_val(rand_eventType).type === EVENT_REPLACE_CREATURETYPE;

export const isEventReplaceCreatureType = {
    name: 'isEventReplaceCreatureType',
    testFunc: isEventReplaceCreatureType_func,
};

const isGlucoseNeuroInRange_func = (_, rand_eventType) =>
    (getPhysTypeCond(rand_val(rand_eventType).physType)('glucose') > 0.0) &&
    (getPhysTypeCond(rand_val(rand_eventType).physType)('neuro') < 100.0);

export const isGlucoseNeuroInRange = {
    name: 'isGlucoseNeuroInRange',
    testFunc: isGlucoseNeuroInRange_func,
};
