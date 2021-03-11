'use strict'

// *** Reducer for remainder properties of storeType

// *** Our imports
import {
    ACTION_COMPARE_COMPARE_PHYSTYPE,
    ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_TIME_CHART_DATA,
    UI_NUM_TRAILS,
} from '../const_vals.js';

import {
    getJournal,
    getPhysTypeStore,
    getPassedComparePhysTypeStore,
    getSavedPhysTypeStore,
    getPhysTypeRootKey,
    getPhysTypeCond,
    getSimCurTime,
    getUIProp
} from './store_getters.js';

import {
    chartShiftData,
    concatSliceMap,
    fadeColors,
    splice,
} from '../utils.js';

import { actAsSimpleCreature } from '../creatures/simple_creature.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


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
        [ACTION_COMPARE_COMPARE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            // use current physTypeStore as the master list for comparing against
            //  saved physTypeStore, using the given comparison function
            //  and comparing ID by ID
            passedComparePhysTypeStore: getPhysTypeStore(storeType)
                // get array of current physTypes that pass the selection function
                // selectFunc signature is (physType) => bool
                .filter((ptToTest) => actionType.selectFunc(ptToTest))

                // with array of selected current physTypes, get array of
                //  current PhysTypes that pass the comparison function
                //  against the saved physTypes,
                //  as compared on an ID by ID basis!
                .filter((ptToCompare) =>
                    // compareFunc signature is (old physType) => (new physType) => bool 
                    actionType.compareFunc
                        // saved physType to compare against current
                        (
                            getSavedPhysTypeStore(storeType)
                                // find the saved physType with the same ID as the physType
                                // currently under comparison
                                .find((ptToFind) => ptToFind.id === ptToCompare.id)
                        )
                        // current physType to compare against saved
                        (ptToCompare)
                ),
        }),

        [ACTION_COMPARE_LOG_CHANGED_BEHAVIORS]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),

                ...getPassedComparePhysTypeStore(storeType).map(
                    (physType) => ({
                        timeFloatType: getSimCurTime(storeType),
                        msgStringType: getPhysTypeRootKey(physType)('name') +
                            ' ' + behaviorStrings[getPhysTypeCond(physType)('behavior')],
                    })
                ),
            ]
        }),

        [ACTION_COMPARE_SAVE_PHYSTYPE]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            savedPhysTypeStore: getPhysTypeStore(storeType),
        }),

        [ACTION_COMPARE_STOP_IF_FROZEN]: (storeType) => (_) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),

                ...getPhysTypeStore(storeType)
                    // filter physType store to find simple creatures
                    .filter((ptToTest1) => getPhysTypeRootKey(ptToTest1)('act') === actAsSimpleCreature)

                    // filter to find simple creatures with behavior of 'frozen'
                    .filter((ptToTest2) => getPhysTypeCond(ptToTest2)('behavior') === 'frozen')

                    // map filter results to journal entries
                    .map(
                        (ptToMap) => ({
                            timeFloatType: getSimCurTime(storeType),
                            msgStringType: getPhysTypeRootKey(ptToMap)('name') + ' is frozen; stopping sim',
                        })
                    )
            ]
        }),

        [ACTION_DO_NOTHING]: (storeType) => (_) => ({ ...storeType.remainder }),

        [ACTION_JOURNAL_ADD_ENTRY]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,
            journal: [
                ...getJournal(storeType),
                {
                    timeFloatType: getSimCurTime(storeType),
                    msgStringType: actionType.msgStringType,
                }
            ],
        }),

        [ACTION_PHYSTYPE_UPDATE_PHYSTYPE]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            // REFACTOR: revise code to handle situation where ID of given physType
            //  is not in the physType store! Suggest "splicing" into front of array
            physTypeStore: splice
                // delete one item...
                (1)

                // ... at the array index (as found by matching physType IDs)...
                (
                    getPhysTypeStore(storeType).findIndex(
                        (ptToFind) => ptToFind.id === actionType.physType.id)
                )

                // ... in the physTypeStore array...
                (getPhysTypeStore(storeType))

                // ... and replace with the given physType
                (actionType.physType),
        }),

        [ACTION_UI_ADD_GEO_CHART_DATA]: (storeType) => (_) =>
        ({
            ...storeType.remainder,

            creature_geo_chart:
                // update geo chart data associated with all physTypes in the store
                getPhysTypeStore(storeType).reduce((accumData, thisPhysType, i) =>
                    mutable_updateGeoChartData(
                        accumData,
                        i,
                        getPhysTypeRootKey(thisPhysType)('color'),
                        ({
                            x: getPhysTypeCond(thisPhysType)('x'),
                            y: getPhysTypeCond(thisPhysType)('y'),
                        })
                    ),
                    getUIProp(storeType)('creature_geo_chart')),
        }),

        [ACTION_UI_ADD_TIME_CHART_DATA]: (storeType) => (actionType) =>
        ({
            ...storeType.remainder,

            creature_time_chart:
                // update time chart data associated with all **simple creatures** in the store
                getPhysTypeStore(storeType)
                    .filter((filterPhysType) => getPhysTypeRootKey(filterPhysType)('act') === actAsSimpleCreature)
                    .reduce((accumData, chartPhysType, i) =>
                        mutable_updateTimeChartData(
                            accumData,
                            2 * i + actionType.offsetIntType,
                            getPhysTypeRootKey(chartPhysType)('name') + ' ' + actionType.condStringType,
                            ({
                                time: getSimCurTime(storeType),
                                value: getPhysTypeCond(chartPhysType)(actionType.condStringType),
                            })
                        ),
                        getUIProp(storeType)('creature_time_chart'))
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
