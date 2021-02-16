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
import { hexRGBAFade } from '../util.js';



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
                creatureStore: action.pct.physicalElem.act(action.pct)
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
function mutable_updateTimeChartData(chart, dataIndex, yTimePair) {
    // timeData is shorthand to reduce typing / increase readability of code
    let timeData = null;

    // get chart data with new value
    timeData = chart.data.datasets[dataIndex];
    chart.data.datasets[dataIndex] = {
        ...timeData,
        data: timeData.data.concat(
            {
                x: yTimePair.time,
                y: yTimePair.value
            })
    };

    // revise time history chart x axis "window" if needed, for next chart update cycle
    let creature_time_chart_x = chart.options.scales.xAxes[0].ticks;
    let creature_time_chart_xWidth = creature_time_chart_x.max - creature_time_chart_x.min;
    if (yTimePair.time > creature_time_chart_x.max) {
        let new_max = Math.ceil(yTimePair.time);
        let new_min = new_max - creature_time_chart_xWidth;

        chart.options.scales.xAxes[0].ticks = {
            ...creature_time_chart_x,
            max: new_max,
            min: new_min
        };

        // remove first element in each data array if hidden
        chart.data.datasets.forEach((dataset) => {
            let checkShift = dataset.data[0];
            if (checkShift.x < (new_min - creature_time_chart_x.StepSize)) {
                dataset.data.shift();
                dataset.backgroundColor.shift();
                dataset.borderColor.shift();
            }
        });
    }

    return chart;
}

// update geospatial chart data
function mutable_updateGeoChartData(chart, xyPair) {
    // geoData is shorthand to reduce typing / increase readability of code
    let geoData = null;

    // get chart data without first datapoint if data array is a certain length
    geoData = chart.data.datasets[0];
    if (geoData.data.length > 10) {
        chart.data.datasets[0] = {
            ...geoData,

            backgroundColor: geoData.backgroundColor.slice(1),
            borderColor: geoData.borderColor.slice(1),
            pointBackgroundColor: geoData.pointBackgroundColor.slice(1),
            pointBorderColor: geoData.pointBorderColor.slice(1),

            data: geoData.data.slice(1)
        };
    }

    // get chart data with new x-y pair
    // geoData is shorthand to reduce typing / increase readability of code
    geoData = chart.data.datasets[0];
    chart.data.datasets[0] = {
        ...geoData,

        backgroundColor: geoData.backgroundColor.concat('#ec56cdff'),
        borderColor: geoData.borderColor.concat('#ec56cdff'),
        pointBackgroundColor: geoData.pointBackgroundColor.concat('#ec56cdff'),
        pointBorderColor: geoData.pointBorderColor.concat('#ec56cdff'),

        data: geoData.data.concat(
            {
                x: xyPair.x,
                y: xyPair.y
            })
    };

    // fade color values
    // geoData is shorthand to reduce typing / increase readability of code
    geoData = chart.data.datasets[0];
    chart.data.datasets[0].backgroundColor = geoData.backgroundColor.map((_, i) =>
        hexRGBAFade(i / geoData.data.length, '#cccccc08', '#ec56cdff'));
    chart.data.datasets[0].borderColor = geoData.borderColor.map((_, i) =>
        hexRGBAFade(i / geoData.data.length, '#cccccc08', '#ec56cdff'));
    chart.data.datasets[0].pointBackgroundColor = geoData.pointBackgroundColor.map((_, i) =>
        hexRGBAFade(i / geoData.data.length, '#cccccc08', '#ec56cdff'));
    chart.data.datasets[0].pointBorderColor = geoData.pointBorderColor.map((_, i) =>
        hexRGBAFade(i / geoData.data.length, '#cccccc08', '#ec56cdff'));

    return chart;
}

// update simulator status box with given HTML message
export function mutable_updateStatusBox(statusBox, message) {
    // get status box scroll bar information
    let statusScrollTop = statusBox.scrollTop;
    let statusScrollHeight = statusBox.scrollHeight;
    let statusInnerHeight = statusBox.clientHeight;

    // push message into status box
    statusBox.innerHTML = statusBox.innerHTML + message + '<br />';

    // adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }

    return statusBox;
}