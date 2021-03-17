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

// *** Our imports
import { event_updatePhysType } from './event_creators.js';

import {
    EVENT_UPDATE_ALL_PHYSTYPES,
    EVENT_UPDATE_CREATURETYPE,
    EVENT_UPDATE_PHYSTYPE,
    WORLD_TOUCH_DISTANCE,
} from '../const_vals.js';

import {
    excludeRange,
    orTests,
} from '../utils.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    action_updatePhysType,
    action_addJournalEntry,
    action_doNothing,
    action_deletePhysType,
    action_updateSelectPhysTypesRand,
} from '../reduxlike/action_creators.js';

import {
    getPhysTypeAct,
    getPhysTypeCond,
    getPhysTypeID,
    getPhysTypeName,
    getPhysTypeStore,
    getSimTimeStep,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import { physTypeDoPhysics } from '../sim/physics.js';

import {
    mutableRandGen_seededRand,
    mutableRandGen_seededWeightedRand,
    rand_seededRand,
    rand_unit,
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
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'idling',
};

const isBehaviorRequestSleeping = {
    name: 'Requested behavior: sleeping?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'sleeping',
};

const isBehaviorRequestWandering = {
    name: 'Requesting behavior: wandering?',
    testFunc: (_) => (eventType) => getPhysTypeCond(eventType.physType)('behavior_request') === 'wandering',
};

const isFoodType = {
    name: 'Is foodType?',
    testFunc: (_) => (eventType) => getPhysTypeAct(eventType.physType) === actAsFood,
};

const isFoodTouchedByCreature = {
    name: 'Is this food being touched by creature?',
    testFunc: (storeType) => (eventType) =>
        // get physType store
        getPhysTypeStore(storeType)
            // keep only simple creatures
            .filter(
                (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsSimpleCreature
            )

            // keep only creatures closer than a given distance from this foodType
            .filter((ptToTest2) => Math.sqrt(
                Math.pow(getPhysTypeCond(ptToTest2)('x') - getPhysTypeCond(eventType.physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') - getPhysTypeCond(eventType.physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any creatures remaining closer than a given distance?
            .length > 0,
};

const isSimpleCreature = {
    name: 'Is creatureType?',
    testFunc: (_) => (eventType) => getPhysTypeAct(eventType.physType) === actAsSimpleCreature,
};

// REFACTOR IDEA: Create an event where the food being touched by the creature can be tagged in, for efficiencies
// GOAL: Avoid scanning food to see what's being eaten - just send the specific food objects
const isCreatureTouchingFood = {
    name: 'Is this creature touching food?',
    testFunc: (storeType) => (eventType) =>
        // get physType store
        getPhysTypeStore(storeType)
            // keep only food
            .filter(
                (ptToTest1) => getPhysTypeAct(ptToTest1) === actAsFood
            )

            // keep only food closer than a given distance from this creatureType
            .filter((ptToTest2) => Math.sqrt(
                Math.pow(getPhysTypeCond(ptToTest2)('x') - getPhysTypeCond(eventType.physType)('x'), 2.0) +
                Math.pow(getPhysTypeCond(ptToTest2)('y') - getPhysTypeCond(eventType.physType)('y'), 2.0)
            ) < WORLD_TOUCH_DISTANCE)

            // any food remaining closer than a given distance?
            .length > 0,
};

const isEventUpdateAllPhysTypes = {
    name: 'Is event of type EVENT_UPDATE_ALL_PHYSTYPES?',
    testFunc: (_) => (eventType) => eventType.type === EVENT_UPDATE_ALL_PHYSTYPES,
};

const isEventUpdateCreatureType = {
    name: 'Is event of type EVENT_UPDATE_CREATURETYPE?',
    testFunc: (_) => (eventType) => eventType.type === EVENT_UPDATE_CREATURETYPE,
};

const isEventUpdatePhysType = {
    name: 'Is event of type EVENT_UPDATE_PHYSTYPE?',
    testFunc: (_) => (eventType) => eventType.type === EVENT_UPDATE_PHYSTYPE,
};

const isGlucoseNeuroInRange = {
    name: 'Glucose and neuro in range?',
    testFunc: (_) => (eventType) =>
        (getPhysTypeCond(eventType.physType)('glucose') > 0.0) &&
        (getPhysTypeCond(eventType.physType)('neuro') < 100.0),
};


// *** Rulebook leaf nodes
const leafApproveBehavior = {
    name: 'Behavior request approved',
    func: (_) => (eventType) =>
        [
            // update physType behavior
            action_updatePhysType(
                usePhysTypeConds
                    (eventType.physType)
                    ({
                        behavior: getPhysTypeCond(eventType.physType)('behavior_request'),
                    })
            ),

            // announce behavior IF behavior has just changed
            (getPhysTypeCond(eventType.physType)('behavior') !==
                getPhysTypeCond(eventType.physType)('behavior_request'))
                ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                    ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior')])
                : action_doNothing(),
        ]
};

const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (eventType) =>
        [
            action_updatePhysType(
                usePhysTypeConds
                    (eventType.physType)
                    ({
                        behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                        speed: 0.0,
                        accel: 0.0
                    })
            ),

            // announce behavior IF behavior has just changed
            (getPhysTypeCond(eventType.physType)('behavior') !==
                getPhysTypeCond(eventType.physType)('behavior_request'))
                ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                    ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior')])
                : action_doNothing(),
        ]
};

const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (eventType) =>
        [
            action_addJournalEntry(
                getPhysTypeName(eventType.physType) +
                ' conditions out of limits!!'
            ),

            action_addJournalEntry(getPhysTypeName(eventType.physType) +
                ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior')]),

            action_updatePhysType(
                usePhysTypeConds
                    (eventType.physType)
                    ({
                        behavior: 'frozen',
                    })
            ),
        ]
};

const leafCreatureEatFood = {
    name: 'Creature touched food! ',
    func: (_) => (eventType) =>
        [
            // announce glorious news in journal IF not already eating
            (getPhysTypeCond(eventType.physType)('behavior') !== 'eating')
                ? action_addJournalEntry(
                    getPhysTypeName(eventType.physType) +
                    ' FOUND FOOD!!'
                )
                : action_doNothing(),

            // switch creatureType behavior to 'eating'
            action_updatePhysType(
                usePhysTypeConds
                    (eventType.physType)
                    ({
                        behavior: 'eating',
                    })
            ),
        ],
};

const leafDoAndApproveWandering = {
    name: 'Doing and approving behavior: wandering!',
    func: (storeType) => (eventType) =>
        [

            // update creatureType behavior with random nudges to acceleration and heading
            (
                // apply anonymous function to passed-in accel and heading nudge
                (accel) => (hdg_nudge) => action_updatePhysType(
                    usePhysTypeConds
                        (eventType.physType)
                        ({
                            behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                            // glucose and neuro impacts are more severe 
                            //  with higher accceleration magnitude
                            glucose: getPhysTypeCond(eventType.physType)('glucose') -
                                (0.3 * Math.abs(accel)) * getSimTimeStep(storeType),
                            neuro: getPhysTypeCond(eventType.physType)('neuro') +
                                (0.2 * Math.abs(accel)) * getSimTimeStep(storeType),

                            heading: getPhysTypeCond(eventType.physType)('heading') + hdg_nudge,
                            accel: accel,
                        })
                )
            )
                // accel: random with minimum magnitude of 2.0
                // heading nudge: small random nudge 
                (excludeRange(2.0)(mutableRandGen_seededRand(-4.0, 15.0)))
                (mutableRandGen_seededRand(-0.1, 0.1)),


            /*
        action_updateSelectPhysTypesRand
            // find the given physType in the store
            ((filterPt) => getPhysTypeID(filterPt) === getPhysTypeID(eventType.physType))

            // conds to update
            (

            ),
            */

            // announce behavior IF behavior has just changed
            (getPhysTypeCond(eventType.physType)('behavior') !==
                getPhysTypeCond(eventType.physType)('behavior_request'))
                ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                    ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior')])
                : action_doNothing(),
        ]
};

const leafPreservePhysType = {
    name: 'Preserve given physType',
    func: (_) => (eventType) => action_updatePhysType(eventType.physType),
};

const leafRemoveFood = {
    name: 'Remove food',
    func: (_) => (eventType) =>
        action_deletePhysType(
            getPhysTypeID(eventType.physType)
        ),
};

const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) => (_) => action_doNothing(),
};

const recursive_leafUpdateAllPhysTypes = {
    name: 'Update all physTypes in one atomic operation, consulting rulebook for each physType',
    func: (storeType) => (_) =>
        // action to update all physTypes "atomically," meaning we use the same 
        //  given storeType for each physType update process, which means that the order
        //  of update doesn't matter - one physType cannot react to another physType just updated.
        // function signature is (physTypeStore) => actionType
        getPhysTypeStore(storeType).map((thisPhysType) =>
            // consult the rulebook using the eventType generated by physType "act"
            // the rulebook returns an actionType
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
    testFunc: (storeType) => orTests(
        testRules.map(
            rule => rule.testFunc(storeType)
        )
    )
});


// *** The rulebook
const ruleBook = {
    testNode: isEventUpdateCreatureType,
    yes:
    {
        // build an event to update the creatureType per the behavior request below
        //  which comes from weighted random draw using given desire functions
        // this event will be processed by the rest of the rulebook, which will return
        //  an action based on the rulebook and current app state
        // the rulebook may assign the requested behavior, 
        //  or may reject the requested behavior and assign a different behavior,
        //  or may return an action totally unrelated to the creatureType object below!
        preFunc: (_) => (eventType) =>
            event_updatePhysType(
                usePhysTypeConds
                    // make an object based on the given physType, with a "behavior_request" prop-obj
                    (eventType.physType)
                    ({
                        behavior_request:
                            // select behavior request from list of given desire funcs using 
                            // a weighted random number selector
                            Object.keys(eventType.desireFuncType)[mutableRandGen_seededWeightedRand(
                                // the code below maps each desire function to a numerical weight
                                //  by evaluating it using the given physType
                                Object.values(eventType.desireFuncType).map(f => f(eventType.physType))
                            )]
                    })
            ),

        testNode: isSimpleCreature,
        yes: {
            testNode: isGlucoseNeuroInRange,
            yes: {
                // produce event containing physType with laws of physics applied
                // the function application below INCLUDES wall collision testing!
                preFunc: (storeType) => (eventType) =>
                ({
                    ...eventType,
                    physType: physTypeDoPhysics(storeType)(eventType.physType),
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
        testNode: isEventUpdatePhysType,
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
// returns actionType or [actionType]
export const resolveRules = (storeType) => (eventType) => findRule(storeType)(eventType)(ruleBook);

// recursive rulebook node finder
// assumes a rule exists in the rulebook for every possible physType
// takes:
//  eventType
//  node: the rule node to use
// returns actionType or [actionType], as determined by rulebook application
const findRule = (storeType) => (eventType) => (node) => {
    // is pre-function undefined? 
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
