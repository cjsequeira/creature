'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_COMPARE_COMPARE_PHYSTYPE,
    ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_ADD_PHYSTYPE,
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_TIME_CHART_DATA,
} from '../const_vals.js';

import { physTypeStoreReducer } from './reducer_phystypestore.js';
import { remainderReducer } from './reducer_remainder.js';
import { simReducer } from './reducer_sim.js';
import { uiReducer } from './reducer_ui.js';
import { combineReducers } from './reduxlike_utils.js';
import { resolveRules } from '../rulebook/rulebook.js';


// *** Add journal entry
// takes:
//  msgStringType: message, as string
//  don't care: storeType
// returns actionType
export const action_addJournalEntry = (msgStringType) =>
({
    type: ACTION_JOURNAL_ADD_ENTRY,
    msgStringType
});


// *** Comparing and testing physTypes
// compare current physTypes with store of saved physTypes
// takes: 
//  selectFunc: test function for selecting physTypes from saved and current physType store
//      signature: (physType) => boolean
//  compareFunc: function for comparing selected physTypes 
//      signature: (old physType) => (new physType) => bool
// returns actionType
export const action_comparePhysTypes = (selectFunc) => (compareFunc) =>
({
    type: ACTION_COMPARE_COMPARE_PHYSTYPE,
    selectFunc,
    compareFunc,
});

// log behavior changes into the app store journal
// takes:
//  don't care
// returns actionType
export const action_logChangedBehaviors = (_) =>
({
    type: ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
});

// save all physTypes for later comparison
// takes: 
//  don't care
// returns actionType
export const action_saveAllPhysTypes = (_) =>
({
    type: ACTION_COMPARE_SAVE_PHYSTYPE,
});

// stop if frozen
// takes: 
//  don't care
// returns actionType
export const action_stopIfFrozen = (_) =>
({
    type: ACTION_COMPARE_STOP_IF_FROZEN,
});


// *** Do nothing
// takes: 
//  don't care: storeType
// returns actionType
export const action_doNothing = (_) =>
({
    type: ACTION_DO_NOTHING,
});


// *** Update app store properties related to UI
// add geo chart data
// takes:
//  don't care
// returns actionType
export const action_uiAddGeoChartData = (_) =>
({
    type: ACTION_UI_ADD_GEO_CHART_DATA,
});

// add time chart data for simple creature
// takes:
//  dataIndexIntType: chart data index, as int
//  labelStringType: label for legend, as string
//  timeValFloatTuple: floating-point data coordinate, as {time, value}
//  don't care: storeType
// returns actionType
export const action_uiAddTimeChartSimpleCreatureData = (offsetIntType) => (condStringType) =>
({
    type: ACTION_UI_ADD_TIME_CHART_DATA,
    offsetIntType,
    condStringType,
});


// *** physType store actions
// add physTypes to store
// takes:
//  physType
// returns actionType
export const action_AddPhysType = (physType) =>
({
    type: ACTION_PHYSTYPE_ADD_PHYSTYPE,
    physType,
});

// update physType with the given physType using the same ID
// takes:
//  physType
// returns actionType
export const action_UpdatePhysType = (physType) =>
({
    type: ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    physType,
});
 

// *** Sim control
// advance sim time if running
// takes: 
//  don't care: storeType
// returns actionType
export const action_advanceSimIfRunning = (_) =>
({
    type: ACTION_SIM_ADVANCE,
});

// save system clock
// takes: 
//  clockFloatType: clock value, as float
//  don't care: storeType
// returns actionType
export const action_saveClockForSim = (clockFloatType) =>
({
    type: ACTION_SIM_SAVE_CLOCK,
    clockFloatType
});

// start sim
// takes: 
//  don't care: storeType
// returns actionType
export const action_startSim = (_) =>
({
    type: ACTION_SIM_START,
});

// stop sim
// takes: 
//  don't care: storeType
// returns actionType
export const action_stopSim = (_) =>
({
    type: ACTION_SIM_STOP,
});


// *** storeType template with reducers for specific properties
export const storeTypeTemplate = {
    physTypeStore: physTypeStoreReducer,
    sim: simReducer,
    ui: uiReducer,

    remainder: remainderReducer,
};


// *** Dispatch a list of actions, then call subscribedFunc, then return updated storeType
// takes:
//  storeType
//  ...actions: list of actions to dispatch, as actionType
// returns undefined
export const dispatchActions = (inStoreType) => (...actions) => {
    let outStoreType = null;

    // process each action atomically
    actions.flat(Infinity).forEach((action) =>
        outStoreType = combineReducers(storeTypeTemplate)(outStoreType || inStoreType)(action)
    );

    // call subscribed func (typically used for rendering UI)
    outStoreType.method_subscribed(outStoreType);

    // return the updated storeType
    return outStoreType;
};

// *** Map a list of events to a list of associated actions
// takes:
//  storeType
//  ...events: list of events to map, as eventType
// returns array of actionType
export const mapEventsToActions = (storeType) => (...events) =>
    events.flat(Infinity).map((thisEvent) => resolveRules(storeType)(thisEvent));
