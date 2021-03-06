'use strict'

// ****** Functions to produce store based on given store and action, and render store changes

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

import { UI_NUM_TRAILS } from '../const_vals.js';
import { simGetCurTime } from './store_getters.js';

import {
    chartShiftData,
    concatSliceMap,
    fadeColors,
    roundTo,
    splice
} from '../util.js';

import { watchProps } from './watch_props.js';


// *** Remainder reducer 
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  ...inActionTypes: array of actions to use sequentially for reduction, as actionType
// returns storeType
export const remainderReducer = (inStoreType) => (...inActionTypes) =>
    // apply each of the actions to the input store in sequential order
    inActionTypes.flat(Infinity).reduce((accumStoreType, curActionType) =>
        // list of "mini" reducer functions
        // each function is associated with an action type, given in brackets
        ({
            [ACTION_CLEAR_ACTION_QUEUE]: (storeType) => (_) =>
            ({
                ...storeType,
                actionFuncQueue: []
            }),

            [ACTION_DO_NOTHING]: (storeType) => (_) => storeType,

            [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
            ({
                ...storeType,
                journal: [
                    ...storeType.journal,
                    {
                        time: simGetCurTime(storeType),
                        message: actionType.msgStringType,
                    }
                ],
            }),

            [ACTION_MUTABLE_RENDER]: (storeType) => (_) => mutable_renderStoreChanges(storeType),

            [ACTION_PHYSTYPE_DO_ACT]: (storeType) => (actionType) =>
            ({
                ...storeType,

                // set physType store to the given physTypeStore with the physType
                //  at the given index replaced with the physType returned from "act"
                physTypeStore: splice
                    (1)                                         // remove one element...
                    (actionType.indexIntType)                   // ... at the given index...
                    (storeType.physTypeStore)                   // ... in this physType store...
                    (actionType.physType.act(                   // ... and replace with physType from "act"
                        actionType.physType)
                    ),
            }),

            [ACTION_QUEUE_ADD_GEO_CHART_DATA]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (_) => mutable_updateGeoChartData(
                        actionType.chart,
                        actionType.dataIndexIntType,
                        actionType.colorStringType,
                        actionType.xyFloatTuple
                    ),
                ],
            }),

            [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (storeType) => mutable_updateStatusBox(
                        actionType.statusBox,
                        'Time ' + roundTo(2)(simGetCurTime(storeType)) + ': ' + actionType.msgStringType
                    ),
                ],
            }),

            [ACTION_QUEUE_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
            ({
                ...storeType,
                changes: [
                    ...storeType.changes,
                    (_) => mutable_updateTimeChartData(
                        actionType.chart,
                        actionType.dataIndexIntType,
                        actionType.labelStringType,
                        actionType.timeValFloatTuple
                    ),
                ],
            }),

            [ACTION_SIM_ADVANCE]: (storeType) => (_) =>
            ({
                ...storeType,
                sim: {
                    ...storeType.sim,
                    curTime: storeType.sim.curTime + storeType.sim.timeStep,
                }
            }),

            [ACTION_SIM_SAVE_CLOCK]: (storeType) => (actionType) =>
            ({
                ...storeType,
                sim: {
                    ...storeType.sim,
                    savedClock: actionType.clockFloatType,
                }
            }),

            [ACTION_SIM_START]: (storeType) => (_) =>
            ({
                ...storeType,
                sim: {
                    ...storeType.sim,
                    running: true,
                }
            }),

            [ACTION_SIM_STOP]: (storeType) => (_) =>
            ({
                ...storeType,
                sim: {
                    ...storeType.sim,
                    running: false,
                }
            }),

            [ACTION_STORE_LOCK]: (storeType) => (_) =>
            ({
                ...storeType,
                locked: true,
            }),

            [ACTION_STORE_UNLOCK]: (storeType) => (_) =>
            ({
                ...storeType,
                locked: false,
            }),

            [ACTION_WATCH_SAVE_PHYSTYPE]: (storeType) => (actionType) =>
            ({
                ...storeType,
                savedPhysTypeStore: splice
                    (1)                                         // remove one element...
                    (actionType.indexIntType)                   // ... at the given index...
                    (storeType.savedPhysTypeStore)              // ... in this saved physType store...
                    (actionType.physType),                      // ... and replace with actionType.physType
            }),

            [ACTION_WATCH_QUEUE_COMPARE_SAVED]: (storeType) => (actionType) =>
            ({
                ...storeType,

                actionFuncQueue: [
                    ...storeType.actionFuncQueue,

                    // append actions returned by handleFunc
                    actionType.handleFunc(
                        // get a physType for handleFunc via these steps:
                        watchProps
                            // compare the saved physType[index]...        
                            (storeType.savedPhysTypeStore[actionType.indexIntType])

                            // ...to the current physType[index]...
                            (storeType.physTypeStore[actionType.indexIntType])

                            // ... observing the given props
                            (actionType.propsStringType)
                    ),
                ],
            }),

            // use curActionType.type as an entry key into the key-val list above
            // key is used to select a function that takes a storeType and actionType 
            //  and returns a storeType
            // if no key-val matches the entry key, return a func that echoes the given storeType
        }[curActionType.type] || ((storeType) => (_) => storeType))
            // evaluate the function with the storeType accumulator and current action to get a storeType
            (accumStoreType || inStoreType)
            (curActionType),

        // we start our reduction with a null storeType
        null);


// *** Reducer combining function
// allows the use of multiple reducers, each reducing to a different store property
// takes:
//  templateStoreType, as storeType
//  inStoreType, as storeType
//  inActionType, as actionType
export const combineReducers = (templateStoreType) => (storeType) => (...actionFuncs) => ({
    ...Object.fromEntries(
        Object.entries(templateStoreType).reduce(
            (accum, curEntry) => ([
                ...accum,
                [
                    curEntry[0],
                    curEntry[1](storeType)(
                        actionFuncs.flat(Infinity).map(actionFunc => actionFunc(storeType))
                    )
                ]
            ]), [])
    )
});


// *** Function to render store changes using an array of render functions
// MUTABLE: may apply functions that mutate the application beyond the app store
// ignores return values from renderFunc applications
// takes: store, as storeType
// returns storeType with empty render function array
export const mutable_renderStoreChanges = (storeType) =>
({
    ...storeType,

    // apply each provided render func to store in order, 
    //  then return false, resulting in empty render function array
    //  returning false causes the render func to be filtered out of changes array
    // MUTABLE: may apply functions that mutate the application beyond the app store
    changes: storeType.changes.filter(renderFunc => renderFunc(storeType) && false),
});


// *** Reducer helpers
// update time history chart data
// MUTABLE: mutates "chart" argument
// takes: 
//  chart: HTML DOM chart reference
//  dataIndexIntType: chart data index, as int
//  labelStringType: data label for legend, as string
//  timeValFloatTuple: floating-point data point, as {time, value}
// returns nothing
function mutable_updateTimeChartData(chart, dataIndexIntType, labelStringType, timeValFloatTuple) {
    // MUTABLE: add data to chart
    chart.data.datasets[dataIndexIntType] = {
        ...chart.data.datasets[dataIndexIntType],
        label: labelStringType,
        data: chart.data.datasets[dataIndexIntType].data.concat(
            {
                x: timeValFloatTuple.time,
                y: timeValFloatTuple.value
            })
    };

    // revise time history chart x axis "window" if needed, for next chart update cycle
    const chart_x = chart.options.scales.xAxes[0].ticks;                    // shorthand for x-axis ticks
    const chart_xWidth = chart_x.max - chart_x.min;                         // extents of x axis
    const new_max = Math.ceil(timeValFloatTuple.time - chart_x.stepSize);   // potential different x axis max           
    const new_min = new_max - chart_xWidth;                                 // potential different x axis min

    // MUTABLE: assign x axis min and max - shifted rightward if indicated by new_min and new_max
    chart.options.scales.xAxes[0].ticks = {
        ...chart_x,
        max: (chart_x.max < new_max) ? new_max : chart_x.max,
        min: (chart_x.min < new_min) ? new_min : chart_x.min,
    };

    // MUTABLE: shift out data that have "fallen off" the left side of the chart
    chart.data.datasets[dataIndexIntType].data = chartShiftData
        (new_min - chart.options.scales.xAxes[0].ticks.stepSize)
        (chart.data.datasets[dataIndexIntType].data);

    // MUTABLE: redraw the chart
    chart.update();
}

// update geospatial chart data
// MUTABLE: mutates "chart" argument
// takes: 
//  chart: HTML DOM chart reference
//  dataIndexIntType: chart data index, as int
//  colorStringType: color for data, as string
//  xyFloatTuple: floating-point datapoint to add, as {x, y}
// returns nothing
function mutable_updateGeoChartData(chart, dataIndexIntType, colorStringType, xyFloatTuple) {
    // all of our slice limits are -UI_NUM_TRAILS, so define a shorthand 
    //  function with that limit built in 
    const concatSliceTrailsMap = concatSliceMap(-UI_NUM_TRAILS);

    // define a shorthand function specific to concatenating a color 
    //  and mapping color list to a fade
    const concatAndFade = concatSliceTrailsMap(fadeColors)(colorStringType);

    // MUTABLE: add data and colors to chart, then slice to max length, 
    //  then fade colors 
    chart.data.datasets[dataIndexIntType] = {
        ...chart.data.datasets[dataIndexIntType],

        data: concatSliceTrailsMap
            (x => x)                                            // identity function for mapping
            ({ x: xyFloatTuple.x, y: xyFloatTuple.y })          // concatenate xyFloatTuple
            ([chart.data.datasets[dataIndexIntType].data]),     // array: current chart xy data

        backgroundColor:
            concatAndFade([chart.data.datasets[dataIndexIntType].backgroundColor]),

        borderColor:
            concatAndFade([chart.data.datasets[dataIndexIntType].borderColor]),

        pointBackgroundColor:
            concatAndFade([chart.data.datasets[dataIndexIntType].pointBackgroundColor]),

        pointBorderColor:
            concatAndFade([chart.data.datasets[dataIndexIntType].pointBorderColor]),
    };

    // MUTABLE: redraw the chart
    chart.update();
}

// update simulator status box with given HTML message
// MUTABLE: Mutates "statusBox" argument
// takes:
//  statusBox: HTML DOM status box reference
//  msgStringType: message, as string
// returns nothing
function mutable_updateStatusBox(statusBox, msgStringType) {
    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // MUTABLE: push message into status box
    statusBox.innerHTML = statusBox.innerHTML + msgStringType + '<br />';

    // MUTABLE: adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}
