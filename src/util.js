'use strict'


// *** Update simulator status box with given HTML message
export function updateStatusBox(statusBox, message) {
    // get status box scroll bar information
    let statusScrollTop = statusBox.scrollTop;
    let statusScrollHeight = statusBox.scrollHeight;
    let statusInnerHeight = statusBox.clientHeight;

    // push message into status box
    statusBox.innerHTML = statusBox.innerHTML + message + '<br />';

    // adjust scroll bar position to auto-scroll if scroll bar is near the end
    if (statusScrollTop > (statusScrollHeight - 1.1 * statusInnerHeight)) {
        statusBox.scrollTop = statusScrollHeight;
    }
}