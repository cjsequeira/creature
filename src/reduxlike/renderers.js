'use strict'

// ****** App store rendering functions ******

// *** Our imports
import {
    getJournal,
    getUIProp,
    isObjChanged,
} from './store_getters.js';

import { roundTo } from '../utils.js';

import {
    HTML_BEHAVIOR_CLASS,
    HTML_BEHAVIOR_TAG,
    HTML_CREATURE_PHYSTYPE_CONTAINER,
} from '../const_vals.js';


// *** Function to be called when app store changes
// MUTABLE: calls functions that mutate the application beyond the app store
// takes: 
//  storeType
// returns undefined
export function imp_mutable_renderFunction(storeType) {
    // time chart data buffer just updated?
    if (isObjChanged(storeType)('ui', 'chartDataBufferTime')) {
        // MUTABLE: point time chart data to internal data buffer and proper x axis settings, then draw
        let creatureTimeChartHandle = getUIProp(storeType)('creature_time_chart');
        creatureTimeChartHandle.data = getUIProp(storeType)('chartDataBufferTime');
        creatureTimeChartHandle.options.scales.xAxes[0] = getUIProp(storeType)('chartXAxisBuffer');
        creatureTimeChartHandle.update();
    }

    // geo chart data buffer just updated?
    if (isObjChanged(storeType)('ui', 'chartDataBufferGeo')) {
        // MUTABLE: point geo chart data to internal data buffer, then draw
        let creatureGeoChartHandle = getUIProp(storeType)('creature_geo_chart');
        creatureGeoChartHandle.data = getUIProp(storeType)('chartDataBufferGeo');
        creatureGeoChartHandle.update();
    }

    // do we need to update creature behavior status boxes?
    if (isObjChanged(storeType)('ui', 'creature_behavior_boxes')) {
        // MUTABLE: update creature behavior status boxes
        imp_mutable_updateBehaviors(storeType);
    }

    // journal just updated?
    if (isObjChanged(storeType)('remainder', 'journal')) {
        // MUTABLE: update status box
        imp_mutable_updateStatusBox(storeType);
    }
};


// *** Other mutable updaters
// update behavior statuses
// MUTABLE: causes behavior status boxes to change
// takes:
//  storeType: store, as storeType
// returns undefined
function imp_mutable_updateBehaviors(storeType) {
    // get a handle to the creature behavior box objects in the storeType
    const behaviorBoxes = getUIProp(storeType)('creature_behavior_boxes');

    // get a list of current DOM behavior box objects
    const curChildren = Array.from(document.getElementById(HTML_CREATURE_PHYSTYPE_CONTAINER).children);

    // delete DOM behavior objects NO LONGER REPRESENTED in storeType
    curChildren
        // get a list of all DOM objects NOT represented in storeType
        .filter
        (
            (findChild) => behaviorBoxes.find((findBox) => findChild.id === findBox.id)
                === undefined
        )

        // for each of those objects...
        .forEach((thisChild) => {
            // remove each identified DOM behavior object
            document.getElementById(thisChild.id).remove();
        });

    // for each behavior box in the storeType...
    behaviorBoxes.forEach((thisBox) => {
        // is this behavior box ALREADY PRESENT on this web page?
        if (curChildren.find((thisChild) => thisBox.id === thisChild.id) !== undefined) {
            const node = document.getElementById(thisBox.id);

            // change color and text 
            node.style.backgroundColor = thisBox.color.slice(0, 7);
            node.textContent = thisBox.text;
        } else {
            // is this behavior box NOT ALREADY PRESENT on this web page?
            // add to DOM
            const node = document.createElement(HTML_BEHAVIOR_TAG);

            node.className = HTML_BEHAVIOR_CLASS;
            node.style.backgroundColor = thisBox.color.slice(0, 7);
            node.style.color = '#ffffff';
            node.id = thisBox.id;
            node.textContent = thisBox.text;

            document.getElementById(HTML_CREATURE_PHYSTYPE_CONTAINER).appendChild(node);
        }
    });
}

// update status box with given HTML message
// MUTABLE: causes simulator status box to change
// takes:
//  storeType: store, as storeType
// returns undefined
function imp_mutable_updateStatusBox(storeType) {
    // point to status box HTML DOM context
    const statusBox = getUIProp(storeType)('status_box');

    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // make an internal HTML buffer version of the journal
    const journalBufferHTMLType = getJournal(storeType).reduce(
        (accumHTML, thisEntry) =>
            accumHTML +
            'Time ' + roundTo(2, thisEntry.timeFloatType).toString() +
            ': ' + thisEntry.msgStringType + '<br />',
        '');

    // MUTABLE: update content in status box using HTML buffer
    statusBox.innerHTML = journalBufferHTMLType;

    // MUTABLE: adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.2 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}
