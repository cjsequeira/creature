'use strict'

// ****** Imports and Requires ******
import 'bootstrap';

import Chart from 'chart.js';


// ****** Creature setup ******
// initial conditions
const condsInit = {
    glucose: 50.0,
    neuro: 50.0,
    behavior: 'idling'
};

// behavior speeches
const behaviorStrings = {
    idling: "I'm is idling!",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz..."
};

// idling function
const ActIdling = (conds) => ({
    glucose: conds.glucose - 2.4,
    neuro: conds.neuro + 1.2,
    behavior: (conds.glucose < 30.0) 
                ? 'eating' 
                : (conds.neuro > 80.0)
                    ? 'sleeping'
                    : 'idling'
});

// eating function
const ActEating = (conds) => ({
    glucose: conds.glucose + 4.0,
    neuro: conds.neuro + 2.6,
    behavior: (conds.glucose > 45.0) ? 'idling' : 'eating'
});

// sleeping function
const ActSleeping = (conds) => ({
    glucose: conds.glucose - 1.0,
    neuro: conds.neuro - 2.2,
    behavior: (conds.neuro < 60.0) ? 'idling' : 'sleeping'
});

// dispatch function
const ActAsSimpleCreature = (conds) => {
    switch (conds.behavior) {
        case 'idling': return ActIdling(conds)
        case 'eating': return ActEating(conds)
        case 'sleeping': return ActSleeping(conds)
        default: return conds 
    }
};


// ****** Journal setup ******
const journalInit = {
    time: 0.0,
    entry: 'Simulator init'
}


// ****** Simulator setup ******
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 500;


// ****** Chart setup ******
// chart axis parameters
var xAxisWidth = 10.0;
var xStepSize = 1.0;
var theY = 0.0;

// array for charts
var charts = [];
var intStateChartId = 0;

// internal state chart
var ctx = document.getElementById('intStateChart').getContext('2d');
charts[intStateChartId] = new Chart(ctx, {
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
                    max: xAxisWidth,
                    stepSize: xStepSize
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
});


// ****** Main code ******
// *** Non-const code setup
let myCreature = {
    conds: condsInit
};

let curBehavior = '';

let myJournal = [journalInit];
let statusMessage = '';

// *** Main update loop 
var timerId = setInterval(() => {
    // *** Update creature
    myCreature.conds = ActAsSimpleCreature(myCreature.conds);

    // *** Update journal if creature behavior change
    curBehavior = behaviorStrings[myCreature.conds.behavior];
    if (myJournal[myJournal.length - 1].entry != curBehavior) {
        statusMessage = curBehavior;
        myJournal.push({time: curTime, entry: statusMessage});
    } else {
        statusMessage = '';
    }


    // *** Update charts
    // get handle to creature status box
    let csBox = $('#creature_status');

    // for each chart...
    charts.forEach((chart) => {
        // push values into chart data
        let index = 0;
        for (const cond in myCreature.conds) {
            if (typeof(myCreature.conds[cond]) != 'string') {
                chart.data.datasets[index].data.push({ x: curTime, y: myCreature.conds[cond] });
                index++;
            }
        }

        // revise chart x axis "window" if needed, for next chart update cycle
        if (curTime > xAxisWidth) {
            chart.options.scales.xAxes[0].ticks.max = Math.ceil(curTime);
            chart.options.scales.xAxes[0].ticks.min = Math.ceil(curTime) - xAxisWidth;

            // remove first element in each data array if hidden
            chart.data.datasets.forEach((dataset) => {
                let checkShift = dataset.data[0];
                if (checkShift.x < (Math.ceil(curTime) - xAxisWidth - xStepSize)) {
                    dataset.data.shift();
                }
            });
        }

        // update chart
        chart.update();
    });


    // *** Update simulator status box
    // get status box scroll bar information
    let statusScrollTop = csBox.scrollTop();
    let statusScrollHeight = csBox.prop('scrollHeight');
    let statusInnerHeight = csBox.innerHeight();

    // push message into status box if applicable
    if (statusMessage != ''){
        csBox.append('Time ' + 
            curTime + 
            ': ' + 
            behaviorStrings[myCreature.conds.behavior] + 
            '<br />');
    }

    // adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.5 * statusInnerHeight)) {
        csBox.scrollTop(statusScrollHeight);
    }


    // *** Update world time
    curTime = curTime + timeStep;
}, browserTime);