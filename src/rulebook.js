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
const ruleTestIsCreatureType = {
    name: '1. Is creatureType?',
    testFunc: (physType) => physType.hasOwnProperty('conds'),
};

const ruleTestGlucoseNeuroRange = {
    name: '1.y. Glucose and neuro in range?',
    testFunc: (physType) =>
        (physTypeGetCond(physType)('glucose') > 0.0) &&
        (physTypeGetCond(physType)('neuro') < 100.0),
};

const ruleTestBehaviorRequestIdling = {
    name: '1.y.y. Requesting behavior: idling?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'idling',
};

const ruleTestBehaviorRequestWandering = {
    name: '1.y.y.n. Requesting behavior: wandering?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'wandering',
};

const ruleTestBehaviorRequestEating = {
    name: '1.y.y.n.n. Requesting behavior: eating?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'eating',
};

const ruleTestBehaviorRequestFoodAvail = {
    name: '1.y.y.n.n.y. Is food available?',
    testFunc: (physType) => mutableRandGen_seededRand(0.0, 1.0) > 0.03,
};

const ruleTestBehaviorRequestSleeping = {
    name: '1.y.y.n.n.n. Requested behavior: sleeping?',
    testFunc: (physType) => physTypeGetCond(physType)('behavior_request') === 'sleeping',
};


// *** Rulebook leaf nodes
const ruleLeafApproveIdling = {
    name: '1.y.y.y. Behavior request approved: idling',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),
        }),
};

const ruleLeafApproveWandering = {
    name: '1.y.y.n.y. Behavior request approved: wandering',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),
        }),
};

const ruleLeafApproveEating = {
    name: '1.y.y.n.n.y.y. Behavior request approved: eating',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: physTypeGetCond(physType)('behavior_request'),

            // can't move if eating: no grab-and-go!
            speed: 0.0,
            accel: 0.0
        }),
};

const ruleLeafApproveSleeping = {
    name: '1.y.y.n.n.n.y. Behavior request approved: sleeping',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: 'sleeping',

            // can't move if sleeping!
            speed: 0.0,
            accel: 0.0
        }),
};

const ruleLeafRejectEating = {
    name: "1.y.y.n.n.y.n. Creature wants to eat but there's no food here!",
    func: (physType) => physTypeUseConds
        (physType)
        ({
            // reject behavior request
            behavior: physTypeGetCond(physType)('behavior'),
        }),
};

const ruleLeafCondsOOL = {
    name: '1.y.n. Creature conditions out of limits!',
    func: (physType) => physTypeUseConds
        (physType)
        ({
            behavior: 'frozen',
        }),
};

const ruleLeafNotCreatureType = {
    name: '1.n. Return given physType',
    func: (physType) => physType,
};

const ruleLeafUnknownBehavior = {
    name: '1.y.y.n.n.n.n. Unknown behavior!',
    func: (physType) => physType
};


// *** The rulebook
const ruleBook = {
    testNode: ruleTestIsCreatureType,
    yes: {
        testNode: ruleTestGlucoseNeuroRange,
        yes: {
            // produce creatureType object with laws of physics applied
            preFunc: (physType) => physTypeDoPhysics(physType),

            testNode: ruleTestBehaviorRequestIdling,
            yes: ruleLeafApproveIdling,
            no: {
                testNode: ruleTestBehaviorRequestWandering,
                yes: ruleLeafApproveWandering,
                no: {
                    testNode: ruleTestBehaviorRequestEating,
                    yes: {
                        testNode: ruleTestBehaviorRequestFoodAvail,
                        yes: ruleLeafApproveEating,
                        no: ruleLeafRejectEating,
                    },
                    no: {
                        testNode: ruleTestBehaviorRequestSleeping,
                        yes: ruleLeafApproveSleeping,
                        no: ruleLeafUnknownBehavior,
                    },
                },
            }
        },
        no: ruleLeafCondsOOL,
    },
    no: ruleLeafNotCreatureType,
};


// *** Rulebook functions
// general rulebook resolver
// REFACTOR IDEA:
//  Determine whether to save last-used rule in a pct or some other structure 
//  (e.g. a store list with a creature lookup)
// takes: physType
// returns physContainerType with applied rule and record of rule used
export const resolveRules = (physType) => {
    // define: get physContainerType with selected rule and a physType to apply the rule to
    const pct_to_use = findRule(physType)(ruleBook);

    // return physContainerType with: 
    //  lastRule: selected rule
    //  physType: given physType with selected rule applied
    return {
        ...pct_to_use,
        lastRule: pct_to_use.lastRule,
        physType: pct_to_use.lastRule.func(pct_to_use.physType),
    }
};

// recursive rulebook node finder
// takes:
//  physType
//  node: the rule node to use
// returns physContainerType with function (named "func") that should be applied to the physType
const findRule = (physType) => (node) => {
    // define: is pre-function undefined? if yes, use physType. if no, use preFunc(physType)
    const physType_to_use = (node.preFunc === undefined)
        ? physType
        : node.preFunc(physType);

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: return the physContainerType
        ? {
            lastRule: node,
            physType: physType_to_use,
        }

        // no: apply the test node's test func to the physType
        : (node.testNode.testFunc(physType_to_use))
            // test func returned true? follow node.yes
            ? findRule(physType_to_use)(node.yes)

            // test func returned false? follow node.no
            : findRule(physType_to_use)(node.no)
};
