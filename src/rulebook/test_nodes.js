'use strict'

// ****** Simulation rulebook: test nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports

import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_REPLACE_CREATURETYPE,
    EVENT_REPLACE_PHYSTYPE,
    WORLD_TOUCH_DISTANCE,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    getPhysTypeAct,
    getPhysTypeCond,
    getPhysTypeStore,
} from '../reduxlike/store_getters.js';

import { actAsFood } from '../phystypes/food_type.js';
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

export const isFoodType = {
    name: 'isFoodType',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_val(rand_eventType).physType) === actAsFood,
};

export const isFoodTouchedByCreature = {
    name: 'isFoodTouchedByCreature',
    testFunc: (storeType) => (rand_eventType) =>
        // get physType store
        getPhysTypeStore(storeType)
            // keep only simple creatures
            .filter(
                (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature
            )

            // keep only creatures closer than a given distance from this foodType
            .filter((ptToTest2) => Math.sqrt(
                Math.pow(getPhysTypeCond(ptToTest2)('x') -
                    getPhysTypeCond(rand_val(rand_eventType).physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') -
                    getPhysTypeCond(rand_val(rand_eventType).physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any creatures remaining closer than a given distance?
            .length > 0,
};

export const isSimpleCreature = {
    name: 'isSimpleCreature',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_val(rand_eventType).physType) === actAsSimpleCreature,
};

// REFACTOR IDEA: Create an event where the food being touched by the creature can be tagged in, for efficiencies
// GOAL: Avoid scanning food to see what's being eaten - just send the specific food objects
export const isCreatureTouchingFood = {
    name: 'isCreatureTouchingFood',
    testFunc: (storeType) => (rand_eventType) =>
        // get physType store
        getPhysTypeStore(storeType)
            // keep only food
            .filter(
                (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsFood
            )

            // keep only food closer than a given distance from this creatureType
            .filter((ptToTest2) => Math.sqrt(
                Math.pow(getPhysTypeCond(ptToTest2)('x') -
                    getPhysTypeCond(rand_val(rand_eventType).physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') -
                    getPhysTypeCond(rand_val(rand_eventType).physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any food remaining closer than a given distance?
            .length > 0,
};

export const isEventUpdateAllPhysTypes = {
    name: 'isEventUpdateAllPhysTypes',
    testFunc: (_) => (rand_eventType) => rand_val(rand_eventType).type === EVENT_UPDATE_ALL_PHYSTYPES,
};

export const isEventReplaceCreatureType = {
    name: 'isEventReplaceCreatureType',
    testFunc: (_) => (rand_eventType) => rand_val(rand_eventType).type === EVENT_REPLACE_CREATURETYPE,
};

export const isEventReplacePhysType = {
    name: 'isEventReplacePhysType',
    testFunc: (_) => (rand_eventType) => rand_val(rand_eventType).type === EVENT_REPLACE_PHYSTYPE,
};

export const isGlucoseNeuroInRange = {
    name: 'isGlucoseNeuroInRange',
    testFunc: (_) => (rand_eventType) =>
        (getPhysTypeCond(rand_val(rand_eventType).physType)('glucose') > 0.0) &&
        (getPhysTypeCond(rand_val(rand_eventType).physType)('neuro') < 100.0),
};
