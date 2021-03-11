'use strict'

import { roundTo } from '../utils.js';
import { getJournal, getUIProp } from './store_getters.js';

// ****** App store rendering functions ******

// *** Function to be called when app store changes
// MUTABLE: may apply functions that mutate the application beyond the app store
// ignores return values from renderFunc applications
// takes: 
//  don't care
// returns undefined
export function mutable_renderFunction(_) {
    // render time chart and geo chart
    this.method_getUIProp('creature_time_chart').update();
    this.method_getUIProp('creature_geo_chart').update();

    // update status box
    mutable_updateStatusBox(this.storeObj);
};

// update simulator status box with given HTML message
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
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
};
