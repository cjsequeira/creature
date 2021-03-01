'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import {
    physTypeGetCond,
    physTypeUseConds
} from './reduxlike/store_getters.js';

import { physTypeDoPhysics } from './sim/physics.js';
import { mutableRandGen_seededRand } from './sim/seeded_rand.js';


// *** Rulebook test nodes
const isCreatureType = {
    name: 'Is creatureType?',
    testFunc: (physType) => physType.hasOwnProperty('conds'),
};

const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (physType) =>
        (physTypeGetCond(physType)('glucose') > 0.0) &&
        (physTypeGetCond(physType)('neuro') < 100.0),
};

const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'idling',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'wandering',
};

const isBehaviorRequestEating = {
    name: 'Requesting behavior: eating?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'eating',
};

const isBehaviorRequestFoodAvail = {
    name: 'Is food available?',
    testFunc: (physType) => mutableRandGen_seededRand(0.0, 1.0) > 0.03,
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'sleeping',
};


// *** Rulebook leaf nodes
const leafApproveIdling = {
    name: 'Behavior request approved: idling',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),
        }),
};

const leafApproveWandering = {
    name: 'Behavior request approved: wandering',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),
        }),
};

const leafApproveEating = {
    name: 'Behavior request approved: eating',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),

            // can't move if eating: no grab-and-go!
            speed: 0.0,
            accel: 0.0
        }),
};

const leafApproveSleeping = {
    name: 'Behavior request approved: sleeping',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: 'sleeping',

            // can't move if sleeping!
            speed: 0.0,
            accel: 0.0
        }),
};

const leafRejectEating = {
    name: "Creature wants to eat but there's no food here!",
    func: (physType) => physTypeUseConds
        (physType)
        ({
            // reject behavior request
            behavior: physTypeGetCond(physType)('behavior'),
        }),
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: 'frozen',
        }),
};

const leafNotCreatureType = {
    name: 'Not a creatureType!',
    func: (physType) => physType,
};

const leafUnknownBehavior = {
    name: 'Unknown behavior!',
    func: (physType) => physType
};


// *** The rulebook
const ruleBook = {
    testNode: isCreatureType,
    yes: {
        testNode: isGlucoseNeuroInRange,
        yes: {
            // first, produce physType with laws of physics applied
            preFunc: (physType) => physTypeDoPhysics(physType),

            testNode: isBehaviorRequestIdling,
            yes: leafApproveIdling,
            no: {
                testNode: isBehaviorRequestWandering,
                yes: leafApproveWandering,
                no: {
                    testNode: isBehaviorRequestEating,
                    yes: {
                        testNode: isBehaviorRequestFoodAvail,
                        yes: leafApproveEating,
                        no: leafRejectEating,
                    },
                    no: {
                        testNode: isBehaviorRequestSleeping,
                        yes: leafApproveSleeping,
                        no: leafUnknownBehavior,
                    },
                },
            }
        },
        no: leafCondsOOL,
    },
    no: leafNotCreatureType,
};


// *** Rulebook functions
// general rulebook resolver
//  find a rule in the rulebook for this physType, 
//  then apply the rule to get a physType
// takes: physType
// returns physType with applied rule
export const resolveRules = (physType) => findRule(physType)(ruleBook);

// recursive rulebook node finder
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  physType
//  node: the rule node to use
// returns physType with selected rule applied
const findRule = (physType) => (node) => {
    // define: is pre-function undefined? 
    //  if yes, apply (x => x) to physType
    //  if no, apply pre-function to physType
    const physType_to_use = (node.preFunc || (x => x))(physType)

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: we assume the given node is a leaf node with a rule to apply
        // so, return the physType with the rule applied
        ? node.func(physType_to_use)

        // no: we assume the given node is a test node with a test function
        // so, apply the given node's test func to the physType
        : (node.testNode.testFunc(physType_to_use))
            // test func returned true? follow node.yes
            ? findRule(physType_to_use)(node.yes)

            // test func returned false? follow node.no
            : findRule(physType_to_use)(node.no)
};
