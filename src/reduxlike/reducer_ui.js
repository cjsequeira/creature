'use strict'

// *** Reducer for UI properties of storeType

// *** Our imports
import {
    geoChartInitTemplate,
    timeChartInitTemplate,
} from './app_store.js';

import {
    ACTION_PHYSTYPE_ADD_PHYSTYPE,
    ACTION_PHYSTYPE_DELETE_PHYSTYPE,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_TIME_CHART_DATA,
    UI_NUM_TRAILS,
} from '../const_vals.js';

import {
    getPhysTypeColor,
    getPhysTypeID,
    getPhysTypeStore,
    getPhysTypeCond,
    getSimCurTime,
    getUIProp,
    getPhysTypeAct,
    getPhysTypeName,
    genPhysTypeAvailID
} from './store_getters.js';

import {
    chartShiftData,
    concatSliceMap,
    fadeColors,
} from '../utils.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';
import { actAsFood } from '../phystypes/food_type.js';


// *** UI reducer 
// reducer for "ui" property of storeType
// takes:
//  inStoreType: store to use as template for reduction, as storeType 
//  inActionType: action to use for reduction, as actionType
// returns storeType "ui" property object
export const uiReducer = (inStoreType) => (inActionType) =>
    // list of "mini" reducer functions
    // each function is associated with an action type, given in brackets
    ({
        // adding a new physType? Allocate space for the data in the charts
        [ACTION_PHYSTYPE_ADD_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.ui,

            // push new datasets into the time chart data if applicable, 
            //  then get the chart object reference
            creature_time_chart:
                ((chart) => {
                    const id = genPhysTypeAvailID(storeType)(0);

                    if (getPhysTypeAct(actionType.physType) === actAsSimpleCreature) {
                        chart.data.datasets.push
                            (
                                {
                                    ...timeChartInitTemplate,
                                    label: getPhysTypeName(actionType.physType),
                                    id: id,
                                },
                                {
                                    ...timeChartInitTemplate,
                                    label: getPhysTypeName(actionType.physType),
                                    id: id,
                                }
                            );
                    }

                    return chart;
                })
                    // apply anonymous function to update the chart passed in below
                    (getUIProp(storeType)('creature_time_chart')),

            // push new dataset into the geo chart data, then get the chart object reference
            creature_geo_chart:
                ((chart) => {
                    const id = genPhysTypeAvailID(storeType)(0);

                    chart.data.datasets.push
                        ({
                            ...geoChartInitTemplate,

                            label: getPhysTypeName(actionType.physType),
                            id: id,

                            // foodType is small dot; otherwise make big dot
                            pointRadius:
                                (getPhysTypeAct(actionType.physType) === actAsFood)
                                    ? 3
                                    : 6,
                        });

                    return chart;
                })
                    // apply anonymous function to update the chart passed in below
                    (getUIProp(storeType)('creature_geo_chart')),
        }),

        [ACTION_PHYSTYPE_DELETE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.ui,

            creature_time_chart:
                ((chart) => {
                    chart.data.datasets = chart.data.datasets.filter(
                        (dsToTest) => dsToTest.id !== actionType.idIntType
                    );

                    return chart;
                })
                    // apply anonymous function to update the chart passed in below
                    (getUIProp(storeType)('creature_time_chart')),

            creature_geo_chart:
                ((chart) => {
                    chart.data.datasets = chart.data.datasets.filter(
                        (dsToTest) => dsToTest.id !== actionType.idIntType
                    );

                    return chart;
                })
                    // apply anonymous function to update the chart passed in below
                    (getUIProp(storeType)('creature_geo_chart')),
        }),

        [ACTION_UI_ADD_GEO_CHART_DATA]: (storeType) => (_) =>
        ({
            ...storeType.ui,

            creature_geo_chart:
                // update geo chart data associated with all physTypes in the store
                getPhysTypeStore(storeType).reduce((accumData, thisPhysType, i) =>
                    mutable_updateGeoChartData(
                        accumData,
                        i,
                        getPhysTypeColor(thisPhysType),
                        ({
                            x: getPhysTypeCond(thisPhysType)('x'),
                            y: getPhysTypeCond(thisPhysType)('y'),
                        })
                    ),
                    getUIProp(storeType)('creature_geo_chart')),
        }),

        [ACTION_UI_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
        ({
            ...storeType.ui,

            creature_time_chart:
                // update time chart data associated with all **simple creatures** in the store
                getPhysTypeStore(storeType)
                    .filter(
                        (filterPhysType) => getPhysTypeAct(filterPhysType) === actAsSimpleCreature
                    )
                    .reduce((accumData, chartPhysType, i) =>
                        mutable_updateTimeChartData(
                            accumData,
                            2 * i + actionType.offsetIntType,
                            getPhysTypeName(chartPhysType) + ' ' + actionType.condStringType,
                            ({
                                time: getSimCurTime(storeType),
                                value: getPhysTypeCond(chartPhysType)(actionType.condStringType),
                            })
                        ),
                        getUIProp(storeType)('creature_time_chart'))
        }),

        // use inActionType.type as an entry key into the key-val list above
        // key is used to select a function that takes a storeType object  
        //  and actionType and returns a storeType "ui" prop obj
        // if no key-val matches the entry key, return a func that echoes 
        //  the given storeType "ui" property object
    }[inActionType.type] || ((storeType) => (_) => ({ ...storeType.ui })))
        // evaluate the function with the storeType "ui" property object 
        //  and actionType to get a storeType "ui" property object
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
function mutable_updateTimeChartData(chart, dataIndexIntType, labelStringType, timeValFloatTuple) {
    // if given data index is beyond the existing number of data blocks, ignore the update request
    if (dataIndexIntType > (chart.data.datasets.length - 1)) {
        return chart;
    }

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
    // if given data index is beyond the existing number of data blocks, ignore the update request
    if (dataIndexIntType > (chart.data.datasets.length - 1)) {
        return chart;
    }

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
