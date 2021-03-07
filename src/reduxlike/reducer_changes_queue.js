
'use strict'

// *** Reducer for "changes" property of storeType

// *** Our imports
import {
    ACTION_MUTABLE_RENDER,
    ACTION_RENDER_QUEUE_ADD_GEO_CHART_DATA,
    ACTION_RENDER_QUEUE_ADD_STATUS_MESSAGE,
    ACTION_RENDER_QUEUE_ADD_TIME_CHART_DATA,
} from '../const_vals.js';

import {
    mutable_renderStoreChanges,
    mutable_updateGeoChartData,
    mutable_updateStatusBox,
    mutable_updateTimeChartData,
} from './renderers.js';

import { simGetCurTime } from './store_getters.js';

import { roundTo } from '../utils.js';


// *** Changes queue reducer
// reducer for "changes" property of storeType 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "changes" property object
export const changesQueueReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_MUTABLE_RENDER]: (storeType) => (_) => mutable_renderStoreChanges(storeType),

        [ACTION_RENDER_QUEUE_ADD_GEO_CHART_DATA]: (storeType) => (actionType) =>
        ([
            ...storeType.changes,
            (_) => mutable_updateGeoChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.colorStringType,
                actionType.xyFloatTuple
            ),
        ]),

        [ACTION_RENDER_QUEUE_ADD_STATUS_MESSAGE]: (storeType) => (actionType) =>
        ([
            ...storeType.changes,
            (storeType) => mutable_updateStatusBox(
                actionType.statusBox,
                'Time ' + roundTo(2)(simGetCurTime(storeType)) + ': ' + actionType.msgStringType
            ),
        ]),

        [ACTION_RENDER_QUEUE_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
        ([
            ...storeType.changes,
            (_) => mutable_updateTimeChartData(
                actionType.chart,
                actionType.dataIndexIntType,
                actionType.labelStringType,
                actionType.timeValFloatTuple
            ),
        ]),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType and actionType 
        //  and returns a storeType
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "changes" property obj
    }[inActionType.type] || ((storeType) => (_) => ([...storeType.changes])))
        // evaluate the function with the storeType and actionType 
        //  to get a storeType "changes" property object
        (inStoreType)
        (inActionType);
