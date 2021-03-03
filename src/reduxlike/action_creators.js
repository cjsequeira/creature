'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_SIM_ADVANCE,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_DO_NOTHING,
    ACTION_STORE_LOCK,
    ACTION_QUEUE_ADD_GEO_CHART_DATA,
    ACTION_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_QUEUE_ADD_TIME_CHART_DATA,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_UNLOCK,
    ACTION_MUTABLE_RENDER,
    ACTION_WATCH_SAVE_OBJ,
    ACTION_WATCH_QUEUE_COMPARE_SAVED,
} from '../const_vals.js';
import { rootReducer } from './reducers_renderers.js';


// *** Add journal entry
// takes:
//  journal: store journal, as journalType
//  message: message, as string
// returns actionType
export const addJournalEntry = (journal) => (message) => 
({
    type: ACTION_JOURNAL_ADD_ENTRY,
    journal,
    message
});


// *** Do action for physType at given index
// takes:
//  physType
//  index: index into physType store in app store
// returns actionType
export const doPhysTypeAct = (physType) => (index) => 
({
    type: ACTION_PHYSTYPE_DO_ACT,
    physType,
    index
});


// *** Do nothing
// takes: nothing
// returns actionType
export const doNothing = () => 
({
    type: ACTION_DO_NOTHING,
});


// *** Mutable render that may mutate application beyond the app store (e.g. UI renders)
export const mutableRender = () =>
({
    type: ACTION_MUTABLE_RENDER,
});


// *** Queue update UI
// *** App store does not change until mutable_renderStateChanges is applied
// queue add geo chart data
// takes:
//  chart: time chart
//  dataIndex: chart data index
//  color: color for the data
//  xyPair: data coordinate, as {x, y}
// returns actionType
export const queue_addGeoChartData = (chart) => (dataIndex) => (color) => (xyPair) => 
({
    type: ACTION_QUEUE_ADD_GEO_CHART_DATA,
    chart,
    dataIndex,
    color,
    xyPair
});

// queue add time chart data
// takes:
//  chart: time chart
//  dataIndex: chart data index
//  label: label for legend
//  timeValPair: data coordinate, as {time, value}
// returns actionType
export const queue_addTimeChartData = (chart) => (dataIndex) => (label) => (timeValPair) => 
({
    type: ACTION_QUEUE_ADD_TIME_CHART_DATA,
    chart,
    dataIndex,
    label,
    timeValPair
});

// queue add status message
// takes:
//  statusBox: HTML DOM status box reference
//  message: message, as string
// returns actionType
export const queue_addStatusMessage = (statusBox) => (message) => 
({
    type: ACTION_QUEUE_ADD_STATUS_MESSAGE,
    statusBox,
    message
});


// *** Sim control
// advance sim time
// takes: nothing
// returns actionType
export const advanceSim = () => 
({
    type: ACTION_SIM_ADVANCE,
});

// save system clock
// takes: nothing
// returns actionType
export const saveClockForSim = (clock) => 
({
    type: ACTION_SIM_SAVE_CLOCK,
    clock
});

// start sim
// takes: nothing
// returns actionType
export const startSim = () => 
({
    type: ACTION_SIM_START,
});

// stop sim
// takes: nothing
// returns actionType
export const stopSim = () => 
({
    type: ACTION_SIM_STOP,
});


// *** Store: Lock and unlock for write access
// lock store
// takes: nothing
// returns actionType
export const lockStore = () => 
({
    type: ACTION_STORE_LOCK,
});

// unlock store
// takes: nothing
// returns actionType
export const unlockStore = () => 
({
    type: ACTION_STORE_UNLOCK,
})


// *** Watching objects: save and compare objects
// save object for watching
// takes: object
// returns actionType
export const saveObj = (obj) => (index) =>
({
    type: ACTION_WATCH_SAVE_OBJ,
    obj,
    index
})

// compare given props of physType at given physType store index against 
//  given props of saved object at same index in saved object store, then 
//  queue application of handleFunc to a version of the physType (at the given
//  index) that has a _watchProp_changes object added as a key-val
// takes: object
// returns actionType
export const queue_compareObj = (handleFunc) => (...props) => (index) =>
({
    type: ACTION_WATCH_QUEUE_COMPARE_SAVED,
    handleFunc,
    props,
    index
})

// handle object changes by 

// *** Action dispatcher function
// takes:
//  store: app store, as storeType
//  action: action to dispatch, as actionType
// returns storeType
export const actionDispatch = (store) => (action) => rootReducer(store)(action);
