'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_CLEAR_ACTION_QUEUE,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_MUTABLE_RENDER,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_QUEUE_ADD_GEO_CHART_DATA,
    ACTION_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_QUEUE_ADD_TIME_CHART_DATA,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    ACTION_WATCH_QUEUE_COMPARE_SAVED,
    ACTION_WATCH_SAVE_PHYSTYPE,
} from '../const_vals.js';

import { queueReducer } from './reducer_queue.js';
import { simReducer } from './reducer_sim.js';
import { remainderReducer } from './reducer_remainder.js';

import { combineReducersWithRemainder } from './reduxlike_utils.js'


// *** Add journal entry
// takes:
//  msgStringType: message, as string
//  don't care: storeType
// returns actionType
export const addJournalEntry = (msgStringType) => (_) =>
({
    type: ACTION_JOURNAL_ADD_ENTRY,
    msgStringType
});


// *** Clear action queue
// takes: 
//  don't care: storeType
// returns actionType
export const clearActionFuncQueue = (_) =>
({
    type: ACTION_CLEAR_ACTION_QUEUE,
})


// *** Do action for physType at given index
// takes:
//  physType
//  indexIntType: index into physType store in app store
//  don't care: storeType
// returns actionType
export const physTypeDoAct = (physType) => (indexIntType) => (_) =>
({
    type: ACTION_PHYSTYPE_DO_ACT,
    physType,
    indexIntType
});


// *** Do nothing
// takes: 
//  don't care: storeType
// returns actionType
export const doNothing = (_) =>
({
    type: ACTION_DO_NOTHING,
});


// *** Mutable render that may mutate application beyond the app store (e.g. UI renders)
// takes: 
//  don't care: storeType
// returns actionType
export const mutableRender = (_) =>
({
    type: ACTION_MUTABLE_RENDER,
});


// *** Queue update UI
// *** App store does not change until mutable_renderStateChanges is applied
// queue add geo chart data
// takes:
//  chart: geo chart object reference
//  dataIndexIntType: chart data index, as int
//  colorStringType: color for the data, as string
//  xyFloatTuple: floating-point data coordinate, as {x, y}
//  don't care: storeType
// returns actionType
export const queue_addGeoChartData = (chart) => (dataIndexIntType) =>
    (colorStringType) => (xyFloatTuple) => (_) =>
    ({
        type: ACTION_QUEUE_ADD_GEO_CHART_DATA,
        chart,
        dataIndexIntType,
        colorStringType,
        xyFloatTuple
    });

// queue add time chart data
// takes:
//  chart: time chart object reference
//  dataIndexIntType: chart data index, as int
//  labelStringType: label for legend, as string
//  timeValFloatTuple: floating-point data coordinate, as {time, value}
//  don't care: storeType
// returns actionType
export const queue_addTimeChartData = (chart) => (dataIndexIntType) =>
    (labelStringType) => (timeValFloatTuple) => (_) =>
    ({
        type: ACTION_QUEUE_ADD_TIME_CHART_DATA,
        chart,
        dataIndexIntType,
        labelStringType,
        timeValFloatTuple
    });

// queue add status message
// takes:
//  statusBox: HTML DOM status box reference
//  msgStringType: message, as string
//  don't care: storeType
// returns actionType
export const queue_addStatusMessage = (statusBox) => (msgStringType) => (_) =>
({
    type: ACTION_QUEUE_ADD_STATUS_MESSAGE,
    statusBox,
    msgStringType
});


// *** Sim control
// advance sim time
// takes: 
//  don't care: storeType
// returns actionType
export const advanceSim = (_) =>
({
    type: ACTION_SIM_ADVANCE,
});

// save system clock
// takes: 
//  clockFloatType: clock value, as float
//  don't care: storeType
// returns actionType
export const saveClockForSim = (clockFloatType) => (_) =>
({
    type: ACTION_SIM_SAVE_CLOCK,
    clockFloatType
});

// start sim
// takes: 
//  don't care: storeType
// returns actionType
export const startSim = (_) =>
({
    type: ACTION_SIM_START,
});

// stop sim
// takes: 
//  don't care: storeType
// returns actionType
export const stopSim = (_) =>
({
    type: ACTION_SIM_STOP,
});


// *** Store: Lock and unlock for write access
// lock store
// takes: 
//  don't care: storeType
// returns actionType
export const lockStore = (_) =>
({
    type: ACTION_STORE_LOCK,
});

// unlock store
// takes: 
//  don't care: storeType
// returns actionType
export const unlockStore = (_) =>
({
    type: ACTION_STORE_UNLOCK,
})


// *** Watching physTypes: save and compare physTypes
// save physType for watching
// takes: 
//  physType: physType to watch
//  indexIntType: index of physType in physType store
//  don't care: storeType
// returns actionType
export const savePhysType = (physType) => (indexIntType) => (_) =>
({
    type: ACTION_WATCH_SAVE_PHYSTYPE,
    physType,
    indexIntType
})

// compare given props of physType at given physType store index against 
//  given props of saved physType at same index in "saved physType" store, then 
//  queue application of handleFunc to a version of the physType (at the given
//  index) that has a [WATCHPROPS_CHANGES] object added as a key-val
// takes: 
//  handleFunc: function that returns an actionType
//  ...propsStringType: list of props to compare, as string
//  indexIntType: index into physType store and "saved physType" store, as int
//  don't care: storeType
// returns actionType
export const queue_comparePhysType = (handleFunc) => (...propsStringType) => (indexIntType) => (_) =>
({
    type: ACTION_WATCH_QUEUE_COMPARE_SAVED,
    handleFunc,
    propsStringType,
    indexIntType
})


// *** Action dispatcher function
// takes:
//  storeType: app store, as storeType
//  ...actionFuncs: action-creating functions to apply, each returning actionType
// returns storeType
const storeTypeTemplate = {
    sim: simReducer,
    queue: queueReducer,
};

export const actionDispatch = (storeType) => (...actionFuncs) =>
    combineReducersWithRemainder(storeTypeTemplate)(remainderReducer)(storeType)(actionFuncs);
