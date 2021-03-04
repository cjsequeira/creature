'use strict'

// ****** Code to dispatch actions collected into groups ******

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
    stopSim,
    clearActionFuncQueue
} from './action_creators.js';

import { mutable_renderStoreChanges } from './reducers_renderers.js';

import {
    physTypeGet,
    physTypeGetCond,
    simGetCurTime,
    simGetRunning,
    storeIsLocked
} from './store_getters.js';


// *** Create actions from the action func queue, 
//  then create action to clear the func action queue
export const actionGroup_createActionsFromFuncQueue = () => (store) =>
([
    store.actionFuncQueue.flat(Infinity).map(action => action(store)),
    clearActionFuncQueue()(store),
]);


// *** Create actions for the non-sim parts of the application
// takes: store, as storeType
// returns array of created actions
export const actionGroup_NonsimActions = () => (store) =>
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
// apply each of the action funcs in the array (produced above) to the store to 
//  get an array of actionType objects
].flat(Infinity).map(action => action(store)));
