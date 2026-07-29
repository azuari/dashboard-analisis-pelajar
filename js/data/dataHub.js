/**
 * ==========================================================
 * IPSAS V2 - Data Hub
 * ----------------------------------------------------------
 * Integrated Pelajar Smart Analytics System
 * CANONICAL DATA ACCESS LAYER
 * ==========================================================
 * Version      : 3.0.0
 * Build        : 2026.07.29.001
 * Module       : Data Hub
 * Layer        : Data Layer
 * Status       : Development (RC3)
 * Dependencies :
 *      csvLoader.js
 *      parser.js
 *      dataSources.js
 *
 * Change Log (3.0.0) - CRITICAL BUG FIX
 * ----------------------------------------------------------
 * - ROOT CAUSE FOUND: the previous store shape (store.attendance,
 *   store.marks as single flat arrays) meant every source in the same
 *   category OVERWROTE the previous one. With 4 ATTENDANCE sources and
 *   4 MARKS sources all targeting the same "attendance"/"marks" key,
 *   loading SMS -> SMV -> SMB -> SMO left ONLY SMO's data behind - the
 *   other 3 courses were silently wiped after every full load. This
 *   explains: marks table only ever showing SMO regardless of the
 *   course dropdown, Top 10 lists / risk list only ever showing SMO
 *   students, and Audit Center reporting far fewer records than the
 *   true total across 4 courses.
 * - FIX: records are now stored per-sourceId
 *   (`store.recordsBySource[sourceId]`). Every getter (getStudents,
 *   getAttendanceRecords, getMarks, getAnalytics) aggregates by
 *   flat-mapping every source whose category matches, via
 *   DATASOURCES.listByCategory(). Reloading one source now only
 *   replaces that source's own slice - it can no longer erase another
 *   course's data.
 * - `set()`/`get()`/`clear()` (which addressed the old category keys
 *   directly) are removed - they no longer map to anything meaningful
 *   under the new shape. Use getStudents()/getAttendanceRecords()/
 *   getMarks()/getAnalytics() and clearSource()/resetSource() instead.
 * ==========================================================
 */

import { CSVLoader } from "./csvLoader.js";
import { Parser } from "./parser.js";
import { DATASOURCES, SOURCE_CATEGORY } from "./dataSources.js";

export class DataHub {

    // ======================================================
    // RUNTIME STORE
    // ----------------------------------------------------------
    // recordsBySource: { [sourceId]: Object[] } - one slice per
    // source, never shared/overwritten across sources.
    // ======================================================

    static store = {

        recordsBySource: {},

        // Per-source metadata (subject, loadedAt, recordCount, ...)
        metadata: {}

    };

    // ======================================================
    // GET BY CATEGORY (aggregates every source in that category)
    // ======================================================

    static getByCategory(category) {

        const sources = DATASOURCES.listByCategory(category);

        return sources.flatMap(

            source => this.store.recordsBySource[source.id] ?? []

        );

    }

    // ======================================================
    // BUSINESS API
    // ======================================================

    static getStudents() {

        return this.getByCategory(SOURCE_CATEGORY.STUDENTS);

    }

    static getAttendanceRecords() {

        return this.getByCategory(SOURCE_CATEGORY.ATTENDANCE);

    }

    static getMarks() {

        return this.getByCategory(SOURCE_CATEGORY.MARKS);

    }

    static getAnalytics() {

        return this.getByCategory(SOURCE_CATEGORY.ANALYTICS);

    }

    // ======================================================
    // METADATA (per-source: subject, loadedAt, sourceId, ...)
    // ======================================================

    static getMetadata() {

        return this.store.metadata;

    }

    static getSourceMetadata(sourceId) {

        return this.store.metadata[sourceId] ?? null;

    }

    // ======================================================
    // CLEAR / RESET
    // ======================================================

    static clearSource(sourceId) {

        delete this.store.recordsBySource[sourceId];

        delete this.store.metadata[sourceId];

    }

    static reset() {

        this.store.recordsBySource = {};

        this.store.metadata = {};

    }

    // ======================================================
    // STATS
    // ======================================================

    static stats() {

        return {

            students: this.getStudents().length,

            attendance: this.getAttendanceRecords().length,

            marks: this.getMarks().length,

            analytics: this.getAnalytics().length,

            sourcesLoaded: Object.keys(this.store.recordsBySource).length

        };

    }

    // ======================================================
    // PARSE BY SOURCE
    // ----------------------------------------------------------
    // Attendance/Marks sheets have a multi-row merged header block
    // and use a fixed row/column layout (see dataSources.js). Every
    // other source is assumed to be a flat, single-header CSV.
    // ======================================================

    static _parseBySource(source, csv) {

        if (

            source.category === SOURCE_CATEGORY.ATTENDANCE ||
            source.category === SOURCE_CATEGORY.MARKS

        ) {

            return Parser.parseFixedRange(csv, source.layout);

        }

        const result = Parser.parse(csv);

        if (!Parser.isValid(result)) {

            throw new Error("[DataHub] Invalid parser result.");

        }

        return result.data;

    }

    // ======================================================
    // LOAD
    // ----------------------------------------------------------
    // Loads exactly ONE source into its own slice
    // (store.recordsBySource[sourceId]). Never touches any other
    // source's data.
    // ======================================================

    static async load({ sourceId }) {

        const source = DATASOURCES.getSource(sourceId);

        if (!source) {

            throw new Error(
                `[DataHub] Source '${sourceId}' not found.`
            );

        }

        const csv = await CSVLoader.load(sourceId);

        const data = this._parseBySource(source, csv);

        // Attach source-level metadata (subject, course, session,
        // semester) to every record so downstream engines don't need
        // to re-resolve which sheet a row came from.
        const enrichedData = data.map(record => ({

            ...record,

            subject: source.subject,

            subjectCode: source.subjectCode,

            course: source.course,

            session: source.session,

            semester: source.semester

        }));

        this.store.recordsBySource[sourceId] = enrichedData;

        this.store.metadata[sourceId] = {

            sourceId,

            course: source.course,

            subject: source.subject,

            subjectCode: source.subjectCode,

            session: source.session,

            semester: source.semester,

            category: source.category,

            recordCount: enrichedData.length,

            loadedAt: new Date()

        };

        return enrichedData;

    }

    // ======================================================
    // RELOAD
    // ======================================================

    static async reload({ sourceId }) {

        CSVLoader.removeCache(sourceId);

        return await this.load({ sourceId });

    }

    // ======================================================
    // LOAD MANY
    // ======================================================

    static async loadMany(requests = []) {

        return Promise.all(

            requests.map(request => this.load(request))

        );

    }

    // ======================================================
    // IS LOADED
    // ----------------------------------------------------------
    // Accepts a SOURCE_CATEGORY value (e.g. "ATTENDANCE"), not a
    // store key - the old flat store keys no longer exist.
    // ======================================================

    static isLoaded(category) {

        return this.getByCategory(category).length > 0;

    }

    // ======================================================
    // DIAGNOSTICS
    // ----------------------------------------------------------
    // Runtime health snapshot: what's loaded, and how much.
    // ======================================================

    static diagnostics() {

        return {

            loaded: {

                students: this.isLoaded(SOURCE_CATEGORY.STUDENTS),

                attendance: this.isLoaded(SOURCE_CATEGORY.ATTENDANCE),

                marks: this.isLoaded(SOURCE_CATEGORY.MARKS),

                analytics: this.isLoaded(SOURCE_CATEGORY.ANALYTICS)

            },

            stats: this.stats()

        };

    }

    // ======================================================
    // VERSION
    // ======================================================

    static VERSION = Object.freeze({

        version: "3.0.0",

        build: "2026.07.29.001"

    });

    static version() {

        return this.VERSION;

    }

    // ======================================================
    // SNAPSHOT
    // ======================================================

    static snapshot() {

        if (typeof structuredClone === "function") {

            return structuredClone(this.store);

        }

        return JSON.parse(
            JSON.stringify(this.store)
        );

    }

}
