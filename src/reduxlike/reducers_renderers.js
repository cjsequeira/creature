'use strict'

// ****** Functions to produce store based on given store and action, and render store changes

// *** Our imports
import {
    ACTION_ADD_TIMECHART_DATA,
    ACTION_ADD_GEOCHART_DATA,
    ACTION_ADD_STATUS_MESSAGE,
    ACTION_ADD_JOURNAL_ENTRY,
    ACTION_DO_CREATURE_ACT,
    ACTION_START_SIM,
    ACTION_STOP_SIM,
    ACTION_ADVANCE_SIM,
    ACTION_DO_NOTHING
} from './action_creators.js';
import { chartShiftData, hexRGBAFade } from '../util.js';


// *** Reducer functions
// root reducer
export const rootReducer = (store, action) => {
    switch (action.type) {
        case ACTION_ADD_TIMECHART_DATA:
            return {
                ...store,
                changes: [
                    ...store.changes,
                    () => action.chart.update()
                ],
                creature_time_chart:
                    mutable_updateTimeChartData(action.chart, action.dataIndex, action.yTimePair)
            };

        case ACTION_ADD_GEOCHART_DATA:
            return {
                ...store,
                changes: [
                    ...store.changes,
                    () => action.chart.update()
                ],
                creature_geo_chart:
                    mutable_updateGeoChartData(action.chart, action.xyPair)
            };

        case ACTION_ADD_STATUS_MESSAGE:
            return {
                ...store,
                status_box:
                    mutable_updateStatusBox(action.statusBox, action.message)
            };

        case ACTION_ADD_JOURNAL_ENTRY:
            return {
                ...store,
                journal: [
                    ...store.journal,
                    {
                        time: action.time,
                        message: action.message
                    }
                ]
            };

        case ACTION_DO_CREATURE_ACT:
            return {
                ...store,
                creatureStore: action.physType.act(action.physType)
            }

        case ACTION_START_SIM:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    running: true
                }
            }

        case ACTION_STOP_SIM:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    running: false
                }
            }

        case ACTION_ADVANCE_SIM:
            return {
                ...store,
                sim: {
                    ...store.sim,
                    curTime: store.sim.curTime + store.sim.timeStep
                }
            }

        case ACTION_DO_NOTHING:
            return store;

        default:
            return store;
    }
}


// *** Function to render store changes using an array of render functions
// returns store with empty render function array
// assumes render functions NEVER RETURN TRUE
export const renderStoreChanges = (store) => ({
    ...store,
    changes:
        // array of render functions with no duplicates
        store.changes.filter((item, i, arr) => arr.indexOf(item) === i)

            // call each provided render function, resulting in empty render function array
            // assumes render functions NEVER RETURN TRUE
            .filter(renderFunc => renderFunc(store))
});


// *** Reducer helpers
// update time history chart data
// WARNING: mutates "chart" argument
function mutable_updateTimeChartData(chart, dataIndex, yTimePair) {
    // MUTABLE: add data to chart
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],
        data: chart.data.datasets[dataIndex].data.concat(
            {
                x: yTimePair.time,
                y: yTimePair.value
            })
    };

    // revise time history chart x axis "window" if needed, for next chart update cycle
    const chart_x = chart.options.scales.xAxes[0].ticks;    // shorthand for x-axis ticks
    const chart_xWidth = chart_x.max - chart_x.min;             // extents of x axis
    const new_max = Math.ceil(yTimePair.time);                  // potential different x axis max           
    const new_min = new_max - chart_xWidth;                     // potential different x axis min

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
            new_min - chart.options.scales.xAxes[0].ticks.stepSize
        );

    // return the passed-in chart object reference
    return chart;
}

// update geospatial chart data
// WARNING: mutates "chart" argument
function mutable_updateGeoChartData(chart, xyPair) {
    // maximum length of geospatial data arrays
    const maxLen = 10;

    // MUTABLE: add data and colors to chart, then slice to max length, 
    //  then fade colors if array length is at least 2
    chart.data.datasets[0] = {
        ...chart.data.datasets[0],

        backgroundColor: chart.data.datasets[0].backgroundColor
            .concat('#ec56cdff')                                    // add
            .slice(-maxLen)                                         // slice to max length
            .map((_, i, arr) =>                                     // fade colors if array length at least 2
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        borderColor: chart.data.datasets[0].borderColor
            .concat('#ec56cdff')
            .slice(-maxLen)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        pointBackgroundColor: chart.data.datasets[0].pointBackgroundColor
            .concat('#ec56cdff')
            .slice(-maxLen)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        pointBorderColor: chart.data.datasets[0].pointBorderColor
            .concat('#ec56cdff')
            .slice(-maxLen)
            .map((_, i, arr) =>
                (arr.length >= 2)
                    ? (i < (arr.length - 1)) ? hexRGBAFade(0.5, arr[i + 1], '#cccccc00') : arr[i]
                    : arr[i]),

        data: chart.data.datasets[0].data
            .concat({ x: xyPair.x, y: xyPair.y })
            .slice(-maxLen),
    };

    // return the passed-in chart object reference
    return chart;
}

// update simulator status box with given HTML message
// WARNING: Mutates "statusBox" argument
export function mutable_updateStatusBox(statusBox, message) {
    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // push message into status box
    statusBox.innerHTML = statusBox.innerHTML + message + '<br />';

    // adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }

    return statusBox;
}