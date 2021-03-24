'use strict'

// ****** App store definition and methods ******

// *** Our imports
import Chart from 'chart.js';

import {
    SIM_TIME_STEP,
    UI_BORDER_WIDTH,
    UI_CREATURE_RADIUS,
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';


// *** Initial app store
const initial_store = {
    // method to be called after action dispatch is completed
    // expected signature: (storeType) => undefined
    method_subscribed: function (storeType) { },

    // simulator properties
    sim: {
        // is simulator running?
        running: false,

        // internal sim time info
        curTime: 0.0,
        timeStep: SIM_TIME_STEP,

        // random number generator seed
        seed: Date.now(),
        //seed: 0,
    },

    // initial physTypeStore
    physTypeStore: [],

    remainder: {
        // initial journal
        journal:
            [{
                timeFloatType: 0.0,
                msgStringType: 'Simulator init'
            }],

        // initial "saved physType" store
        savedPhysTypeStore: [{}],

        // initial "physTypes that passed comparison" store
        passedComparePhysTypeStore: [{}],
    },

    ui: {
        // empty list of UI objects just changed
        changesList: [],

        // creature time chart reference placeholder
        creature_time_chart: null,

        // creature geospatial chart reference placeholder
        creature_geo_chart: null,

        // creature behavior div info
        creature_behavior_div: null,
        creature_behavior_boxes: [],

        // status box reference placeholder
        status_box: null,

        // creature time chart data buffer and x axis settings buffer,
        //  and sim clock time of MOST-RECENT DATA ADDITION
        chartDataBufferTime: null,
        chartXAxisBuffer: null,
        chartTimeLastClock: 0.0,

        // creature geo chart data buffer
        chartDataBufferGeo: null,
    },
};


// *** Initial parameters for creature charts 
// time-based chart parameters
const creature_time_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [],
    },
    options: {
        animation: {
            duration: 150,
        },
        title: {
            display: true,
            fontSize: 14,
            position: 'top',
            text: 'Internal Conditions'
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                id: 'my-x-axis',
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: 'Time'
                },
                ticks: {
                    min: 0.0,
                    max: 20.0,
                    stepSize: 1.0
                }
            }],
            yAxes: [{
                id: 'my-y-axis',
                scaleLabel: {
                    display: true,
                    labelString: 'Value'
                },
                ticks: {
                    min: 0.0,
                    max: 100.0
                }
            }]
        }
    }
};

// geospatial chart parameters
const creature_geo_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [],
    },
    options: {
        animation: {
            duration: 100,
        },
        title: {
            display: true,
            fontSize: 14,
            position: 'top',
            text: 'Location'
        },
        legend: {
            display: false
        },
        tooltips: {
            enabled: false
        },
        scales: {
            xAxes: [{
                id: 'my-x-axis',
                type: 'linear',
                scaleLabel: {
                    display: true,
                    labelString: 'x'
                },
                ticks: {
                    min: 0.0,
                    max: WORLD_SIZE_X,
                    stepSize: 1.0
                }
            }],
            yAxes: [{
                id: 'my-y-axis',
                scaleLabel: {
                    display: true,
                    labelString: 'y'
                },
                ticks: {
                    min: 0.0,
                    max: WORLD_SIZE_Y,
                    stepSize: 1.0
                }
            }]
        }
    }
};

// Time chart init template
export const timeChartInitTemplate =
{
    label: 'Template',
    xAxisId: 'my-x-axis',
    yAxisId: 'my-y-axis',
    showLine: true,
    fill: false,
    tension: 0.2,
    data: [],
    backgroundColor: '#cc0000ff',
    borderColor: '#cc0000ff',
    pointBackgroundColor: '#cc0000ff',
    pointBorderColor: '#cc0000ff',
    pointRadius: 1,
};

// Geo chart init template
export const geoChartInitTemplate =
{
    label: 'Template',
    xAxisId: 'my-x-axis',
    yAxisId: 'my-y-axis',
    showLine: false,
    fill: false,
    tension: 0.2,
    pointRadius: 3,
    data: [],
    backgroundColor: [],
    borderColor: [],
    pointBackgroundColor: [],
    pointBorderColor: [],
    pointRadius: UI_CREATURE_RADIUS,
    pointBorderWidth: UI_BORDER_WIDTH,
};


// *** Store initializer function
// SIDE EFFECT: creates new ChartJS objects
export const sideEffect_storeInit =
    (
        creature_time_chart_context,
        creature_geo_chart_context,
        behavior_div_context,
        status_box_context,
        renderFunc
    ) =>
    ({
        ...initial_store,

        // UI
        ui: {
            ...initial_store.ui,

            // SIDE EFFECT
            // time chart HTML DOM object
            creature_time_chart: new Chart(creature_time_chart_context, creature_time_chart_params_init),

            // SIDE EFFECT
            // geo chart HTML DOM object
            creature_geo_chart: new Chart(creature_geo_chart_context, creature_geo_chart_params_init),

            // behavior div HTML DOM object
            creature_behavior_div: behavior_div_context,

            // status box HTML DOM object
            status_box: status_box_context,

            // time chart data buffer and x axis settings buffer
            chartDataBufferTime: creature_time_chart_params_init.data,
            chartXAxisBuffer: creature_time_chart_params_init.options.scales.xAxes[0],

            // geo chart data buffer
            chartDataBufferGeo: creature_geo_chart_params_init.data,
        },

        // set function to be called when the app store changes
        method_subscribed: renderFunc,
    });
