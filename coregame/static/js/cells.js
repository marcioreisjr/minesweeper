/**
 * Minesweeper Game.
 *
 * App's Cells' classes JS code.
 *
 * September 06, 2022 by Marcio Reis Jr.
 */


/**
 * Base class for the BlankCell, NumberCell and MineCell.
 */
class Cell {
    /**
     * Do a basic setup for a generic cell.
     *
     * @param {Number} col - Cell's column number.
     * @param {Number} row - Cell's row number.
     * @param {Array} board - Array with the entire board.
     */
    constructor(row, col, board) {
        if (new.target === Cell) {
            throw new Error(
                'Abstract class Cell cannot be directly instantiated');
        }
        if (!this.click) {
            throw new Error('Inheriting class must define click()');
        }
        if (!this.reveal) {
            throw new Error('Inheriting class must define reveal()');
        }
        this.row = row;
        this.col = col;
        this.board = board;
        this.revealed = false;
        this.isFlagged = false;
        this.targetButton = null;
    }

    // Use the following documentation on your implementation of click()

    /**
     * Handle click events.
     *
     * @param {Boolean} modifierKey - True if the control (or other modifier)
     *                                key was pressed.
     *
     * @returns {Number} Either -1, 0 or 1 for the following conditions:
     *  If modifierKey was 'true' then:
     *      -1 : If a flag was removed;
     *       0 : If no change in flag had happened;
     *       1 : If a flag was set;
     *  If modifierKey was 'false' then:
     *       0 : If a mine did NOT blow off;
     *       1 : If a mine blew off.
     *
     * Inheriting class must define this method.
     * click(modifierKey) {}
     */

    // Use the following documentation on your implementation of reveal()

    /**
     * Reveal the cell type on the DOM and place additional CSS classes on it.
     *
     * @param {Array} classAddition - Array of CSS classes to be added to the
     *      element.
     * @param {Boolean} ignoreFlag - If the cell is flagged the reveal process
     *      behaves as if the cell was not flagged.
     *
     * Inheriting class must define this method.
     *
     * reveal(classAddition = null, ignoreFlag = false) {}
     */

    /**
     * Return the revealed state.
     *
     * @returns {Boolean} 'true' if the cell is already revealed, otherwise
     *                    return 'false'.
     */
    isRevealed() {
        return this.revealed;
    }

    /**
     * Return a list of cells surrounding this one.
     *
     * @returns {Array} With a list of cells surrounding this one.
     */
    getSurroundings() {
        const collection = [],
            rowStart = this.row - 1 < 0 ? 0 : this.row - 1,
            rowEnd = this.row + 1 >= this.board.length ? this.row :
                this.row + 1,
            colStart = this.col - 1 < 0 ? 0 : this.col - 1,
            colEnd = this.col + 1 >= this.board.length ? this.col :
                this.col + 1;
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                if (this.board[row][col] != this) {
                    collection.push(this.board[row][col]);
                }
            }
        }
        return collection;
    }

    /**
     * Remove all classes that styles elements from this cell.
     */
    removeAllElementClasses() {
        this.targetButton.classList.remove(...
            'flag mine water fa-flag fa-sun fa-water number blank'.split(' '));
    }

    /**
     * Set an icon of water on the DOM for the given cell.
     *
     * @param {Array} classAddition - Additional CSS classes to be added to
     *      the displayed element.
     */
    setWaterIcon(classAddition = null) {
        this.targetButton = this.targetButton || document.querySelector(
            `#r${this.row}-c${this.col}`);
        this.removeAllElementClasses();
        this.targetButton.classList.add(... 'fa fa-water water'.split(' '),
            ...classAddition || []);
        this.isFlagged = false;
        return this;
    }

    /**
     * Set an icon of flag on the DOM for the given cell.
     *
     * @param {Array} classAddition - Additional CSS classes to be added to
     *      the displayed element.
     */
    setFlagIcon(classAddition = null) {
        this.targetButton = this.targetButton || document.querySelector(
            `#r${this.row}-c${this.col}`);
        this.removeAllElementClasses();
        this.targetButton.classList.add(...'fa fa-flag flag'.split(' '),
            ...classAddition || []);
        this.isFlagged = true;
        return this;
    }
}

/**
 * Provide behavior to cells with mine count in it.
 */
class NumberCell extends Cell {
    /**
     * Instantiate a NumberCell Object.
     *
     * @param {Number} col - Cell's column number.
     * @param {Number} row - Cell's row number.
     * @param {Array} board - Array with the entire board.
     */
    constructor(row, col, board) {
        super(row, col, board);
        this.mineCount = 0;
    }

    /**
     * Increment the amount of mines surrounding it.
     */
    incMineCount() {
        this.mineCount++;
        return this;
    }

    /**
     * Set a number on the DOM for the given cell.
     *
     * @param {String} classAddition - Additional CSS classes to be added to
     *      the displayed element.
     * @param {number} val - Value to set on the cell.
     */
    setNumberIcon(classAddition = null, val = 0) {
        this.targetButton = this.targetButton || document.querySelector(
            `#r${this.row}-c${this.col}`);
        this.removeAllElementClasses();
        this.targetButton.classList.add('number', ...classAddition || []);
        this.targetButton.innerText = val;
        this.isFlagged = false;
        return this;
    }

    /**
     * Reveal the cell type on the DOM and place additional CSS classes on it.
     *
     * @param {Array} classAddition - Array of CSS classes to be added to the
     *      element.
     * @param {Boolean} ignoreFlag - If the cell is flagged the reveal process
     *      behaves as if the cell was not flagged.
     */
    reveal(classAddition = null, ignoreFlag = false) {
        if (!this.revealed) {
            this.revealed = true;
            if (this.isFlagged && !ignoreFlag) {
                // reveal a wrong flagging
                this.setFlagIcon(['text-danger', ...classAddition || []]);
            } else {
                // otherwise just reveal its mine count
                this.setNumberIcon(classAddition, this.mineCount);
            }
        }
        return this;
    }

    /**
     * Handle click events.
     *
     * @param {Boolean} modifierKey - True if the control (or other modifier)
     *                                key was pressed.
     *
     * @returns {Number} Either -1, 0 or 1 for the following conditions:
     *  If modifierKey was 'true' then:
     *      -1 : If a flag was removed;
     *       0 : If no change in flag had happened;
     *       1 : If a flag was set;
     *  If modifierKey was 'false' then:
     *      -1 : If a flag was removed;
     *       0 : If no change in flag had happened;
     */
    click(modifierKey) {
        if (this.revealed) { return 0; }
        if (modifierKey) {
            if (this.isFlagged) {
                this.setWaterIcon();
                return -1;
            } else {
                this.setFlagIcon();
                return 1;
            }
        }
        const ret = this.isFlagged ? -1 : 0;
        this.isFlagged = false;
        this.reveal();
        return ret;
    }
}

/**
 * Provide behavior to the blank cells.
 */
class BlankCell extends Cell {
    /**
     * Instantiate a BlankCell Object.
     *
     * @param {Number} col - Cell's column number.
     * @param {Number} row - Cell's row number.
     * @param {Array} board - Array with the entire board.
     */
    constructor(row, col, board) {
        super(row, col, board);
        this.setWaterIcon();
    }

    /**
     * Handle click events.
     *
     * @param {Boolean} modifierKey - True if the control (or other modifier)
     *                                key was pressed.
     *
     * @returns {Number} Either -1, 0 or 1 for the following conditions:
     *  If modifierKey was 'true' then:
     *      -1 : If a flag was removed;
     *       0 : If no change in flag had happened;
     *       1 : If a flag was set;
     *  If modifierKey was 'false' then:
     *       0 : If no change in flag had happened;
     *      -n : Number of flags removed due to the chain reaction triggered on
     *  the surrounding cells.
     */
    click(modifierKey) {
        if (this.revealed) { return 0; }
        if (!modifierKey) {
            let ret = this.isFlagged ? -1 : 0;
            this.isFlagged = false;
            this.reveal();
            const surroundings = this.getSurroundings();
            for (let cell of surroundings) {
                if (cell instanceof BlankCell || cell instanceof NumberCell) {
                    ret += cell.click(modifierKey);
                }
            }
            return ret;
        }
        // modifierKey == true cases
        if (this.isFlagged) {
            this.setWaterIcon();
            return -1;
        }
        this.setFlagIcon();
        return 1;
    }

    /**
     * Set no icon on the DOM for the given cell.
     *
     * @param {String} classAddition - Additional CSS classes to be added to
     *      the displayed element.
     */
    setNoIcon(classAddition = null) {
        this.targetButton = this.targetButton || document.querySelector(
            `#r${this.row}-c${this.col}`);
        this.removeAllElementClasses();
        this.targetButton.classList.add('blank', ...classAddition || []);
        this.targetButton.innerText = '';
        this.isFlagged = false;
        return this;
    }

    /**
     * Reveal the cell type on the DOM and place additional CSS classes on it.
     *
     * @param {Array} classAddition - Array of CSS classes to be added to the
     *      element.
     */
    reveal(classAddition = null) {
        if (!this.revealed) {
            this.revealed = true;
            if (this.isFlagged) {
                // reveal a wrong flagging
                this.setFlagIcon(['text-danger', ...classAddition || []]);
            } else {
                // otherwise just reveal an empty cell
                this.setNoIcon(classAddition);
            }
        }
        return this;
    }
}

class MineCell extends Cell {
    /**
     * Place NumberCell in the surrounding and increment their mine count.
     */
    enumerate() {
        const surrounding = this.getSurroundings();
        for (let cell of surrounding) {
            if (cell instanceof BlankCell) {
                const newCell = new NumberCell(cell.row, cell.col, this.board);
                this.board[cell.row][cell.col] = newCell;
                newCell.incMineCount();
            }
            if (cell instanceof NumberCell) { cell.incMineCount(); }
        }
        return this;
    }

    /**
     * Set an icon of Mine on the DOM for the given cell.
     *
     * @param {Array} classAddition - Additional CSS classes to be added to the
     *      displayed element.
     */
    setMineIcon(classAddition = null) {
        this.targetButton = this.targetButton || document.querySelector(
            `#r${this.row}-c${this.col}`);
        this.removeAllElementClasses();
        this.targetButton.classList.add(...'fa fa-sun mine'.split(' '),
            ...classAddition || []);
        this.isFlagged = false;
        return this;
    }

    /**
     * Handle click events.
     *
     * @param {Boolean} modifierKey - True if the control (or other modifier)
     *                                key was pressed.
     *
     * @returns {Number} Either -1, 0 or 1 for the following conditions:
     *  If modifierKey was 'true' then:
     *      -1 : If a flag was removed;
     *       0 : If no change in flag had happened;
     *       1 : If a flag was set;
     *  If modifierKey was 'false' then:
     *       0 : If a mine did NOT blow off;
     *       1 : If a mine blew off.
     */
    click(modifierKey) {
        if (this.revealed) { return 0; }
        if (modifierKey) {
            if (this.isFlagged) {
                this.setWaterIcon();
                return -1;
            } else {
                this.setFlagIcon();
                return 1;
            }
        }
        // no modifierKey, mine blows off
        this.revealed = true;
        this.setMineIcon(['text-danger']);
        return 1;
    }

    /**
     * Reveal the cell type on the DOM and place additional CSS classes on it.
     *
     * @param {Array} classAddition - Array of CSS classes to be added to the
     *      element.
     */
    reveal(classAddition = null) {
        if (!this.revealed) {
            this.revealed = true;
            if (this.isFlagged) {
                // reveal a right flagging
                this.setMineIcon(['text-success', ...classAddition || []]);
            } else {
                // otherwise just reveal the mine
                this.setMineIcon(classAddition);
            }
        }
        return this;
    }
}
