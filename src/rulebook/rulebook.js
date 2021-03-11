'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
//
//  RULEBOOK MAPS A SINGLE EVENT TO ACTION(S) USING THE GIVEN APP STATE!
//  (eventType) -> rulebook(storeType) -> actionType or [actionType]
//
//      Events can be user events captured with event listeners (e.g. button clicks)
//      Events can be simulator events that go straight to rulebook review
//          E.g.: "Use the rulebook to map this Update PhysType event to an action"
//  
//  Not all code has to generate events instead of actions. The things that generate
//      application-specific events are the things that we want the rulebook to handle.
//      In other words, we could still have button clicks dispatch events directly rather
//      than going through the rulebook.
// 

// *** Our imports
import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_UPDATE_PHYSTYPE
} from '../const_vals.js';

import { orTests } from '../utils.js';

import {
    action_UpdatePhysType,
    action_addJournalEntry,
    action_doNothing,
} from '../reduxlike/action_creators.js';

import {
    getPhysTypeStore,
    getPhysTypeRootKey,
    getPhysTypeCond,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';
import { mutableRandGen_seededRand } from '../sim/seeded_rand.js';


// *** Rulebook test nodes
const is_eventUpdatePhysType = {
    name: 'Is event of type EVENT_UPDATE_PHYSTYPE?',
    testFunc: (_) => (eventType) => eventType.type === EVENT_UPDATE_PHYSTYPE,
};

const is_eventUpdateAllPhysTypes = {
    name: 'Is event of type EVENT_UPDATE_ALL_PHYSTYPES?',
    testFunc: (_) => (eventType) => eventType.type === EVENT_UPDATE_ALL_PHYSTYPES,
};

const isCreatureType = {
    name: 'Is creatureType?',
    testFunc: (_) => (eventType) => eventType.physType.hasOwnProperty('conds'),
};

const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (_) => (eventType) =>
        (getPhysTypeCond(eventType.physType)('glucose') > 0.0) &&
        (getPhysTypeCond(eventType.physType)('neuro') < 100.0),
};

const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'idling',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'wandering',
};

const isBehaviorRequestEating = {
    name: 'Requesting behavior: eating?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'eating',
};

const isBehaviorRequestFoodAvail = {
    name: 'Is food available?',
    testFunc: (_) => (_) => mutableRandGen_seededRand(0.0, 1.0) > 0.03,
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'sleeping',
};


// *** Rulebook leaf nodes
const leafApproveBehavior = {
    name: 'Behavior request approved',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            usePhysTypeConds
                (eventType.physType)
                ({
                    behavior: getPhysTypeCond(eventType.physType)('behavior_request'),
                })
        ),
};

const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            usePhysTypeConds
                (eventType.physType)
                ({
                    behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                    speed: 0.0,
                    accel: 0.0
                })
        ),
};

const leafRejectBehaviorNoFood = {
    name: 'No food here. Behavior request rejected!',
    func: (_) => (eventType) => ([
        // reject the behavior request
        action_UpdatePhysType(
            usePhysTypeConds
                (eventType.physType)
                ({
                    // reject behavior request by re-assigning input physType behavior
                    behavior: getPhysTypeCond(eventType.physType)('behavior'),
                })
        ),

        // announce the bad news in journal
        action_addJournalEntry(
            '*** ' +
            getPhysTypeRootKey(eventType.physType)('name') +
            ' wants to eat but there\'s no food here!!'
        ),
    ]),
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            usePhysTypeConds
                (eventType.physType)
                ({
                    behavior: 'frozen',
                })
        ),
};

const leafNotCreatureType = {
    name: 'Not a creatureType! Preserve given physType',
    func: (_) => (_) => action_UpdatePhysType(eventType.physType),
};

const leafUnknownBehavior = {
    name: 'Unknown behavior! Preserve given physType',
    func: (_) => (_) => action_UpdatePhysType(eventType.physType),
};

const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) => (_) => action_doNothing(),
};

const leafRecursive_UpdateAllPhysTypes = {
    name: 'Update all physTypes in one atomic operation, consulting rulebook for each physType',
    func: (storeType) => (_) =>
        // action to update all physTypes "atomically," meaning we use the same 
        //  given storeType for each physType update process
        // function signature is (physTypeStore) -> actionType
        getPhysTypeStore(storeType).map((thisPhysType) =>
            resolveRules
                (storeType)
                (thisPhysType.act(storeType)(thisPhysType))
        ),
};


// *** Functional programming helper functions
// link together rulebook test nodes with logical "or"
// takes:
//  ...testRules: array of rulebook test nodes
// returns object with testFunc property as: function combining test nodes with logical "or"
// the testFunc signature is (storeType) => (eventType) => bool
const orTestRules = (...testRules) => ({
    name: 'orTestRules',
    testFunc: (storeType) => orTests(testRules.map(rule => rule.testFunc(storeType)))
});


// *** The rulebook
// REFACTOR: implement some version of "switch" / "select case"
const ruleBook = {
    testNode: is_eventUpdatePhysType,
    yes:
    {
        testNode: isCreatureType,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                // produce physType with laws of physics applied
                // the function application below INCLUDES wall collision testing!
                preFunc: (storeType) => (eventType) =>
                ({
                    ...eventType,
                    physType: physTypeDoPhysics(storeType)(eventType.physType),
                }),

                testNode: isBehaviorRequestEating,
                yes: {
                    testNode: isBehaviorRequestFoodAvail,
                    yes: leafApproveBehaviorStopMovement,
                    no: leafRejectBehaviorNoFood,
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
    },
    no: {
        testNode: is_eventUpdateAllPhysTypes,
        yes: leafRecursive_UpdateAllPhysTypes,
        no: leafUnknownEvent,
    },
};


// *** Rulebook functions
// general rulebook resolver
//  find a rule in the rulebook for an event, then apply the rule to get an action
// THE RULEBOOK IS: (eventType) -> rulebook(storeType) -> actionType or [actionType]
// takes: 
//  storeType
//  eventType
// returns actionType or [actionType]
export const resolveRules = (storeType) => (eventType) => findRule(storeType)(eventType)(ruleBook);

// recursive rulebook node finder
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  eventType
//  node: the rule node to use
// returns actionType or [actionType], as determined by rulebook application
const findRule = (storeType) => (eventType) => (node) => {
    // define: is pre-function undefined? 
    //  if yes, apply (x => x) to eventType
    //  if no, apply pre-function to eventType
    const eventType_to_use = (node.preFunc || (_ => x => x))(storeType)(eventType)

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: we assume the given node is a leaf node with a rule to apply
        // so, return the physType with the rule applied
        ? node.func(storeType)(eventType_to_use)

        // no: we assume the given node is a test node with a test function
        // so, apply the given node's test func to the eventType
        : (node.testNode.testFunc(storeType)(eventType_to_use))
            // test func returned true? follow node.yes
            ? findRule(storeType)(eventType_to_use)(node.yes)

            // test func returned false? follow node.no
            : findRule(storeType)(eventType_to_use)(node.no)
};
