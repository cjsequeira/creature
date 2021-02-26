'use strict'

// ****** Functions to produce store based on given store and action, and render store changes

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
    ACTION_STORE_UNLOCK,
} from '../const_vals.js';
import {
    UI_NUM_TRAILS
} from '../const_vals.js';
import { simGetCurTime } from './store_getters.js';
import {
    chartShiftData,
    hexRGBAFade,
    roundTo,
    splice
} from '../util.js';


// *** Root reducer 
// MUTABLE: Can cause changes in application store and other parts of application!
// takes store type and action type
// returns store type
export const mutable_rootReducer = (store, action) => {
    switch (action.type) {
        case ACTION_PHYSTYPE_DO_ACT:
            return {
                ...store,
                creatureStore: splice(
                    store.creatureStore,
                    action.index,
                    1,
                    action.pct.physType.act(action.pct)
                ),
            }

        case ACTION_DO_NOTHING:
            return store;

        case ACTION_SIM_ADVANCE:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    curTime: store.sim.curTime + store.sim.timeStep,
                }
            }

        case ACTION_JOURNAL_ADD_ENTRY:
            return {
                ...store,
                journal: [
                    ...store.journal,
                    {
                        time: simGetCurTime(store),
                        message: action.message,
                    }
                ],
            };

        case ACTION_STORE_LOCK:
            return {
                ...store,
                locked: true,
            }

        case ACTION_STORE_UNLOCK:
            return {
                ...store,
                locked: false,
            }

        case ACTION_QUEUE_ADD_GEOCHART_DATA:
            return {
                ...store,
                changes: [
                    ...store.changes,
                    () => mutable_updateGeoChartData(action.chart, action.dataIndex, action.color, action.xyPair),
                ],
            };

        case ACTION_QUEUE_ADD_STATUS_MESSAGE:
            return {
                ...store,
                changes: [
                    ...store.changes,
                    () => mutable_updateStatusBox(
                        action.statusBox,
                        'Time ' + roundTo(simGetCurTime(store), 2) + ': ' + action.message
                    ),
                ],
            };

        case ACTION_QUEUE_ADD_TIMECHART_DATA:
            return {
                ...store,
                changes: [
                    ...store.changes,
                    () => mutable_updateTimeChartData(action.chart, action.dataIndex, action.timeValPair),
                ],
            };

        case ACTION_SIM_START:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    running: true,
                }
            }

        case ACTION_SIM_STOP:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    running: false,
                }
            }

        default:
            return store;
    }
}


// *** Function to render store changes using an array of render functions
// MUTABLE: may apply functions that mutate the application state
// takes store type
// returns store type with empty render function array
// ignores return values from renderFunc applications
export function mutable_renderStoreChanges(store) {
    return {
        ...store,

        // apply each provided render func to store in order, resulting in empty render function array
        // MUTABLE: may apply functions that mutate the application state
        changes: store.changes.filter(renderFunc => {
            // apply the renderFunc to the store, ignoring return value
            renderFunc(store);

            // returning "false" causes the renderFunc to be filtered out of the changes array
            return false;
        })
    }
};


// *** Reducer helpers
// update time history chart data
// MUTABLE: mutates "chart" argument
// takes chart reference, chart data index, {time, value} pair
// does not return anything!
function mutable_updateTimeChartData(chart, dataIndex, timeValPair) {
    // MUTABLE: add data to chart
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],
        data: chart.data.datasets[dataIndex].data.concat(
            {
                x: timeValPair.time,
                y: timeValPair.value
            })
    };

    // revise time history chart x axis "window" if needed, for next chart update cycle
    const chart_x = chart.options.scales.xAxes[0].ticks;            // shorthand for x-axis ticks
    const chart_xWidth = chart_x.max - chart_x.min;                 // extents of x axis
    const new_max = Math.ceil(timeValPair.time - chart_x.stepSize);   // potential different x axis max           
    const new_min = new_max - chart_xWidth;                         // potential different x axis min

    // MUTABLE: assign x axis min and max - shifted rightward if indicated by new_min and new_max
    chart.options.scales.xAxes[0].ticks = {
        ...chart_x,
        max: (chart_x.max < new_max) ? new_max : chart_x.max,
        min: (chart_x.min < new_min) ? new_min : chart_x.min,
    };

    // MUTABLE: shift out data that have "fallen off" the left side of the chart
    chart.data.datasets[dataIndex].data =
        chartShiftData(
            chart.data.datasets[dataIndex].data,
            new_min - chart.options.scales.xAxes[0].ticks.stepSize,
        );

    // MUTABLE: redraw the chart
    chart.update();
}

// update geospatial chart data
// MUTABLE: mutates "chart" argument
// takes chart reference, {x, y} pair
// does not return anything!
function mutable_updateGeoChartData(chart, dataIndex, color, xyPair) {
    // MUTABLE: add data and colors to chart, then slice to max length, 
    //  then fade colors if array length is at least 2
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],

        backgroundColor: [chart.data.datasets[dataIndex].backgroundColor]
            .flat()                                                 // flatten
            .slice(-chart.data.datasets[dataIndex].data.length)     // slice to same length as datapoints arr
            .concat(color)                                          // add
            .slice(-UI_NUM_TRAILS)                                  // slice to max length
            .map((_, i, arr) =>                                     // fade colors if array length at least 2
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        borderColor: [chart.data.datasets[dataIndex].borderColor]
            .flat()
            .slice(-chart.data.datasets[dataIndex].data.length)
            .concat(color)
            .slice(-UI_NUM_TRAILS)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        pointBackgroundColor: [chart.data.datasets[dataIndex].pointBackgroundColor]
            .flat()
            .slice(-chart.data.datasets[dataIndex].data.length)
            .concat(color)
            .slice(-UI_NUM_TRAILS)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        pointBorderColor: [chart.data.datasets[dataIndex].pointBorderColor]
            .flat()
            .slice(-chart.data.datasets[dataIndex].data.length)
            .concat(color)
            .slice(-UI_NUM_TRAILS)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        data: [chart.data.datasets[dataIndex].data]
            .flat()
            .concat({ x: xyPair.x, y: xyPair.y })
            .slice(-UI_NUM_TRAILS),
    };

    // MUTABLE: redraw the chart
    chart.update();
}

// update simulator status box with given HTML message
// MUTABLE: Mutates "statusBox" argument
// takes status box reference, message string
// does not return anything!
export function mutable_updateStatusBox(statusBox, message) {
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