'use strict'

// ****** Code to dispatch actions collected into groups ******

// *** Imports
import { actAsSimpleCreature } from '../creatures/simple_creature.js';

import {
    addJournalEntry,
    clearActionFuncQueue,
    doNothing,
    queue_addGeoChartData,
    queue_addStatusMessage,
    queue_addTimeChartData,
    stopSim,
} from './action_creators.js';

import {
    physTypeGet,
    physTypeGetCond,
    simGetCurTime,
} from './store_getters.js';


// *** Create actions from the action func queue, 
//  then create action to clear the func action queue
// takes:
//  storeType: the store to use
// returns array of actionType objects
export const actionGroup_createActionsFromFuncQueue = (storeType) =>
([
    storeType.actionFuncQueue.flat(Infinity).map(action => action(storeType)),
    clearActionFuncQueue(storeType),
]);


// *** Create actions for the non-sim parts of the application
// takes:
//  storeType: the store to use
// returns array of actionType objects
export const actionGroup_NonsimActions = (storeType) =>
([
    // for all physType objects in store...
    storeType.physTypeStore.map((this_physType, index) => {
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
                        (storeType.ui.creature_time_chart)
                        (2 * index)
                        (inGet('name') + ' glucose')
                        ({
                            time: simGetCurTime(storeType),
                            value: inGetCond('glucose')
                        }),

                    // next, queue add neuro data to time chart
                    queue_addTimeChartData
                        (storeType.ui.creature_time_chart)
                        (2 * index + 1)
                        (inGet('name') + ' neuro')
                        ({
                            time: simGetCurTime(storeType),
                            value: inGetCond('neuro')
                        }),

                    // next, if creature is frozen, 
                    //  queue give termination message and stop simulator
                    (inGetCond('behavior') === 'frozen')
                        ? [
                            addJournalEntry("Simulation ended"),
                            queue_addStatusMessage(storeType.ui.status_box)("*** Simulation ended"),
                            stopSim
                        ]
                        : doNothing,
                ]

                // not a Simple Creature: don't return the actions above
                : doNothing,

            // next, queue add x-y data to geo chart for this_physType
            queue_addGeoChartData
                (storeType.ui.creature_geo_chart)
                (index)
                (inGet('color'))
                ({
                    x: inGetCond('x'),
                    y: inGetCond('y')
                })
        ]
    }),
// apply each of the action funcs in the array (produced above) to the given storeType to 
//  get an array of actionType objects
].flat(Infinity).map(action => action(storeType)));
