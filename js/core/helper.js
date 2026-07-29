/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : helper.js
 * Layer        : Registry Layer
 * Domain       : Shared Utilities
 *
 * Description
 * ----------------------------------------------------------------------------
 * Small, pure, reusable utility functions used across IPSAS V2.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Formatting (percent, date)
 * - Simple derived values (current session)
 * - Text helpers (capitalize)
 * - ID generation
 * - Numeric guards
 *
 * This module DOES NOT:
 * - contain business logic
 * - read from DataHub or any runtime store
 * - have side effects
 *
 * Public API
 * ----------------------------------------------------------------------------
 * formatPercent(value, decimals)
 * formatDate(date, pattern)
 * getCurrentSession(date)
 * capitalize(text)
 * generateStudentId(prefix)
 * isNumber(value)
 * safeNumber(value, fallback)
 * average(numbers)
 *
 * =============================================================================
 * Version      : 1.0.0
 * Build        : 2026.07.28.001
 * Status       : Development
 *
 * Change Log (1.0.0)
 * ----------------------------------------------------------------------------
 * - Implemented from scratch. The previous version of this file contained
 *   only a list of function names with no implementation.
 * =============================================================================
 ******************************************************************************/

/******************************************************************************
 * formatPercent()
 *
 * Format a number as a percentage string.
 *
 * @param {number} value - e.g. 87.456
 * @param {number} [decimals=0] - decimal places to keep
 * @returns {string} e.g. "87%" or "87.46%"
 ******************************************************************************/

export function formatPercent(value, decimals = 0) {

    const number = safeNumber(value, 0);

    return `${number.toFixed(decimals)}%`;

}

/******************************************************************************
 * formatDate()
 *
 * Format a Date object as DD/MM/YYYY (IPSAS default, see config.js
 * app.dateFormat).
 *
 * @param {Date|string|number} date
 * @param {string} [pattern="DD/MM/YYYY"]
 * @returns {string}
 ******************************************************************************/

export function formatDate(date, pattern = "DD/MM/YYYY") {

    const target = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(target.getTime())) {

        return "";

    }

    const day = String(target.getDate()).padStart(2, "0");

    const month = String(target.getMonth() + 1).padStart(2, "0");

    const year = target.getFullYear();

    return pattern

        .replace("DD", day)

        .replace("MM", month)

        .replace("YYYY", String(year));

}

/******************************************************************************
 * getCurrentSession()
 *
 * Derive the current academic session ("1/YYYY" or "2/YYYY") from a date,
 * based on ACADEMIC.sessions (SESSION_1: Jan-Jun, SESSION_2: Jul-Dec).
 *
 * @param {Date} [date=new Date()]
 * @returns {string} e.g. "2/2026"
 ******************************************************************************/

export function getCurrentSession(date = new Date()) {

    const month = date.getMonth() + 1;

    const year = date.getFullYear();

    const session = month <= 6 ? 1 : 2;

    return `${session}/${year}`;

}

/******************************************************************************
 * capitalize()
 *
 * Capitalize the first letter of each word.
 *
 * @param {string} text
 * @returns {string}
 ******************************************************************************/

export function capitalize(text) {

    if (text == null) {

        return "";

    }

    return String(text)

        .trim()

        .toLowerCase()

        .replace(/\b\w/g, char => char.toUpperCase());

}

/******************************************************************************
 * generateStudentId()
 *
 * Generate a short pseudo-unique runtime identifier for a student record.
 * This is NOT the student's official identity (see ADR-001 - No. KP
 * remains the primary key). It is only for ephemeral UI/list keys.
 *
 * @param {string} [prefix="STU"]
 * @returns {string} e.g. "STU-1abc23de"
 ******************************************************************************/

export function generateStudentId(prefix = "STU") {

    const random = Math.random().toString(36).slice(2, 10);

    return `${prefix}-${random}`;

}

/******************************************************************************
 * isNumber()
 *
 * Check whether a value is a finite number (rejects NaN, Infinity, strings).
 *
 * @param {*} value
 * @returns {boolean}
 ******************************************************************************/

export function isNumber(value) {

    return typeof value === "number" && Number.isFinite(value);

}

/******************************************************************************
 * safeNumber()
 *
 * Coerce a value to a finite number, or return a fallback.
 *
 * @param {*} value
 * @param {number} [fallback=0]
 * @returns {number}
 ******************************************************************************/

export function safeNumber(value, fallback = 0) {

    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;

}

/******************************************************************************
 * average()
 *
 * Compute the arithmetic mean of an array of numbers.
 * Non-numeric entries are ignored. Returns 0 for an empty/invalid input.
 *
 * @param {number[]} numbers
 * @returns {number}
 ******************************************************************************/

export function average(numbers) {

    if (!Array.isArray(numbers) || numbers.length === 0) {

        return 0;

    }

    const valid = numbers.filter(isNumber);

    if (valid.length === 0) {

        return 0;

    }

    const total = valid.reduce((sum, value) => sum + value, 0);

    return total / valid.length;

}

/******************************************************************************
 * Export
 ******************************************************************************/

export const Helper = Object.freeze({

    formatPercent,

    formatDate,

    getCurrentSession,

    capitalize,

    generateStudentId,

    isNumber,

    safeNumber,

    average

});
