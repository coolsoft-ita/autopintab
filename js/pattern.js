/*
 * Copyright (C) 2019 Claudio Nicora <coolsoft.ita@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Save patterns to settings.
 */
function SavePatterns(newPatterns) {
    browser.storage.local.set({ patterns: newPatterns });
}

/**
 * @classdesc Class to describe a Pattern rule
 * @class
 */
class Pattern {

    constructor(pattern = '', isRegex = false, enabled = true) {
        /**
         * Rule pattern, could be a simple string or a regular expression
         *
         * @type {string}
         */
        this.pattern = pattern;
        /**
         * True if the pattern property describes a regular expression
         *
         * @type {boolean}
         */
        this.isRegex = isRegex;
        /**
         * Enabled state of the pattern
         *
         * @type {boolean}
         */
        this.enabled = enabled;
    }

    
    /**
     * Validate the pattern.
     *
     * @returns {true|object}
     * If the pattern is valid returns true, otherwise returns an object with invalid fields errors (key=field name, value=error messages).
     * (actually only the "pattern" field can raise validation errors...)
     */
    Validate() {
        let errors = {};
        if (!this.pattern) {
            errors["pattern"] = "Pattern field cannot be empty";
        }
        // test RegExp validity
        if (this.isRegex) {
            try {
                new RegExp(this.pattern);
            }
            catch(e) {
                errors["pattern"] = "Invalid regular expression: " + e.message;
            }
        }
        // do we have any error?
        return (Object.keys(errors).length !== 0) ? errors : true;
    }
}
