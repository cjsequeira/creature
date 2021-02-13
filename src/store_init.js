'use strict'

// ****** App store setup ******

// Our imports
import Chart from 'chart.js';
import { ActAsSimpleCreature } from './creatures/simple_creature.js';
import { ActAsSimpleCreature_Crazy } from './creatures/simple_creature_crazy.js';


// Initial creature conditions chart parameters
const chart_creature_params_init = {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Glucose',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            backgroundColor: '#0000cc',
            borderColor: '#000099',
            tension: 0.2,
            data: []
        },
        {
            label: 'Neuro',
            xAxisId: 'my-x-axis',
            yAxisId: 'my-y-axis',
            showLine: true,
            fill: false,
            backgroundColor: '#00cc00',
            borderColor: '#009900',
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
}

// Initial store
const store = {
    // Initial creature
    creature: {
        name: 'Vinny the Simple Creature',
        act: ActAsSimpleCreature,
        conds: {
            glucose: 50.0,
            neuro: 50.0,
            behavior: 'idling',
            behavior_request: null
        },
        seed: 0
    },

    // Initial journal
    journal: [{
        time: 0.0,
        entry: 'Simulator init'
    }],

    // Creature chart reference placeholder
    chart_creature: null,

    // Status box reference placeholder
    box_status: null,
};


export const storeInit = (chart_creature_context, box_status_context) => ({
    ...store,
    chart_creature: new Chart(
        chart_creature_context, 
        {
            ...chart_creature_params_init,
            options: {
                ...chart_creature_params_init.options,
                title: {
                    ...chart_creature_params_init.options.title,
                    text: chart_creature_params_init.options.title.text + ': ' + store.creature.name,
                },
            }
        },
    ),
    box_status: box_status_context,
});