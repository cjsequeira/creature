'use strict'

// ****** Code to dispatch actions collected into groups ******

// *** Imports
import { actAsSimpleCreature } from '../creatures/simple_creature.js';

import {
    addJournalEntry,
    doNothing,
    physTypeDoAct,
    queueRender_addGeoChartData,
    queueRender_addStatusMessage,
    queueRender_addTimeChartData,
    savePhysType,
} from './action_creators.js';

import {
    getPhysTypeStore,
    getUIProp,
    physTypeGet,
    physTypeGetCond,
    simGetCurTime,
} from './store_getters.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Action group functions
// update all physType objects
// takes:
//  storeType: the store to use
// returns array of actionType
export const actionGroup_updateAllPhysTypes = (storeType) =>
([
    // do physType act for each physType in physType store
    storeType.remainder.physTypeStore.map(
        (this_physType, i) => [
            // save the current state of this physType
            savePhysType(this_physType)(i),

            // do the physType "act"
            physTypeDoAct(this_physType)(i),
        ]
    ),
]);

// create actions for the non-sim parts of the application
// takes:
//  storeType: the store to use
// returns array of actionType
export const actionGroup_NonsimActions = (storeType) =>
([
    // for all physType objects in store...
    getPhysTypeStore(storeType).map((this_physType, index) => {
        // define shorthand func to get this_physType keyval
        const inGet = physTypeGet(this_physType);

        // define shorthand func to get this_physType cond
        const inGetCond = physTypeGetCond(this_physType);

        // return an array of actions to be dispatched for this_physType
        return [
            // is this_physType a Simple Creature?
            (inGet('act') === actAsSimpleCreature)
                // yes
                ? [
                    // queue render add glucose data to time chart
                    queueRender_addTimeChartData
                        (getUIProp(storeType)('creature_time_chart'))
                        (2 * index)
                        (inGet('name') + ' glucose')
                        ({
                            time: simGetCurTime(storeType),
                            value: inGetCond('glucose')
                        }),

                    // next, queue render add neuro data to time chart
                    queueRender_addTimeChartData
                        (getUIProp(storeType)('creature_time_chart'))
                        (2 * index + 1)
                        (inGet('name') + ' neuro')
                        ({
                            time: simGetCurTime(storeType),
                            value: inGetCond('neuro')
                        }),

                    // next, if creature is frozen, 
                    //  give termination message and stop simulator
                    (inGetCond('behavior') === 'frozen')
                        ? [
                            // add journal entry
                            addJournalEntry("Simulation ended"),

                            // queue render add status message
                            queueRender_addStatusMessage
                                (getUIProp(storeType)('status_box'))
                                ("*** Simulation ended"),

                            // stop sim
                            stopSim(),
                        ]
                        : doNothing(),
                ]

                // not a Simple Creature: don't return the actions above
                : doNothing(),

            // next, queue render add x-y data to geo chart for this_physType
            queueRender_addGeoChartData
                (getUIProp(storeType)('creature_geo_chart'))
                (index)
                (inGet('color'))
                ({
                    x: inGetCond('x'),
                    y: inGetCond('y')
                }),
        ]
    }),
]);
