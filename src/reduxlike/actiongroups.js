'use strict'

// ****** Code to dispatch actions collected into groups ******

// *** Imports
import { actAsSimpleCreature } from '../creatures/simple_creature.js';

import {
    addJournalEntry,
    doNothing,
    physTypeDoAct,
    uiAddGeoChartData,
    uiAddStatusMessage,
    uiAddTimeChartData,
    savePhysType,
} from './action_creators.js';
import { appStore } from './app_store.js';

import {
    getPhysTypeStore,
    physTypeGet,
    physTypeGetCond,
    physTypePropChanged,
    simGetCurTime,
} from './store_getters.js';

import { watchProps } from './watch_props.js';


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
                    uiAddTimeChartData
                        (2 * index)
                        (inGet('name') + ' glucose')
                        ({
                            time: simGetCurTime(storeType),
                            value: inGetCond('glucose')
                        }),

                    // next, queue render add neuro data to time chart
                    uiAddTimeChartData
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
                            uiAddStatusMessage("*** Simulation ended"),

                            // stop sim
                            stopSim(),
                        ]
                        : doNothing(),
                ]

                // not a Simple Creature: don't return the actions above
                : doNothing(),


        ]
    }),
]);
