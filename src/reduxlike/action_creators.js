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
    ACTION_PHYSTYPE_DELETE_PHYSTYPE,
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES,
    ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_INC_SEED,
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
// add physType to store
// takes:
//  physType
// returns actionType
export const action_addPhysType = (physType) =>
({
    type: ACTION_PHYSTYPE_ADD_PHYSTYPE,
    physType,
});

// delete physType from store
// takes:
//  idIntType: the physType ID to delete
// returns actionType
export const action_deletePhysType = (idIntType) =>
({
    type: ACTION_PHYSTYPE_DELETE_PHYSTYPE,
    idIntType,
});

// update physType with the given physType using the same ID
// takes:
//  physType
// returns actionType
export const action_updatePhysType = (physType) =>
({
    type: ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    physType,
});
 
// atomically update all physTypes that pass a filter function
// takes:
//  filterFunc: of signature (physType) => bool
//  updateFunc: of signature (physType) => physType
// returns actionType
export const action_updateSelectPhysTypes = (filterFunc) => (updateFunc) =>
({
    type: ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES,
    filterFunc,
    updateFunc,
});

// atomically update all physTypes that pass a filter function by
//  applying random values to the specified conds
// takes:
//  filterFunc: of signature (physType) => bool
//  ...gensForRand: an array of functions with properties and randomType generators, as:
//
//  [
//      (seed1): {property1a: randGen1a(seed1), property1b: randGen1b(seed1), ... }
//      (seed2): {property2a: randGen2a(seed2), property2b: randGen2b(seed2), ... }
//      ...
//  ]
//
//      where randGen1a, randGen1b, ... are of signature (seedIntType) => randType
//      for example, seededRand(0.0)(1.0) would have the appropriate signature 
//          while seededRand(0.0)(1.0)(0) would NOT have the appropriate signature
//
// returns [actionType]
export const action_updateSelectPhysTypesRand = (filterFunc) => (...gensForRand) =>
({
    type: ACTION_PHYSTYPE_UPDATE_SELECT_PHYSTYPES_RAND,
    filterFunc,
    gensForRand,
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

// increment system seed
// takes:
//  seedIncIntType: how many times to advance the system seed
// returns actionType
export const action_incSimSeed = (seedIncIntType) =>
({
    type: ACTION_SIM_INC_SEED,
    seedIncIntType,
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
