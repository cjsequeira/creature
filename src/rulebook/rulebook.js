'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
// REFACTOR IDEA: Rulebook should return an ACTION (or array of actions), not a PHYSTYPE!
// OR --------- Should Rulebook still return a physType, with expanded properties/messages,
//  e.g. a messages sub-object saying things like "delete?"
// But physTypes shouldn't care about messaging the system. Instead, the system should
// have rules for dealing with certain circumstances.
// Where should the rules be located, what should be their input, and what should they return?

// NO STATE IN ACTIONS -- No reading state in action creators!
// NO ACTIONS IN REDUCERS -- No dispatching actions in reducers based on state!

// REDUCER is: state -> action -> state
// ACTION is a tiny piece of info dispatched by an EVENT -- NO LOGIC IN ACTIONS
//  ACTION is: event -> action

// Can we have a rulebook that's an ACTION GENERATOR?
//  If so: rulebook cannot be in an action
//  If so: rulebook cannot be in a reducer

//  Rulebook must be "its own thing"...?
//  Imagine EVERYTHING being filtered through the rulebook, which then dispatches actions
//      In other words, rulebook stands BETWEEN EVENTS and ACTIONS as a PRE-PROCESSOR
//          EVENTS --> PRE-PROCESSING --> ACTIONS
//          EVENTS --> RULEBOOK REVIEW --> ACTIONS
//          So events no longer trigger actions directly: EVENTS pass through RULEBOOK,
//          which provides logic to create ACTIONS BASED ON STATE

//          EVENTS --> Rulebook review (event)(state) --> ACTIONS

//      Event example: creature doBehavior: creature wants to change behavior
//      Event example: creature wants to change behavior
//      Event example: creature and food meet
//      Event example: creature wants to duplicate
//      Event example: creature conds out of limits

//  Must decide WHAT IS AN EVENT and HOW ARE EVENTS BUILT
//      Example: JavaScript event listeners for DOM events like button clicks
//          How event is built: by browser (?) and then captured through browser mechanics
//      Internal simulator equivalent: since we know exactly what is going on in the sim,
//          we don't need an event listener - just decide WHAT IS AN EVENT
//
//  The flow:
//      Event dispatch sends event -> rulebook review (event)(state) -> actions
//
//      Events can be user events captured with event listeners (e.g. button clicks)
//      Events can be simulator events that go straight to rulebook review
//          E.g.: "handle this doBehavior event with rulebook(event, state)"
//
//  RULEBOOK IS MIDDLEWARE BETWEEN EVENTS AND ACTIONS
//  Rulebook: map (state, event) -> actions
//  
//  Rulebook is:
//  takes:
//      storeType: current state
//      eventType: event to process
//  returns: array of actionType
//
//  So the rulebook below no longer processes a physType and returns a physType
//      It processes an EVENT (which could be related to a physType)
//      and returns an array of ACTIONS
//
//  Need: a set of APPLICATION-SPECIFIC events!
//      Events to be triggered by simulator
//      Events to be triggered by DOM event listeners
//      Event background/inspiration? https://www.w3schools.com/jsref/dom_obj_event.asp
//          E.g. event type, target (i.e. trigger object/situation), timeStamp
//  
//  Not all code has to generate events instead of actions. The things that generate
//      application-specific events are the things that we want the rulebook to handle
//      In other words, we could still have button clicks dispatch events directly
// 


// *** Our imports
import { EVENT_UPDATE_ALL_PHYSTYPES, EVENT_UPDATE_PHYSTYPE } from '../const_vals.js';

import { orTests } from '../utils.js';

import {
    getPhysTypeStore,
    physTypeGetCond,
    physTypeUseConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';
import { mutableRandGen_seededRand } from '../sim/seeded_rand.js';
import { action_UpdatePhysType, doNothing, physTypeDoAct } from '../reduxlike/action_creators.js';


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
        (physTypeGetCond(eventType.physType)('glucose') > 0.0) &&
        (physTypeGetCond(eventType.physType)('neuro') < 100.0),
};

const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (_) => (eventType) => physTypeGetCond(eventType.physType)('behavior_request') === 'idling',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (eventType) => physTypeGetCond(eventType.physType)('behavior_request') === 'wandering',
};

const isBehaviorRequestEating = {
    name: 'Requesting behavior: eating?',
    testFunc: (_) => (eventType) => physTypeGetCond(eventType.physType)('behavior_request') === 'eating',
};

const isBehaviorRequestFoodAvail = {
    name: 'Is food available?',
    testFunc: (_) => (_) => mutableRandGen_seededRand(0.0, 1.0) > 0.03,
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (eventType) => physTypeGetCond(eventType.physType)('behavior_request') === 'sleeping',
};


// *** Rulebook leaf nodes
const leafApproveBehavior = {
    name: 'Behavior request approved',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            physTypeUseConds
                (eventType.physType)
                ({
                    behavior: physTypeGetCond(eventType.physType)('behavior_request'),
                })
        ),
};

const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            physTypeUseConds
                (eventType.physType)
                ({
                    behavior: physTypeGetCond(eventType.physType)('behavior_request'),

                    speed: 0.0,
                    accel: 0.0
                })
        ),
};

const leafRejectBehavior = {
    name: 'Behavior request rejected!',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            physTypeUseConds
                (eventType.physType)
                ({
                    // reject behavior request by re-assigning input physType behavior
                    behavior: physTypeGetCond(eventType.physType)('behavior'),
                })
        ),
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (eventType) =>
        action_UpdatePhysType(
            physTypeUseConds
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
    func: (_) => (_) => doNothing(),
};

const leafRecursive_UpdateAllPhysTypes = {
    name: 'Update all physTypes in one atomic operation, consulting rulebook for each physType',
    func: (storeType) => (_) =>
        // action to update all physTypes "atomically," meaning we use the same 
        //  given storeType for each physType update process
        // function signature is (physTypeStore) -> actionType
        physTypeDoAct(
            // map each physType in the physTypeStore of the given storeType by...
            getPhysTypeStore(storeType).map(
                (thisPhysType) =>
                    // ...applying physType "act" to get an event, then passing that event
                    //  through the rulebook (along with the given storeType) to get 
                    //  an "update physType" action, then stripping the physType from that action
                    // REFACTOR?: UGLY, YET FUNCTIONAL
                    resolveRules
                        (storeType)
                        (thisPhysType.act(storeType)(thisPhysType))

                        // strip the physType from the action given by resolveRules
                        //  and use that physType as the "map" function output
                        // WE ASSUME the action given by resolveRules has 
                        //  a property named "physType"!
                        .physType
            )
        ),
};


// *** Functional programming helper functions
// link together rulebook test nodes with logical "or"
// takes:
//  ...testRules: array of rulebook test nodes
// returns object with testFunc property as: function combining test nodes with logical "or"
// the function signature is (storeType) => (eventType) => bool
const orTestRules = (...testRules) => ({
    name: 'orTestRules',
    testFunc: (storeType) => orTests(testRules.map(rule => rule.testFunc(storeType)))
});


// *** The rulebook
const ruleBook = {
    testNode: is_eventUpdatePhysType,
    yes:
    {
        testNode: isCreatureType,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                // first, produce physType with laws of physics applied
                preFunc: (storeType) => (eventType) =>
                ({
                    ...eventType,
                    physType: physTypeDoPhysics(storeType)(eventType.physType),
                }),

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
// THE RULEBOOK IS: (eventType) -> rulebook(storeType) -> actionType
// takes: 
//  storeType
//  eventType
// returns actionType
export const resolveRules = (storeType) => (eventType) => findRule(storeType)(eventType)(ruleBook);

// recursive rulebook node finder
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  eventType
//  node: the rule node to use
// returns actionType as determined by rulebook application
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
