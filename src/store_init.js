'use strict'

// ****** App store setup ******

// *** Our imports
import Chart from 'chart.js';
import { ActAsSimpleCreature } from './creatures/simple_creature.js';


// *** Initial parameters for creature conditions charts parameters
// Time-based parameters
const creature_time_chart_params_init = {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'glucose',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            backgroundColor: '#0000cc',
            borderColor: '#0000cc',
            tension: 0.2,
            data: []
        },
        {
            label: 'neuro',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            backgroundColor: '#00cc00',
            borderColor: '#00cc00',
            tension: 0.2,
            data: []
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

// Geospatial parameters
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
                backgroundColor: '#ec56cd',
                borderColor: '#ec56cd',
                tension: 0.2,
                data: []
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
const store = {
    // Initial creature
    creature: {
        name: 'Vinny the Simple Creature',
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
        },
        seed: Date.now()
    },

    // Initial journal
    journal: [{
        time: 0.0,
        entry: 'Simulator init'
    }],

    // Creature chart time reference placeholder
    creature_time_chart: null,

    // Creature chart geospatial reference placeholder
    creature_geo_chart: null,

    // Status box reference placeholder
    box_status: null,
};


export const storeInit = (creature_time_chart_context, creature_geo_chart_context, box_status_context) => ({
    ...store,
    creature_time_chart: new Chart(
        creature_time_chart_context,
        {
            ...creature_time_chart_params_init,
            options: {
                ...creature_time_chart_params_init.options,
                title: {
                    ...creature_time_chart_params_init.options.title,
                    text: creature_time_chart_params_init.options.title.text + ': ' + store.creature.name,
                },
            }
        },
    ),
    creature_geo_chart: new Chart(
        creature_geo_chart_context,
        {
            ...creature_geo_chart_params_init,
            options: {
                ...creature_geo_chart_params_init.options,
                title: {
                    ...creature_geo_chart_params_init.options.title,
                    text: creature_geo_chart_params_init.options.title.text + ': ' + store.creature.name,
                },
            }
        },
    ),
    box_status: box_status_context,
});