'use strict'

// ****** Imports ******
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// Our own stuff
import { storeInit } from './store_init.js';
import { ResolveRules } from './rulebook.js';
import { updateStatusBox } from './util.js';
import { behaviorStrings } from './creatures/simple_creature.js';


// ****** HTML page references ******
const conds_chart = 'page_conds_chart';
const creature_status_box = 'creature_status';


// ****** Simulator setup ******
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 750;


// ****** Main code ******
// *** Non-const code setup
let myStore = storeInit(
    document.getElementById(conds_chart).getContext('2d'),
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


    // *** Update chart
    // push values into chart data
    let index = 0;
    for (const cond in myStore.creature.conds) {
        if (typeof (myStore.creature.conds[cond]) != 'string') {
            myStore.chart_creature.data.datasets[index++].data.push({
                x: curTime,
                y: myStore.creature.conds[cond]
            });
        }
    }

    // revise chart x axis "window" if needed, for next chart update cycle
    let chart_creature_x = myStore.chart_creature.options.scales.xAxes[0].ticks;
    let chart_creature_xWidth = chart_creature_x.max - chart_creature_x.min;
    if (curTime > chart_creature_x.max) {
        let new_max = Math.ceil(curTime);
        let new_min = new_max - chart_creature_xWidth;

        myStore.chart_creature.options.scales.xAxes[0].ticks = {
            ...chart_creature_x,
            max: new_max,
            min: new_min
        };


        // remove first element in each data array if hidden
        myStore.chart_creature.data.datasets.forEach((dataset) => {
            let checkShift = dataset.data[0];
            if (checkShift.x < (new_min - chart_creature_x.StepSize)) {
                dataset.data.shift();
            }
        });
    }

    // update chart
    myStore.chart_creature.update();


    // *** Update world time
    curTime = curTime + timeStep;

}, browserTime);