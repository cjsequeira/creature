'use strict'

// ****** Code for creating actions ******

// *** Our imports
import { rootReducer } from './reducers_renderers.js';


// *** Action names
// queue update UI
export const ACTION_QUEUE_ADD_TIMECHART_DATA = 'QUEUE_ADD_TIMECHART_DATA';
export const ACTION_QUEUE_ADD_GEOCHART_DATA = 'QUEUE_ADD_GEOCHART_DATA';
export const ACTION_QUEUE_ADD_STATUS_MESSAGE = 'QUEUE_ADD_STATUS_MESSAGE';

// add journal entry
export const ACTION_ADD_JOURNAL_ENTRY = 'ADD_JOURNAL_ENTRY';

// do creature action
export const ACTION_DO_CREATURE_ACT = 'DO_CREATURE_ACT';

// control simulator
export const ACTION_START_SIM = 'START_SIM';
export const ACTION_STOP_SIM = 'STOP_SIM';
export const ACTION_ADVANCE_SIM = 'ADVANCE_SIM';

// do nothing
export const ACTION_DO_NOTHING = 'DO_NOTHING';


// *** Queue update UI
// *** These functions don't change state until mutable_renderStateChanges is applied
// queue add geo chart data
// xyPair is {x, y}
export const queue_addGeoChartData = (chart, xyPair) => ({
    type: ACTION_QUEUE_ADD_GEOCHART_DATA,
    chart,
    xyPair
});

// queue add time chart data
// yTimePair is {time, value}
export const queue_addTimeChartData = (chart, dataIndex, yTimePair) => ({
    type: ACTION_QUEUE_ADD_TIMECHART_DATA,
    chart,
    dataIndex,
    yTimePair
});

// queue add status message
export const queue_addStatusMessage = (statusBox, message) => ({
    type: ACTION_QUEUE_ADD_STATUS_MESSAGE,
    statusBox,
    message
});


// *** Add journal entry
export const addJournalEntry = (journal, message) => ({
    type: ACTION_ADD_JOURNAL_ENTRY,
    journal,
    message
});


// *** Perform creature action
export const doCreatureAct = (pct) => ({
    type: ACTION_DO_CREATURE_ACT,
    pct
});

// *** Sim control
// start sim
export const startSim = () => ({
    type: ACTION_START_SIM,
});

// stop sim
export const stopSim = () => ({
    type: ACTION_STOP_SIM,
});

// advance sim time
export const advanceSim = () => ({
    type: ACTION_ADVANCE_SIM,
})

// *** Do nothing
export const doNothing = () => ({
    type: ACTION_DO_NOTHING,
});


// *** Action dispatcher function
export const actionDispatch = (store, action) => rootReducer(store, action);