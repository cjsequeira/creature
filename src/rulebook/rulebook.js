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
// RANDTYPE MONAD: The rulebook's findRule function operates within the randType monad!!!
//  findRule takes a rand_eventType and returns a rand_actionType
//  the rand_actionType is unwrapped to get [actionType] plus an action to update the sim seed!!!
//

// *** Our imports
import { event_replacePhysType } from './event_creators.js';

import {
    leafApproveBehavior,
    leafApproveBehaviorStopMovement,
    leafCondsOOL,
    leafCreatureEatFood,
    leafDoAndApproveWandering,
    leafPreservePhysType,
    leafRemoveFood,
    leafUnknownEvent,
} from './leaf_nodes.js';

import {
    isBehaviorRequestIdling,
    isBehaviorRequestSleeping,
    isBehaviorRequestWandering,
    isCreatureTouchingFood,
    isEventReplaceCreatureType,
    isEventReplacePhysType,
    isEventUpdateAllPhysTypes,
    isFoodTouchedByCreature,
    isFoodType,
    isGlucoseNeuroInRange,
    isSimpleCreature,
} from './test_nodes.js';

import { compose, orTests } from '../utils.js';
import { action_setSimSeed } from '../reduxlike/action_creators.js';

import {
    getPhysTypeStore,
    getSimSeed,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';

import {
    rand_bind,
    rand_chooseWeight,
    rand_getNextSeed,
    rand_unit,
} from '../sim/seeded_rand.js';


// *** Recursive leaf nodes
// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
export const recursive_leafUpdateAllPhysTypes = {
    name: 'RECURSIVE: Update all physTypes',
    func: (storeType) => (rand_eventType) =>
        getPhysTypeStore(storeType).reduce(
            (accum_rand_actionType, thisPt) =>
            ({
                value:
                    [
                        ...accum_rand_actionType.value,

                        rand_findRule
                            (storeType)
                            ({
                                value: thisPt.act(storeType)(thisPt),
                                nextSeed: (accum_rand_actionType.nextSeed || rand_eventType.nextSeed),
                            })
                            (ruleBook)
                            .value,
                    ],

                nextSeed:
                    rand_findRule
                        (storeType)
                        ({
                            value: thisPt.act(storeType)(thisPt),
                            nextSeed: (accum_rand_actionType.nextSeed || rand_eventType.nextSeed),
                        })
                        (ruleBook)
                        .nextSeed,
            }),

            // start with a unit randType with an array value
            rand_unit([])
        ),
};


// *** Functional programming helper functions
// link together rulebook test nodes with logical "or"
// takes:
//  ...testRules: array of rulebook test nodes
// returns object with testFunc property as: function combining test nodes with logical "or"
// the expected testFunc signature is (storeType) => (rand_eventType) => bool
const orTestRules = (...testRules) => ({
    name: 'orTestRules',
    testFunc: (storeType) => orTests(
        testRules.map(
            rule => rule.testFunc(storeType)
        )
    )
});


// *** The rulebook
const ruleBook = {
    testNode: isEventReplaceCreatureType,
    yes:
    {
        // build an event to update the creatureType per the behavior request below
        //  which comes from weighted random draw using given desire functions
        // this event will be processed by the rest of the rulebook, which will return
        //  an action based on the rulebook and current app state
        // the rulebook may assign the requested behavior, 
        //  or may reject the requested behavior and assign a different behavior,
        //  or may return an action totally unrelated to the creatureType object below!

        // REFACTOR to remove mutable rand!!
        // preFunc signature is (storeType) => (rand_eventType) => rand_eventType
        preFunc: (_) => (rand_eventType) =>
        ({
            // eventType
            value:
                // signature (physType) => eventType
                event_replacePhysType

                    // physType arg for event_replacePhysType
                    (
                        // signature: (physType) => (conds) => physType
                        usePhysTypeConds
                            // make an object based on the given physType, with a "behavior_request" prop-obj
                            (rand_eventType.value.physType)
                            ({
                                behavior_request:
                                    // select behavior request from list of given desire funcs using 
                                    // a weighted random number selector
                                    Object.keys(rand_eventType.value.desireFuncType)
                                    // use a randomly-chosen index to select a behavioral desire
                                    [rand_chooseWeight
                                        // list of numerical desires
                                        (
                                            // the code below maps each desire function to a numerical weight
                                            //  by evaluating it using the given physType
                                            Object.values(rand_eventType.value.desireFuncType).map(f => f(rand_eventType.value.physType))
                                        )
                                        // seed for rand_chooseWeight
                                        (rand_eventType.nextSeed)
                                    ]
                            })
                    ),

            // our use of rand_chooseWeight requires a manual advance to the next system seed!
            nextSeed: rand_getNextSeed(rand_eventType.nextSeed)(0),
        }),

        testNode: isSimpleCreature,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                // produce event containing physType with laws of physics applied
                // the function application below INCLUDES wall collision testing!
                // preFunc signature is (storeType) => (rand_eventType) => rand_eventType
                preFunc: (storeType) => (rand_eventType) =>
                ({
                    // eventType
                    value:
                        compose
                            (event_replacePhysType)
                            (physTypeDoPhysics(storeType))
                            (rand_eventType.value.physType),

                    nextSeed: rand_eventType.nextSeed,
                }),

                testNode: isCreatureTouchingFood,
                yes: leafCreatureEatFood,
                no: {
                    testNode: isBehaviorRequestSleeping,
                    yes: leafApproveBehaviorStopMovement,
                    no: {
                        testNode: isBehaviorRequestWandering,
                        yes: leafDoAndApproveWandering,
                        no: {
                            testNode: isBehaviorRequestIdling,
                            yes: leafApproveBehavior,
                            no: leafPreservePhysType
                        }
                    },
                },
            },
            no: leafCondsOOL,
        },
        no: leafPreservePhysType,
    },
    no: {
        testNode: isEventReplacePhysType,
        yes: {
            testNode: isFoodType,
            yes: {
                testNode: isFoodTouchedByCreature,
                yes: leafRemoveFood,
                no: leafPreservePhysType,
            },
            no: leafPreservePhysType,
        },
        no: {
            testNode: isEventUpdateAllPhysTypes,
            yes: recursive_leafUpdateAllPhysTypes,
            no: leafUnknownEvent,
        },
    }
};


// *** Rulebook functions
// general rulebook resolver
//  find a rule in the rulebook for an event, then apply the rule to get an action
// THE RULEBOOK IS: (eventType) -> rulebook(storeType) -> actionType or [actionType]
// takes: 
//  storeType
//  eventType
// returns [actionType]
export const resolveRules = (storeType) => (eventType) => {
    // wrap the given eventType in a randType to create a rand_eventType
    // then jump into the randType monad
    const rand_actionType =
        rand_findRule
            (storeType)
            ({
                value: eventType,
                nextSeed: getSimSeed(storeType),
            })
            (ruleBook);

    // manually unwrap the rand_actionType produced by rand_findRule
    // when unwrapped, we get an actionType or [actionType], plus an action to update the seed!!
    // REFACTOR to make a rand_actionType unwrapping function!
    // return value: [actionType]
    return [
        rand_actionType.value,
        action_setSimSeed(rand_actionType.nextSeed),
    ];
};

// recursive rulebook node finder
// MONAD: operates within the randType monad
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  rand_eventType: an eventType wrapped in a randType
//  node: the rule node to use
// returns rand_actionType 
const rand_findRule = (storeType) => (rand_eventType) => (node) => {
    // is pre-function undefined? 
    //  if yes, apply (_ => x => x) to rand_eventType
    //  if no, apply pre-function to rand_eventType
    // expected pre-function signature: (storeType) => (rand_eventType) => rand_eventType
    const rand_eventType_to_use = (node.preFunc || (_ => x => x))(storeType)(rand_eventType)

    // is test node undefined?
    return (node.testNode === undefined)
        // yes: we assume the given node is a leaf node with a function to apply
        // we apply the function "func" to return an actionType or [actionType]
        // expected func signature: (storeType) => (rand_eventType) => actionType or [actionType]
        // REFACTOR MONAD: to make a node.func unwrapper that gives the proper action_setSimSeed!!!
        //  This will reduce boilerplate code in all leaf nodes!
        ? node.func(storeType)(rand_eventType_to_use)

        // no: we assume the given node is a test node with a test function
        // so, apply the given node's test function "testFunc" to the eventType
        // expected testFunc signature: (storeType) => (rand_eventType) => bool
        : (node.testNode.testFunc(storeType)(rand_eventType_to_use))
            // test func returned true? follow node.yes
            ? rand_findRule(storeType)(rand_eventType_to_use)(node.yes)

            // test func returned false? follow node.no
            : rand_findRule(storeType)(rand_eventType_to_use)(node.no)
};
