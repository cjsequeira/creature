'use strict'

// ****** App store definition and methods ******

// *** Our imports
import Chart from 'chart.js';

import {
    UPDATE_FREQ_SIM,
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    mutableRandGen_initRandGen,
} from '../sim/seeded_rand.js';


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
        timeStep: UPDATE_FREQ_SIM / 1000.0,
        savedClock: 0.0,

        // initial random number generator seed
        // REFACTOR to simply, "seed"
        //initSeed: mutableRandGen_initRandGen(Date.now()),
        initSeed: mutableRandGen_initRandGen(0),

        seed: 0,
    },

    // initial physTypeStore
    physTypeStore: [
        // Simple Creature Vinny
        {
            name: 'Vinny',
            color: '#0000ccff',
            id: 0,
            act: actAsSimpleCreature,
            conds: {
                // internal biology
                glucose: 50.0,
                neuro: 50.0,

                // behavior
                behavior: 'idling',
                behavior_request: null,

                // location
                x: WORLD_SIZE_X / 2.0,
                y: WORLD_SIZE_Y / 2.0,

                // heading, speed, acceleration
                heading: 0.0,
                speed: 1.0,
                accel: 0.0,
            },
        },

        // Simple Creature Eddie
        {
            name: 'Eddie',
            color: '#f7036cff',
            id: 1,
            act: actAsSimpleCreature,
            conds: {
                // internal biology
                glucose: 50.0,
                neuro: 50.0,

                // behavior
                behavior: 'idling',
                behavior_request: null,

                // location
                x: WORLD_SIZE_X / 2.0,
                y: WORLD_SIZE_Y / 2.0,

                // heading, speed, acceleration
                heading: 0.0,
                speed: 1.0,
                accel: 0.0,
            },
        },
    ],

    remainder: {
        // initial journal
        journal: [{
            timeFloatType: 0.0,
            msgStringType: 'Simulator init'
        }],

        // initial "saved physType" store
        savedPhysTypeStore: [{}],

        // initial "physTypes that passed comparison" store
        passedComparePhysTypeStore: [{}],
    },

    ui: {
        // creature chart time reference placeholder
        creature_time_chart: null,

        // creature chart geospatial reference placeholder
        creature_geo_chart: null,

        // status box reference placeholder
        status_box: null,
    },
};


// *** Initial parameters for creature charts 
// time-based chart parameters
const creature_time_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Vinny glucose',
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: true,
                fill: false,
                tension: 0.2,
                data: [],
                backgroundColor: '#0000ccff',
                borderColor: '#0000ccff',
                pointBackgroundColor: '#0000ccff',
                pointBorderColor: '#0000ccff',
                pointRadius: 1,
            },
            {
                label: 'Vinny neuro',
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: true,
                fill: false,
                tension: 0.2,
                data: [],
                backgroundColor: '#00cc00ff',
                borderColor: '#00cc00ff',
                pointBackgroundColor: '#00cc00ff',
                pointBorderColor: '#00cc00ff',
                pointRadius: 1,
            },

            {
                label: 'Eddie glucose',
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: true,
                fill: false,
                tension: 0.2,
                data: [],
                backgroundColor: '#f7036cff',
                borderColor: '#f7036cff',
                pointBackgroundColor: '#f7036cff',
                pointBorderColor: '#f7036cff',
                pointRadius: 1,
            },
            {
                label: 'Eddie neuro',
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: true,
                fill: false,
                tension: 0.2,
                data: [],
                backgroundColor: '#3289eaff',
                borderColor: '#3289eaff',
                pointBackgroundColor: '#3289eaff',
                pointBorderColor: '#3289eaff',
                pointRadius: 1,
            }
        ]
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
        datasets: [
            {
                label: 'Vinny',
                id: 0,
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: false,
                fill: false,
                tension: 0.2,
                pointRadius: 6,
                data: [],
                backgroundColor: [],
                borderColor: [],
                pointBackgroundColor: [],
                pointBorderColor: []
            },

            {
                label: 'Eddie',
                id: 1,
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: false,
                fill: false,
                tension: 0.2,
                pointRadius: 6,
                data: [],
                backgroundColor: [],
                borderColor: [],
                pointBackgroundColor: [],
                pointBorderColor: []
            },
        ]
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
    pointBorderColor: []
};


// *** Store initializer function
export const storeInit = (creature_time_chart_context) => (creature_geo_chart_context) =>
    (status_box_context) => (renderFunc) =>
    ({
        ...initial_store,

        // UI
        ui: {
            ...initial_store.ui,

            // time chart
            creature_time_chart: new Chart(creature_time_chart_context, creature_time_chart_params_init),

            // geo chart
            creature_geo_chart: new Chart(creature_geo_chart_context, creature_geo_chart_params_init),

            // status box
            status_box: status_box_context,
        },

        // set function to be called when the app store changes
        method_subscribed: renderFunc,
    });
