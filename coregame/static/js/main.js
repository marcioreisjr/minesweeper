/**
 * Minesweeper Game.
 *
 * App's main JS code.
 *
 * September 06, 2022 by Marcio Reis Jr.
 */

const BACK_TO_REG_URL = "../../index.html";
const DEFAULT_BOARD_SIZE = 7;
const MAX_VISIBLE_NICK_LEN = 10;
const getTemplate = tmplName => document.querySelector(tmplName).innerHTML;



 /**
 * Class to keep track of the leaderboard and saving to a local storage.
 */
class LeaderBoard {
    /**
     * Builds a new instance of LeaderBoard and load it from the database.
     */
    constructor() {
        this.hasItems = false;
        this.dbName = 'MinesweeperLeaderBoard';
        this.leaderList = {};
        const leaderBoard = localStorage.getItem(this.dbName);
        if (leaderBoard !== null) {
            this.leaderList = JSON.parse(leaderBoard);
            this.hasItems = true;
        }
    }

    /**
     * Set a new score for a given board size and save on the database.
     *
     * @param {Number} size - Size of the board.
     * @param {Number} min - Minutes to solve the puzzle.
     * @param {Number} sec - Seconds to solve the puzzle.
     * @returns 'true' if provided record beat the stored one and it is now the
     *          best score or 'false' if the provided score does NOT beat the
     *          stored one. It is discarded.
     */
    setScore(size, minutes, seconds, nick = '') {
        const newSize = parseInt(size);
        const newMin = parseInt(minutes);
        const newSec = parseInt(seconds);
        const { min, sec } = this.leaderList[newSize] ||
            { min: 99999, sec: 99999 };
        if (this.leaderList[newSize] === undefined || newMin < min ||
            (newMin == min && newSec < sec)) {
            this.leaderList[newSize] = { min: newMin, sec: newSec,
                nick: nick };
            this.save_();
            this.hasItems = true;
            return true;
        }
        return false;
    }

    /**
     * Private method.
     *
     * Save the database to the browser storage.
     */
    save_() {
        const str = JSON.stringify(this.leaderList);
        localStorage.setItem(this.dbName, str);
    }

    /**
     * Iterator that provide objects containing the information from the
     * database.
     *
     * @returns {Object} - {size: {Number}, min: {Number}, sec: {Number}}.
     */
    *[Symbol.iterator]() {
        const sizes = [];
        for (let ii in this.leaderList) { sizes.push(ii); }
        sizes.sort((a, b) => parseInt(a) - parseInt(b));
        for (let ii of sizes) {
            const { min, sec, nick } = this.leaderList[ii];
            yield { size: ii, min, sec, nick };
        }
    }

    /**
     * Iterator that provide strings containing information from each of
     * records of the database.
     *
     * @returns {String} - String describing each size's entry.
     */
    *strIterator() {
        const sizes = [];
        for (let ii in this.leaderList) { sizes.push(ii); }
        sizes.sort((a, b) => parseInt(a) - parseInt(b));
        for (let ii of sizes) {
            yield `Board size - ${ii}x${ii}: ${this.leaderList[ii].min}:${
                this.leaderList[ii].sec.toString()
                .padStart(2, '0')} min. by ${this.leaderList[ii].nick}`;
        }
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
    leaderboard: new LeaderBoard(),
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
    const highScore = appData.leaderboard.setScore(size, min, sec, appData.nick);
    if (highScore) {
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
    if (appData.leaderboard.hasItems) {
        msg = "<p>";
        for (let item of appData.leaderboard.strIterator()) {
            msg += `<h5>${item}</h5>`;
        }
        msg += '</p>';
    } else {
        msg = getTemplate('#be1StWinner');
    }
    popModalUp(getTemplate('#leaderboardTitle'), msg);
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

    switch(type) {
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
    appData.$fadeElements.animate({opacity: 0}, () => {
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
    appData.minesweeper = new Minesweeper(DEFAULT_BOARD_SIZE,{
        evListenerElement : document.querySelector('#main-div'),
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
    console.log("from hash", appData.nick);
    if (appData.nick == '') {
        // try from the current_user element (Django mode)
        appData.nick = document.querySelector('#current_user').innerHTML;
        console.log("from #current_user", appData.nick);
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
