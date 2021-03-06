'use strict'

// ****** App store rendering functions ******

// *** Our imports
import { UI_NUM_TRAILS } from '../const_vals.js';

import {
    chartShiftData,
    concatSliceMap,
    fadeColors,
} from '../utils.js';


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


// *** App store UI rendering functions
// update time history chart data
// MUTABLE: mutates "chart" argument
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
export function mutable_updateGeoChartData(chart, dataIndexIntType, colorStringType, xyFloatTuple) {
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
export function mutable_updateStatusBox(statusBox, msgStringType) {
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
