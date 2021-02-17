'use strict'

// *** Imports
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
} from './reduxlike/action_creators.js';
import { renderStoreChanges } from './reduxlike/reducers_renderers.js';
import { pctGetCond, simGetCurTime, simGetRunning } from './reduxlike/store_getters.js';
import { makeChain } from './util.js';


// *** Function-chaining function with our store action dispatcher already applied
const makeChainOfActionDispatch = makeChain(actionDispatch);


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
                        value: pctGetCond(store.creatureStore, 'glucose')
                    }),

                // next, add neuro data to time chart
                addTimeChartData(
                    store.ui.creature_time_chart,
                    1,
                    {
                        time: simGetCurTime(store),
                        value: pctGetCond(store.creatureStore, 'neuro')
                    }),

                // next, add x-y data to geo chart
                addGeoChartData(
                    store.ui.creature_geo_chart,
                    {
                        x: pctGetCond(store.creatureStore, 'x'),
                        y: pctGetCond(store.creatureStore, 'y')
                    }),

                // next, if creature behavior has just changed in current store, update journal and status box
                (store.journal[store.journal.length - 1].message !=
                    behaviorStrings[pctGetCond(store.creatureStore, 'behavior')])
                    ? [
                        addJournalEntry(
                            store.journal,
                            simGetCurTime(store),
                            behaviorStrings[pctGetCond(store.creatureStore, 'behavior')]
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            'Time ' + simGetCurTime(store) +
                            ": " + behaviorStrings[pctGetCond(store.creatureStore, 'behavior')]
                        )
                    ]
                    : doNothing(),

                // next, if last-used rule in current store should be verbalized, update journal and status box
                (store.creatureStore.lastRule.verbalize)
                    ? [
                        addJournalEntry(
                            store.journal,
                            simGetCurTime(store),
                            store.creatureStore.physicalElem.name + " " +
                            store.creatureStore.lastRule.name
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            'Time ' + simGetCurTime(store) + ": *** " +
                            store.creatureStore.physicalElem.name + " " +
                            store.creatureStore.lastRule.name
                        )
                    ]
                    : doNothing(),

                // next, if creature has just frozen in current store, give termination message and stop simulator
                // else, act out creature behavior using current store
                (pctGetCond(store.creatureStore, 'behavior') === 'frozen')
                    ? [
                        addJournalEntry(
                            store.journal,
                            simGetCurTime(store),
                            "Simulation ended"
                        ),
                        addStatusMessage(
                            store.ui.status_box,
                            'Time ' + simGetCurTime(store) + ": *** Simulation ended"
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