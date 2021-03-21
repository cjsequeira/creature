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
    getChangesList,
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

            changesList: [
                ...getChangesList(storeType)('ui'),
                'chartDataBufferTime',
                'chartDataBufferGeo',
            ],

            chartDataBufferTime:
                // is the given physType a simple creature?
                (getPhysTypeAct(actionType.physType) === actAsSimpleCreature)
                    // yes: add two new datasets into the time chart data buffer
                    ? {
                        ...getUIProp(storeType)('chartDataBufferTime'),

                        datasets:
                            [
                                ...getUIProp(storeType)('chartDataBufferTime').datasets,

                                // glucose data
                                {
                                    ...timeChartInitTemplate,
                                    label: getPhysTypeName(actionType.physType) + ' glucose',
                                    id: id,
                                },

                                // neuro data
                                {
                                    ...timeChartInitTemplate,
                                    label: getPhysTypeName(actionType.physType) + ' neuro',
                                    id: id,
                                },
                            ],
                    }

                    // no, not a simple creature: keep the time chart data buffer the same
                    : getUIProp(storeType)('chartDataBufferTime'),

            // add new dataset into the geo chart data buffer
            chartDataBufferGeo: {
                ...getUIProp(storeType)('chartDataBufferGeo'),

                datasets: [
                    ...getUIProp(storeType)('chartDataBufferGeo').datasets,

                    {
                        // start construction of new dataset using template
                        ...geoChartInitTemplate,

                        // set label and ID
                        label: getPhysTypeName(actionType.physType),
                        id: genPhysTypeAvailID(storeType)(0),

                        // point radius: foodType is small dot; otherwise make big dot
                        pointRadius:
                            (getPhysTypeAct(actionType.physType) === actAsFood)
                                ? 3
                                : 6,
                    },
                ]
            },

        }),

        [ACTION_PHYSTYPE_DELETE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.ui,

            changesList: [
                ...getChangesList(storeType)('ui'),
                'chartDataBufferTime',
                'chartDataBufferGeo',
            ],

            chartDataBufferTime: {
                ...getUIProp(storeType)('chartDataBufferTime'),

                datasets:
                    // filter out the datasets associated with the given physType ID
                    getUIProp(storeType)('chartDataBufferTime').datasets.filter
                        ((dsToTest) => dsToTest.id !== getPhysTypeID(actionType.physType)),
            },

            chartDataBufferGeo: {
                ...getUIProp(storeType)('chartDataBufferGeo'),

                datasets:
                    // filter out the dataset associated with the given physType ID
                    getUIProp(storeType)('chartDataBufferGeo').datasets.filter
                        ((dsToTest) => dsToTest.id !== getPhysTypeID(actionType.physType)),
            },
        }),

        [ACTION_UI_ADD_GEO_CHART_DATA]: (storeType) => (_) =>
        ({
            ...storeType.ui,

            changesList: [
                ...getChangesList(storeType)('ui'),
                'chartDataBufferGeo',
            ],

            chartDataBufferGeo:
            {
                ...getUIProp(storeType)('chartDataBufferGeo'),

                datasets:
                    // update geo chart data buffer associated with all physTypes in the store
                    getPhysTypeStore(storeType).map((thisPhysType, i) =>
                        updateGeoChartDataset(
                            // dataset to update: ASSUMED TO EXIST!
                            (getUIProp(storeType)('chartDataBufferGeo').datasets[i]),

                            // color to use
                            getPhysTypeColor(thisPhysType),

                            // data to add
                            ({
                                x: getPhysTypeCond(thisPhysType)('x'),
                                y: getPhysTypeCond(thisPhysType)('y'),
                            }),

                            // number of trails
                            (
                                // draw full number of trails for simple creatures
                                // draw one trail for all other physTypes
                                (getPhysTypeAct(thisPhysType) === actAsSimpleCreature)
                                    ? UI_NUM_TRAILS
                                    : 1
                            )
                        )
                    ),

            },
        }),

        [ACTION_UI_ADD_TIME_CHART_DATA]: (storeType) => (_) =>
        ({
            ...storeType.ui,

            changesList: [
                ...getChangesList(storeType)('ui'),
                'chartDataBufferTime',
            ],

            // REFACTOR to take more than two conditions, with arbitrary names!
            chartDataBufferTime:
            {
                ...getUIProp(storeType)('chartDataBufferTime'),

                // update time chart data associated with all **simple creatures** in the store
                datasets: getPhysTypeStore(storeType)
                    .filter((filterPt1) => getPhysTypeAct(filterPt1) === actAsSimpleCreature)
                    .map((thisPhysType, i) =>
                        [
                            // chart the glucose condition for this physType
                            updateTimeChartDataset(
                                // dataset to update: ASSUMED TO EXIST!
                                getUIProp
                                    (storeType)
                                    ('chartDataBufferTime')
                                    .datasets[2 * i + 0],

                                // legend label to use
                                // REFACTOR
                                getPhysTypeName(thisPhysType) + ' ' + 'glucose',

                                // minimum x below which data "falls off" chart,
                                getUIProp(storeType)('chartXAxisBuffer').ticks.min - 2.0,

                                // data tuple to add
                                ({
                                    time: getSimCurTime(storeType),
                                    value: getPhysTypeCond(thisPhysType)('glucose'),
                                })
                            ),

                            // chart the neuro condition for this physType
                            updateTimeChartDataset(
                                // dataset to update: ASSUMED TO EXIST!
                                getUIProp
                                    (storeType)
                                    ('chartDataBufferTime')
                                    .datasets[2 * i + 1],

                                // legend label to use
                                getPhysTypeName(thisPhysType) + ' ' + 'neuro',

                                // minimum x below which data "falls off" chart,
                                getUIProp(storeType)('chartXAxisBuffer').ticks.min - 2.0,

                                // data tuple to add
                                ({
                                    time: getSimCurTime(storeType),
                                    value: getPhysTypeCond(thisPhysType)('neuro'),
                                })
                            ),
                        ]

                        // flatten by one level
                    ).flat(1),
            },

            chartXAxisBuffer:
                // update time chart x axis based on current sim time
                updateTimeChartXAxis(
                    getUIProp(storeType)('chartXAxisBuffer'),
                    getSimCurTime(storeType)
                ),
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
// update specific time history chart dataset
// takes: 
//  inDataSet: time chart ChartJS dataset to use
//  labelStringType: data label for legend, as string
//  minXFloatType: minimum x beyond which to drop data, as float
//  timeValFloatTuple: floating-point data point, as {time, value}
// returns ChartJS dataset type
function updateTimeChartDataset(inDataSet, labelStringType, minXFloatType, timeValFloatTuple) {
    // return dataset with data added and shifting-out of data that have "fallen off" 
    //  the left side of the chart
    return {
        ...inDataSet,

        label: labelStringType,

        // add in new data while shifting out data that has now
        //  "fallen off" the left side of the chart
        data:
            chartShiftData
                (minXFloatType)
                ([
                    ...inDataSet.data,

                    {
                        x: timeValFloatTuple.time,
                        y: timeValFloatTuple.value,
                    }
                ]),
    };
}

// update specific time history chart x axis
// takes: 
//  inXAxis: time chart ChartJS x axis to use
//  timeFloat: time to use for review, as float
// returns ChartJS dataset type
function updateTimeChartXAxis(inXAxis, timeFloat) {
    // calculate appropriate time chart x axis "window"
    const chart_x = inXAxis.ticks;                                  // shorthand for x-axis ticks
    const chart_xWidth = chart_x.max - chart_x.min;                 // extents of x axis
    const new_max = Math.ceil(timeFloat - chart_x.stepSize);        // potential different x axis max           
    const new_min = new_max - chart_xWidth;                         // potential different x axis min

    // return updated axes 
    return {
        ...inXAxis,

        ticks: {
            ...chart_x,

            // assign x axis min and max - shifted rightward if indicated by new_min and new_max
            max: (chart_x.max < new_max) ? new_max : chart_x.max,
            min: (chart_x.min < new_min) ? new_min : chart_x.min,
        },
    };
}

// update specific geospatial chart dataset
// takes: 
//  inDataSet: geo chart ChartJS dataset to use
//  colorStringType: color for data, as string
//  xyFloatTuple: floating-point datapoint to add, as {x, y}
//  numTrailsIntType: number of trailing dots to draw
// returns ChartJS dataset type
function updateGeoChartDataset(inDataSet, colorStringType, xyFloatTuple, numTrailsIntType) {
    // all of our slice limits are -numTrailsIntType, so define a shorthand 
    //  function with that limit built in 
    const concatSliceTrailsMap = concatSliceMap(-numTrailsIntType);

    // define a shorthand function specific to concatenating a color 
    //  and mapping color list to a fade
    const concatAndFade = concatSliceTrailsMap(fadeColors)(colorStringType);

    // return a ChartJS dataset object with data and colors added, 
    //  then sliced to max length, then color-faded
    return {
        ...inDataSet,

        data: concatSliceTrailsMap
            (x => x)                            // identity function for mapping
            ({                                  // concatenate xyFloatTuple
                x: xyFloatTuple.x,
                y: xyFloatTuple.y
            })
            ([inDataSet.data]),                 // array: current chart xy data

        backgroundColor:
            concatAndFade([inDataSet.backgroundColor]),

        borderColor:
            concatAndFade([inDataSet.borderColor]),

        pointBackgroundColor:
            concatAndFade([inDataSet.pointBackgroundColor]),

        pointBorderColor:
            concatAndFade([inDataSet.pointBorderColor]),
    };
}
