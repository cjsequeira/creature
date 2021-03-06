
'use strict'

// *** Reducer for "changes" property of storeType

// *** Our imports
import {
    ACTION_QUEUE_ADD_GEO_CHART_DATA,
    ACTION_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_QUEUE_ADD_TIME_CHART_DATA,
} from '../const_vals.js';

import { simGetCurTime } from './store_getters.js';

import { roundTo } from '../utils.js';

import {
    mutable_updateGeoChartData,
    mutable_updateStatusBox,
    mutable_updateTimeChartData,
} from './renderers.js';


// *** Changes queue reducer
// reducer for "changes" property of storeType 
// takes:
//  inStoreTypeChanges: store "changes" property object to use as template for reduction 
//  inActionType: action to use for reduction, as actionType
// returns storeType "changes" property object
export const changesQueueReducer = (inStoreTypeChanges) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_QUEUE_ADD_GEO_CHART_DATA]: (storeTypeChanges) => (actionType) =>
        ([
            ...storeTypeChanges,
            (_) => mutable_updateGeoChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.colorStringType,
                actionType.xyFloatTuple
            ),
        ]),

        [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (storeTypeChanges) => (actionType) =>
        ([
            ...storeTypeChanges,
            (storeType) => mutable_updateStatusBox(
                actionType.statusBox,
                'Time ' + roundTo(2)(simGetCurTime(storeType)) + ': ' + actionType.msgStringType
            ),
        ]),

        [ACTION_QUEUE_ADD_TIME_CHART_DATA]: (storeTypeChanges) => (actionType) =>
        ([
            ...storeTypeChanges,
            (_) => mutable_updateTimeChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.labelStringType,
                actionType.timeValFloatTuple
            ),
        ]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType "changes" prop obj and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "changes" prop obj
    }[inActionType.type] || ((storeTypeChanges) => (_) => storeTypeChanges))
        // evaluate the function with the storeType "changes" obj (or an empty array if null)
        //  and actionType to get a storeType "changes" obj
        (inStoreTypeChanges || [])
        (inActionType);
