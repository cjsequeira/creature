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
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_REPLACE_CREATURETYPE,
    EVENT_REPLACE_PHYSTYPE,
    WORLD_TOUCH_DISTANCE,
} from '../const_vals.js';

import {
    excludeRange,
    orTests,
} from '../utils.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    action_replacePhysType,
    action_addJournalEntry,
    action_doNothing,
    action_deletePhysType,
    action_updateSelectPhysTypesRand,
    action_setSimSeed,
} from '../reduxlike/action_creators.js';

import {
    getPhysTypeAct,
    getPhysTypeCond,
    getPhysTypeCondsObj,
    getPhysTypeID,
    getPhysTypeName,
    getPhysTypeStore,
    getSimSeed,
    getSimTimeStep,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';

import {
    rand_chooseWeight,
    rand_getNextSeed,
    rand_seededRand,
    rand_unit,
    rand_unwrapRandType,
} from '../sim/seeded_rand.js';

import { actAsFood } from '../phystypes/food_type.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Rulebook test nodes
const isBehaviorRequestIdling = {
    name: 'Requesting behavior: idling?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'idling',
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'sleeping',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeCond(rand_eventType.value.physType)('behavior_request') === 'wandering',
};

const isFoodType = {
    name: 'Is foodType?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_eventType.value.physType) === actAsFood,
};

const isFoodTouchedByCreature = {
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

const isSimpleCreature = {
    name: 'Is creatureType?',
    testFunc: (_) => (rand_eventType) =>
        getPhysTypeAct(rand_eventType.value.physType) === actAsSimpleCreature,
};

// REFACTOR IDEA: Create an event where the food being touched by the creature can be tagged in, for efficiencies
// GOAL: Avoid scanning food to see what's being eaten - just send the specific food objects
const isCreatureTouchingFood = {
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

const isEventUpdateAllPhysTypes = {
    name: 'Is event of type EVENT_UPDATE_ALL_PHYSTYPES?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_UPDATE_ALL_PHYSTYPES,
};

const isEventReplaceCreatureType = {
    name: 'Is event of type EVENT_REPLACE_CREATURETYPE?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_REPLACE_CREATURETYPE,
};

const isEventReplacePhysType = {
    name: 'Is event of type EVENT_REPLACE_PHYSTYPE?',
    testFunc: (_) => (rand_eventType) => rand_eventType.value.type === EVENT_REPLACE_PHYSTYPE,
};

const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (_) => (rand_eventType) =>
        (getPhysTypeCond(rand_eventType.value.physType)('glucose') > 0.0) &&
        (getPhysTypeCond(rand_eventType.value.physType)('neuro') < 100.0),
};


// *** Rulebook leaf nodes
// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
const leafApproveBehavior = {
    name: 'Behavior request approved',
    func: (_) => (rand_eventType) =>
    ({
        value:
            [
                // update physType behavior
                action_replacePhysType(
                    usePhysTypeConds
                        (rand_eventType.value.physType)
                        ({
                            behavior: getPhysTypeCond(rand_eventType.value.physType)('behavior_request'),
                        })
                ),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(rand_eventType.value.physType)('behavior') !==
                    getPhysTypeCond(rand_eventType.value.physType)('behavior_request'))
                    ? action_addJournalEntry(getPhysTypeName(rand_eventType.value.physType) +
                        ' ' + behaviorStrings[getPhysTypeCond(rand_eventType.value.physType)('behavior_request')])
                    : action_doNothing(),
            ],

        nextSeed: rand_eventType.nextSeed,
    })
};

const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (rand_eventType) =>
    ({
        value:
            [
                action_replacePhysType(
                    usePhysTypeConds
                        (rand_eventType.value.physType)
                        ({
                            behavior: getPhysTypeCond(rand_eventType.value.physType)('behavior_request'),

                            speed: 0.0,
                            accel: 0.0
                        })
                ),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(rand_eventType.value.physType)('behavior') !==
                    getPhysTypeCond(rand_eventType.value.physType)('behavior_request'))
                    ? action_addJournalEntry(getPhysTypeName(rand_eventType.value.physType) +
                        ' ' + behaviorStrings[getPhysTypeCond(rand_eventType.value.physType)('behavior_request')])
                    : action_doNothing(),
            ],

        nextSeed: rand_eventType.nextSeed,
    })
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (rand_eventType) =>
    ({
        value:
            [
                // make an announcement
                action_addJournalEntry(
                    getPhysTypeName(rand_eventType.value.physType) +
                    ' conditions out of limits!!'
                ),

                // change behavior to frozen
                action_replacePhysType(
                    usePhysTypeConds
                        (rand_eventType.value.physType)
                        ({
                            behavior: 'frozen',
                        })
                ),
            ],

        nextSeed: rand_eventType.nextSeed,
    }),
};

const leafCreatureEatFood = {
    name: 'Creature touched food! ',
    func: (_) => (rand_eventType) =>
    ({
        value:
            [
                // announce glorious news in journal IF not already eating
                (getPhysTypeCond(rand_eventType.value.physType)('behavior') !== 'eating')
                    ? action_addJournalEntry(
                        getPhysTypeName(rand_eventType.value.physType) +
                        ' FOUND FOOD!!'
                    )
                    : action_doNothing(),

                // switch creatureType behavior to 'eating'
                action_replacePhysType(
                    usePhysTypeConds
                        (rand_eventType.value.physType)
                        ({
                            behavior: 'eating',
                        })
                ),
            ],

        nextSeed: rand_eventType.nextSeed,
    }),
};

const leafDoAndApproveWandering = {
    name: 'Doing and approving behavior: wandering!',
    func: (storeType) => (rand_eventType) =>
    ({
        value:
            [
                action_updateSelectPhysTypesRand
                    // find the given physType in the store
                    ((filterPt) => getPhysTypeID(filterPt) === getPhysTypeID(rand_eventType.value.physType))

                    // conds to update
                    (
                        // be sure to include conds that will not be randomized
                        (_) => getPhysTypeCondsObj(rand_eventType.value.physType),

                        // conds driven by randomized acceleration
                        (seed1) => {
                            return (
                                (randNum) =>
                                ({
                                    behavior: getPhysTypeCond(rand_eventType.value.physType)('behavior_request'),

                                    // glucose and neuro impacts are more severe 
                                    //  with higher accceleration magnitude
                                    glucose:
                                        getPhysTypeCond(rand_eventType.value.physType)('glucose') -
                                        0.3 * Math.abs(randNum) *
                                        getSimTimeStep(storeType),

                                    neuro:
                                        getPhysTypeCond(rand_eventType.value.physType)('neuro') +
                                        0.2 * Math.abs(randNum) *
                                        getSimTimeStep(storeType),

                                    accel: randNum,
                                })
                            )
                                (excludeRange
                                    (2.0)
                                    (rand_unwrapRandType(rand_seededRand(-4.0)(15.0)(seed1)))
                                )
                        },

                        // conds driven by randomized heading nudge
                        (seed2) =>
                        ({
                            heading: getPhysTypeCond(rand_eventType.value.physType)('heading') +
                                rand_unwrapRandType(rand_seededRand(-0.3)(0.3)(seed2)),
                        })
                    ),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(rand_eventType.value.physType)('behavior') !==
                    getPhysTypeCond(rand_eventType.value.physType)('behavior_request'))
                    ? action_addJournalEntry(getPhysTypeName(rand_eventType.value.physType) +
                        ' ' + behaviorStrings[getPhysTypeCond(rand_eventType.value.physType)('behavior_request')])
                    : action_doNothing(),
            ],

        nextSeed: rand_eventType.nextSeed,
    }),
};

const leafPreservePhysType = {
    name: 'Preserve given physType',
    func: (_) => (rand_eventType) =>
    ({
        value: [
            // replace the physType with the given physType
            action_replacePhysType(rand_eventType.value.physType),
        ],

        nextSeed: rand_eventType.nextSeed,
    }),
};

const leafRemoveFood = {
    name: 'Remove food',
    func: (_) => (rand_eventType) =>
    ({
        value:
            [
                // delete the given physType
                action_deletePhysType(
                    getPhysTypeID(rand_eventType.value.physType)
                ),
            ],

        nextSeed: rand_eventType.nextSeed,
    }),
};

const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) => (rand_eventType) =>
    ({
        value:
            // do nothing except update system seed
            action_doNothing(),

        nextSeed: rand_eventType.nextSeed,
    }),
};

// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
const recursive_leafUpdateAllPhysTypes = {
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
                        ({
                            ...rand_eventType.value,
                            physType: physTypeDoPhysics(storeType)(rand_eventType.value.physType),
                        }),

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
