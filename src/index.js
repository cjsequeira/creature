'use strict'

// ****** Imports ******
// Styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// Our own stuff
import storeInit from './store_init.js';
import updateStatusBox from './util.js';


// ****** HTML page references ******
const conds_chart = 'page_conds_chart';
const creature_status_box = 'creature_status';


// ****** Creature setup ******
// behavior speeches
const behaviorStrings = {
    idling: "I'm is idling! Blah...",
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


// ****** Simulator setup ******
var curTime = 0.0;
var timeStep = 1.0;
var browserTime = 750;


// ****** Main code ******
// *** Non-const code setup
let myStore = storeInit(
    document.getElementById(conds_chart).getContext('2d'),
    document.getElementById(creature_status_box));
let curBehavior = '';


// *** Main update loop 
let timerId = setInterval(() => {
    // *** Update creature
    myStore.creature = ActAsSimpleCreature(myStore.creature);


    // *** Update journal if creature behavior change
    curBehavior = behaviorStrings[myStore.creature.behavior];
    if (myStore.journal[myStore.journal.length - 1].entry != curBehavior) {
        updateStatusBox(myStore.box_status, 'Time ' + curTime + ": " + curBehavior);
        myStore.journal = [...myStore.journal, { time: curTime, entry: curBehavior }];
    }


    // *** Update chart
    // push values into chart data
    let index = 0;
    for (const cond in myStore.creature) {
        if (typeof (myStore.creature[cond]) != 'string') {
            myStore.chart_creature.data.datasets[index].data.push({
                x: curTime,
                y: myStore.creature[cond]
            });
            index++;
        }
    }

    // revise chart x axis "window" if needed, for next chart update cycle
    let chart_creature_x = myStore.chart_creature.options.scales.xAxes[0].ticks;
    let chart_creature_xWidth = chart_creature_x.max - chart_creature_x.min;
    if (curTime > chart_creature_x.max) {
        let new_max = Math.ceil(curTime);
        myStore.chart_creature.options.scales.xAxes[0].ticks = {
            ...chart_creature_x,
            max: new_max,
            min: new_max - chart_creature_xWidth
        };


        // remove first element in each data array if hidden
        myStore.chart_creature.data.datasets.forEach((dataset) => {
            let checkShift = dataset.data[0];
            if (checkShift.x < (new_max - chart_creature_xWidth - chart_creature_x.StepSize)) {
                dataset.data.shift();
            }
        });
    }

    // update chart
    myStore.chart_creature.update();


    // *** Update world time
    curTime = curTime + timeStep;
}, browserTime);

