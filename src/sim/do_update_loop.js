'use strict'

// *** Imports
import { makeArgChain } from '../util.js';
import {
    actionDispatch,
    advanceSim,
    addJournalEntry,
    doCreatureAct,
    doNothing,
    lockStore,
    unlockStore,
    queue_addGeoChartData,
    queue_addStatusMessage,
    queue_addTimeChartData,
    startSim,
    stopSim
} from '../reduxlike/action_creators.js';
import { mutable_renderStoreChanges } from '../reduxlike/reducers_renderers.js';
import {
    physTypeGetCond,
    simGetCurTime,
    simGetRunning,
    storeIsLocked
} from '../reduxlike/store_getters.js';


// *** Function-chaining function with our store action dispatcher already applied
const makeChainOfActionDispatch = makeArgChain(actionDispatch);


// *** Status message objects/arrays
const behaviorStrings = {
    idling: "I'm is chillin'! Yeeeah...",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz...",
    wandering: "I'm is wandering! Wiggity whack!",
    frozen: "I'm is frozen! Brrrr....."
};


// *** Code for the main update loop
// REFACTOR: Cannot reliably update UI in response to creature state changes, because code below
//  may miss such changes since they are updated in a separate thread. Consider designing watchers
//  to generate actions/messages when certain things change
export const doUpdateLoop = (store) => {
    // if sim is running AND store is unlocked, then:    
    return (simGetRunning(store) && !storeIsLocked(store))
        // return a rendered store object that's built from the current store by...
        ? mutable_renderStoreChanges(
            // ... applying our action dispatcher repeatedly to the action creators
            //  listed below, in top-to-bottom order...
            makeChainOfActionDispatch(
                // first, set store lock... OTHER CODE MUST CHECK FOR AND RESPECT THIS!
                lockStore(),

                // next, if creature behavior string is not the most-recent journal item,
                //  update journal and queue update status box
                (store.journal[store.journal.length - 1].message !=
                    behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')])
                    ? [
                        addJournalEntry(
                            store.journal,
                            behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')]
                        ),
                        queue_addStatusMessage(
                            store.ui.status_box,
                            behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')]
                        )
                    ]
                    : doNothing(),

                // next, if creature in current store is frozen, 
                //  queue give termination message and stop simulator
                (physTypeGetCond(store.creatureStore.physType, 'behavior') === 'frozen')
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
                    : doNothing(),

                // next, queue add glucose data to time chart
                queue_addTimeChartData(
                    store.ui.creature_time_chart,
                    0,
                    {
                        time: simGetCurTime(store),
                        value: physTypeGetCond(store.creatureStore.physType, 'glucose')
                    }),

                // next, queue add neuro data to time chart
                queue_addTimeChartData(
                    store.ui.creature_time_chart,
                    1,
                    {
                        time: simGetCurTime(store),
                        value: physTypeGetCond(store.creatureStore.physType, 'neuro')
                    }),

                // next, queue add x-y data to geo chart
                queue_addGeoChartData(
                    store.ui.creature_geo_chart,
                    {
                        x: physTypeGetCond(store.creatureStore.physType, 'x'),
                        y: physTypeGetCond(store.creatureStore.physType, 'y')
                    }),

                // next, unset store lock
                unlockStore()
                
                // ... and evaluating all listed action creators above using the current store
            )(store)

            // closing paren for mutable_renderStoreChanges(...)
        )

        // if sim is not running or is locked, just return the given store
        : store
};
