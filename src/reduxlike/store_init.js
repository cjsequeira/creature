'use strict'

// ****** App store setup ******

// *** Our imports
import Chart from 'chart.js';
import { ActAsSimpleCreature } from '../creatures/simple_creature.js';
import { chartParamsUseTitle } from '../util.js';


// *** Initial parameters for creature charts 
// time-based parameters
const creature_time_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'glucose',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            tension: 0.2,
            data: [],
            backgroundColor: '#0000ccff',
            borderColor: '#0000ccff',
            pointBackgroundColor: '#0000ccff',
            pointBorderColor: '#0000ccff'
        },
        {
            label: 'neuro',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            tension: 0.2,
            data: [],
            backgroundColor: '#00cc00ff',
            borderColor: '#00cc00ff',
            pointBackgroundColor: '#00cc00ff',
            pointBorderColor: '#00cc00ff'
        }]
    },
    options: {
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
                    max: 50.0,
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

// geospatial parameters
const creature_geo_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'position',
                xAxisId: 'my-x-axis',
                yAxisId: 'my-y-axis',
                showLine: true,
                fill: false,
                tension: 0.2,
                pointRadius: 6,
                data: [],
                backgroundColor: [],
                borderColor: [],
                pointBackgroundColor: [],
                pointBorderColor: []
            }]
    },
    options: {
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
                    max: 20.0,
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
                    max: 20.0,
                    stepSize: 1.0
                }
            }]
        }
    }
};


// *** Initial store
const initialStore = {
    // is simulator running?
    sim: {
        running: false,
        curTime: 0.0,
        timeStep: 1.0,
    },

    // array of store changes to render
    changes: [],

    // initial creature with no prior rule applied
    // type: physContainerType
    creatureStore: {
        // the last rule node applied
        lastRule: {},

        // the creature
        // type: creatureType
        physType: {
            name: 'Vinny',
            act: ActAsSimpleCreature,
            conds: {
                // internal biology
                glucose: 50.0,
                neuro: 50.0,

                // behavior
                behavior: 'idling',
                behavior_request: null,

                // location
                x: 15.0 * Math.random() + 4.0,
                y: 15.0 * Math.random() + 4.0,

                // heading, speed, acceleration
                heading: 2 * Math.PI * Math.random(),
                speed: Math.random() - 0.5,
                accel: 0.0,

                // heading, speed, acceleration
                heading: 2.0 * Math.PI * Math.random(),
                speed: Math.random(),
                accel: 0.0,
            },
            seed: Date.now(),
        },
    },

    // initial journal
    journal: [{
        time: 0.0,
        message: 'Simulator init'
    }],

    // UI elements
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
export const storeInit = (creature_time_chart_context, creature_geo_chart_context, status_box_context) => ({
    ...initialStore,
    ui: {
        // time chart with creature name in title
        creature_time_chart: new Chart(
            creature_time_chart_context,
            chartParamsUseTitle(
                creature_time_chart_params_init,
                creature_time_chart_params_init.options.title.text +
                ': ' + initialStore.creatureStore.physType.name)
        ),

        // geo chart with creature name in title
        creature_geo_chart: new Chart(
            creature_geo_chart_context,
            chartParamsUseTitle(
                creature_geo_chart_params_init,
                creature_geo_chart_params_init.options.title.text
                + ': ' + initialStore.creatureStore.physType.name)
        ),

        // status box
        status_box: status_box_context
    }
});