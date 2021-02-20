'use strict'

// ****** Code for creating actions ******

// *** Our imports
import { rootReducer } from './reducers_renderers.js';


// *** Action names
// add info to UI
export const ACTION_ADD_TIMECHART_DATA = 'ADD_TIMECHART_DATA';
export const ACTION_ADD_GEOCHART_DATA = 'ADD_GEOCHART_DATA';
export const ACTION_ADD_STATUS_MESSAGE = 'ADD_STATUS_MESSAGE';
export const ACTION_ADD_JOURNAL_ENTRY = 'ADD_JOURNAL_ENTRY';

// do creature action
export const ACTION_DO_CREATURE_ACT = 'DO_CREATURE_ACT';

// control simulator
export const ACTION_START_SIM = 'START_SIM';
export const ACTION_STOP_SIM = 'STOP_SIM';
export const ACTION_ADVANCE_SIM = 'ADVANCE_SIM';

// do nothing
export const ACTION_DO_NOTHING = 'DO_NOTHING';


// *** Basic action creator functions: add info to UI
// add time chart data
// yTimePair is { time: , value: }
export const addTimeChartData = (chart, dataIndex, yTimePair) => ({
    type: ACTION_ADD_TIMECHART_DATA,
    chart,
    dataIndex,
    yTimePair
});

// add geo chart data
// xyPair is { x: , y: }
export const addGeoChartData = (chart, xyPair) => ({
    type: ACTION_ADD_GEOCHART_DATA,
    chart,
    xyPair
});

// add status message
export const addStatusMessage = (statusBox, message) => ({
    type: ACTION_ADD_STATUS_MESSAGE,
    statusBox,
    message
});

// add journal entry
export const addJournalEntry = (journal, message) => ({
    type: ACTION_ADD_JOURNAL_ENTRY,
    journal,
    message
});


// *** Basic action creator functions: perform creature action
export const doCreatureAct = (physType) => ({
    type: ACTION_DO_CREATURE_ACT,
    physType
});

// *** Basic action creator functions: sim control
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

// *** Basic action creator functions: do nothing
export const doNothing = () => ({
    type: ACTION_DO_NOTHING,
});


// *** Action dispatcher function
export const actionDispatch = (store, action) => rootReducer(store, action);