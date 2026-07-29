/**
 * ==========================================================
 * IPSAS V2 - CSV Parser
 * ----------------------------------------------------------
 * Integrated Pelajar Smart Analytics System
 * ==========================================================
 * Version      : 2.2.0
 * Build        : 2026.07.29.002
 * Module       : Parser
 * Layer        : Data Layer
 * Status       : Development (RC2)
 * Dependencies :
 *      PapaParse
 *
 * Change Log (2.1.0)
 * ----------------------------------------------------------
 * - Added ES6 export (fixes broken import in dataHub.js)
 * - Added parseFixedRange() to support multi-row-header sheets
 *   such as "REKOD KEHADIRAN PELAJAR" (5 merged header rows,
 *   data starting at row 7, ending at row 31 - see ADR-003 and
 *   dataSources.js -> ATTENDANCE_LAYOUT).
 * - header:true is no longer usable for attendance sheets since
 *   their real header sits on row 5, not row 1. parseFixedRange()
 *   parses positionally instead of by header name.
 * Change Log (2.2.0)
 * ----------------------------------------------------------
 * - parseFixedRange() now also accepts a `segments` layout shape:
 *   { segments: [{firstDataRow, lastDataRow, columns}, ...] }
 *   instead of a single flat {firstDataRow, lastDataRow, columns}.
 *   This is required because a formula-driven "overflow" row range
 *   on the marks sheet was confirmed to use a DIFFERENT column
 *   layout than the main list (3 fewer blank columns before
 *   "Penilaian Lain") - a single fixed column mapping cannot cover
 *   both ranges correctly. The old flat shape still works unchanged
 *   for single-segment sheets (e.g. attendance).
 * ==========================================================
 */

export class Parser {

    // ======================================================
    // DEFAULT OPTIONS
    // ======================================================

    static defaultOptions = Object.freeze({

        header: true,

        skipEmptyLines: true,

        trimHeaders: true,

        trimValues: true,

        dynamicTyping: false

    });

    // ======================================================
    // RAW OPTIONS (no header assumption)
    // ======================================================

    static rawOptions = Object.freeze({

        header: false,

        skipEmptyLines: true,

        dynamicTyping: false

    });

    // ======================================================
    // VALIDATE
    // ======================================================

    static validate(csvText) {

        if (typeof csvText !== "string") {

            throw new Error("[Parser] CSV must be a string.");

        }

        if (csvText.trim() === "") {

            throw new Error("[Parser] CSV is empty.");

        }

        return true;

    }

    // ======================================================
    // PARSE (header-based, e.g. flat student/marks sheets)
    // ======================================================

    static parse(csvText, options = {}) {

        this.validate(csvText);

        const config = {

            ...this.defaultOptions,

            ...options

        };

        return Papa.parse(csvText, config);

    }

    // ======================================================
    // PARSE RAW (no header assumption, returns 2D array)
    // ======================================================

    static parseRaw(csvText, options = {}) {

        this.validate(csvText);

        const config = {

            ...this.rawOptions,

            ...options

        };

        return Papa.parse(csvText, config);

    }

    // ======================================================
    // PARSE FIXED RANGE
    // ----------------------------------------------------------
    // Extract rows from a raw parse result, mapping columns by fixed
    // position. Accepts either:
    //   - a flat layout: { firstDataRow, lastDataRow, columns }
    //   - a segmented layout: { segments: [{firstDataRow, lastDataRow,
    //     columns}, ...] } - for sheets where different row ranges use
    //     different column positions (e.g. a formula-driven overflow
    //     range with a narrower table than the main list).
    //
    // This is the required strategy for multi-row-header sheets
    // (e.g. attendance/marks sheets) where:
    //   - header:true cannot locate the real header row
    //   - a broken duplicate table (#REF! errors) may exist in the
    //     scanned range and must never be read
    //
    // @param {string} csvText
    // @param {Object} layout
    // @returns {Object[]} array of row objects keyed by each segment's columns
    // ======================================================

    static parseFixedRange(csvText, layout) {

        if (!layout || typeof layout !== "object") {

            throw new Error("[Parser] parseFixedRange requires a layout.");

        }

        const result = this.parseRaw(csvText);

        if (!this.isValid(result)) {

            throw new Error("[Parser] Invalid parser result.");

        }

        const rows = result.data;

        const segments = Array.isArray(layout.segments)
            ? layout.segments
            : [layout];

        const records = [];

        for (const segment of segments) {

            records.push(...this._extractSegment(rows, segment));

        }

        return records;

    }

    // ======================================================
    // PRIVATE: EXTRACT SEGMENT
    // ----------------------------------------------------------
    // Extract and map rows [firstDataRow, lastDataRow] (1-indexed,
    // inclusive) from a raw 2D row array using one column mapping.
    // ======================================================

    static _extractSegment(rows, segment) {

        const { firstDataRow, lastDataRow, columns } = segment;

        // Convert 1-indexed spreadsheet rows to 0-indexed array positions
        const startIndex = firstDataRow - 1;

        const endIndex = Math.min(lastDataRow - 1, rows.length - 1);

        const records = [];

        for (let i = startIndex; i <= endIndex; i++) {

            const row = rows[i];

            if (!row) {

                continue;

            }

            const record = this._mapRow(row, columns);

            // Stop-guard: a valid student row always has a Bil (row number).
            // This protects against broken/leftover tables (#REF!) that may
            // sit immediately below the real data block.
            if (!this._isValidRow(record)) {

                continue;

            }

            records.push(record);

        }

        return records;

    }

    // ======================================================
    // PRIVATE: MAP ROW
    // ======================================================

    static _mapRow(row, columns) {

        const record = {};

        for (const [field, index] of Object.entries(columns)) {

            record[field] = row[index] ?? "";

        }

        return record;

    }

    // ======================================================
    // PRIVATE: IS VALID ROW
    // ======================================================

    static _isValidRow(record) {

        // Bil column must be a positive integer; #REF! or blank rows
        // will fail this check and are silently skipped.
        const bil = Number(record.bil);

        return Number.isInteger(bil) && bil > 0;

    }

    // ======================================================
    // HEADERS
    // ======================================================

    static headers(result) {

        return result.meta?.fields ?? [];

    }

    // ======================================================
    // IS VALID
    // ======================================================

    static isValid(result) {

        return Array.isArray(result?.data);

    }

}
