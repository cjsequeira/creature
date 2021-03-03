'use strict'

// ****** Functions to produce store based on given store and action, and render store changes

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
    ACTION_WATCH_SAVE_PHYSTYPE,
    ACTION_WATCH_QUEUE_COMPARE_SAVED,
    ACTION_CLEAR_ACTION_QUEUE
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
import { actionDispatch } from './action_creators.js';


// *** Root reducer 
// takes:
//  inStore: store to use as template for reduction, as storeType 
//  inAction: action to use for reduction, as actionType
// returns storeType
export const rootReducer = (inStore) => (inAction) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_CLEAR_ACTION_QUEUE]: (store) => (action) =>
        ({
            ...store,
            actionQueue: []
        }),

        [ACTION_DO_NOTHING]: (store) => (action) => store,

        [ACTION_MUTABLE_RENDER]: (store) => (action) => mutable_renderStoreChanges(store),

        [ACTION_PHYSTYPE_DO_ACT]: (store) => (action) =>
        ({
            ...store,

            // set physType store to the given physTypeStore with the physType
            //  at the given index replaced with the physType returned from "act"
            physTypeStore: splice
                (1)                                         // remove one element...
                (action.index)                              // ... at the given index...
                (store.physTypeStore)                       // ... in this physType store...
                (action.physType.act(action.physType)),     // ... and replace with physType from "act"
        }),

        [ACTION_QUEUE_ADD_GEO_CHART_DATA]: (store) => (action) =>
        ({
            ...store,
            changes: [
                ...store.changes,
                (store) => mutable_updateGeoChartData(
                    action.chart,
                    action.dataIndex,
                    action.color,
                    action.xyPair
                ),
            ],
        }),

        [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (store) => (action) =>
        ({
            ...store,
            changes: [
                ...store.changes,
                (store) => mutable_updateStatusBox(
                    action.statusBox,
                    'Time ' + roundTo(2)(simGetCurTime(store)) + ': ' + action.message
                ),
            ],
        }),

        [ACTION_QUEUE_ADD_TIME_CHART_DATA]: (store) => (action) =>
        ({
            ...store,
            changes: [
                ...store.changes,
                (store) => mutable_updateTimeChartData(
                    action.chart,
                    action.dataIndex,
                    action.label,
                    action.timeValPair
                ),
            ],
        }),

        [ACTION_SIM_ADVANCE]: (store) => (action) =>
        ({
            ...store,
            sim: {
                ...store.sim,
                curTime: store.sim.curTime + store.sim.timeStep,
            }
        }),

        [ACTION_SIM_SAVE_CLOCK]: (store) => (action) =>
        ({
            ...store,
            sim: {
                ...store.sim,
                savedClock: action.clock,
            }
        }),

        [ACTION_SIM_START]: (store) => (action) =>
        ({
            ...store,
            sim: {
                ...store.sim,
                running: true,
            }
        }),

        [ACTION_SIM_STOP]: (store) => (action) =>
        ({
            ...store,
            sim: {
                ...store.sim,
                running: false,
            }
        }),

        [ACTION_STORE_LOCK]: (store) => (action) =>
        ({
            ...store,
            locked: true,
        }),

        [ACTION_STORE_UNLOCK]: (store) => (action) =>
        ({
            ...store,
            locked: false,
        }),

        [ACTION_JOURNAL_ADD_ENTRY]: (store) => (action) =>
        ({
            ...store,
            journal: [
                ...store.journal,
                {
                    time: simGetCurTime(store),
                    message: action.message,
                }
            ],
        }),

        [ACTION_WATCH_SAVE_PHYSTYPE]: (store) => (action) =>
        ({
            ...store,
            savedPhysTypeStore: splice
                (1)                                         // remove one element...
                (action.index)                              // ... at the given index...
                (store.savedPhysTypeStore)                  // ... in this saved physType store...
                (action.obj),                               // ... and replace with action.obj
        }),

        [ACTION_WATCH_QUEUE_COMPARE_SAVED]: (store) => (action) =>
        ({
            ...store,

            actionQueue: [
                ...store.actionQueue,

                // append actions returned by handleFunc
                action.handleFunc(
                    watchProps                                      // get an object via these steps:
                        (store.savedPhysTypeStore[action.index])    // compare the saved physType[index]...
                        (store.physTypeStore[action.index])         // ...to the current physType[index]...
                        (action.props)                              // ... observing the given props
                ),
            ],
        }),

        // use inAction.type as an entry key into the key-val list above
        // key is used to select a function that takes a store type and action type 
        //  and returns a store type
        // if no key-val matches the entry key, return a func that echoes the given store
    }[inAction.type] || ((store) => (action) => store))
        // evaluate the function with the given store and action to get a store type
        (inStore)
        (inAction);


// *** Function to render store changes using an array of render functions
// MUTABLE: may apply functions that mutate the application beyond the app store
// ignores return values from renderFunc applications
// takes: store, as storeType
// returns storeType with empty render function array
export const mutable_renderStoreChanges = (store) =>
({
    ...store,

    // apply each provided render func to store in order, 
    //  then return false, resulting in empty render function array
    //  returning false causes the render func to be filtered out of changes array
    // MUTABLE: may apply functions that mutate the application beyond the app store
    changes: store.changes.filter(renderFunc => renderFunc(store) && false),
});


// *** Reducer helpers
// update time history chart data
// MUTABLE: mutates "chart" argument
// takes: 
//  chart: HTML DOM chart reference
//  dataIndex: chart data index
//  label: data label for legend
//  timeValPair: data point, as {time, value}
// returns nothing
function mutable_updateTimeChartData(chart, dataIndex, label, timeValPair) {
    // MUTABLE: add data to chart
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],
        label: label,
        data: chart.data.datasets[dataIndex].data.concat(
            {
                x: timeValPair.time,
                y: timeValPair.value
            })
    };

    // revise time history chart x axis "window" if needed, for next chart update cycle
    const chart_x = chart.options.scales.xAxes[0].ticks;            // shorthand for x-axis ticks
    const chart_xWidth = chart_x.max - chart_x.min;                 // extents of x axis
    const new_max = Math.ceil(timeValPair.time - chart_x.stepSize); // potential different x axis max           
    const new_min = new_max - chart_xWidth;                         // potential different x axis min

    // MUTABLE: assign x axis min and max - shifted rightward if indicated by new_min and new_max
    chart.options.scales.xAxes[0].ticks = {
        ...chart_x,
        max: (chart_x.max < new_max) ? new_max : chart_x.max,
        min: (chart_x.min < new_min) ? new_min : chart_x.min,
    };

    // MUTABLE: shift out data that have "fallen off" the left side of the chart
    chart.data.datasets[dataIndex].data = chartShiftData
        (new_min - chart.options.scales.xAxes[0].ticks.stepSize)
        (chart.data.datasets[dataIndex].data);

    // MUTABLE: redraw the chart
    chart.update();
}

// update geospatial chart data
// MUTABLE: mutates "chart" argument
// takes: 
//  chart: HTML DOM chart reference, {x, y} pair
//  dataIndex: chart data index
//  color: color for data
//  xyPair: datapoint to add, as {x, y}
// returns nothing
function mutable_updateGeoChartData(chart, dataIndex, color, xyPair) {
    // all of our slice limits are -UI_NUM_TRAILS, so define a shorthand 
    //  function with that limit built in 
    const concatSliceTrailsMap = concatSliceMap(-UI_NUM_TRAILS);

    // define a shorthand function specific to concatenating a color 
    //  and mapping color list to a fade
    const concatAndFade = concatSliceTrailsMap(fadeColors)(color);

    // MUTABLE: add data and colors to chart, then slice to max length, 
    //  then fade colors 
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],

        data: concatSliceTrailsMap
            (x => x)                                                // identity function for mapping
            ({ x: xyPair.x, y: xyPair.y })                          // concatenate xyPair
            ([chart.data.datasets[dataIndex].data]),                // array: current chart xy data

        backgroundColor:
            concatAndFade([chart.data.datasets[dataIndex].backgroundColor]),

        borderColor:
            concatAndFade([chart.data.datasets[dataIndex].borderColor]),

        pointBackgroundColor:
            concatAndFade([chart.data.datasets[dataIndex].pointBackgroundColor]),

        pointBorderColor:
            concatAndFade([chart.data.datasets[dataIndex].pointBorderColor]),
    };

    // MUTABLE: redraw the chart
    chart.update();
}

// update simulator status box with given HTML message
// MUTABLE: Mutates "statusBox" argument
// takes:
//  statusBox: HTML DOM status box reference
//  message: message string
// returns nothing
function mutable_updateStatusBox(statusBox, message) {
    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // MUTABLE: push message into status box
    statusBox.innerHTML = statusBox.innerHTML + message + '<br />';

    // MUTABLE: adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}
