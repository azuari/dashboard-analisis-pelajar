/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : attendanceEngine.js
 * Layer        : Business Layer
 * Domain       : Attendance
 *
 * Description
 * ----------------------------------------------------------------------------
 * Attendance Business Engine
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Manage attendance runtime
 * - Provide attendance queries
 * - Provide attendance summary
 * - Provide attendance statistics
 *
 * Depends On
 * ----------------------------------------------------------------------------
 * - DataHub
 *
 * Public API
 * ----------------------------------------------------------------------------
 * getAttendance()
 * getAttendanceByIC()
 * hasAttendance()
 * listAttendance()
 * reloadAttendance()
 * getAttendanceSummary()
 * getAttendanceStatistics()
 *
 * =============================================================================
 * Version      : 1.2.0
 * Build        : 2026.07.29.001
 * Status       : Development (RC2)
 *
 * Change Log (1.2.0) - BUG FIX
 * ----------------------------------------------------------------------------
 * - normalizeAttendance() was silently dropping `course`, `subjectCode`,
 *   `session` and `semester` from every record (only destructured
 *   ic/name/subject/interactionHours/presentHours/absentHours/
 *   attendancePercentage). This caused: the course dropdown filter to
 *   always return empty (a.course === "SMS" never matched since
 *   a.course was undefined), the attendance chart to group everything
 *   under a single "UNKNOWN" bar, and "(undefined)" appearing next to
 *   attendance/risk entries in the dashboard. Now mirrors marksEngine's
 *   field set.
 * =============================================================================
 ******************************************************************************/

/******************************************************************************
 * Imports
 ******************************************************************************/

import { DataHub } from "../data/dataHub.js";

/******************************************************************************
 * Engine Metadata
 ******************************************************************************/

const ENGINE = Object.freeze({

    NAME: "AttendanceEngine",

    VERSION: "1.2.0"

});

/******************************************************************************
 * Runtime
 ******************************************************************************/

const runtime = {

    attendanceMap: new Map(),

    attendanceList: [],

    statistics: {},

    metadata: {}

};

/******************************************************************************
 * Private Helpers
 ******************************************************************************/

/******************************************************************************
 * normalizeAttendance()
 *
 * Normalize a single attendance record into the IPSAS domain model.
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
 *
 * @param {Object} record
 * @returns {Object|null}
 ******************************************************************************/

function normalizeAttendance(record) {

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

        interactionHours = 0,

        presentHours = 0,

        absentHours = 0,

        attendancePercentage = 0

    } = record;

    return {

        ic: String(ic).trim(),

        name: String(name).trim(),

        subject: String(subject).trim(),

        subjectCode: String(subjectCode).trim(),

        course: String(course).trim(),

        session: String(session).trim(),

        semester,

        interactionHours: Number(interactionHours),

        presentHours: Number(presentHours),

        absentHours: Number(absentHours),

        attendancePercentage: Number(attendancePercentage)

    };

}


/******************************************************************************
 * buildAttendance()
 *
 * Build a normalized attendance object.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Normalize a raw attendance record
 * - Return a Business Layer domain object
 *
 * This function DOES NOT:
 * - validate data
 * - update runtime
 * - calculate statistics
 *
 * @param {Object} record
 * @returns {Object|null}
 ******************************************************************************/

function buildAttendance(record) {

    const attendance = normalizeAttendance(record);

    if (!attendance) {

        return null;

    }

    return attendance;

}


/******************************************************************************
 * validateAttendance()
 *
 * Validate a normalized attendance object.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Validate required fields
 * - Validate numeric values
 * - Validate business constraints
 *
 * This function DOES NOT:
 * - normalize data
 * - update runtime
 * - calculate statistics
 ******************************************************************************/

function validateAttendance(attendance) {

    if (!attendance || typeof attendance !== "object") {

        return false;

    }

    if (!attendance.ic) {

        return false;

    }

    if (!attendance.name) {

        return false;

    }

    if (attendance.interactionHours < 0) {

        return false;

    }

    if (attendance.presentHours < 0) {

        return false;

    }

    if (attendance.absentHours < 0) {

        return false;

    }

    if (
        attendance.attendancePercentage < 0 ||
        attendance.attendancePercentage > 100
    ) {

        return false;

    }

    return true;

}

/******************************************************************************
 * buildAttendanceMap()
 *
 * Build attendance lookup map.
 ******************************************************************************/

function buildAttendanceMap(attendanceList) {

    const attendanceMap = new Map();

    if (!Array.isArray(attendanceList)) {

        return attendanceMap;

    }

    for (const attendance of attendanceList) {

        if (!validateAttendance(attendance)) {

            continue;

        }

        if (attendanceMap.has(attendance.ic)) {

            console.warn(

                `[AttendanceEngine] Duplicate IC: ${attendance.ic}`

            );

        }

        attendanceMap.set(
            attendance.ic,
            attendance
        );

    }

    return attendanceMap;

}

/******************************************************************************
 * calculateStatistics()
 *
 * Calculate attendance statistics.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Calculate summary statistics
 * - Return statistics object
 *
 * This function DOES NOT:
 * - update runtime
 * - modify attendance records
 ******************************************************************************/

function calculateStatistics(attendanceList) {

    if (!Array.isArray(attendanceList)) {

        return {

            totalStudents: 0,

            totalPresent: 0,

            totalAbsent: 0,

            averageAttendance: 0

        };

    }

    let totalPresent = 0;

    let totalAbsent = 0;

    let totalPercentage = 0;

    for (const attendance of attendanceList) {

        totalPresent += attendance.presentHours;

        totalAbsent += attendance.absentHours;

        totalPercentage += attendance.attendancePercentage;

    }

    return {

        totalStudents: attendanceList.length,

        totalPresent,

        totalAbsent,

        averageAttendance:

            attendanceList.length === 0

                ? 0

                : Number(
                    (
                        totalPercentage /
                        attendanceList.length
                    ).toFixed(2)
                )

    };

}


/******************************************************************************
 * cloneAttendance()
 *
 * Clone attendance object.
 ******************************************************************************/

function cloneAttendance(attendance) {

    if (typeof structuredClone === "function") {

        return structuredClone(attendance);

    }

    return JSON.parse(JSON.stringify(attendance));

}

/******************************************************************************
 * Initialization
 ******************************************************************************/

function initialize() {

    return reloadAttendance();

}

/******************************************************************************
 * reloadAttendance()
 *
 * Rebuild AttendanceEngine runtime.
 ******************************************************************************/

function reloadAttendance() {

    // -------------------------------------------------------------------------
    // Step 1 : Read records
    // -------------------------------------------------------------------------

    const records = DataHub.getAttendanceRecords() ?? [];

    // -------------------------------------------------------------------------
    // Step 2 : Build attendance list
    // -------------------------------------------------------------------------

    const attendanceList = [];

    for (const record of records) {

        const attendance = buildAttendance(record);

        if (!attendance) continue;

        if (!validateAttendance(attendance)) continue;

        attendanceList.push(attendance);

    }

    // -------------------------------------------------------------------------
    // Step 3 : Build lookup map
    // -------------------------------------------------------------------------

    const attendanceMap =
        buildAttendanceMap(attendanceList);

    // -------------------------------------------------------------------------
    // Step 4 : Calculate statistics
    // -------------------------------------------------------------------------

    const statistics =
        calculateStatistics(attendanceList);


    // -------------------------------------------------------------------------
    // Step 5 : Build metadata
    // -------------------------------------------------------------------------

    const metadata = {

        loadedAt: new Date(),

        totalRecords: records.length,

        validRecords: attendanceList.length,

        invalidRecords:
            records.length - attendanceList.length,

        source: "DataHub",

        engine: ENGINE.NAME,

        version: ENGINE.VERSION,

        status: "READY"

    };

    // -------------------------------------------------------------------------
    // Step 6 : Commit runtime
    // -------------------------------------------------------------------------

    Object.assign(runtime, {

        attendanceList,

        attendanceMap,

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
 * getAttendance()
 *
 * Return all attendance records.
 ******************************************************************************/

function getAttendance() {

    return runtime.attendanceList;

}


/******************************************************************************
 * getAttendanceByIC()
 *
 * Get attendance record by IC.
 *
 * @param {string} ic
 * @returns {Object|null}
 ******************************************************************************/

function getAttendanceByIC(ic) {

    return runtime.attendanceMap.get(ic) ?? null;

}


/******************************************************************************
 * hasAttendance()
 *
 * Check if an attendance record exists for the given IC.
 *
 * @param {string} ic
 * @returns {boolean}
 ******************************************************************************/

function hasAttendance(ic) {

    return runtime.attendanceMap.has(ic);

}

/******************************************************************************
 * listAttendance()
 *
 * Get a list of attendance identifiers.
 *
 * @returns {string[]}
 ******************************************************************************/

function listAttendance() {

    return runtime.attendanceList.map(

        attendance => attendance.ic

    );

}


/*
 * Statistics
 */

/******************************************************************************
 * getAttendanceSummary()
 *
 * Get attendance runtime summary.
 *
 * @returns {Object}
 ******************************************************************************/

function getAttendanceSummary() {

    return runtime.metadata;

}


/******************************************************************************
 * getAttendanceStatistics()
 *
 * Get attendance statistics.
 *
 * @returns {Object}
 ******************************************************************************/

function getAttendanceStatistics() {

    return runtime.statistics;

}

/******************************************************************************
 * Export
 ******************************************************************************/

export const attendanceEngine = Object.freeze({
    initialize,

    getAttendance,

    getAttendanceByIC,

    hasAttendance,

    listAttendance,

    reloadAttendance,

    getAttendanceSummary,

    getAttendanceStatistics

});
