'use strict'

// ****** Simulation rulebook: leaf nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import {
    compose,
    excludeRange,
} from '../utils.js';

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
    rand_bind,
    rand_lift,
    rand_liftBind,
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
        // action creator is nominally (any) => actionType
        // lift action creator to give a rand_actionType: (any) => rand_actionType
        // then bind the lifted function to take a rand_eventType
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // update physType behavior
                action_replacePhysType(
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
                        ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior_request')])
                    : action_doNothing(),
            ])
            (rand_eventType)
};

export const leafApproveBehaviorStopMovement = {
    name: 'Behavior request approved and movement stopped',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                action_replacePhysType(
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
                        ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior_request')])
                    : action_doNothing(),
            ])
            (rand_eventType)
};

export const leafCondsOOL = {
    name: 'Creature conditions out of limits!',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // make an announcement
                action_addJournalEntry(
                    getPhysTypeName(eventType.physType) +
                    ' conditions out of limits!!'
                ),

                // change behavior to frozen
                action_replacePhysType(
                    usePhysTypeConds
                        (eventType.physType)
                        ({
                            behavior: 'frozen',
                        })
                ),
            ])
            (rand_eventType),
};

export const leafCreatureEatFood = {
    name: 'Creature touched food! ',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // announce glorious news in journal IF not already eating
                (getPhysTypeCond(eventType.physType)('behavior') !== 'eating')
                    ? action_addJournalEntry(
                        getPhysTypeName(eventType.physType) +
                        ' FOUND FOOD!!'
                    )
                    : action_doNothing(),

                // switch creatureType behavior to 'eating'
                action_replacePhysType(
                    usePhysTypeConds
                        (eventType.physType)
                        ({
                            behavior: 'eating',
                        })
                ),
            ])
            (rand_eventType),
};

export const leafDoAndApproveWandering = {
    name: 'Doing and approving behavior: wandering!',
    func: (storeType) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                action_updateSelectPhysTypesRand
                    // find the given physType in the store
                    ((filterPt) => getPhysTypeID(filterPt) === getPhysTypeID(eventType.physType))

                    // conds to update
                    (
                        // be sure to include conds that will not be randomized
                        (_) => getPhysTypeCondsObj(eventType.physType),

                        // conds driven by randomized acceleration
                        (seed1) =>
                            ((randNum) => ({
                                behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                                // glucose and neuro impacts are more severe 
                                //  with higher accceleration magnitude
                                glucose:
                                    getPhysTypeCond(eventType.physType)('glucose') -
                                    0.3 * Math.abs(randNum) *
                                    getSimTimeStep(storeType),

                                neuro:
                                    getPhysTypeCond(eventType.physType)('neuro') +
                                    0.2 * Math.abs(randNum) *
                                    getSimTimeStep(storeType),

                                accel: randNum,
                            }))
                                (excludeRange(2.0)
                                    (rand_val(rand_seededRand(-4.0)(15.0)(seed1)))
                                ),

                        // conds driven by randomized heading nudge
                        (seed2) =>
                        ({
                            heading: getPhysTypeCond(eventType.physType)('heading') +
                                rand_val(rand_seededRand(-0.3)(0.3)(seed2)),
                        })
                    ),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(eventType.physType)('behavior') !==
                    getPhysTypeCond(eventType.physType)('behavior_request'))
                    ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                        ' ' + behaviorStrings[getPhysTypeCond(eventType.physType)('behavior_request')])
                    : action_doNothing(),
            ])
            (rand_eventType),
};

export const leafPreservePhysType = {
    name: 'Preserve given physType',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // replace the physType with the given physType
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => action_replacePhysType(eventType.physType))
            (rand_eventType),
};

export const leafRemoveFood = {
    name: 'Remove food',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // delete the given physType
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => compose(action_deletePhysType)(getPhysTypeID)(eventType.physType))
            (rand_eventType),
};

export const leafUnknownEvent = {
    name: 'Unknown event!',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (_) => actionType or [actionType]
            ((_) => action_doNothing())
            (rand_eventType),
};

