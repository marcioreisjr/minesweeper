/**
 * Minesweeper Login and registration screen.
 *
 * App's Cells' classes JS code.
 *
 * September 06, 2022 by Marcio Reis Jr.
 */


/**
 * Class to store user's information in a persistent location.
 *
 * The user can still delete them by clearing the browser cache.
 */
class UserDb {
    /**
     * Builds a new instance of the UserDb and load users from the database.
     */
    constructor() {
        this.dbName = 'MinesweeperUsers';
        this.userList = [];
        const userSet = localStorage.getItem(this.dbName);
        if (userSet !== null) {
            this.userList = JSON.parse(userSet);
        }
    }

    /**
     * Return the amount of players in the database.
     */
    get length() {
        return this.userList.length;
    }

    /**
     * Prevents from setting a length.
     */
    set length(_) { }

    /**
     * Store a new user or update an existing one, based on the email.
     *
     * This method normalizes the email to lower case.
     *
     * @param {String} email - Key for the user record.
     * @param {String} nick - Nickname.
     * @param {String} phone - Phone number as a string.
     * @param {String} passHash - Password hash.
     */
    setUserByEmail(email, nick, phone, passHash) {
        email = email.toLowerCase();
        const newInfo = { email, nick, phone, passHash };
        const exists = this.userList.findIndex(
            (val) => val.email === email ? true : false);
        if (exists !== -1) {
            this.userList[exists] = newInfo;
        } else {
            this.userList.push(newInfo);
        }
        this.save_();
    }

    /**
     * Get a user from the database based on the email.
     *
     * This method normalizes the email to lower case.
     *
     * @param {String} email - Email to look for;
     * @returns {Object} An object with the user information or 'undefined'.
     */
    getUserByEmail(email) {
        email = email.toLowerCase();
        const exists = this.userList.findIndex(
            (val) => val.email === email ? true : false);
        return exists !== -1 ? this.userList[exists] : undefined;
    }

    /**
     * Remove a user based on her/his email.
     *
     * @param {String} email - Nickname for lookup.
     *
     * @returns {Boolean} 'true' if succeeded to delete, otherwise 'false'.
     */
    removeUserByEmail(email) {
        const exists = this.userList.findIndex(
            (val) => val.email === email ? true : false);
        if (exists === -1) { return false; }
        this.userList.splice(exists, 1);
        this.save_();
        return true;
    }

    /**
     * Get a user based on her/his nickname.
     *
     * @param {String} nick - Nickname for lookup.
     *
     * @returns {Object} A DB record with the user or 'undefined'.
     */
    getUserByNick(nick) {
        const exists = this.userList.findIndex(
            (val) => val.nick === nick ? true : false);
        return exists !== -1 ? this.userList[exists] : undefined;
    }

    /**
     * Remove a user based on her/his nickname.
     *
     * @param {String} nick - Nickname for lookup.
     *
     * @returns {Boolean} 'true' if succeeded to delete, otherwise 'false'.
     */
    removeUserByNick(nick) {
        const exists = this.userList.findIndex(
            (val) => val.nick === nick ? true : false);
        if (exists === -1) { return false; }
        this.userList.splice(exists, 1);
        this.save_();
        return true;
    }

    /**
     * Store a new user or update an existing one, based on the nickname.
     *
     * This method normalizes the email to lower case.
     *
     * @param {String} email - Key for the user record.
     * @param {String} nick - Nickname.
     * @param {String} phone - Phone number as a string.
     * @param {String} passHash - Password hash.
     */
    setUserByNick(email, nick, phone, passHash) {
        email = email.toLowerCase();
        const newInfo = { email, nick, phone, passHash };
        const exists = this.userList.findIndex(
            (val) => val.nick === nick ? true : false);
        if (exists !== -1) {
            this.userList[exists] = newInfo;
        } else {
            this.userList.push(newInfo);
        }
        this.save_();
    }

    /**
     * Private method.
     *
     * Save the database to the browser storage.
     */
    save_() {
        const str = JSON.stringify(this.userList);
        localStorage.setItem(this.dbName, str);
    }

    /**
     * Iterator that provide objects containing the information from the
     * database.
     *
     * @returns {Object}:
     *  {email: {String}, nick: {String}, phone: {String}, passHash: {String}}
     */
    *[Symbol.iterator]() {
        yield* this.userList;
    }
}


/*****************************************************************************
 * App's Main code
 */
const TOOLTIP_OFF_DELAY = 3000; // Delay to turn tooltip off
const DELETE_MODAL_TIMEOUT = 30000; // in milliseconds
const EMPTY_NICK_TOOLTIP = "Choose a player with the pull down button.";
const getTemplate = tmplName => document.querySelector(tmplName).innerHTML;
const warningHeader = "#warningHeader";
const emailInUse = '#emailInUse';
const nickInUse = '#nickInUse';
const successHeader = '#successHeader';
const additionBody = '#additionBody';

let appData = {
    userDb: new UserDb(),
    form: $('#user-form-id')[0],
    emailInput: $('#email-input-id')[0],
    emailTooltip: $('#email-input-id'),
    nickDrpButton: $('#nick-drp-btb-id')[0],
    nickButton: $('#nick-drp-menu')[0],
    nickInput: $('#nick-input-id')[0],
    nickTooltip: $('#nick-input-id'),
    phoneInput: $('#phone-input-id')[0],
    phoneTooltip: $('#phone-input-id'),
    mpButton: $('#mp-btn-id')[0],
    playButton: $('#play-btn-id')[0],
    mpDropDownButton: $('#mp-dp-down')[0],
    confirmationFunction: null,
    $fadeElements: $('#main-div .initially-out'),
    operationState: '',
};


/**
 * Validate and fix the email field.
 *
 * @returns {Boolean} 'true' if the email is valid, otherwise returns 'false'.
 */
function validateEmail() {
    const val = appData.emailInput.value.trim().toLowerCase();
    const pattern1 = /^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-z0-9-]+\.)+[a-z]{2,6}$/;
    if (pattern1.test(val)) {
        appData.emailInput.value = val;
        appData.emailTooltip.tooltip('hide');
        return true;
    }
    appData.emailTooltip.tooltip('show');
    setTimeout(() => appData.emailTooltip.tooltip('hide'), TOOLTIP_OFF_DELAY);
    return false;
}

/**
 * Validate and fix phone number format.
 *
 * @returns {Boolean} 'true' if the format is valid, otherwise returns 'false'.
 */
function validatePhone() {
    const val = appData.phoneInput.value.replace(/\s/g, '');
    appData.phoneInput.value = val;
    if (val === '') {
        appData.phoneTooltip.tooltip('hide');
        return true;
    }
    const pattern = /^\(?(\d{3})\)?-?\s?(\d{3})-?\s?(\d{4})$/;
    const mts = pattern.exec(val);
    if (mts) {
        appData.phoneInput.value = `(${mts[1]})${mts[2]}-${mts[3]}`;
        appData.phoneTooltip.tooltip('hide');
        return true;
    }
    appData.phoneTooltip.tooltip('show');
    setTimeout(() => appData.phoneTooltip.tooltip('hide'), TOOLTIP_OFF_DELAY);
    return false;
}

/**
 * Validate the nickname field.
 *
 * The only constraint is that it must have something (anything) for the
 * registration event.
 *
 * @returns {Boolean} 'true' if the format is valid, otherwise returns 'false'.
 */
function validateNick(tooltipMsg) {
    appData.nickInput.value = appData.nickInput.value.trim();
    if (appData.nickInput.value !== '') {
        appData.nickTooltip.tooltip('hide');
        return true;
    }
    if (tooltipMsg) {
        appData.nickTooltip.attr('data-original-title', tooltipMsg);
        appData.nickTooltip.tooltip('show');
        setTimeout(() => appData.nickTooltip.tooltip('hide'), TOOLTIP_OFF_DELAY);
    }
    return false;
}

/**
 * Pops the modal up with the given title, message and buttons.
 *
 * @param {String | HTML} title - Title for the modal title area;
 * @param {String | HTML} msg - Message to the modal's body.
 * @param {Object} options - Object with the following attributes:
 *      {String | HTML} normalBtnText - Text for the 'normal' button, which
 *          is always shown. Defaults to 'Close'.
 *      {String | HTML} alertBtnText - Text for the 'alert' button, which is
 *          shown (in red color) only if a text is provided.
 *      {Number} timeout - Optional timeout in milliseconds to have the
 *          modal automatically dismissed upon its expiration.
 * @returns {Promise} A Promise that resolves with the clicked button's ID,
 *      null if the modal is dismissed or it rejects on timeout.
 */
function popModalUp(title, msg, options = {}) {
    const modal = $('#ecModal');
    const alertBtn = $('#ecAlertBtn', modal);
    const normalBtn = $('#ecNormalBtn', modal);
    const { normalBtnText, alertBtnText, timeout } = options;
    normalBtn.html(normalBtnText || 'Close');
    if (alertBtnText) {
        alertBtn.html(alertBtnText);
        alertBtn.show();
    } else {
        alertBtn.hide();
    }
    $('#ecTitle', modal).html(title || 'Title');
    $('#ecBody', modal).html(msg || 'Message');
    modal.modal('show');
    return new Promise((resolve, reject) => {
        let timer;
        if (typeof timeout === 'number') timer = setTimeout(() => {
            modal.modal('hide');
            reject('timeout');
        }, timeout);
        modal.one('shown.bs.modal', (event) => {
            normalBtn.trigger('focus');
        });
        modal.one('click hidden.bs.modal', (event) => {
            if (timer) clearTimeout(timer);
            if (event.target.nodeName === 'BUTTON') {
                resolve(event.target.id);
            }
            if (event.type === 'hidden') { resolve(null); }
        });
    });
}

/**
 * Verify if fields are valid for registration and add new user to the database.
 *
 * @param {Event} even - Event from the DOM.
 * @returns {Boolean} 'true' if new user has been added, otherwise 'false';
 */
function registerNewPlayer(event) {
    if (setOpState('Register') === true) { return false; } // just adjust form
    if (validateNick("Please choose a unique and valid nickname") &&
        validateEmail() && validatePhone()) {
        const email = appData.emailInput.value;
        const nick = appData.nickInput.value;
        let phone = appData.phoneInput.value;

        if (appData.userDb.getUserByEmail(email) !== undefined) {
            // user already exists
            popModalUp(getTemplate(warningHeader),
                       getTemplate(emailInUse).replace(/{email}/g, email));
            return false;
        } else if (appData.userDb.getUserByNick(nick) !== undefined) {
            // nick already in use
            popModalUp(getTemplate(warningHeader),
                       getTemplate(nickInUse).replace(/{nick}/g, nick));
            return false;
        } else {
            // new user
            appData.userDb.setUserByEmail(email, nick, phone, '');
            if (phone === '') { phone = 'None'; }
            appData.playButton.hidden = false;
            appData.mpDropDownButton.hidden = false;
            popModalUp(getTemplate(successHeader), getTemplate(additionBody)
                .replace(/{nick}/g, nick)
                .replace(/{email}/g, email)
                .replace(/{phone}/g, phone));
            populatePullBtn();
            return true;
        }
    }
    return false;
}

/**
 * Clear out all input fields.
 */
function clearAllEntries() {
    appData.emailInput.value = '';
    appData.nickInput.value = '';
    appData.phoneInput.value = '';
}

/**
 * Populate the pull down button with a list of registered users.
 *
 * @returns {Boolean}   'true' if there is at least one player in the list,
 *                      otherwise returns false.
 */
function populatePullBtn() {
    const usrList = [];
    let hasPlayer = true;
    let HTMLContent = '';
    for (let usr of appData.userDb) { usrList.push(usr); }
    if (usrList.length === 0) {
        HTMLContent = getTemplate('#noPlayersYetMsg');
        hasPlayer = false;
    } else {
        usrList.sort((a, b) => a.nick > b.nick ? 1 : -1);
        for (let usr of usrList) {
            HTMLContent += getTemplate('#userEntry')
                .replace(/{user-data}/g, encodeURIComponent(JSON.stringify(usr)))
                .replace(/{nick}/g, usr.nick);
        }
    }
    appData.nickButton.innerHTML = HTMLContent;
    return hasPlayer;
}

/**
 * Edit a player in the database.
 *
 * @param {Event} event - An event from the DOM.
 *
 * @returns {Boolean} 'true' if succeeded to edit the user, otherwise 'false'.
 */
function editPlayer(event) {
    if (validateEmail() && validatePhone()) {
        const email = appData.emailInput.value;
        const nick = appData.nickInput.value;
        let phone = appData.phoneInput.value;
        const chkUsr = appData.userDb.getUserByEmail(email);
        if (chkUsr !== undefined && chkUsr.nick !== nick) {
            // user already exists
            popModalUp(getTemplate(warningHeader), getTemplate(emailInUse)
                .replace(/{email}/g, email));
            return false;
        }
        // edit selected user
        appData.userDb.setUserByNick(email, nick, phone, '');
        if (phone === '') { phone = 'None'; }
        popModalUp(getTemplate('#changedHeader'), getTemplate('#changeSummary')
           .replace(/{nick}/g, nick)
           .replace(/{email}/g, email)
           .replace(/{phone}/g, phone));
        populatePullBtn();
        return true;
    }
    return false;
}

/**
 * Ask for confirmation of user removal.
 *
 * @param {Event} event - An event from the DOM.
 */
function confirmRemovePlayer(event) {
    const usr = appData.userDb.getUserByNick(appData.nickInput.value);
    confirmationFunction = () => {
        appData.userDb.removeUserByNick(usr.nick);
        populatePullBtn();
    };
    popModalUp(getTemplate('#confirmRemovalHeader'),
        getTemplate('#confirmRemovalMsg').replace(/{nick}/g, usr.nick)
            .replace(/{email}/g, usr.email)
            .replace(/{phone}/g, usr.phone),
        { timeout: DELETE_MODAL_TIMEOUT, alertBtnText: 'Confirm'}
    ).then(
        (result) => {
            if (result === 'ecAlertBtn') {
                appData.userDb.removeUserByNick(usr.nick);
            }
            clearAllEntries();
            if (populatePullBtn()) {
                setOpState('Play');
            } else {
                appData.playButton.hidden = true;
                appData.mpDropDownButton.hidden = true;
                setOpState('Register');
            }
        },
        (reason) => {/* empty handle to supress warnings on the console */}
    );
}

/**
 * Once the MP button has been pressed, invoke the selected operation.
 *
 * @param {Event} event - An event from the DOM.
 */
function handlePlayButton(event) {
    if (setOpState('Play') === true) {
        // just adjust the form
        clearAllEntries();
        return;
    }
    if (!validateNick(EMPTY_NICK_TOOLTIP)) { return; }
    appData.$fadeElements.animate({ opacity: 0 }, () => {
        location.href = `resources/html/minesweeper.html#${
            appData.nickInput.value}`;
    });
}

/**
 * Once the MP button has been pressed, invoke the selected operation.
 *
 * @param {Event} event - An event from the DOM.
 */
function handleMpButton(event) {
    const opSel = appData.mpButton.innerHTML;
    if (opSel === 'Register') {
        if (registerNewPlayer(event)) { setOpState('Play'); }
    } else if (opSel === 'Edit') {
        if (validateNick(EMPTY_NICK_TOOLTIP)) {
            if (editPlayer(event)) { setOpState('Play'); }
        }
    } else if (opSel === 'Remove') {
        if (validateNick(EMPTY_NICK_TOOLTIP)) {
            confirmRemovePlayer(event);
            setOpState('Play');
        }
    }
}

/**
 * Set operation state depending on the selection (play/edit/register/remove).
 *
 * It also set the fields read/write state.
 *
 * @param {String} opSel - The operation (function) to perform.
 * @returns {Boolean} 'true' if there was a change in state, otherwise 'false'.
 */
function setOpState(opSel) {
    if (opSel === appData.operationState) { return false; }
    appData.operationState = opSel;
    appData.mpButton.innerHTML = opSel;
    if (opSel === 'Play') {
        appData.mpButton.innerHTML = 'Register';
        appData.nickInput.disabled = true;
        appData.emailInput.hidden = true;
        appData.phoneInput.hidden = true;
        appData.nickDrpButton.hidden = false;
        appData.playButton.innerText = "Play";
        $(appData.playButton).trigger('focus');
    } else if (opSel === 'Remove') {
        appData.nickInput.disabled = true;
        appData.emailInput.hidden = true;
        appData.phoneInput.hidden = true;
        appData.nickDrpButton.hidden = false;
        appData.playButton.innerText="Cancel"
        $(appData.mpButton).trigger('focus');
    } else if (opSel === 'Register') {
        appData.nickInput.disabled = false;
        appData.emailInput.hidden = false;
        appData.emailInput.disabled = false;
        appData.phoneInput.hidden = false;
        appData.phoneInput.disabled = false;
        appData.nickDrpButton.hidden = true;
        clearAllEntries();
        appData.playButton.innerText="Cancel"
        $(appData.nickInput).trigger('focus');
    } else if (opSel === 'Edit') {
        appData.nickInput.disabled = true;
        appData.emailInput.hidden = false;
        appData.emailInput.disabled = false;
        appData.phoneInput.hidden = false;
        appData.phoneInput.disabled = false;
        appData.nickDrpButton.hidden = false;
        appData.playButton.innerText="Cancel"
        $(appData.mpButton).trigger('focus');
    }
    return true;
}

/**
 * Pull selected user from the database and fill out the form.
 *
 * @param {Event} event - An event from the DOM.
 */
function handleUsrButton(event) {
    const usr = JSON.parse(decodeURIComponent(event.target.dataset.usrSel));
    appData.nickInput.value = usr.nick;
    appData.emailInput.value = usr.email;
    appData.phoneInput.value = usr.phone;
    if (appData.operationState === 'Play') {
        $(appData.playButton).trigger('focus');
    } else {
        $(appData.mpButton).trigger('focus');
    }
}

/**
 * App's initialization code.
 */
$(function () {
    // hookup the main event handler
    $(window).on('click submit unload', (event) => {
        if (event.type === 'click') {
            if (event.target.id === 'play-btn-id') {
                handlePlayButton(event);
            } else if (event.target.id === 'shareId') {
                popModalUp(getTemplate("#shareModalHeader"),
                           getTemplate("#shareModalBody"));
            } else if (event.target.dataset.opSel !== undefined) {
                // Pull down button next to the multipurpose button
                setOpState(event.target.dataset.opSel);
            } else if (event.target.dataset.usrSel !== undefined) {
                // Pull down next to nickname field
                handleUsrButton(event);
            }
        } else if (event.type === 'submit') {
            event.preventDefault();
            handleMpButton();
        } else if (event.type === 'unload') {
            // remove all system resources we were using
            $(window).off();
            appData = null;
        }
    });
    // populate the pull down button with existing users
    if (populatePullBtn()) {
        // set Initial operation state
        setOpState('Play');
    } else {
        appData.playButton.hidden = true;
        appData.mpDropDownButton.hidden = true;
        setOpState('Register');
    }
    // set all tooltips for manual activation
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'manual' });
    // set focus to the main button every time the modal closes
    $('#ecModal').on('hidden.bs.modal', function (e) {
        $(appData.playButton).trigger('focus');
    })
    // show the initial screen
    appData.$fadeElements.animate({ opacity: 1 });
});
