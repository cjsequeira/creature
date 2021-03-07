'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
// REFACTOR IDEA: Rulebook should return an ACTION (or array of actions), not a PHYSTYPE!

// *** Our imports
import { orTests } from './utils.js';

import {
    physTypeGetCond,
    physTypeUseConds,
} from './reduxlike/store_getters.js';

import { physTypeDoPhysics } from './sim/physics.js';
import { mutableRandGen_seededRand } from './sim/seeded_rand.js';


// *** Rulebook test nodes
const isCreatureType = {
    name: 'Is creatureType?',
    testFunc: (_) => (physType) => physType.hasOwnProperty('conds'),
};

const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (_) => (physType) =>
        (physTypeGetCond(physType)('glucose') > 0.0) &&
        (physTypeGetCond(physType)('neuro') < 100.0),
};

const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (_) => (physType) => physTypeGetCond(physType)('behavior_request') === 'idling',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (physType) => physTypeGetCond(physType)('behavior_request') === 'wandering',
};

const isBehaviorRequestEating = {
    name: 'Requesting behavior: eating?',
    testFunc: (_) => (physType) => physTypeGetCond(physType)('behavior_request') === 'eating',
};

const isBehaviorRequestFoodAvail = {
    name: 'Is food available?',
    testFunc: (_) => (_) => mutableRandGen_seededRand(0.0, 1.0) > 0.03,
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (physType) => physTypeGetCond(physType)('behavior_request') === 'sleeping',
};


// *** Rulebook leaf nodes
const leafApproveBehavior = {
    name: 'Behavior request approved',
    func: (_) => (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),
        }),
};

const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),

            speed: 0.0,
            accel: 0.0
        }),
};

const leafRejectBehavior = {
    name: 'Behavior request rejected!',
    func: (_) => (physType) => physTypeUseConds
        (physType)
        ({
            // reject behavior request by re-assigning input physType
            behavior: physTypeGetCond(physType)('behavior'),
        }),
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (physType) => physTypeUseConds
        (physType)
        ({
            behavior: 'frozen',
        }),
};

const leafNotCreatureType = {
    name: 'Not a creatureType!',
    func: (_) => (physType) => physType,
};

const leafUnknownBehavior = {
    name: 'Unknown behavior!',
    func: (_) => (physType) => physType
};


// *** Functional programming helper functions
// link together rulebook test nodes with logical "or"
// takes:
//  ...testRules: array of rulebook test nodes
// returns object with testFunc property as: function combining test nodes with logical "or"
// the function signature is (storeType) => (physType) => returning bool
const orTestRules = (...testRules) => ({
    name: 'orTestRules',
    testFunc: (storeType) => orTests(testRules.map(rule => rule.testFunc(storeType)))
});


// *** The rulebook
const ruleBook = {
    testNode: isCreatureType,
    yes: {
        testNode: isGlucoseNeuroInRange,
        yes: {
            // first, produce physType with laws of physics applied
            preFunc: (storeType) => (physType) => physTypeDoPhysics(storeType)(physType),

            testNode: isBehaviorRequestEating,
            yes: {
                testNode: isBehaviorRequestFoodAvail,
                yes: leafApproveBehaviorStopMovement,
                no: leafRejectBehavior,
            },
            no: {
                testNode: isBehaviorRequestSleeping,
                yes: leafApproveBehaviorStopMovement,
                no: {
                    testNode: orTestRules(isBehaviorRequestIdling, isBehaviorRequestWandering),
                    yes: leafApproveBehavior,
                    no: leafUnknownBehavior,
                },
            },
        },
        no: leafCondsOOL,
    },
    no: leafNotCreatureType,
};


// *** Rulebook functions
// general rulebook resolver
//  find a rule in the rulebook for this physType, 
//  then apply the rule to get a physType
// takes: 
//  storeType
//  physType
// returns physType with applied rule
export const resolveRules = (storeType) => (physType) => findRule(storeType)(physType)(ruleBook);

// recursive rulebook node finder
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  physType
//  node: the rule node to use
// returns physType with selected rule applied
const findRule = (storeType) => (physType) => (node) => {
    // define: is pre-function undefined? 
    //  if yes, apply (x => x) to physType
    //  if no, apply pre-function to physType
    const physType_to_use = (node.preFunc || (_ => x => x))(storeType)(physType)

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: we assume the given node is a leaf node with a rule to apply
        // so, return the physType with the rule applied
        ? node.func(storeType)(physType_to_use)

        // no: we assume the given node is a test node with a test function
        // so, apply the given node's test func to the physType
        : (node.testNode.testFunc(storeType)(physType_to_use))
            // test func returned true? follow node.yes
            ? findRule(storeType)(physType_to_use)(node.yes)

            // test func returned false? follow node.no
            : findRule(storeType)(physType_to_use)(node.no)
};
