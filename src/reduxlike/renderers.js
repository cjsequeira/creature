'use strict'

// ****** App store rendering functions ******

// *** Our imports
import {
    getJournal,
    getUIProp,
    isObjChanged,
} from './store_getters.js';

import { roundTo } from '../utils.js';


// *** Function to be called when app store changes
// MUTABLE: calls functions that mutate the application beyond the app store
// takes: 
//  storeType
// returns undefined
export function mutable_renderFunction(storeType) {
    // time chart data buffer just updated?
    if (isObjChanged(storeType)('ui')('chartDataBufferTime')) {
        // MUTABLE: point time chart data to internal data buffer and proper x axis settings, then draw
        let creatureTimeChartHandle = getUIProp(storeType)('creature_time_chart');
        creatureTimeChartHandle.data = getUIProp(storeType)('chartDataBufferTime');
        creatureTimeChartHandle.options.scales.xAxes[0] = getUIProp(storeType)('chartXAxisBuffer');
        creatureTimeChartHandle.update();
    }

    // geo chart data buffer just updated?
    if (isObjChanged(storeType)('ui')('chartDataBufferGeo')) {
        // MUTABLE: point geo chart data to internal data buffer, then draw
        let creatureGeoChartHandle = getUIProp(storeType)('creature_geo_chart');
        creatureGeoChartHandle.data = getUIProp(storeType)('chartDataBufferGeo');
        creatureGeoChartHandle.update();
    }

    // journal just updated?
    if (isObjChanged(storeType)('remainder')('journal')) {
        // MUTABLE: update status box
        mutable_updateStatusBox(storeType);
    }
};

// update simulator status box with given HTML message
// MUTABLE: causes simulator status box to change
// takes:
//  storeType: store, as storeType
// returns undefined
function mutable_updateStatusBox(storeType) {
    // point to status box HTML DOM context
    let statusBox = getUIProp(storeType)('status_box');

    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // make an internal HTML buffer version of the journal
    const journalBufferHTMLType = getJournal(storeType).reduce(
        (accumHTML, thisEntry) =>
            accumHTML +
            'Time ' + roundTo(2)(thisEntry.timeFloatType).toString() +
            ': ' + thisEntry.msgStringType + '<br />',
        '');

    // MUTABLE: update content in status box using HTML buffer
    statusBox.innerHTML = journalBufferHTMLType;

    // MUTABLE: adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.4 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
};
