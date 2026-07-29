/******************************************************************************
 * =============================================================================
 * IPSAS V2
 * -----------------------------------------------------------------------------
 * Module       : headerMap.js
 * Layer        : Core / Data
 * Domain       : Metadata
 *
 * Description
 * -----------------------------------------------------------------------------
 * Official Data Dictionary for IPSAS V2.
 *
 * Responsibilities
 * -----------------------------------------------------------------------------
 * - Define canonical field names
 * - Define CSV header aliases
 * - Define field metadata
 * - Provide header lookup services
 * - Support schema validation
 * - Support parser normalization
 *
 * Public API
 * -----------------------------------------------------------------------------
 * get(field)
 * has(field)
 * findAlias(header)
 * getAliases(field)
 * getType(field)
 * isRequired(field)
 * listFields()
 * listCategories()
 * fieldsByCategory(category)
 * version()
 *
 * =============================================================================
 * Version      : 1.2.0
 * Build        : 2026.07.28.002
 * Status       : Development
 *
 * Change Log (1.2.0)
 * -----------------------------------------------------------------------------
 * - Added quiz1, quiz2, assignment1, assignment2, test1, test2,
 *   otherAssessment, otherAssessmentScore - confirmed against the real
 *   marks sheet layout ("REKOD PEMARKAHAN SUBJEK UMUM DAN BINA INSAN",
 *   see dataSources.js MARKS_LAYOUT and marksEngine.js). The pre-existing
 *   generic `quiz`/`assignment` fields are kept for any future source
 *   that doesn't split components by number.
 * =============================================================================
 ******************************************************************************/

/******************************************************************************
 * Module Metadata
 ******************************************************************************/

const MODULE = Object.freeze({

    NAME: "HeaderMap",

    VERSION: "1.2.0",

    BUILD: "2026.07.28.002",

    STATUS: "Development"

});

/******************************************************************************
 * Categories
 ******************************************************************************/

const CATEGORY = Object.freeze({

    IDENTITY: "identity",

    ACADEMIC: "academic",

    SUBJECT: "subject",

    ATTENDANCE: "attendance",

    ASSESSMENT: "assessment",

    ANALYTICS: "analytics",

    SYSTEM: "system"

});

/******************************************************************************
 * Field Definitions
 *
 * Each field defines:
 *   - category  : which CATEGORY it belongs to
 *   - type      : "string" | "number"
 *   - required  : whether the field must be present to build a valid record
 *   - aliases   : known CSV/Google Sheets header text variants, uppercased
 *                 for case-insensitive matching (see normalizeHeader)
 ******************************************************************************/

const FIELDS = Object.freeze({

    // Identity
    ic: Object.freeze({
        category: CATEGORY.IDENTITY,
        type: "string",
        required: true,
        aliases: ["NO. KP", "NO KP", "IC", "NO. K/P", "KAD PENGENALAN"]
    }),

    name: Object.freeze({
        category: CATEGORY.IDENTITY,
        type: "string",
        required: true,
        aliases: ["NAMA", "NAME"]
    }),

    gender: Object.freeze({
        category: CATEGORY.IDENTITY,
        type: "string",
        required: false,
        aliases: ["JANTINA", "GENDER"]
    }),

    race: Object.freeze({
        category: CATEGORY.IDENTITY,
        type: "string",
        required: false,
        aliases: ["BANGSA", "RACE"]
    }),

    religion: Object.freeze({
        category: CATEGORY.IDENTITY,
        type: "string",
        required: false,
        aliases: ["AGAMA", "RELIGION"]
    }),

    // Academic
    department: Object.freeze({
        category: CATEGORY.ACADEMIC,
        type: "string",
        required: false,
        aliases: ["JABATAN", "DEPARTMENT"]
    }),

    course: Object.freeze({
        category: CATEGORY.ACADEMIC,
        type: "string",
        required: false,
        aliases: ["KURSUS", "PROGRAM", "COURSE"]
    }),

    semester: Object.freeze({
        category: CATEGORY.ACADEMIC,
        type: "number",
        required: false,
        aliases: ["SEMESTER"]
    }),

    session: Object.freeze({
        category: CATEGORY.ACADEMIC,
        type: "string",
        required: false,
        aliases: ["SESI", "SESSION"]
    }),

    class: Object.freeze({
        category: CATEGORY.ACADEMIC,
        type: "string",
        required: false,
        aliases: ["KELAS", "CLASS"]
    }),

    // Subject
    subject: Object.freeze({
        category: CATEGORY.SUBJECT,
        type: "string",
        required: false,
        aliases: ["KOD & NAMA SUBJEK / MODUL", "SUBJEK", "SUBJECT"]
    }),

    subjectCode: Object.freeze({
        category: CATEGORY.SUBJECT,
        type: "string",
        required: false,
        aliases: ["KOD SUBJEK", "SUBJECT CODE"]
    }),

    lecturer: Object.freeze({
        category: CATEGORY.SUBJECT,
        type: "string",
        required: false,
        aliases: ["PENGAJAR", "PENSYARAH", "LECTURER"]
    }),

    // Attendance
    interactionHours: Object.freeze({
        category: CATEGORY.ATTENDANCE,
        type: "number",
        required: false,
        aliases: ["BIL. JAM INTERAKSI", "BIL JAM INTERAKSI"]
    }),

    presentHours: Object.freeze({
        category: CATEGORY.ATTENDANCE,
        type: "number",
        required: false,
        aliases: ["BIL. JAM HADIR", "BIL JAM HADIR"]
    }),

    absentHours: Object.freeze({
        category: CATEGORY.ATTENDANCE,
        type: "number",
        required: false,
        aliases: ["BIL. JAM TIDAK HADIR", "BIL JAM TIDAK HADIR"]
    }),

    attendancePercentage: Object.freeze({
        category: CATEGORY.ATTENDANCE,
        type: "number",
        required: false,
        aliases: ["* PERATUS KEHADIRAN (%)", "PERATUS KEHADIRAN (%)", "PERATUS KEHADIRAN"]
    }),

    // Assessment
    coursework: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["KERJA KURSUS", "COURSEWORK"]
    }),

    assignment: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["TUGASAN", "ASSIGNMENT"]
    }),

    quiz: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["KUIZ", "QUIZ"]
    }),

    practical: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["AMALI", "PRACTICAL"]
    }),

    finalExam: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["PEPERIKSAAN AKHIR", "FINAL EXAM"]
    }),

    totalMarks: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["JUMLAH MARKAH", "TOTAL MARKS"]
    }),

    grade: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "string",
        required: false,
        aliases: ["GRED", "GRADE"]
    }),

    // Assessment (numbered components - confirmed against the real
    // "REKOD PEMARKAHAN" marks sheet layout, see dataSources.js
    // MARKS_LAYOUT and marksEngine.js)
    quiz1: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["KUIZ 1", "QUIZ 1"]
    }),

    quiz2: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["KUIZ 2", "QUIZ 2"]
    }),

    assignment1: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["TUGASAN 1", "ASSIGNMENT 1"]
    }),

    assignment2: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["TUGASAN 2", "ASSIGNMENT 2"]
    }),

    test1: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["UJIAN 1", "TEST 1"]
    }),

    test2: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["UJIAN 2", "TEST 2"]
    }),

    otherAssessment: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["PENILAIAN LAIN", "OTHER ASSESSMENT"]
    }),

    otherAssessmentScore: Object.freeze({
        category: CATEGORY.ASSESSMENT,
        type: "number",
        required: false,
        aliases: ["MATA PENILAIAN LAIN", "OTHER ASSESSMENT SCORE"]
    }),

    // Analytics
    riskLevel: Object.freeze({
        category: CATEGORY.ANALYTICS,
        type: "string",
        required: false,
        aliases: ["TAHAP RISIKO", "RISK LEVEL"]
    }),

    recommendation: Object.freeze({
        category: CATEGORY.ANALYTICS,
        type: "string",
        required: false,
        aliases: ["CADANGAN", "RECOMMENDATION"]
    }),

    status: Object.freeze({
        category: CATEGORY.ANALYTICS,
        type: "string",
        required: false,
        aliases: ["STATUS"]
    })

});

/******************************************************************************
 * Private Helpers
 ******************************************************************************/

/**
 * Normalize header text before comparison.
 *
 * @param {string} header
 * @returns {string}
 */
function normalizeHeader(header) {

    return String(header)
        .trim()
        .replace(/\s+/g, " ")
        .toUpperCase();

}

/**
 * Build a reverse lookup: normalized alias -> canonical field name.
 * Built once at module load time.
 *
 * @returns {Object}
 */
function buildAliasIndex() {

    const index = {};

    for (const [field, definition] of Object.entries(FIELDS)) {

        for (const alias of definition.aliases ?? []) {

            index[normalizeHeader(alias)] = field;

        }

        // The canonical field name itself is always a valid alias.
        index[normalizeHeader(field)] = field;

    }

    return index;

}

const ALIAS_INDEX = Object.freeze(buildAliasIndex());

/******************************************************************************
 * Public API
 ******************************************************************************/

/**
 * Get the full definition for a canonical field.
 *
 * @param {string} field
 * @returns {Object|null}
 */
function get(field) {

    return FIELDS[field] ?? null;

}

/**
 * Check if a canonical field exists.
 *
 * @param {string} field
 * @returns {boolean}
 */
function has(field) {

    return field in FIELDS;

}

/**
 * Resolve a raw CSV/Sheet header to its canonical field name.
 *
 * @param {string} header
 * @returns {string|null}
 */
function findAlias(header) {

    const key = normalizeHeader(header);

    return ALIAS_INDEX[key] ?? null;

}

/**
 * Get all known aliases for a canonical field.
 *
 * @param {string} field
 * @returns {string[]}
 */
function getAliases(field) {

    return FIELDS[field]?.aliases ?? [];

}

/**
 * Get the data type of a canonical field.
 *
 * @param {string} field
 * @returns {string|null}
 */
function getType(field) {

    return FIELDS[field]?.type ?? null;

}

/**
 * Check whether a canonical field is required.
 *
 * @param {string} field
 * @returns {boolean}
 */
function isRequired(field) {

    return FIELDS[field]?.required === true;

}

/**
 * List every canonical field name.
 *
 * @returns {string[]}
 */
function listFields() {

    return Object.keys(FIELDS);

}

/**
 * List every category code.
 *
 * @returns {string[]}
 */
function listCategories() {

    return Object.values(CATEGORY);

}

/**
 * List canonical field names belonging to a category.
 *
 * @param {string} category
 * @returns {string[]}
 */
function fieldsByCategory(category) {

    return Object.entries(FIELDS)
        .filter(([, definition]) => definition.category === category)
        .map(([field]) => field);

}

function version() {

    return MODULE;

}

/******************************************************************************
 * Export
 ******************************************************************************/

export const HeaderMap = Object.freeze({

    get,

    has,

    findAlias,

    getAliases,

    getType,

    isRequired,

    listFields,

    listCategories,

    fieldsByCategory,

    version

});
