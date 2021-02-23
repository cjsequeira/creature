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


// *** Function-chaining function with our store action dispatcher already applied
const makeChainOfActionDispatch = makeArgChain(actionDispatch);


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
export const doNonSimUpdate = (store) => {
    // if sim is running AND store is unlocked, then:    
    return (simGetRunning(store) && !storeIsLocked(store))
        // return a rendered store object that's built from the current store by...
        ? mutable_renderStoreChanges(
            // ... applying our action dispatcher repeatedly to the action creators
            //  listed below, in top-to-bottom order...
            makeChainOfActionDispatch(
                // first, set store lock... OTHER CODE MUST CHECK FOR AND RESPECT THIS!
                lockStore(),

                // for all creatures...
                store.creatureStore.map((creature, index) => [
                    // next, if creature behavior string is not the most-recent journal item,
                    //  update journal and queue update status box
                    (store.journal[store.journal.length - 1].message !=
                        (physTypeGet(creature.physType, 'name') + ' ' +
                            behaviorStrings[physTypeGetCond(creature.physType, 'behavior')]))
                        ? [
                            addJournalEntry(
                                store.journal,
                                physTypeGet(creature.physType, 'name') + ' ' +
                                behaviorStrings[physTypeGetCond(creature.physType, 'behavior')]
                            ),
                            queue_addStatusMessage(
                                store.ui.status_box,
                                physTypeGet(creature.physType, 'name') + ' ' +
                                behaviorStrings[physTypeGetCond(creature.physType, 'behavior')]
                            )
                        ]
                        : doNothing(),

                    // next, queue add glucose data to time chart
                    queue_addTimeChartData(
                        store.ui.creature_time_chart,
                        2 * index,
                        {
                            time: simGetCurTime(store),
                            value: physTypeGetCond(creature.physType, 'glucose')
                        }),

                    // next, queue add neuro data to time chart
                    queue_addTimeChartData(
                        store.ui.creature_time_chart,
                        2 * index + 1,
                        {
                            time: simGetCurTime(store),
                            value: physTypeGetCond(creature.physType, 'neuro')
                        }),

                    // next, queue add x-y data to geo chart
                    queue_addGeoChartData(
                        store.ui.creature_geo_chart,
                        index,
                        physTypeGet(creature.physType, 'color'),
                        {
                            x: physTypeGetCond(creature.physType, 'x'),
                            y: physTypeGetCond(creature.physType, 'y')
                        }),

                    // next, if creature in current store is frozen, 
                    //  queue give termination message and stop simulator
                    (physTypeGetCond(creature.physType, 'behavior') === 'frozen')
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

                // ... and evaluating all listed action creators above using the current store
            )(store)

            // closing paren for mutable_renderStoreChanges(...)
        )

        // if sim is not running or is locked, just return the given store
        : store
};
