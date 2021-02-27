'use strict'

// ****** Code to update the non-sim parts of the application ******

// *** Imports
import { makeArgChain } from './util.js';

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
} from './reduxlike/action_creators.js';

import { mutable_renderStoreChanges } from './reduxlike/reducers_renderers.js';

import {
    physTypeGet,
    physTypeGetCond,
    simGetCurTime,
    simGetRunning,
    storeIsLocked
} from './reduxlike/store_getters.js';


// *** Define function-chaining function applied to our store action dispatcher
const makeArgChainActionDispatch = makeArgChain(actionDispatch);


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// *** Code for the main update loop
// REFACTOR: Cannot currently reliably update UI in response to creature state changes, because code below
//  may miss such changes since UI and sim update are now decoupled. Consider designing watchers
//  to generate actions/messages/events in response to changes in certain things 
export const doNonSimUpdate = (store) =>
    // is sim running AND store lock unset?    
    (simGetRunning(store) && !storeIsLocked(store))
        // yes: return a rendered store type object that's built from the given store by...
        ? mutable_renderStoreChanges(
            // ... applying our action dispatcher repeatedly to the action creators
            //  listed below, in top-to-bottom order...
            // ... to the given store
            makeArgChainActionDispatch(store)(
                // first, set store lock... OTHER CODE MUST CHECK FOR AND RESPECT THIS!
                lockStore(),

                // for all creatures...
                store.creatureStore.map((this_creature, index) => [
                    // next, if creature behavior string is not the most-recent journal item,
                    //  update journal and queue update status box
                    (store.journal[store.journal.length - 1].message !=
                        (physTypeGet(this_creature.physType, 'name') + ' ' +
                            behaviorStrings[physTypeGetCond(this_creature.physType, 'behavior')]))
                        ? [
                            addJournalEntry(
                                store.journal,
                                physTypeGet(this_creature.physType, 'name') + ' ' +
                                behaviorStrings[physTypeGetCond(this_creature.physType, 'behavior')]
                            ),
                            queue_addStatusMessage(
                                store.ui.status_box,
                                physTypeGet(this_creature.physType, 'name') + ' ' +
                                behaviorStrings[physTypeGetCond(this_creature.physType, 'behavior')]
                            )
                        ]
                        : doNothing(),

                    // next, queue add glucose data to time chart
                    queue_addTimeChartData(
                        store.ui.creature_time_chart,
                        2 * index,
                        {
                            time: simGetCurTime(store),
                            value: physTypeGetCond(this_creature.physType, 'glucose')
                        }),

                    // next, queue add neuro data to time chart
                    queue_addTimeChartData(
                        store.ui.creature_time_chart,
                        2 * index + 1,
                        {
                            time: simGetCurTime(store),
                            value: physTypeGetCond(this_creature.physType, 'neuro')
                        }),

                    // next, queue add x-y data to geo chart
                    queue_addGeoChartData(
                        store.ui.creature_geo_chart,
                        index,
                        physTypeGet(this_creature.physType, 'color'),
                        {
                            x: physTypeGetCond(this_creature.physType, 'x'),
                            y: physTypeGetCond(this_creature.physType, 'y')
                        }),

                    // next, if creature in given store is frozen, 
                    //  queue give termination message and stop simulator
                    (physTypeGetCond(this_creature.physType, 'behavior') === 'frozen')
                        ? [
                            addJournalEntry(
                                store.journal,
                                "Simulation ended"
                            ),
                            queue_addStatusMessage(
                                store.ui.status_box,
                                "*** Simulation ended"
                            ),
                            stopSim()
                        ]
                        : doNothing()
                ]),

                // next, queue add food to geo chart
                queue_addGeoChartData(
                    store.ui.creature_geo_chart,
                    store.creatureStore.length,
                    '#008800ff',
                    {
                        x: physTypeGetCond(store.foodStore.physType, 'x'),
                        y: physTypeGetCond(store.foodStore.physType, 'y')
                    }),

                // next, unset store lock
                unlockStore()
            )

            // closing paren for mutable_renderStoreChanges(...)
        )

        // if sim is not running or store lock is set, just return the given store
        : store;
