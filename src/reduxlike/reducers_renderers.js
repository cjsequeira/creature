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
    concatSliceMap,
    fadeColors,
    roundTo,
    splice
} from '../util.js';


// *** Root reducer 
// takes inStore: store type, and inAction: action type
// returns store type
export const rootReducer = (inStore, inAction) => (
    {
        [ACTION_PHYSTYPE_DO_ACT]: (store, action) => ({
            ...store,
            creatureStore: splice(
                store.creatureStore,
                action.index,
                1,
                action.pct.physType.act(action.pct)
            ),
        }),

        [ACTION_DO_NOTHING]: (store, action) => store,

        [ACTION_SIM_ADVANCE]: (store, action) => ({
            ...store,
            sim: {
                ...store.sim,
                curTime: store.sim.curTime + store.sim.timeStep,
            }
        }),

        [ACTION_JOURNAL_ADD_ENTRY]: (store, action) => ({
            ...store,
            journal: [
                ...store.journal,
                {
                    time: simGetCurTime(store),
                    message: action.message,
                }
            ],
        }),

        [ACTION_STORE_LOCK]: (store, action) => ({
            ...store,
            locked: true,
        }),

        [ACTION_STORE_UNLOCK]: (store, action) => ({
            ...store,
            locked: false,
        }),

        [ACTION_QUEUE_ADD_GEOCHART_DATA]: (store, action) => ({
            ...store,
            changes: [
                ...store.changes,
                () => mutable_updateGeoChartData(action.chart, action.dataIndex, action.color, action.xyPair),
            ],
        }),

        [ACTION_QUEUE_ADD_STATUS_MESSAGE]: (store, action) => ({
            ...store,
            changes: [
                ...store.changes,
                () => mutable_updateStatusBox(
                    action.statusBox,
                    'Time ' + roundTo(simGetCurTime(store), 2) + ': ' + action.message
                ),
            ],
        }),

        [ACTION_QUEUE_ADD_TIMECHART_DATA]: (store, action) => ({
            ...store,
            changes: [
                ...store.changes,
                () => mutable_updateTimeChartData(action.chart, action.dataIndex, action.timeValPair),
            ],
        }),

        [ACTION_SIM_START]: (store, action) => ({
            ...store,
            sim: {
                ...store.sim,
                running: true,
            }
        }),

        [ACTION_SIM_STOP]: (store, action) => ({
            ...store,
            sim: {
                ...store.sim,
                running: false,
            }
        }),

        // use inAction.type as an entry key into the key-val list above
        // key is used to select a function that takes a store type and action type 
        //  and returns a store type
        // if no key-val matches the entry key, return a func that echoes the given store
    }[inAction.type] || ((store, action) => store)

    // evaluate the function with the given store and action to get a store type
)(inStore, inAction);


// *** Function to render store changes using an array of render functions
// MUTABLE: may apply functions that mutate the application state
// takes store: store type
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
// takes chart: chart reference, dataIndex: chart data index, timeValPair: {time, value} pair
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
    const new_max = Math.ceil(timeValPair.time - chart_x.stepSize); // potential different x axis max           
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
    // all of our slice limits are -UI_NUM_TRAILS, so define a shorthand 
    //  function with that limit built in 
    const concatSliceTrailsMap = concatElem => mapFunc => arr =>
        concatSliceMap(concatElem)(-UI_NUM_TRAILS)(mapFunc)(arr);

    // define a shorthand function specific to concatenating a color and 
    //  mapping color list to a fade
    const concatAndFade = concatSliceTrailsMap(color)(fadeColors);

    // MUTABLE: add data and colors to chart, then slice to max length, 
    //  then fade colors 
    chart.data.datasets[dataIndex] = {
        ...chart.data.datasets[dataIndex],

        data: concatSliceTrailsMap
            ({ x: xyPair.x, y: xyPair.y })                          // concatenate xyPair
            (x => x)                                                // identity function for mapping
            ([chart.data.datasets[dataIndex].data]),                // input: current chart xy data

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
