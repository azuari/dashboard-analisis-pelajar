/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : marksEngine.js
 * Layer        : Business Layer
 * Domain       : Marks
 *
 * Description
 * ----------------------------------------------------------------------------
 * Marks Business Engine
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Manage marks runtime
 * - Provide marks queries by IC
 * - Provide marks summary
 * - Provide marks statistics (per-component averages)
 *
 * Depends On
 * ----------------------------------------------------------------------------
 * - DataHub
 *
 * Public API
 * ----------------------------------------------------------------------------
 * initialize()
 * getMarks()
 * findByIC()
 * hasMarks()
 * listMarks()
 * reloadMarks()
 * getMarksSummary()
 * getMarksStatistics()
 * computeTotal(marks)
 * computeGrade(total)
 *
 * =============================================================================
 * Version      : 2.1.0
 * Build        : 2026.07.29.002
 * Status       : Development (RC2)
 *
 * Design Notes
 * ----------------------------------------------------------------------------
 * - Follows the AttendanceEngine blueprint (module closures: Initialization
 *   -> Private Helpers -> Runtime -> Public API -> Export), the agreed
 *   Golden Reference (see studentEngine.js v2.1.0 change log).
 * - findByIC() returns an ARRAY, not a single record. Unlike attendance
 *   (currently one subject per student per session), marks are already
 *   confirmed to expand across multiple subjects, semesters and sessions
 *   per student (see dataSources.js v2.0.0 change log - Math, English,
 *   IT, semesters 1-3, sessions 2/2026 onward are coming). Returning a
 *   single record now would force a breaking API change later; an array
 *   keyed by IC is correct from day one even though today every array
 *   happens to hold exactly one record (session 1/2026, USK3311 only).
 *
 * Change Log (2.0.0)
 * ----------------------------------------------------------------------------
 * - Official component weights CONFIRMED by IKBN Pekan (user, 2026-07-29):
 *   Quiz 1 10%, Quiz 2 10%, Assignment 1 10%, Test 1 15%, Test 2 15%,
 *   Other Assessment 40% (sums to 100%, matches the GENERAL-subject
 *   coursework:100/examination:0 split in academic.js for USK3311).
 *   This matches the previously-observed otherAssessmentScore = 
 *   otherAssessment * 0.4 pattern in the raw sheet data - cross-checked
 *   against a live sample (ABANG KALLEEF AZMAN, SMS) and confirmed
 *   correct by the user before implementation.
 * - Added MARKS_WEIGHTS, computeTotal() and computeGrade() (using the
 *   official grading scale in academic.js ACADEMIC.grading.scale - not
 *   an invented scale). Every record built by buildMarks() now carries
 *   `total` and `grade` fields.
 * - calculateStatistics() now also reports averageTotal.
 *
 * Change Log (2.1.0) - BUG FIX
 * ----------------------------------------------------------------------------
 * - Fixed computeGrade() silently returning "" for decimal totals that
 *   fell in the 1-point gap between adjacent integer band boundaries
 *   (e.g. 89.96 matched neither B+ [85-89] nor A- [90-94]). See
 *   computeGrade() docstring for the fix. Reported by user: two real
 *   students showing "90%" with a blank grade.
 ******************************************************************************/

/******************************************************************************
 * Imports
 ******************************************************************************/

import { DataHub } from "../data/dataHub.js";
import { ACADEMIC } from "../core/academic.js";

/******************************************************************************
 * Engine Metadata
 ******************************************************************************/

const ENGINE = Object.freeze({

    NAME: "MarksEngine",

    VERSION: "2.1.0"

});

/******************************************************************************
 * Marks Weights
 * ----------------------------------------------------------------------------
 * Official component weights for USK3311 (Sains Kejuruteraan 1), confirmed
 * by IKBN Pekan on 2026-07-29. Sums to 100%, matching the GENERAL-subject
 * coursework:100/examination:0 split in academic.js.
 *
 * NOTE: these weights are subject-specific. When Math/English/IT sources
 * are added (see dataSources.js v2.0.0), confirm whether they share this
 * same breakdown before reusing MARKS_WEIGHTS for them.
 ******************************************************************************/

const MARKS_WEIGHTS = Object.freeze({

    quiz1: 0.10,

    quiz2: 0.10,

    assignment1: 0.10,

    test1: 0.15,

    test2: 0.15,

    otherAssessment: 0.40

});

/******************************************************************************
 * Runtime
 ******************************************************************************/

const runtime = {

    // Map<ic, Object[]> - a student can have marks across multiple
    // subjects/semesters/sessions.
    marksMap: new Map(),

    marksList: [],

    statistics: {},

    metadata: {}

};

/******************************************************************************
 * Private Helpers
 ******************************************************************************/

/******************************************************************************
 * normalizeMarks()
 *
 * Normalize a single marks record into the IPSAS domain model.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Trim string values
 * - Convert numeric values
 * - Build IPSAS domain model
 *
 * This function DOES NOT:
 * - validate data
 * - update runtime
 * - calculate statistics
 * - compute a total/final grade
 *
 * @param {Object} record
 * @returns {Object|null}
 ******************************************************************************/

function normalizeMarks(record) {

    if (!record || typeof record !== "object") {

        return null;

    }

    const {

        ic = "",

        name = "",

        subject = "",

        subjectCode = "",

        course = "",

        session = "",

        semester = null,

        quiz1 = 0,

        quiz2 = 0,

        assignment1 = 0,

        test1 = 0,

        test2 = 0,

        otherAssessment = 0,

        otherAssessmentScore = 0

    } = record;

    return {

        ic: String(ic).trim(),

        name: String(name).trim(),

        subject: String(subject).trim(),

        subjectCode: String(subjectCode).trim(),

        course: String(course).trim(),

        session: String(session).trim(),

        semester,

        quiz1: Number(quiz1) || 0,

        quiz2: Number(quiz2) || 0,

        assignment1: Number(assignment1) || 0,

        test1: Number(test1) || 0,

        test2: Number(test2) || 0,

        otherAssessment: Number(otherAssessment) || 0,

        otherAssessmentScore: Number(otherAssessmentScore) || 0

    };

}

/******************************************************************************
 * computeTotal()
 *
 * Compute the final weighted course mark (0-100) using MARKS_WEIGHTS.
 *
 * @param {Object} marks - a normalized marks record
 * @returns {number}
 ******************************************************************************/

function computeTotal(marks) {

    if (!marks) {

        return 0;

    }

    const total =

        marks.quiz1 * MARKS_WEIGHTS.quiz1 +
        marks.quiz2 * MARKS_WEIGHTS.quiz2 +
        marks.assignment1 * MARKS_WEIGHTS.assignment1 +
        marks.test1 * MARKS_WEIGHTS.test1 +
        marks.test2 * MARKS_WEIGHTS.test2 +
        marks.otherAssessment * MARKS_WEIGHTS.otherAssessment;

    return Number(total.toFixed(2));

}

/******************************************************************************
 * computeGrade()
 *
 * Resolve a final mark to a letter grade using the official grading
 * scale in academic.js (ACADEMIC.grading.scale) - not an invented scale.
 *
 * BUG FIX (2026-07-29): the original implementation matched
 * `total >= band.min && total <= band.max`. Since `total` is a computed
 * weighted average, it is frequently a decimal (e.g. 89.96), and the
 * scale's min/max are integers with a 1-point gap between adjacent
 * bands (B+ max=89, A- min=90). A decimal total landing in that gap
 * (89 < 89.96 < 90) matched NO band and silently returned no grade -
 * this was reported as two real students showing "90%" with a blank
 * grade. Fixed by sorting bands by `min` descending and taking the
 * first band whose `min` the total meets or exceeds - this is
 * equivalent for exact integers and correctly closes the gap for any
 * decimal value, since the bands' `min` values are already contiguous.
 *
 * @param {number} total - 0-100
 * @returns {string} e.g. "A", "B+", "F" - or "" only if total is
 *   outside every band's min (should not happen for 0-100 inputs)
 ******************************************************************************/

const GRADE_BANDS_DESC = [...ACADEMIC.grading.scale].sort((a, b) => b.min - a.min);

function computeGrade(total) {

    const match = GRADE_BANDS_DESC.find(band => total >= band.min);

    return match?.grade ?? "";

}

/******************************************************************************
 * buildMarks()
 *
 * Build a normalized marks object, including the computed weighted
 * total and letter grade.
 *
 * @param {Object} record
 * @returns {Object|null}
 ******************************************************************************/

function buildMarks(record) {

    const marks = normalizeMarks(record);

    if (!marks) {

        return null;

    }

    const total = computeTotal(marks);

    const grade = computeGrade(total);

    return {

        ...marks,

        total,

        grade

    };

}

/******************************************************************************
 * validateMarks()
 *
 * Validate a normalized marks object.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Validate required fields
 * - Validate numeric ranges (0-100)
 *
 * This function DOES NOT:
 * - normalize data
 * - update runtime
 * - calculate statistics
 ******************************************************************************/

function validateMarks(marks) {

    if (!marks || typeof marks !== "object") {

        return false;

    }

    if (!marks.ic) {

        return false;

    }

    if (!marks.name) {

        return false;

    }

    const components = [

        marks.quiz1,
        marks.quiz2,
        marks.assignment1,
        marks.test1,
        marks.test2,
        marks.otherAssessment

    ];

    for (const value of components) {

        if (value < 0 || value > 100) {

            return false;

        }

    }

    return true;

}

/******************************************************************************
 * buildMarksMap()
 *
 * Build IC -> marks[] lookup map. A student may appear more than once
 * (multiple subjects/semesters/sessions), so every IC maps to an array.
 ******************************************************************************/

function buildMarksMap(marksList) {

    const marksMap = new Map();

    if (!Array.isArray(marksList)) {

        return marksMap;

    }

    for (const marks of marksList) {

        if (!validateMarks(marks)) {

            continue;

        }

        if (!marksMap.has(marks.ic)) {

            marksMap.set(marks.ic, []);

        }

        marksMap.get(marks.ic).push(marks);

    }

    return marksMap;

}

/******************************************************************************
 * calculateStatistics()
 *
 * Calculate per-component averages across all valid marks records.
 *
 * This function DOES NOT:
 * - update runtime
 * - modify marks records
 ******************************************************************************/

function calculateStatistics(marksList) {

    const empty = {

        totalStudents: 0,

        averageQuiz1: 0,

        averageQuiz2: 0,

        averageAssignment1: 0,

        averageTest1: 0,

        averageTest2: 0,

        averageOtherAssessment: 0,

        averageTotal: 0

    };

    if (!Array.isArray(marksList) || marksList.length === 0) {

        return empty;

    }

    const totals = marksList.reduce((sum, marks) => {

        sum.quiz1 += marks.quiz1;
        sum.quiz2 += marks.quiz2;
        sum.assignment1 += marks.assignment1;
        sum.test1 += marks.test1;
        sum.test2 += marks.test2;
        sum.otherAssessment += marks.otherAssessment;
        sum.total += marks.total;

        return sum;

    }, { quiz1: 0, quiz2: 0, assignment1: 0, test1: 0, test2: 0, otherAssessment: 0, total: 0 });

    const count = marksList.length;

    const round2 = value => Number((value / count).toFixed(2));

    return {

        totalStudents: count,

        averageQuiz1: round2(totals.quiz1),

        averageQuiz2: round2(totals.quiz2),

        averageAssignment1: round2(totals.assignment1),

        averageTest1: round2(totals.test1),

        averageTest2: round2(totals.test2),

        averageOtherAssessment: round2(totals.otherAssessment),

        averageTotal: round2(totals.total)

    };

}

/******************************************************************************
 * Initialization
 ******************************************************************************/

function initialize() {

    return reloadMarks();

}

/******************************************************************************
 * reloadMarks()
 *
 * Rebuild MarksEngine runtime.
 ******************************************************************************/

function reloadMarks() {

    // -------------------------------------------------------------------------
    // Step 1 : Read records
    // -------------------------------------------------------------------------

    const records = DataHub.getMarks() ?? [];

    // -------------------------------------------------------------------------
    // Step 2 : Build marks list
    // -------------------------------------------------------------------------

    const marksList = [];

    for (const record of records) {

        const marks = buildMarks(record);

        if (!marks) continue;

        if (!validateMarks(marks)) continue;

        marksList.push(marks);

    }

    // -------------------------------------------------------------------------
    // Step 3 : Build lookup map
    // -------------------------------------------------------------------------

    const marksMap = buildMarksMap(marksList);

    // -------------------------------------------------------------------------
    // Step 4 : Calculate statistics
    // -------------------------------------------------------------------------

    const statistics = calculateStatistics(marksList);

    // -------------------------------------------------------------------------
    // Step 5 : Build metadata
    // -------------------------------------------------------------------------

    const metadata = {

        loadedAt: new Date(),

        totalRecords: records.length,

        validRecords: marksList.length,

        invalidRecords: records.length - marksList.length,

        source: "DataHub",

        engine: ENGINE.NAME,

        version: ENGINE.VERSION,

        status: "READY"

    };

    // -------------------------------------------------------------------------
    // Step 6 : Commit runtime
    // -------------------------------------------------------------------------

    Object.assign(runtime, {

        marksList,

        marksMap,

        statistics,

        metadata

    });

    return metadata;

}

/******************************************************************************
 * Public API
 ******************************************************************************/

/*
 * Queries
 */

/******************************************************************************
 * getMarks()
 *
 * Return all marks records (across every subject/course/session loaded).
 *
 * @returns {Object[]}
 ******************************************************************************/

function getMarks() {

    return runtime.marksList;

}

/******************************************************************************
 * findByIC()
 *
 * Get all marks records for a given IC (one per subject/session).
 *
 * @param {string} ic
 * @returns {Object[]}
 ******************************************************************************/

function findByIC(ic) {

    return runtime.marksMap.get(ic) ?? [];

}

/******************************************************************************
 * hasMarks()
 *
 * Check if any marks record exists for the given IC.
 *
 * @param {string} ic
 * @returns {boolean}
 ******************************************************************************/

function hasMarks(ic) {

    return runtime.marksMap.has(ic);

}

/******************************************************************************
 * listMarks()
 *
 * Get a list of distinct student ICs with marks loaded.
 *
 * @returns {string[]}
 ******************************************************************************/

function listMarks() {

    return [...runtime.marksMap.keys()];

}

/*
 * Statistics
 */

/******************************************************************************
 * getMarksSummary()
 *
 * Get marks runtime summary.
 *
 * @returns {Object}
 ******************************************************************************/

function getMarksSummary() {

    return runtime.metadata;

}

/******************************************************************************
 * getMarksStatistics()
 *
 * Get marks statistics (per-component averages).
 *
 * @returns {Object}
 ******************************************************************************/

function getMarksStatistics() {

    return runtime.statistics;

}

/******************************************************************************
 * Export
 ******************************************************************************/

export const marksEngine = Object.freeze({

    initialize,

    getMarks,

    findByIC,

    hasMarks,

    listMarks,

    reloadMarks,

    getMarksSummary,

    getMarksStatistics,

    computeTotal,

    computeGrade

});
