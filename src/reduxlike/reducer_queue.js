
'use strict'

// *** Reducer for "queue" property of storeType

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
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    ACTION_WATCH_QUEUE_COMPARE_SAVED,
    ACTION_WATCH_SAVE_PHYSTYPE,
} from '../const_vals.js';

import { simGetCurTime } from './store_getters.js';

import {
    roundTo,
    splice
} from '../utils.js';

import {
    mutable_renderStoreChanges,
    mutable_updateGeoChartData,
    mutable_updateStatusBox,
    mutable_updateTimeChartData,
} from './renderers.js';

import { watchProps } from './watch_props.js';


// *** Queue reducer
// reducer for "queue" property of storeType 
// takes:
//  inStoreTypeQueue: store "queue" property object to use as template for reduction 
//  inActionType: action to use for reduction, as actionType
// returns storeType "queue" property object
export const queueReducer = (inStoreTypeQueue) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_QUEUE_ADD_GEO_CHART_DATA]: (storeTypeQueue) => (actionType) =>
        ([
            ...storeTypeQueue,
            (_) => mutable_updateGeoChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.colorStringType,
                actionType.xyFloatTuple
            ),
        ]),

        [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (storeTypeQueue) => (actionType) =>
        ([
            ...storeTypeQueue,
            (storeType) => mutable_updateStatusBox(
                actionType.statusBox,
                'Time ' + roundTo(2)(simGetCurTime(storeType)) + ': ' + actionType.msgStringType
            ),
        ]),

        [ACTION_QUEUE_ADD_TIME_CHART_DATA]: (storeTypeQueue) => (actionType) =>
        ([
            ...storeTypeQueue,
            (_) => mutable_updateTimeChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.labelStringType,
                actionType.timeValFloatTuple
            ),
        ]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType "queue" prop obj and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "queue" prop obj
    }[inActionType.type] || ((storeTypeQueue) => (_) => storeTypeQueue))
        // evaluate the function with the storeType "queue" obj (or an empty array if null)
        //  and actionType to get a storeType "queue" obj
        (inStoreTypeQueue || [])
        (inActionType);
