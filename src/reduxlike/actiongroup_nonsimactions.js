'use strict'

// ****** Code to update the non-sim parts of the application ******

// *** Imports
import { applyArgChain } from '../util.js';

import { actAsSimpleCreature } from '../creatures/simple_creature.js';

import {
    actionDispatch,
    addJournalEntry,
    doNothing,
    lockStore,
    unlockStore,
    queue_addGeoChartData,
    queue_addStatusMessage,
    queue_addTimeChartData,
    startSim,
    stopSim
} from './action_creators.js';

import { mutable_renderStoreChanges } from './reducers_renderers.js';

import {
    physTypeGet,
    physTypeGetCond,
    simGetCurTime,
    simGetRunning,
    storeIsLocked
} from './store_getters.js';


// *** Define argument-chaining function applied to our store action dispatcher
const applyArgChainActionDispatch = applyArgChain(actionDispatch);


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Dispatch actions for the non-sim parts of the application
// takes: store, as storeType
// returns array of action dispatchers
export const actionGroup_NonsimActions = (store) =>
([
    // for all physType objects in store...
    store.physTypeStore.map((this_physType, index) => {
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
                    // queue add glucose data to time chart
                    queue_addTimeChartData
                        (store.ui.creature_time_chart)
                        (2 * index)
                        (inGet('name') + ' glucose')
                        ({
                            time: simGetCurTime(store),
                            value: inGetCond('glucose')
                        }),

                    // next, queue add neuro data to time chart
                    queue_addTimeChartData
                        (store.ui.creature_time_chart)
                        (2 * index + 1)
                        (inGet('name') + ' neuro')
                        ({
                            time: simGetCurTime(store),
                            value: inGetCond('neuro')
                        }),

                    // next, if creature is frozen, 
                    //  queue give termination message and stop simulator
                    (inGetCond('behavior') === 'frozen')
                        ? [
                            addJournalEntry(store.journal)("Simulation ended"),
                            queue_addStatusMessage(store.ui.status_box)("*** Simulation ended"),
                            stopSim()
                        ]
                        : doNothing(),
                ]

                // not a Simple Creature: don't return the actions above
                : doNothing(),

            // next, queue add x-y data to geo chart for this_physType
            queue_addGeoChartData
                (store.ui.creature_geo_chart)
                (index)
                (inGet('color'))
                ({
                    x: inGetCond('x'),
                    y: inGetCond('y')
                })
        ]
    }),
])
