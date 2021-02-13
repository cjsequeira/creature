'use strict'

// ****** Main code ******

// *** Imports
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// Our own stuff
import { storeInit } from './store_init.js';
import { updateStatusBox } from './util.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Simulator setup 
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 750;


// *** Simple status message object
const behaviorStrings = {
    idling: "I'm is idling! Blah...",
    eating: "I'm is eating!! Nom...",
    sleeping: "I'm is sleeping! Zzzz...",
    wandering: "I'm is wandering! Wiggity whack!",
    frozen: "I'm is frozen! Brrrr....."
};


// *** Non-const code setup
let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

let curBehavior = '';


// *** Main update loop 
let timerId = setInterval(() => {
    // *** Update creature
    myStore.creature = myStore.creature.act(myStore.creature);


    // *** Update journal if creature behavior has just changed
    curBehavior = behaviorStrings[myStore.creature.conds.behavior];
    if (myStore.journal[myStore.journal.length - 1].entry != curBehavior) {
        updateStatusBox(myStore.box_status, 'Time ' + curTime + ": " + curBehavior);
        myStore.journal = [...myStore.journal, { time: curTime, entry: curBehavior }];
    }


    // *** Update time history chart
    // push values into chart data
    myStore.creature_time_chart.data.datasets[0].data.push({
        x: curTime,
        y: myStore.creature.conds.glucose
    });
    myStore.creature_time_chart.data.datasets[1].data.push({
        x: curTime,
        y: myStore.creature.conds.neuro
    });

    // revise time history chart x axis "window" if needed, for next chart update cycle
    let creature_time_chart_x = myStore.creature_time_chart.options.scales.xAxes[0].ticks;
    let creature_time_chart_xWidth = creature_time_chart_x.max - creature_time_chart_x.min;
    if (curTime > creature_time_chart_x.max) {
        let new_max = Math.ceil(curTime);
        let new_min = new_max - creature_time_chart_xWidth;

        myStore.creature_time_chart.options.scales.xAxes[0].ticks = {
            ...creature_time_chart_x,
            max: new_max,
            min: new_min
        };

        // remove first element in each data array if hidden
        myStore.creature_time_chart.data.datasets.forEach((dataset) => {
            let checkShift = dataset.data[0];
            if (checkShift.x < (new_min - creature_time_chart_x.StepSize)) {
                dataset.data.shift();
            }
        });
    }

    // redraw time history chart
    myStore.creature_time_chart.update();


    // *** Update geospatial chart
    // push values into chart data
    myStore.creature_geo_chart.data.datasets[0].data.push({
        x: myStore.creature.conds.x,
        y: myStore.creature.conds.y
    });

    // remove earlier values as the dataset gets long
    if (myStore.creature_geo_chart.data.datasets[0].data.length > 5) {
        myStore.creature_geo_chart.data.datasets[0].data.shift();
    }

    // redraw geospatial chart
    myStore.creature_geo_chart.update();


    // *** Update world time
    curTime = curTime + timeStep;

}, browserTime);