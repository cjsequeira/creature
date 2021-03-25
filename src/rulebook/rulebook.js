'use strict'

// ****** Simulation rulebook ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/
//
//  RULEBOOK MAPS A SINGLE EVENT TO ACTION(S) USING THE GIVEN APP STATE!
//  (eventType) => rulebook(storeType) => actionType or [actionType]
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
// RANDM MONAD: The rulebook's randM_findRule function operates within the randM monad!!!
// This allows code within the rulebook to use immutable random numbers at will.
//
// randM_findRule takes a randM_eventType (among other args) and returns a randM_actionType
//
//      randM_eventType: an eventType wrapped within a randM monad
//      randM_actionType: an actionType wrapped within a randM monad
//
// the randM_actionType is unwrapped at the end to get [actionType] plus an action
// to update the sim seed!!! This ensures the sim seed stays in sync with its use

// *** Our imports
import {
    leafApproveBehaviorStopAccel,
    leafApproveBehaviorStopMovement,
    leafCondsOOL,
    leafCreatureEatFood,
    leafDoAndApproveWandering,
    leafDoCreatureCollision,
    leafPreservePhysType,
    leafUnknownEvent,
} from './leaf_nodes.js';

import {
    preFuncApplyPhysics,
    preFuncGenBehaviorRequest,
    preFuncTagTouchedCreatures,
    preFuncTagTouchedFood,
} from './prefuncs.js';

import {
    isBehaviorRequestEating,
    isBehaviorRequestIdling,
    isBehaviorRequestSleeping,
    isBehaviorRequestWandering,
    isCreatureAching,
    isCreatureEating,
    isCreatureTouchingCreature,
    isCreatureTouchingFood,
    isEventReplaceCreatureType,
    isEventUpdateAllPhysTypes,
    isGlucoseNeuroInRange,
    isSimpleCreature,
} from './test_nodes.js';

import {
    pipe2Comma,
    orTests2Comma,
} from '../utils.js';

import { action_setSimSeed } from '../reduxlike/action_creators.js';

import {
    getPhysTypeStore,
    getSimSeed,
} from '../reduxlike/store_getters.js';

import {
    randM_concat,
    randM_genRandM,
    randM_nextSeed,
    randM_unit,
    randM_val,
} from '../sim/seeded_rand.js';


// *** Pre-func named combinations
const preFuncDoPhysicsAndTag = (storeType, randM_eventType) =>
    pipe2Comma
        (
            storeType,
            randM_eventType,
            [
                preFuncApplyPhysics,
                preFuncTagTouchedCreatures,
                preFuncTagTouchedFood,
            ]
        );


// *** Functional programming helper functions
// link together rulebook test nodes with logical "or"
// takes:
//  ...testRules: array of rulebook test nodes
// returns object with testFunc property as: function combining test nodes with logical "or"
// the expected testFunc signature is (storeType, randM_eventType) => bool
// REFACTOR: Not yet tested!
const orTestRules = (...testRules) =>
({
    name: 'orTestRules',
    testFunc: (storeType) => orTests2Comma(
        testRules.map(
            rule => rule.testFunc(storeType, randM_eventType)
        )
    )
});

// unwrap a randM_actionType into an actionType plus an action to update the simulation seed
// takes:
//  randM_actionType: an actionType wrapped in a randM monad
// returns [actionType]
const randM_actionTypeVal = (randM_actionType) =>
([
    randM_val(randM_actionType),
    action_setSimSeed(randM_nextSeed(randM_actionType)),
]);


// *** Rulebook functions
// recursive rulebook node finder
// MONADIC: operates within the randM monad
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  randM_eventType: an eventType wrapped in a randM
//  node: the rule node to use
// returns randM_actionType: an actionType wrapped in a randM
const randM_findRule = (storeType, randM_eventType, node) => {
    // is pre-function undefined? 
    //  if yes, apply ((_, x) => x) to randM_eventType
    //  if no, apply pre-function to randM_eventType
    // expected pre-function signature: (storeType, randM_eventType) => randM_eventType
    const randM_eventType_to_use = (node.preFunc || ((_, x) => x))(storeType, randM_eventType)

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: we assume the given node is a leaf node with a function to apply
        // we apply the function "func" to return a randM_actionType
        // expected func signature: (storeType, randM_eventType) => randM_actionType
        ? node.func(storeType, randM_eventType_to_use)

        // no: we assume the given node is a test node with a test function
        // so, apply the given node's test function "testFunc" to the eventType
        // expected testFunc signature: (storeType, randM_eventType) => bool
        : (node.testNode.testFunc(storeType, randM_eventType_to_use))
            // test func returned true? follow node.yes
            ? randM_findRule(storeType, randM_eventType_to_use, node.yes)

            // test func returned false? follow node.no
            : randM_findRule(storeType, randM_eventType_to_use, node.no)
};

// general rulebook resolver
//  find a rule in the rulebook for an event, then apply the rule to get an action
// THE RULEBOOK IS: (eventType) -> rulebook(storeType) -> [actionType]
// takes: 
//  storeType
//  eventType
// returns [actionType]
const resolveRules = (storeType, eventType) =>
    // unwrap the randM_actionType produced by randM_findRule below
    // when unwrapped, we get an [actionType] that consists of a combination of:
    //  actionType or [actionType], plus an action to update the seed!!
    randM_actionTypeVal
        (
            // get a randM_actionType through application of randM_findRule
            // wrap the given eventType in a randM to create a randM_eventType
            // then apply randM_findRule
            randM_findRule
                (
                    // store to use
                    storeType,

                    // eventType to use, wrapped into a randM to make "randM_eventType"
                    randM_genRandM(eventType, getSimSeed(storeType)),

                    // use our rulebook as the starting rule node for randM_findRule
                    ruleBook
                )
        );


// *** Map a list of events to a list of associated actions by using our system rulebook
// takes:
//  storeType
//  ...events: list of events to map, as eventType
// returns [actionType]
export const mapEventsToActions = (storeType, ...events) =>
    events.flat(Infinity).map((thisEvent) => resolveRules(storeType, thisEvent));


// *** Recursive leaf nodes
// signature of leaf func: (storeType, randM_eventType) => randM_actionType
const recursive_leafUpdateAllPhysTypes_func = (storeType, randM_eventType) =>
    // reduce the entire physType store to a single randM_actionType
    getPhysTypeStore(storeType).reduce((accum_randM_actionType, thisPt) =>
        // concatenate randMs
        randM_concat
            (
                // left-hand side: accumulated randM_actionType so far
                accum_randM_actionType,

                // right-hand side: 
                // apply rulebook to this physType to get a randM_actionType...
                randM_findRule
                    (
                        // ... using the given store...
                        storeType,

                        // ... and a randM_eventType...
                        randM_genRandM
                            (
                                // ... built from the eventType produced by physType "act"...
                                thisPt.act(storeType, thisPt),

                                // ... and the seed of the accumulated randM_actionType OR
                                //  the given randM_eventType if accumulated randM_actionType is empty

                                (randM_val(accum_randM_actionType).length > 0)
                                    ? randM_nextSeed(accum_randM_actionType)
                                    : randM_nextSeed(randM_eventType)
                            ),

                        // use our rulebook
                        ruleBook
                    )

            ),
        // start reduction with a unit randM with a value of an empty array
        randM_unit([]));

const recursive_leafUpdateAllPhysTypes = {
    name: 'recursive_leafUpdateAllPhysTypes',
    func: recursive_leafUpdateAllPhysTypes_func,
};


// *** The rulebook
const ruleBook = {
    testNode: isEventReplaceCreatureType,
    yes:
    {
        preFunc: preFuncGenBehaviorRequest, // use desires to generate creature behavior request
        testNode: isSimpleCreature,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                preFunc: preFuncDoPhysicsAndTag,
                testNode: isCreatureTouchingCreature,
                yes: leafDoCreatureCollision,
                no: {
                    testNode: isBehaviorRequestEating,
                    yes: {
                        // no eating if aching!
                        testNode: isCreatureAching,
                        yes: leafPreservePhysType,
                        no: {
                            testNode: isCreatureTouchingFood,
                            yes: {
                                testNode: isCreatureEating,

                                // can't switch to eating if already eating! this prevents
                                //  picking up more food when already in "eating" behavior
                                yes: leafPreservePhysType,

                                // if not already eating, eat the touched food
                                no: leafCreatureEatFood,
                            },
                            no: leafPreservePhysType,
                        },
                    },
                    no: {
                        testNode: isBehaviorRequestSleeping,
                        yes: leafApproveBehaviorStopMovement,
                        no: {
                            testNode: isBehaviorRequestWandering,
                            yes: leafDoAndApproveWandering,
                            no: {
                                testNode: isBehaviorRequestIdling,
                                yes: leafApproveBehaviorStopAccel,
                                no: leafPreservePhysType,
                            }
                        },
                    },
                },
            },
            no: leafCondsOOL,
        },
        no: leafPreservePhysType,
    },
    no: {
        testNode: isEventUpdateAllPhysTypes,
        yes: recursive_leafUpdateAllPhysTypes,
        no: leafUnknownEvent,
    },
};
