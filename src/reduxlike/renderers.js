'use strict'

// ****** App store rendering functions ******

// *** Function to be called when app store changes
// MUTABLE: may apply functions that mutate the application beyond the app store
// ignores return values from renderFunc applications
// takes: 
//  don't care
// returns undefined
export function mutable_renderFunction(_) {
    // render time chart and geo chart
    this.storeObj.remainder.creature_time_chart.update();
    this.storeObj.remainder.creature_geo_chart.update();

    // update status box
    mutable_updateStatusBox(this.storeObj);
};


// *** App store UI rendering functions
// update simulator status box with given HTML message
// takes:
//  storeObj: object containing public app store state
// returns undefined
function mutable_updateStatusBox(storeObj) {
    let statusBox = storeObj.remainder.status_box;

    // get status box scroll bar information
    const statusScrollTop = statusBox.scrollTop;
    const statusScrollHeight = statusBox.scrollHeight;
    const statusInnerHeight = statusBox.clientHeight;

    // MUTABLE: update content in status box based on app store
    statusBox.innerHTML = storeObj.remainder.statusBoxContent;

    // MUTABLE: adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}
