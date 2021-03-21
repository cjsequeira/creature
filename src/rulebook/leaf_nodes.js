'use strict'

// ****** Simulation rulebook: leaf nodes ******
// Inspired by: https://ericlippert.com/2015/05/11/wizards-and-warriors-part-five/

// *** Our imports
import {
    EVENT_INSERT_CREATURETYPES,
    EVENT_INSERT_FOODTYPES,
    UI_BEHAVIOR_STRINGS,
} from '../const_vals.js';

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
    action_forceChangesListUpdate,
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
    rand_liftBind,
    rand_seededRand,
    rand_val,
} from '../sim/seeded_rand.js';


// *** Rulebook leaf nodes
// signature of leaf func: (storeType) => (rand_eventType) => rand_actionType
export const leafApproveBehavior = {
    name: 'leafApproveBehavior',
    func: (_) => (rand_eventType) =>
        // action creator is nominally (any) => actionType
        // lift action creator to give a rand_actionType: (any) => rand_actionType
        // then bind the lifted function to take a rand_eventType
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // update physType behavior
                compose(action_replacePhysType)(usePhysTypeConds(eventType.physType))
                    ({
                        behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                        // update behavior clock time IF behavior has just changed,
                        //  else keep the same
                        behavior_clock:
                            (getPhysTypeCond(eventType.physType)('behavior') !==
                                getPhysTypeCond(eventType.physType)('behavior_request'))
                                ? performance.now()
                                : getPhysTypeCond(eventType.physType)('behavior_clock'),
                    }),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(eventType.physType)('behavior') !==
                    getPhysTypeCond(eventType.physType)('behavior_request'))

                    ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                        ' ' + UI_BEHAVIOR_STRINGS[getPhysTypeCond(eventType.physType)('behavior_request')])
                    : action_doNothing(),
            ])
            (rand_eventType)
};

export const leafApproveBehaviorStopMovement = {
    name: 'leafApproveBehaviorStopMovement',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                compose(action_replacePhysType)(usePhysTypeConds(eventType.physType))
                    ({
                        behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                        // update behavior clock time IF behavior has just changed,
                        //  else keep the same
                        behavior_clock:
                            (getPhysTypeCond(eventType.physType)('behavior') !==
                                getPhysTypeCond(eventType.physType)('behavior_request'))
                                ? performance.now()
                                : getPhysTypeCond(eventType.physType)('behavior_clock'),

                        speed: 0.0,
                        accel: 0.0,
                    }),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(eventType.physType)('behavior') !==
                    getPhysTypeCond(eventType.physType)('behavior_request'))

                    ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                        ' ' + UI_BEHAVIOR_STRINGS[getPhysTypeCond(eventType.physType)('behavior_request')])
                    : action_doNothing(),
            ])
            (rand_eventType)
};

export const leafCondsOOL = {
    name: 'leafCondsOOL',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // make an announcement
                action_addJournalEntry(
                    getPhysTypeName(eventType.physType) + ' conditions out of limits!!'
                ),

                // change behavior to frozen
                compose(action_replacePhysType)(usePhysTypeConds(eventType.physType))
                    ({
                        behavior: 'frozen',

                        // update behavior clock time IF behavior has just changed,
                        //  else keep the same
                        behavior_clock:
                            (getPhysTypeCond(eventType.physType)('behavior') !== 'frozen')
                                ? performance.now()
                                : getPhysTypeCond(eventType.physType)('behavior_clock'),
                    }),

                // let the creature speak
                action_addJournalEntry(
                    getPhysTypeName(eventType.physType) + ' ' + UI_BEHAVIOR_STRINGS['frozen']
                ),

                // force a redraw of the time chart to capture full conditions
                action_forceChangesListUpdate('ui')('chartDataBufferTime'),
            ])
            (rand_eventType),
};

export const leafCreatureEatFood = {
    name: 'leafCreatureEatFood',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // announce glorious news in journal IF not already eating
                (getPhysTypeCond(eventType.physType)('behavior') !== 'eating')
                    ? action_addJournalEntry(
                        getPhysTypeName(eventType.physType) + ' FOUND FOOD!!'
                    )
                    : action_doNothing(),

                // switch creatureType behavior to 'eating'
                compose(action_replacePhysType)(usePhysTypeConds(eventType.physType))
                    ({
                        behavior: 'eating',

                        // update behavior clock time IF behavior has just changed,
                        //  else keep the same
                        behavior_clock:
                            (getPhysTypeCond(eventType.physType)('behavior') !== 'eating')
                                ? performance.now()
                                : getPhysTypeCond(eventType.physType)('behavior_clock'),
                    }),

                // remove food that is being touched
                eventType[EVENT_INSERT_FOODTYPES].map((thisFoodType) =>
                    action_deletePhysType(thisFoodType)
                ),

                // force a redraw of the geo chart to update creature color
                action_forceChangesListUpdate('ui')('chartDataBufferGeo'),
            ])
            (rand_eventType),
};

export const leafDoAndApproveWandering = {
    name: 'leafDoAndApproveWandering',
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
                        // conds driven by randomized acceleration
                        (seed1) =>
                            // anonymous function to produce randomized conds
                            ((randNum) => ({
                                // be sure to include conds that will not be randomized
                                ...getPhysTypeCondsObj(eventType.physType),

                                behavior: getPhysTypeCond(eventType.physType)('behavior_request'),

                                // update behavior clock time IF behavior has just changed,
                                //  else keep the same
                                behavior_clock:
                                    (getPhysTypeCond(eventType.physType)('behavior') !==
                                        getPhysTypeCond(eventType.physType)('behavior_request'))
                                        ? performance.now()
                                        : getPhysTypeCond(eventType.physType)('behavior_clock'),

                                // glucose and neuro impacts are more severe 
                                //  with higher accceleration magnitude
                                glucose:
                                    getPhysTypeCond(eventType.physType)('glucose') -
                                    0.2 * Math.abs(randNum) *
                                    getSimTimeStep(storeType),

                                neuro:
                                    getPhysTypeCond(eventType.physType)('neuro') +
                                    0.1 * Math.abs(randNum) *
                                    getSimTimeStep(storeType),

                                accel: randNum,
                            }))
                                // anonymous function argument: random accel that's at least 
                                //  a minimum magnitude
                                (
                                    excludeRange
                                        (2.0)
                                        (rand_val(rand_seededRand(-3.0)(15.0)(seed1)))
                                ),

                        // conds driven by randomized heading nudge
                        (seed2) => ({
                            heading:
                                getPhysTypeCond(eventType.physType)('heading') +
                                rand_val(rand_seededRand(-0.3)(0.3)(seed2)),
                        })
                    ),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(eventType.physType)('behavior') !==
                    getPhysTypeCond(eventType.physType)('behavior_request'))

                    ? action_addJournalEntry(
                        getPhysTypeName(eventType.physType) +
                        ' ' + UI_BEHAVIOR_STRINGS[getPhysTypeCond(eventType.physType)('behavior_request')]
                    )
                    : action_doNothing(),
            ])
            (rand_eventType),
};

export const leafDoCreatureCollision = {
    name: 'leafDoCreatureCollision',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => [
                // announce news in journal for each touched creatureType
                eventType[EVENT_INSERT_CREATURETYPES].map((thisCt) =>
                    action_addJournalEntry
                        (
                            getPhysTypeName(eventType.physType) + ' crashed into ' +
                            getPhysTypeName(thisCt) + '!!!'
                        )
                ),

                // handle collision by changing direction and possibly speed, and
                //  setting behavior to 'aching'
                compose(action_replacePhysType)(usePhysTypeConds(eventType.physType))
                    ({
                        // behavior: aching!
                        behavior: 'aching',

                        // update behavior clock time even if already aching!
                        behavior_clock: performance.now(),

                        // spin heading around a bit (in radians)
                        heading: getPhysTypeCond(eventType.physType)('heading') + 1.8,

                        // establish a minimum speed
                        speed:
                            (getPhysTypeCond(eventType.physType)('speed') > 10.0)
                                ? getPhysTypeCond(eventType.physType)('speed')
                                : 10.0,
                    }),

                // announce behavior IF behavior has just changed
                (getPhysTypeCond(eventType.physType)('behavior') != 'aching')
                    ? action_addJournalEntry(getPhysTypeName(eventType.physType) +
                        ' ' + UI_BEHAVIOR_STRINGS['aching'])
                    : action_doNothing(),
            ])
            (rand_eventType),
};

export const leafPreservePhysType = {
    name: 'leafPreservePhysType',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // replace the physType with the given physType
            // signature of this func: (eventType) => actionType or [actionType]
            ((eventType) => action_replacePhysType(eventType.physType))
            (rand_eventType),
};

export const leafUnknownEvent = {
    name: 'leafUnknownEvent',
    func: (_) => (rand_eventType) =>
        // total signature: (rand_eventType) => rand_actionType
        rand_liftBind
            // signature of this func: (_) => actionType or [actionType]
            ((_) => action_doNothing())
            (rand_eventType),
};
