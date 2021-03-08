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
// update all physType objects
// takes:
//  don't care
// returns array of actionType
export const actionGroup_updateAllPhysTypes = (_) =>
([
    // do physType act for each physType in physType store at 
    //  the moment of entering this function
    // REFACTOR: The physTypeStore could change while we're in the middle of this code!
    // Think ATOMIC
    appStore.storeObj.remainder.physTypeStore.map(
        (_, i) => [
            // save the current state of this physType
            savePhysType(i),

            // do the physType "act"
            physTypeDoAct(i),

            // did physType behavior just change? announce it!
            // REFACTOR: Must be in form of action that causes reducer to look at 
            //  immediate store and react accordingly! Perhaps this reducer
            //  adds "just-changed" physTypes to a queue to be announced during rendering!
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

            // next, queue render add x-y data to geo chart for this_physType
            uiAddGeoChartData
                (index)
                (inGet('color'))
                ({
                    x: inGetCond('x'),
                    y: inGetCond('y')
                }),
        ]
    }),
]);
