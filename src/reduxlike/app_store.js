'use strict'

// ****** App store definition and methods ******

// *** Our imports
import Chart from 'chart.js';

import { action_doNothing } from './action_creators.js';

import {
    UPDATE_FREQ_SIM,
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from '../const_vals.js';

import { actAsSimpleCreature } from '../phystypes/simple_creature.js';

import {
    mutableRandGen_initRandGen,
    mutableRandGen_seededRand
} from '../sim/seeded_rand.js';
import { event_updatePhysType } from '../rulebook/event_creators.js';


// *** Initial app store
const initial_store = {
    // method to be called after action dispatch is completed
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
        initSeed: mutableRandGen_initRandGen(Date.now()),
        //initSeed: mutableRandGen_initRandGen(0),
    },

    remainder: {
        // initial store locked / unlocked for writing
        locked: false,

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
                    x: mutableRandGen_seededRand(1.0, 18.0),
                    y: mutableRandGen_seededRand(1.0, 18.0),

                    // heading, speed, acceleration
                    heading: 2.0 * Math.PI * mutableRandGen_seededRand(0.0, 1.0),
                    speed: mutableRandGen_seededRand(0.0, 1.0),
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
                    x: mutableRandGen_seededRand(1.0, 18.0),
                    y: mutableRandGen_seededRand(1.0, 18.0),

                    // heading, speed, acceleration
                    heading: 2.0 * Math.PI * mutableRandGen_seededRand(0.0, 1.0),
                    speed: mutableRandGen_seededRand(0.0, 1.0),
                    accel: 0.0,
                },
            },

            // initial food element 1
            {
                name: 'Food 1',
                color: '#008800ff',
                id: 2,
                act: (_) => (physType) => event_updatePhysType(physType),
                conds: {
                    // location
                    x: mutableRandGen_seededRand(1.0, 18.0),
                    y: mutableRandGen_seededRand(1.0, 18.0),
                },
            },

            // initial food element 2
            {
                name: 'Food 2',
                color: '#008800ff',
                id: 3,
                act: (_) => (physType) =>  event_updatePhysType(physType),
                conds: {
                    // location
                    x: mutableRandGen_seededRand(1.0, 18.0),
                    y: mutableRandGen_seededRand(1.0, 18.0),
                },
            },
        ],

        // initial journal
        journal: [{
            timeFloatType: 0.0,
            msgStringType: 'Simulator init'
        }],

        // initial "saved physType" store
        savedPhysTypeStore: [{}],

        // initial "physTypes that passed comparison" store
        passedComparePhysTypeStore: [{}],

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


// *** Store initializer function
export const storeInit = (creature_time_chart_context) => (creature_geo_chart_context) =>
    (status_box_context) => (renderFunc) =>
    ({
        ...initial_store,

        // UI
        remainder: {
            ...initial_store.remainder,

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
