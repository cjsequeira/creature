'use strict'

// ****** Simulation rulebook: leaf nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import { excludeRange } from '../utils.js';

import {
    action_replacePhysType,
    action_addJournalEntry,
    action_doNothing,
    action_deletePhysType,
    action_updateSelectPhysTypesRand,
} from '../reduxlike/action_creators.js';

import {
    getPhysTypeCond,
    getPhysTypeCondsObj,
    getPhysTypeID,
    getPhysTypeName,
    getSimTimeStep,
    usePhysTypeConds,
} from '../reduxlike/store_getters.js';

import {
    rand_seededRand,
    rand_val,
} from '../sim/seeded_rand.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Rulebook leaf nodes
// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
export const leafApproveBehavior = {
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

export const leafApproveBehaviorStopMovement = {
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

export const leafCondsOOL = {
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

export const leafCreatureEatFood = {
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

export const leafDoAndApproveWandering = {
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
                                    (rand_val(rand_seededRand(-4.0)(15.0)(seed1)))
                                )
                        },

                        // conds driven by randomized heading nudge
                        (seed2) =>
                        ({
                            heading: getPhysTypeCond(rand_eventType.value.physType)('heading') +
                                rand_val(rand_seededRand(-0.3)(0.3)(seed2)),
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

export const leafPreservePhysType = {
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

export const leafRemoveFood = {
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

export const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) => (rand_eventType) =>
        // action creator is nominally (any) => actionType
        // lift action creator to give a rand_actionType: (any) => rand_actionType
        // then bind the lifted function to take a rand_eventType
        // total signature: (rand_eventType) => rand_actionType
        compose(rand_bind)(rand_lift)(action_doNothing)
            // provide the given rand_eventType
            (rand_eventType),

    /*
    ({
        value:
            // do nothing except update system seed
            action_doNothing(),

        nextSeed: rand_eventType.nextSeed,
    }),
    */
};





/*
// total signature: (any => any) => (any => randType)
export const rand_lift = func =>
    anyType => compose(rand_unit)(func)(anyType);

// total signature: (any) => randType
export const rand_unit = (valAnyType) =>
({
    [TYPE_RANDTYPE]: true,
    value: valAnyType,
    nextSeed: 0,
});

// total signature: (any => randType) => (randType => randType)
export const rand_bind = func =>
    randType =>
    ({
        ...func(randType.value),
        nextSeed: randType.nextSeed,
    });

export const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) =>
    (eventType) =>
        // eventType => actionType
        action_doNothing
        (eventType)
};

// eventType => rand_actionType
// gives: eventType => { value: actionType, nextSeed: 0}
rand_lift(action_doNothing)

// rand_eventType => rand_actionType
// gives: {value: eventType, nextSeed: x } => {value: actionType, nextSeed: x }
rand_bind(rand_lift(action_doNothing))
compose(rand_bind)(rand_lift)(action_doNothing)
*/