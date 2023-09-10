/**
 * Minesweeper Login and registration screen.
 *
 * App's Cells' classes JS code.
 *
 * September 06, 2022 by Marcio Reis Jr.
 */


/*****************************************************************************
 * App's Main code
 */
const getTemplate = tmplName => document.querySelector(tmplName);

/**
 * Pops the modal up with the given message.
 *
 * @param {String} title - Title for the modal title area;
 * @param {String} msg - Message to the modal's body.
 * @param {Boolean} confirmCallback - Callback for the 'confirm' button.
 */
function popModalUp(title, msg) {
    getTemplate("#feedbackTitle").innerHTML = title.innerHTML;
    getTemplate("#feedbackBody").innerHTML = msg.innerHTML;
    getTemplate("#modal-confirm-id").hidden = true;
    $('#feedbackModal').modal('show');
}

/**
 * App's initialization code.
 */
$(function () {
    console.log('Startup code');
    // hookup the main event handler
    $(window).on('click unload', (event) => {
        if (event.type === 'click') {
            if (event.target.id === 'shareId') {
                popModalUp(getTemplate("#shareModalHeader"),
                    getTemplate("#shareModalBody"));
            }
        } else if (event.type === 'unload') {
            // remove all system resources we were using
            $(window).off();
        }
    });
});
