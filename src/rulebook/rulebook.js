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
    rand_genRandType,
    rand_getNextSeed,
    rand_nextSeed,
    rand_unit,
    rand_val,
} from '../sim/seeded_rand.js';


// *** Recursive leaf nodes
// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
export const recursive_leafUpdateAllPhysTypes = {
    name: 'recursive_leafUpdateAllPhysTypes',
    func: (storeType) => (rand_eventType) =>
        // reduce the entire physType store to a single rand_actionType
        //  composed of value: [actionType], and nextSeed: the appropriate incremented seed to
        //  assign back to the simulator
        getPhysTypeStore(storeType).reduce(
            (accum_rand_actionType, thisPt) =>
                // use anonymous function as shorthand to produce a concatenated [actionType]
                (
                    (in_rand_actionType) => rand_genRandType
                        ([
                            // include the actionTypes accumulated so far
                            ...rand_val(accum_rand_actionType),

                            // then include the next [actionType]
                            rand_val(in_rand_actionType),
                        ])

                        // use the seed from the next [actionType]
                        (rand_nextSeed(in_rand_actionType))
                )
                    // generate rand_actionType to pass in as an argument...
                    (
                        rand_findRule
                            // ... using the given store...
                            (storeType)

                            // ... and a rand_eventType...
                            (
                                rand_genRandType
                                    // ... built from the eventType produced by physType "act"...
                                    (thisPt.act(storeType)(thisPt))

                                    // ... and the seed of the accumulated rand_actionType OR
                                    //  the given rand_eventType
                                    (accum_rand_actionType.nextSeed || rand_eventType.nextSeed)
                            )

                            // use our rulebook
                            (ruleBook)
                    ),

            // start with a unit randType with an empty array as a value
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

// unwrap a rand_actionType into an actionType plus an action to update the simulation seed
// takes:
//  rand_actionType: an actionType wrapped in a randType
// returns [actionType]
const rand_actionTypeVal = (rand_actionType) => ([
    rand_val(rand_actionType),
    action_setSimSeed(rand_nextSeed(rand_actionType)),
]);


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

        // preFunc signature is (storeType) => (rand_eventType) => rand_eventType
        preFunc: (_) => (rand_eventType) =>
            // generate an updated rand_eventType
            rand_genRandType
                // rand_genRandType value
                (compose
                    // create a new event using...
                    (event_replacePhysType)

                    // ... an object based on the given physType, with a "behavior_request" prop-obj
                    (usePhysTypeConds(rand_val(rand_eventType).physType))

                    // here is the "behavior_request" prop-obj
                    ({
                        behavior_request:
                            // select behavior request from list of given desire funcs using 
                            // a weighted random number selector
                            Object.keys(rand_val(rand_eventType).desireFuncType)
                            // use a randomly-chosen index to select a behavioral desire
                            [rand_chooseWeight
                                // list of numerical desires
                                (
                                    // the code below maps each desire function to a numerical weight
                                    //  by evaluating it using the given physType
                                    Object.values(rand_val(rand_eventType).desireFuncType)
                                        .map(f => f(rand_val(rand_eventType).physType))
                                )
                                // seed for rand_chooseWeight
                                (rand_nextSeed(rand_eventType))
                            ]
                    })
                )
                // rand_genRandType seed
                // since we just used a system seed, we must point to the next seed when
                //  assembling an updated rand_eventType
                (rand_getNextSeed(rand_nextSeed(rand_eventType))(0)),

        testNode: isSimpleCreature,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                // produce event containing physType with laws of physics applied
                // the function application below INCLUDES wall collision testing!
                // preFunc signature is (storeType) => (rand_eventType) => rand_eventType
                preFunc: (storeType) => (rand_eventType) =>
                    rand_genRandType
                        // rand_genRandType value
                        (
                            compose
                                // create a new event using...
                                (event_replacePhysType)

                                // ...a physType with physics applied
                                (physTypeDoPhysics(storeType))

                                // the physType to apply physics to
                                (rand_val(rand_eventType).physType)
                        )
                        // rand_genRandType seed
                        (rand_nextSeed(rand_eventType)),

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
export const resolveRules = (storeType) => (eventType) =>
    compose
        // unwrap the rand_actionType produced by rand_findRule below
        // when unwrapped, we get an actionType or [actionType], plus an action to update the seed!!
        (rand_actionTypeVal)
        (
            // wrap the given eventType in a randType to create a rand_eventType
            // then jump into the randType monad
            rand_findRule
                // store to use
                (storeType)

                // eventType to use, wrapped into a randType to make "rand_eventType"
                // function signature: (eventType) => rand_eventType
                (rand_genRandType(eventType)(getSimSeed(storeType)))
        )
        // use our rulebook to use as the first rule node
        (ruleBook);

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
        // we apply the function "func" to return a rand_actionType
        // expected func signature: (storeType) => (rand_eventType) => rand_actionType
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
