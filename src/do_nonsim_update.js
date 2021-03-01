'use strict'

// ****** Code to update the non-sim parts of the application ******

// *** Imports
import { applyArgChain } from './util.js';

import { actAsSimpleCreature } from './creatures/simple_creature.js';

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


// *** Code for the main update loop
// REFACTOR: Cannot currently reliably update UI in response to creature state changes, because code below
//  may miss such changes since UI and sim update are now decoupled. Consider designing watchers
//  to generate actions/messages/events in response to changes in certain things 
// takes: store, as storeType
// returns storeType
export const doNonSimUpdate = (store) =>
    // is sim running AND store lock unset?    
    (simGetRunning(store) && !storeIsLocked(store))
        // yes: return a rendered store type object that's built from the given store by
        //  applying our action dispatcher repeatedly to the action creators
        //  listed below, in top-to-bottom order, with the given store
        ? applyArgChainActionDispatch(store)(
            // first, set store lock... OTHER CODE MUST CHECK FOR AND RESPECT THIS!
            lockStore(),

            // for all physType objects in store...
            store.physTypeStore.map((this_physType, index) => {
                // define shorthand func to get this_physType keyval
                const inGet = physTypeGet(this_physType);

                // define shorthand func to get this_physType cond
                const inGetCond = physTypeGetCond(this_physType);

                // dispatch these actions
                return [
                    // is this_physType a Simple Creature?
                    (inGet('act') === actAsSimpleCreature)
                        // yes
                        ? [
                            // if creature behavior string is not the most-recent journal item,
                            //  update journal and queue update status box
                            (store.journal[store.journal.length - 1].message !=
                                (inGet('name') + ' ' + behaviorStrings[inGetCond('behavior')]))
                                ? [
                                    addJournalEntry
                                        (store.journal)
                                        (inGet('name') + ' ' + behaviorStrings[inGetCond('behavior')]),
                                    queue_addStatusMessage
                                        (store.ui.status_box)
                                        (inGet('name') + ' ' + behaviorStrings[inGetCond('behavior')])
                                ]
                                : doNothing(),

                            // next, queue add glucose data to time chart
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

                            // next, if creature in given store is frozen, 
                            //  queue give termination message and stop simulator
                            (inGetCond('behavior') === 'frozen')
                                ? [
                                    addJournalEntry(store.journal)("Simulation ended"),
                                    queue_addStatusMessage(store.ui.status_box)("*** Simulation ended"),
                                    stopSim()
                                ]
                                : doNothing(),
                        ]

                        // not a Simple Creature: don't do the stuff above
                        : doNothing(),

                    // next, queue add x-y data to geo chart
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

            // next, unset store lock
            unlockStore()

            // closing paren for applyArgChainActionDispatch, then for mutable_renderStoreChanges
        )

        // if sim is not running or store lock is set, just return the given store
        : store;
