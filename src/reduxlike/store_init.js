'use strict'

// ****** App store setup ******

// *** Our imports
import Chart from 'chart.js';

import {
    UPDATE_FREQ_SIM,
    WORLD_SIZE_X,
    WORLD_SIZE_Y
} from '../const_vals.js';

import { actAsSimpleCreature } from '../creatures/simple_creature.js';
import { mutableRandGen_initRandGen } from '../sim/seeded_rand.js';


// *** Initial parameters for creature charts 
// time-based chart parameters
const creature_time_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [{
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
        }]
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
                label: 'Food 1',
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
            },
            {
                label: 'Food 2',
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


// *** Initial store
const initial_store = {
    // initial store locked / unlocked for writing
    locked: false,

    // simulator properties
    sim: {
        // is simulator running?
        running: false,

        // internal sim time info
        curTime: 0.0,
        timeStep: UPDATE_FREQ_SIM / 1000.0,
        savedClock: 0.0,

        // initial random number generator seed
        initSeed: 0,

        // initial random number generator seed
        /*
        initSeed: Date.now(),
        */
    },

    // initial array of store changes to render
    changes: [],

    // initial "saved physType" store
    savedPhysTypeStore: [{}],

    // initial physTypeStore
    physTypeStore: [
        // Simple Creature Vinny
        {
            name: 'Vinny',
            color: '#0000ccff',
            act: actAsSimpleCreature,
            conds: {
                // internal biology
                glucose: 50.0,
                neuro: 50.0,

                // behavior
                behavior: 'idling',
                behavior_request: null,


                // location
                x: 15.0,
                y: 15.0,

                // heading, speed, acceleration
                heading: 180.0 * Math.PI / 180.0,
                speed: 2.0,
                accel: 0.0,


                // location
                /*
                x: 18.0 * Math.random() + 1.0,
                y: 18.0 * Math.random() + 1.0,
                
                // heading, speed, acceleration
                heading: 2.0 * Math.PI * Math.random(),
                speed: Math.random(),
                accel: 0.0,
                */
            },
        },

        // Simple Creature Eddie
        {
            name: 'Eddie',
            color: '#f7036cff',
            act: actAsSimpleCreature,
            conds: {
                // internal biology
                glucose: 50.0,
                neuro: 50.0,

                // behavior
                behavior: 'idling',
                behavior_request: null,


                // location
                x: 5.0,
                y: 5.0,

                // heading, speed, acceleration
                heading: 0.0 * Math.PI / 180.0,
                speed: 2.0,
                accel: 0.0,


                // location
                /*
                x: 18.0 * Math.random() + 1.0,
                y: 18.0 * Math.random() + 1.0,

                // heading, speed, acceleration
                heading: 2.0 * Math.PI * Math.random(),
                speed: Math.random(),
                accel: 0.0,
                */
            },
        },

        // initial food element 1
        {
            name: 'Food 1',
            color: '#008800ff',
            act: (physType) => physType,
            conds: {

                x: 8.0,
                y: 8.0,


                // location
                /*
                x: 18.0 * Math.random() + 1.0,
                y: 18.0 * Math.random() + 1.0,
                */
            },
        },

        // initial food element 2
        {
            name: 'Food 2',
            color: '#008800ff',
            act: (physType) => physType,
            conds: {

                x: 12.0,
                y: 12.0,


                // location
                /*
                x: 18.0 * Math.random() + 1.0,
                y: 18.0 * Math.random() + 1.0,
                */
            },
        },
    ],

    // initial journal
    journal: [{
        time: 0.0,
        message: 'Simulator init'
    }],

    // initial UI elements
    ui: {
        // creature chart time reference placeholder
        creature_time_chart: null,

        // creature chart geospatial reference placeholder
        creature_geo_chart: null,

        // status box reference placeholder
        status_box: null,
    }
};


// *** Store initializer function
export const storeInit = (creature_time_chart_context, creature_geo_chart_context, status_box_context) =>
({
    ...initial_store,

    // Simulator
    sim: {
        ...initial_store.sim,

        // initRandGen just gives back the input seed
        initSeed: mutableRandGen_initRandGen(initial_store.sim.initSeed),
    },

    // UI
    ui: {
        ...initial_store.ui,

        // time chart
        creature_time_chart: new Chart(creature_time_chart_context, creature_time_chart_params_init),

        // geo chart
        creature_geo_chart: new Chart(creature_geo_chart_context, creature_geo_chart_params_init),

        // status box
        status_box: status_box_context
    }
});
