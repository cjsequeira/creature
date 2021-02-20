'use strict'

// *** Imports
import { makeArgChain } from '../util.js';
import {
    actionDispatch,
    addGeoChartData,
    addJournalEntry,
    addStatusMessage,
    addTimeChartData,
    doCreatureAct,
    startSim,
    stopSim,
    advanceSim,
    doNothing
} from '../reduxlike/action_creators.js';
import { renderStoreChanges } from '../reduxlike/reducers_renderers.js';
import { physTypeGetCond, simGetCurTime, simGetRunning } from '../reduxlike/store_getters.js';


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
export const doUpdateLoop = (store) => {
    // if sim is running, then:    
    return (simGetRunning(store))
        // return a rendered store object that's built from the current store by...
        ? renderStoreChanges(
            // ... applying our action dispatcher repeatedly to the action creators
            //  listed below, in top-to-bottom order...
            makeChainOfActionDispatch(

                // first, add glucose data to time chart
                addTimeChartData(
                    store.ui.creature_time_chart,
                    0,
                    {
                        time: simGetCurTime(store),
                        value: physTypeGetCond(store.creatureStore.physType, 'glucose')
                    }),

                // next, add neuro data to time chart
                addTimeChartData(
                    store.ui.creature_time_chart,
                    1,
                    {
                        time: simGetCurTime(store),
                        value: physTypeGetCond(store.creatureStore.physType, 'neuro')
                    }),

                // next, add x-y data to geo chart
                addGeoChartData(
                    store.ui.creature_geo_chart,
                    {
                        x: physTypeGetCond(store.creatureStore.physType, 'x'),
                        y: physTypeGetCond(store.creatureStore.physType, 'y')
                    }),

                // next, if creature behavior has just changed in current store, update journal and status box
                (store.journal[store.journal.length - 1].message !=
                    behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')])
                    ? [
                        addJournalEntry(
                            store.journal,
                            behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')]
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            behaviorStrings[physTypeGetCond(store.creatureStore.physType, 'behavior')]
                        )
                    ]
                    : doNothing(),

                // next, if last-used rule in current store should be verbalized, update journal and status box
                (store.creatureStore.lastRule.verbalize)
                    ? [
                        addJournalEntry(
                            store.journal,
                            store.creatureStore.physType.name + " " +
                            store.creatureStore.lastRule.name
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            "*** " +
                            store.creatureStore.physType.name + " " +
                            store.creatureStore.lastRule.name
                        )
                    ]
                    : doNothing(),

                // next, if creature has just frozen in current store, give termination message and stop simulator
                // else, act out creature behavior using current store
                (physTypeGetCond(store.creatureStore.physType, 'behavior') === 'frozen')
                    ? [
                        addJournalEntry(
                            store.journal,
                            "Simulation ended"
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            "*** Simulation ended"
                        ),
                        stopSim()
                    ]
                    : doCreatureAct(store.creatureStore),

                // next, advance simulator if simulator is running
                (simGetRunning(store))
                    ? advanceSim()
                    : doNothing()

                // ... and evaluating all listed action creators above using the current store
            )(store)

            // closing paren for renderStoreChanges(...)
        )

        // if sim is not running, just return the given store
        : store
};
