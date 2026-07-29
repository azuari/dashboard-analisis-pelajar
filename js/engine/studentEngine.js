/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : studentEngine.js
 * Layer        : Business Layer
 * Domain       : Student Identity
 *
 * Description
 * ----------------------------------------------------------------------------
 * Business Identity Engine for IPSAS V2.
 * Responsible for student lookup, indexing and identity management
 * using runtime data from DataHub.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Manage student runtime
 * - Provide student lookup by IC / Name
 * - Provide student existence checks
 *
 * Depends On
 * ----------------------------------------------------------------------------
 * - DataHub
 *
 * Public API
 * ----------------------------------------------------------------------------
 * initialize()
 * getAll()
 * findByIC()
 * findByName()
 * exists()
 * count()
 * reloadStudents()
 *
 * =============================================================================
 * Version      : 2.1.0
 * Build        : 2026.07.28.001
 * Status       : Development (RC2)
 *
 * Change Log (2.1.0)
 * ----------------------------------------------------------------------------
 * - Refactored from object+`this` pattern to the module-closure pattern
 *   used by AttendanceEngine, per the agreed Golden Reference decision
 *   (03-Business-Layer-Guide.md, IDS-009). This engine is now the
 *   reference implementation other engines should copy.
 * - Removed duplicate key definitions of findByIC/findByName/exists/count
 *   (previously defined twice in the same object literal - the stub
 *   "not implemented" versions were dead code silently overridden by
 *   the real versions defined later in the same file).
 * - indexByIC/indexByName now use real Map instances consistently
 *   (previously declared as Map but built and read as plain objects).
 * - Added ES6 import for DataHub (previously relied on global scope).
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

    NAME: "StudentEngine",

    VERSION: "2.1.0"

});

/******************************************************************************
 * Configuration
 ******************************************************************************/

const CONFIGURATION = Object.freeze({

    normalizeIC: true,

    normalizeName: true,

    caseSensitive: false

});

/******************************************************************************
 * Runtime
 ******************************************************************************/

const runtime = {

    students: [],

    indexByIC: new Map(),

    indexByName: new Map(),

    statistics: {},

    metadata: {}

};

/******************************************************************************
 * Private Helpers
 ******************************************************************************/

/******************************************************************************
 * normalizeIC()
 *
 * Normalize an IC number for consistent lookup.
 *
 * @param {string} ic
 * @returns {string}
 ******************************************************************************/

function normalizeIC(ic) {

    if (!CONFIGURATION.normalizeIC) {

        return ic;

    }

    if (ic == null) {

        return "";

    }

    return String(ic)
        .trim()
        .replace(/-/g, "")
        .replace(/\s+/g, "");

}

/******************************************************************************
 * normalizeName()
 *
 * Normalize a student name for consistent lookup.
 *
 * @param {string} name
 * @returns {string}
 ******************************************************************************/

function normalizeName(name) {

    if (!CONFIGURATION.normalizeName) {

        return name;

    }

    if (name == null) {

        return "";

    }

    return String(name)
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

}

/******************************************************************************
 * buildICIndex()
 *
 * Build IC -> student lookup map.
 *
 * @param {Object[]} students
 * @returns {Map}
 ******************************************************************************/

function buildICIndex(students) {

    const index = new Map();

    for (const student of students) {

        const ic = normalizeIC(student.ic);

        if (!ic) {

            continue;

        }

        if (index.has(ic)) {

            console.warn(
                `[StudentEngine] Duplicate IC detected: ${ic}`
            );

        }

        index.set(ic, student);

    }

    return index;

}

/******************************************************************************
 * buildNameIndex()
 *
 * Build Name -> student[] lookup map.
 *
 * @param {Object[]} students
 * @returns {Map}
 ******************************************************************************/

function buildNameIndex(students) {

    const index = new Map();

    for (const student of students) {

        const name = normalizeName(student.name);

        if (!name) {

            continue;

        }

        if (!index.has(name)) {

            index.set(name, []);

        }

        index.get(name).push(student);

    }

    return index;

}

/******************************************************************************
 * Initialization
 ******************************************************************************/

function initialize() {

    return reloadStudents();

}

/******************************************************************************
 * reloadStudents()
 *
 * Rebuild StudentEngine runtime from DataHub.
 ******************************************************************************/

function reloadStudents() {

    const students = DataHub.getStudents() ?? [];

    if (!Array.isArray(students)) {

        throw new Error(
            "[StudentEngine] Student data is not available."
        );

    }

    const indexByIC = buildICIndex(students);

    const indexByName = buildNameIndex(students);

    const metadata = {

        loadedAt: new Date(),

        totalRecords: students.length,

        source: "DataHub",

        engine: ENGINE.NAME,

        version: ENGINE.VERSION,

        status: "READY"

    };

    Object.assign(runtime, {

        students,

        indexByIC,

        indexByName,

        metadata

    });

    return metadata;

}

/******************************************************************************
 * Public API
 ******************************************************************************/

/******************************************************************************
 * getAll()
 *
 * Return all students.
 *
 * @returns {Object[]}
 ******************************************************************************/

function getAll() {

    return runtime.students;

}

/******************************************************************************
 * findByIC()
 *
 * Find a student by IC number.
 *
 * @param {string} ic
 * @returns {Object|null}
 ******************************************************************************/

function findByIC(ic) {

    const key = normalizeIC(ic);

    return runtime.indexByIC.get(key) ?? null;

}

/******************************************************************************
 * findByName()
 *
 * Find students by name.
 *
 * @param {string} name
 * @returns {Object[]}
 ******************************************************************************/

function findByName(name) {

    const key = normalizeName(name);

    return runtime.indexByName.get(key) ?? [];

}

/******************************************************************************
 * exists()
 *
 * Check whether a student with the given IC exists.
 *
 * @param {string} ic
 * @returns {boolean}
 ******************************************************************************/

function exists(ic) {

    return findByIC(ic) !== null;

}

/******************************************************************************
 * count()
 *
 * Count total students in runtime.
 *
 * @returns {number}
 ******************************************************************************/

function count() {

    return runtime.students.length;

}

/******************************************************************************
 * Export
 ******************************************************************************/

export const StudentEngine = Object.freeze({

    initialize,

    getAll,

    findByIC,

    findByName,

    exists,

    count,

    reloadStudents

});

export default StudentEngine;
