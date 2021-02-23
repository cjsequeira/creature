'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_SIM_ADVANCE,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_DO_NOTHING,
    ACTION_STORE_LOCK,
    ACTION_QUEUE_ADD_GEOCHART_DATA,
    ACTION_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_QUEUE_ADD_TIMECHART_DATA,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_UNLOCK
} from '../const_vals.js';
import { mutable_rootReducer } from './reducers_renderers.js';


// *** Queue update UI
// *** These functions don't change state until mutable_renderStateChanges is applied
// queue add geo chart data
// xyPair is {x, y}
export const queue_addGeoChartData = (chart, dataIndex, color, xyPair) => ({
    type: ACTION_QUEUE_ADD_GEOCHART_DATA,
    chart,
    dataIndex,
    color,
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
    type: ACTION_JOURNAL_ADD_ENTRY,
    journal,
    message
});


// *** Perform action for physType at given index
export const doPhysTypeAct = (pct, index) => ({
    type: ACTION_PHYSTYPE_DO_ACT,
    pct,
    index
});


// *** Sim control
// start sim
export const startSim = () => ({
    type: ACTION_SIM_START,
});

// stop sim
export const stopSim = () => ({
    type: ACTION_SIM_STOP,
});

// advance sim time
export const advanceSim = () => ({
    type: ACTION_SIM_ADVANCE,
});


// *** Lock and unlock for write access
// lock store
export const lockStore = () => ({
    type: ACTION_STORE_LOCK,
});

// unlock store
export const unlockStore = () => ({
    type: ACTION_STORE_UNLOCK,
})


// *** Do nothing
export const doNothing = () => ({
    type: ACTION_DO_NOTHING,
});


// *** Action dispatcher function
export const actionDispatch = (store, action) => mutable_rootReducer(store, action);