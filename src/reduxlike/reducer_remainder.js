'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_STATUS_MESSAGE,
    ACTION_UI_ADD_TIME_CHART_DATA,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    UI_NUM_TRAILS,
} from '../const_vals.js';

import {
    getJournal,
    getPhysTypeAtIndex,
    getPhysTypeCondAtIndex,
    getPhysTypeStore,
    getSavedPhysTypeStore,
    physTypeGet,
    physTypeGetCond,
    simGetCurTime
} from './store_getters.js';

import {
    chartShiftData,
    concatSliceMap,
    fadeColors,
    roundTo,
    splice,
} from '../utils.js';


// *** Remainder reducer 
// reducer for "remainder" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "remainder" property object
export const remainderReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        [ACTION_COMPARE_SAVE_PHYSTYPE]: (storeType) => (_) =>
        ({
            ...storeType.remainder,

            savedPhysTypeStore: storeType.remainder.physTypeStore,
        }),

        [ACTION_DO_NOTHING]: (storeType) => (_) => ({ ...storeType.remainder }),

        [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),
                {
                    time: simGetCurTime(storeType),
                    message: actionType.msgStringType,
                }
            ],
        }),

        [ACTION_PHYSTYPE_DO_ACT]: (storeType) => (_) =>
        ({
            ...storeType.remainder,

            // IMPORTANT: every physType acts on the given store
            // in other words, the store doesn't change in the middle of "map" below!
            physTypeStore: storeType.remainder.physTypeStore.map((thisPhysType) =>
                thisPhysType.act(storeType)(thisPhysType)
            ),
        }),

        [ACTION_STORE_LOCK]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            locked: true,
        }),

        [ACTION_STORE_UNLOCK]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            locked: false,
        }),

        [ACTION_UI_ADD_STATUS_MESSAGE]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            statusBoxContent: storeType.remainder.statusBoxContent +
                'Time ' + roundTo(2)(simGetCurTime(storeType)) +
                ': ' + actionType.msgStringType + '<br />',
        }),

        [ACTION_UI_ADD_GEO_CHART_DATA]: (storeType) => (_) =>
        ({
            ...storeType.remainder,

            creature_geo_chart:
                // update geo chart data associated with all physTypes in the store
                storeType.remainder.physTypeStore.reduce((accumData, thisPhysType, i) =>
                    mutable_updateGeoChartData(
                        accumData,
                        i,
                        physTypeGet(thisPhysType)('color'),
                        ({
                            x: physTypeGetCond(thisPhysType)('x'),
                            y: physTypeGetCond(thisPhysType)('y'),
                        })
                    ),
                    storeType.remainder.creature_geo_chart),
        }),

        [ACTION_UI_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            creature_time_chart:
                // update time chart data associated with all physTypes in the store
                storeType.remainder.physTypeStore.reduce((accumData, thisPhysType, i) =>
                    mutable_updateTimeChartData(
                        accumData,
                        2 * i + actionType.offsetIntType,
                        physTypeGet(thisPhysType)('name') + ' ' + actionType.condStringType,
                        ({
                            time: simGetCurTime(storeType),
                            value: physTypeGetCond(thisPhysType)(actionType.condStringType),
                        })
                    ),
                    storeType.remainder.creature_time_chart),
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "remainder" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "remainder" property object
    }[inActionType.type] || ((storeType) => (_) => ({ ...storeType.remainder })))
        // evaluate the function with the storeType "remainder" property object 
        //  and actionType to get a storeType "remainder" property object
        (inStoreType)
        (inActionType);


// *** Reducer helper functions
// update time history chart data
// MUTABLE: mutates object at "chart" reference
// takes: 
//  chart: HTML DOM chart reference
//  dataIndexIntType: chart data index, as int
//  labelStringType: data label for legend, as string
//  timeValFloatTuple: floating-point data point, as {time, value}
// returns nothing
export function mutable_updateTimeChartData(chart, dataIndexIntType, labelStringType, timeValFloatTuple) {
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

    // return the passed-in chart reference
    return chart;
}

// update geospatial chart data
// MUTABLE: mutates object at "chart" reference
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

    // return the passed-in chart reference
    return chart;
}