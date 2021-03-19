'use strict'

// ****** Simulation rulebook: test nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
//


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


// *** Rulebook test nodes
export const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'idling',
};

export const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'sleeping',
};

export const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'wandering',
};

export const isFoodType = {
    name: 'Is foodType?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_eventType.value.physType) === actAsFood,
};

export const isFoodTouchedByCreature = {
    name: 'Is this food being touched by creature?',
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
                    getPhysTypeCond(rand_eventType.value.physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') -
                    getPhysTypeCond(rand_eventType.value.physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any creatures remaining closer than a given distance?
            .length > 0,
};

export const isSimpleCreature = {
    name: 'Is creatureType?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_eventType.value.physType) === actAsSimpleCreature,
};

// REFACTOR IDEA: Create an event where the food being touched by the creature can be tagged in, for efficiencies
// GOAL: Avoid scanning food to see what's being eaten - just send the specific food objects
export const isCreatureTouchingFood = {
    name: 'Is this creature touching food?',
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
                    getPhysTypeCond(rand_eventType.value.physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') -
                    getPhysTypeCond(rand_eventType.value.physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any food remaining closer than a given distance?
            .length > 0,
};

export const isEventUpdateAllPhysTypes = {
    name: 'Is event of type EVENT_UPDATE_ALL_PHYSTYPES?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_UPDATE_ALL_PHYSTYPES,
};

export const isEventReplaceCreatureType = {
    name: 'Is event of type EVENT_REPLACE_CREATURETYPE?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_REPLACE_CREATURETYPE,
};

export const isEventReplacePhysType = {
    name: 'Is event of type EVENT_REPLACE_PHYSTYPE?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_REPLACE_PHYSTYPE,
};

export const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (_) => (rand_eventType) =>
        (getPhysTypeCond(rand_eventType.value.physType)('glucose') > 0.0) &&
        (getPhysTypeCond(rand_eventType.value.physType)('neuro') < 100.0),
};
