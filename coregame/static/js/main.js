/**
 * Minesweeper Game.
 *
 * App's main JS code.
 *
 * September 06, 2022 by Marcio Reis Jr.
 */

const BACK_TO_REG_URL = "/accounts/logout";
const DEFAULT_BOARD_SIZE = 7;
const MAX_VISIBLE_NICK_LEN = 10;
const getTemplate = tmplName => document.querySelector(tmplName).innerHTML;
const GAMEHOST = `http://${window.location.host}`;


/**
 * Return the CSRF token the server had provided.
 *
 * @param {string} name Name of the csrf token
 * @returns
 */
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


/**
* Class to keep track of the leaderboard and saving to a local storage.
*/
class LeaderBoard {
    /**
     * Builds a new instance of LeaderBoard.
     *
     * @param {String} host - Hostname to read the leaderboard from.
     */
    constructor(host) {
        this.host = host;
        this.getApiPath = 'coregame/scores';
        this.setApiPath = 'coregame/scores';
    }


    /**
     * Set a new score for a given board size and save on the database.
     *
     * @param {Number} size - Size of the board.
     * @param {Number} min - Minutes to solve the puzzle.
     * @param {Number} sec - Seconds to solve the puzzle.
     * @param {String} nick - Player's nickname.
     * @param {Function} callback - Callback to process the return data,
     *  modeled as: { err: "Error message", accepted: Boolean }
     *  If accepted is true, then the score (timming) broke a record and went to
     *  the leaderbord, otherwise it returns false.
     */
    setScore(size, minutes, seconds, nick, callback) {
        const jData = JSON.stringify({
            board_size: parseInt(size),
            player: nick,
            timing: (parseInt(minutes) * 60) + parseInt(seconds),
        })
        const apiURL = `${this.host}/${this.setApiPath}/${size}/`;

        fetch(apiURL, {
            method: 'PUT',
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: jData,
        })
            .then(response => {
                if (response.status == 200) return response.json();
                throw Error(response["statusText"]);
            })
            .then(data => {
                // Process the retrieved data
                callback(null, data)
            })
            .catch(error => {
                // Handle any errors
                callback(error, null)
            });
    }

    /**
     * Read current leaderboard from the game host system.
     *
     * @param {Function} callback to handle the result. The arguments are
     *  (err, data[]):
     *      err (String): Error message ot Null
     *      data[].board_size: Board size to which this data relates to.
     *      data[].player: Player username (Nickname)
     *      datat[]timing: Duration in seconds to complete the game.
     */
    fetchScores(callback) {
        fetch(`${this.host}/${this.getApiPath}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data["err"] != null) return callback(data["err"], null);
                // Process the retrieved data
                callback(null, data["scores"])
            })
            .catch(error => {
                // Handle any errors
                callback(error, null)
            });
    }
}

/**
 * Class to provide the functionality of at sticky flad (shift key).
 */
class StickyShiftKey {
    /**
     * Instanciate the StickyShiftKey class.
     *
     * @param {NodeList} elem - A NodeList to get decorated with the 'sticky'
     *      CSS class when the flag is active.
     */
    constructor(elem) {
        this.stickyShiftKey = false;
        this.element = elem;
    }

    /**
     * Handle click events from an element that turns the sticky flag on/off.
     *
     * @param {Event} event - An event object from the DOM.
     */
    stickyShiftKeyBtnEvent(event) {
        this.stickyShiftKey ^= true;
        if (this.element instanceof NodeList) {
            if (this.stickyShiftKey) {
                this.element.forEach((el) => el.classList.add('sticky'));
            } else {
                this.element.forEach((el) => el.classList.remove('sticky'));
            }
        }
    }

    /**
     * Set sticky flag.
     *
     * @param {Boolean} bol - Value to set the sticky flag.
     */
    setStickyShiftKey(bol) {
        this.stickyShiftKey = !bol;
        return this.stickyShiftKeyBtnEvent();
    }

    /**
     * Get the sticky flag and resets it, if it is currently set.
     *
     * @note This function also adjusts the CSS class on tbe provided element.
     *
     * @returns {Boolean} State of the sticky flag before resetting it.
     */
    getStickyShiftKey() {
        const ret = !!this.stickyShiftKey;
        this.stickyShiftKey = false;
        if (this.element instanceof HTMLElement) {
            this.element.classList.remove('sticky');
        }
        return ret;
    }

    /**
     * Return the value of the sticky flag without resetting it.
     *
     * @returns {Boolean} State of the sticky flag.
     */
    peekStickyShiftKey() {
        return !!this.stickyShiftKey;
    }
}


// ----------------------------------------------------------------
//   App's Main code
// ----------------------------------------------------------------
let appData = {
    minesweeper: null,
    leaderboard: new LeaderBoard(GAMEHOST),
    nick: '',
    modalTitle: $('#feedbackTitle')[0],
    modalMsg: $('#feedbackBody')[0],
    modalConfirmBtn: $('#modal-confirm-id')[0],
    modal: $('#feedbackModal'),
    confirmationFunction: null,
    $backToReg: $('#back-to-reg-id'),
    $fadeElements: $('#main-div .initially-out'),
    $sizeDisplay: $('#size-display'),
    $desktopModeBtn: $('#desktop-help-id'),
    $mobileModeBtn: $('#mobile-help-id'),
    platfModeBtn: document.querySelectorAll('.platModeBtn'),
    playing: false,
    mobilePlatf: (window.screen.width * window.screen.height) < 373500,
    stickyShiftKey: new StickyShiftKey(this.platfModeBtn),
};

/**
 * Pops up a modal notifying the user the she/he lose the game.
 *
 * @param {Number} size - Size of the board.
 * @param {Number} mines - Amount of mines on the board.
 * @param {String} time - Elapsed time on the format m:ss minutes.
 */
function notifyLose(size, mines, time) {
    popModalUp(getTemplate('#youLoseHeader'), getTemplate('#youLoseMsg'));
}

/**
 * Pops up a modal notifying the user the she/he won the game.
 *
 * @param {Number} size - Size of the board.
 * @param {Number} mines - Amount of mines on the board.
 * @param {String} time - Elapsed time on the format m:ss minutes.
 */
function notifyWin(size, mines, time) {
    let [min, sec] = time.split(":").map((v) => parseInt(v)), title, msg;
    const unit = min > 1 ? 'minutes' : min === 1 ? 'minute' : 'seconds';
    if (min === 0) { time = sec; }
    appData.leaderboard.setScore(
        size, min, sec, appData.nick, (err, data) => {
            if (err || data.err) {
                title = getTemplate('#errHeader');
                msg = getTemplate('#errPhoningMsg')
                    .replace(/{err}/g, err ? err : data.err);
            } else if (data.accepted) {
                title = getTemplate('#higherScoreHeader');
                msg = getTemplate('#higherScoreMsg')
                    .replace(/{size}/g, size)
                    .replace(/{time}/g, time)
                    .replace(/{unit}/g, unit);
            } else {
                title = getTemplate('#youWinHeader');
                msg = getTemplate('#youWinMsg')
                    .replace(/{time}/g, time)
                    .replace(/{unit}/g, unit);
            }
            popModalUp(title, msg);
        });
}

/**
 * Callback for the end of game.
 */
function userNotification(result, size, mines, time) {
    // from now on do not show the tooltip anymore, until reload.
    $('[data-toggle="tooltip"]').tooltip('disable');
    if (result === 'lose') { notifyLose(size, mines, time); }
    if (result === 'win') { notifyWin(size, mines, time); }
}

/**'
 * Handler for the 'Leaderboard' button.
 */
function showLeaderboard() {
    let msg;
    appData.leaderboard.fetchScores((err, data) => {
        if (err) {
            msg = getTemplate('#errPhoningMsg').replace(/{err}/g, err);
        } else if (!data.length) {
            msg = getTemplate('#be1StWinner');
        } else {
            data.sort((a, b) => a.board_size - b.board_size);
            msg = "<p>";
            for (let item of data) {
                const bs = item.board_size;
                const pl = item.player;
                const tm = `${Math.floor(item.timing / 60)}:${(
                    item.timing % 60).toString().padStart(2, "0")}`;
                msg += `<h5>Board size - ${bs}x${bs}: ${tm} min. by ${pl}</h5>`;
            }
            msg += '</p>';
        }
        popModalUp(getTemplate('#leaderboardTitle'), msg);
    });
}

/**
 * Handler for the 'Rules' button.
 */
function showRules() {
    const rules = document.querySelector("#rulesTmpl").content;
    popModalUp(rules.querySelector('#header').innerHTML,
        rules.querySelector('#body').innerHTML);
}

/**
 * Pops the modal up with the given message.
 *
 * @param {String} title - Title for the modal title area;
 * @param {String} msg - Message to the modal's body.
 * @param {Boolean} confirmCallback - Callback for the 'confirm' button.
 */
function popModalUp(title, msg) {
    appData.modalTitle.innerHTML = title;
    appData.modalMsg.innerHTML = msg;
    appData.modalConfirmBtn.hidden = true;
    appData.modal.modal('show');
}

/**
 * Handle events generated by Minesweeper object.
 *
 * @param {Event} event - Event received from the DOM.
 * @returns 'true' if the event has been handled, otherwise returns 'false.''
 */
function handleOwnEvents(event) {
    const type = event.type;

    switch (type) {
        // switch between help text and back-to-reg button
        case 'minesweeperrunning':
            appData.$backToReg.hide();
            appData.playing = true;
            activateHelpButtons();
            return true;
        case 'minesweeperstart':
        // fall through
        case 'minesweeperwin':
        // fall through
        case 'minesweeperlose':
            appData.$backToReg.show();
            appData.playing = false;
            activateHelpButtons();
            return true;
    }
    return false;
}

/**
 * Run all the animations and move to the registration URL.
 */
function backToReg() {
    appData.$fadeElements.animate({ opacity: 0 }, () => {
        location.href = BACK_TO_REG_URL;
    });
}

/**
 * Set the dimension of the board in cells.
 *
 * @param {Number} dim - Dimension of the board in number of cells.
 */
function setBoardDimension(dim) {
    appData.minesweeper.setDimension(dim);
    appData.$sizeDisplay.text(`${dim}x${dim}`);
}

/**
 * Activate the help button at the bottom of the board
 */
function activateHelpButtons() {
    if (appData.playing && !appData.stickyShiftKey.peekStickyShiftKey()) {
        appData.$desktopModeBtn.show();
    } else {
        appData.$desktopModeBtn.hide();
    }
    if (appData.playing && appData.stickyShiftKey.peekStickyShiftKey()) {
        appData.$mobileModeBtn.show();
    } else {
        appData.$mobileModeBtn.hide();
    }
}

/**
 * App initialization code.
 */
$(function () {
    // Instantiate the core code of the game
    const dbName = 'MinesweeperSettings';
    appData.minesweeper = new Minesweeper(DEFAULT_BOARD_SIZE, {
        evListenerElement: document.querySelector('#main-div'),
        boardBody: document.querySelector('#board-body'),
        timerDisplay: document.querySelector('#time-counter'),
        minesDisplay: document.querySelector('#mines-counter'),
        resultNotification: userNotification,
        stickyShiftKey: appData.stickyShiftKey,
    });

    // hookup the event handler for the size selection
    $('body').on('click minesweeperrunning minesweeperstart minesweeperwin \
        minesweeperlose', function mainEvHandler(event) {
        const target = event.target;
        if (handleOwnEvents(event)) { return; }
        if (target.id === 'sm-select-id') { setBoardDimension(7); }
        else if (target.id === 'lg-select-id') { setBoardDimension(12); }
        else if (target.id === 'md-select-id') { setBoardDimension(10); }
        else if (target.id === 'xl-select-id') { setBoardDimension(15); }
        else if (target.id === 'hg-select-id') { setBoardDimension(20); }
        else if (target.id === 'rules-button-id') { showRules(); }
        else if (target.id === 'leaderBrd-button-id') { showLeaderboard(); }
        else if (event.target.id === 'shareId') {
            popModalUp(getTemplate("#shareModalHeader"),
                getTemplate("#shareModalBody"));
        }
        else if (target.id === 'back-to-reg-id' ||
            target.id === 'back-to-reg-btn-id') {
            event.preventDefault();
            backToReg();
        }
        else if (target.classList.contains('platModeBtn')) {
            appData.stickyShiftKey.stickyShiftKeyBtnEvent(event);
            activateHelpButtons();
        }
    });
    // hookup the removal of resources when leaving the page
    $(window).on('unload', (event) => {
        $(window).off();
        $('body').off();
        appData = null;
    });
    if (appData.mobilePlatf) { appData.stickyShiftKey.setStickyShiftKey(true); }
    appData.$backToReg.show().css('visibility', 'visible');
    // get nickname provided by the registration page
    appData.nick = decodeURIComponent(location.hash.substring(1));
    if (appData.nick == '') {
        // try from the current_user element (Django mode)
        appData.nick = document.querySelector('#current_user').innerHTML;
    }
    if (appData.nick !== '') {
        // if nick on the hash, save nick to the local storage, clear the hash
        localStorage.setItem(dbName, JSON.stringify({ nick: appData.nick }));
        location.hash = '';
    } else {
        // try to get it from the local storage
        const settings = JSON.parse(localStorage.getItem(dbName));
        if (settings !== null) {
            appData.nick = settings.nick;
        } else {
            // or just default to 'Anonymous'
            appData.nick = 'Anonymous';
        }
    }
    setBoardDimension(DEFAULT_BOARD_SIZE);
    $('#nick-id')[0].innerHTML = appData.nick.length < 11 ? appData.nick :
        appData.nick.substring(0, MAX_VISIBLE_NICK_LEN) + "...";
    // initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();
    // set focus on modal's 'close' button after poping up
    appData.modal.on('shown.bs.modal', function () {
        $('#modal-button-id').trigger('focus');
    });
    // Set focus on start button after each game
    appData.modal.on('hidden.bs.modal', function (e) {
        $('#start-button').trigger('focus');
    });
    appData.$fadeElements.animate({ opacity: 1 });
});
