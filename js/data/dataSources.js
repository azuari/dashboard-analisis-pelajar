/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : dataSources.js
 * Layer        : Data Layer
 * Domain       : Source Registry
 *
 * Description
 * ----------------------------------------------------------------------------
 * Registry of all external data sources (Google Sheets) consumed by IPSAS V2.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Define each source (spreadsheet tab) IPSAS reads from
 * - Attach metadata to each source (session, semester, subject, course,
 *   category, column layout)
 * - Attach loader-facing fields (url, enabled, status) required by
 *   csvLoader.js
 * - Provide lookup services to CSVLoader / DataHub
 *
 * This module DOES NOT:
 * - fetch data
 * - parse data
 * - contain business logic
 *
 * Public API
 * ----------------------------------------------------------------------------
 * DATASOURCES.sourceIndex          - direct map, used by csvLoader.js
 * getSource(sourceId)
 * hasSource(sourceId)
 * listSources()
 * listByCategory(category)
 * listBySession(session)
 * listBySubject(subjectCode)
 * listBySemester(semester)
 * listByCourse(course)
 *
 * =============================================================================
 * Version      : 2.3.0
 * Build        : 2026.07.29.005
 * Status       : Development
 *
 * Change Log (1.1.0)
 * ----------------------------------------------------------------------------
 * - Reshaped to match what csvLoader.js actually expects:
 *   `DATASOURCES.sourceIndex[sourceId]` with `url`, `enabled`, `status`
 *   fields. The 1.0.0 version predated csvLoader.js being available for
 *   review and used an incompatible shape (`SOURCES` + `getSource()` only).
 *
 * Change Log (1.2.0)
 * ----------------------------------------------------------------------------
 * - Replaced spreadsheetId/gid-based gviz URLs with confirmed "Publish to
 *   Web" (pubhtml) CSV export URLs, verified reachable (SMV title
 *   confirmed: "SMV_1_2026 USK3311"). Format:
 *   https://docs.google.com/spreadsheets/d/e/{publishedKey}/pub?output=csv
 *
 * Change Log (1.3.0)
 * ----------------------------------------------------------------------------
 * - The unlabeled 5th key is confirmed: it is the published ("Publish to
 *   Web") counterpart of the private master spreadsheet
 *   (17benStAEIKRMedklM1AaOtzOubWrU4R1QIA6pyL9bVM), titled
 *   "USK 3311_1_2026 DATA MARKAH". It contains 4 tabs (one per course).
 * - Added MARKS_LAYOUT and 4 MARKS sources. Each tab actually contains TWO
 *   stacked tables: rows 4-28 (subject USK3311, real data) and rows ~41-65
 *   (subject UIT2221) - the second table is corrupted on every tab, so
 *   MARKS_LAYOUT stops at row 28 and never reads the second table at all.
 * - Column D (Peratus Kehadiran) and H (Tugasan 2) intentionally NOT
 *   mapped (owned by AttendanceEngine / confirmed blank, respectively).
 *
 * Change Log (2.0.0)
 * ----------------------------------------------------------------------------
 * - IMPORTANT SCOPE CLARIFICATION from user: the 8 sources below cover only
 *   session "1/2026", subject USK3311 (Sains Kejuruteraan 1), semester 3.
 *   The system must scale to: multiple subjects (Math, English, IT, etc.),
 *   semesters 1-3, multiple sessions (2/2026 onward), and sources coming
 *   from OTHER Google accounts/links. Primary student key remains No. KP
 *   (ADR-001) - unaffected.
 * - Restructured every source entry to carry explicit `session`,
 *   `semester` and `subjectCode` fields (previously only `subject` -
 *   the display name - existed, with no session/semester dimension at
 *   all). Without this, adding a second session or subject would have
 *   silently collided with or shadowed the first (same course = same key).
 * - Added `registerSource()` private helper so each new subject/session/
 *   semester combination is a single declarative call instead of a
 *   hand-written ~15-line object. Source IDs are now generated as
 *   `{CATEGORY}_{SESSION}_{SUBJECT_CODE}_{COURSE}` (session slashes
 *   replaced with underscores) to guarantee uniqueness as the registry
 *   grows, e.g. "ATTENDANCE_1_2026_USK3311_SMS".
 * - Added listBySession(), listBySubject(), listBySemester(), listByCourse()
 *   so DataHub/engines can later query "everything for session 2/2026" or
 *   "everything for Mathematics across all courses" without knowing IDs.
 * - `enabled`/`status` remain per-source, from a DIFFERENT Google account
 *   or link requires no code change to csvLoader.js - fetch() only cares
 *   about the URL being reachable/CORS-permissive, not who owns it.
 *
 * Change Log (2.1.0) - BUG FIX
 * ----------------------------------------------------------------------------
 * - CONFIRMED via direct content inspection + user report: total real
 *   enrolment is 86 (SMB 12 + SMO 25 + SMS 23 + SMV 26), not 85. SMV has
 *   1 extra student in a formula-driven "overflow" mini table that sits
 *   further down the sheet than the previous lastDataRow cutoff (28 for
 *   marks, 31 for attendance) covered. Both ATTENDANCE_LAYOUT and
 *   MARKS_LAYOUT lastDataRow extended to 50. See each layout's updated
 *   docstring for why a single generous range - combined with the
 *   existing Bil-integer validity check - safely covers every course
 *   without needing a different row number per course.
 *
 * Change Log (2.2.0)
 * ----------------------------------------------------------------------------
 * - CONFIRMED by user: unlike marks (whose overflow lives lower in the
 *   SAME tab), each ATTENDANCE spreadsheet has a SEPARATE SECOND TAB
 *   (different gid, same spreadsheet/publishedKey) for the formula-driven
 *   overflow roster (B7 filled -> A7 generates Bil=26 onward). Added
 *   `part` support to buildSourceId()/registerSource() so a second tab
 *   for the same course+category gets a unique ID
 *   (e.g. "ATTENDANCE_1_2026_USK3311_SMS_P2") without colliding with the
 *   main tab's source. Registered all 4 overflow tabs (SMS, SMV, SMB,
 *   SMO). DataHub.getByCategory() already aggregates every source in a
 *   category regardless of `part`, so no DataHub changes were needed.
 * - Also added explicit `gid` to the 4 main attendance sources (they
 *   previously relied on "first/active sheet" default, which is now
 *   confirmed ambiguous now that each spreadsheet has 2 tabs).
 *
 * Change Log (2.3.0) - BUG FIX
 * ----------------------------------------------------------------------------
 * - CONFIRMED via the real SMV overflow row (Bil=26): the marks sheet's
 *   overflow row range uses a DIFFERENT column layout than the main
 *   list - "Penilaian Lain"/Score sit 3 columns earlier (10/11 instead
 *   of 13/14). The old single flat MARKS_LAYOUT silently read 0 for
 *   otherAssessment on that student, which lowered their weighted total
 *   enough to wrongly appear on the "Pelajar Berisiko" list (54.4%
 *   computed vs the correct ~86.4%). MARKS_LAYOUT is now a `segments`
 *   layout (see parser.js v2.2.0): rows 4-28 use MARKS_MAIN_COLUMNS,
 *   rows 29-50 use MARKS_OVERFLOW_COLUMNS.
 * =============================================================================
 ******************************************************************************/

/******************************************************************************
 * Source Categories
 ******************************************************************************/

export const SOURCE_CATEGORY = Object.freeze({

    ATTENDANCE: "ATTENDANCE",

    MARKS: "MARKS",

    STUDENTS: "STUDENTS",

    ANALYTICS: "ANALYTICS"

});

/******************************************************************************
 * Source Status
 ******************************************************************************/

export const SOURCE_STATUS = Object.freeze({

    ACTIVE: "ACTIVE",

    INACTIVE: "INACTIVE",

    BROKEN: "BROKEN"

});

/******************************************************************************
 * Attendance Sheet Layout
 * ----------------------------------------------------------------------------
 * Shared physical layout for every "REKOD KEHADIRAN PELAJAR" sheet.
 * See ADR-003 (Attendance Summary Model).
 *
 *   A(0)=Bil  B(1)=Nama  C(2)=No.KP  D..W(3-22)=Tarikh harian (diabaikan)
 *   X(23)=Bil. Jam Interaksi
 *   Y(24)=Bil. Jam Hadir
 *   Z(25)=Bil. Jam Tidak Hadir
 *   AA(26)=Peratus Kehadiran (%)
 *
 * Data starts row 7. lastDataRow is intentionally generous (50, not a
 * tight 28-31) because the sheet has a formula-driven "overflow" mini
 * table further down (observed starting row 41-45, varying per course)
 * that only contains a real row when a name is manually entered there
 * (confirmed real-world case: SMV has 1 extra student at Bil=26). A
 * broken duplicate table with #REF! errors may also sit in this range
 * on some courses. Both blank rows and #REF! rows are automatically
 * excluded by _isValidRow()'s Bil-must-be-a-positive-integer check in
 * parser.js - only genuinely numbered student rows, wherever they fall
 * in the range, are kept. This means the layout does not need a
 * different lastDataRow per course.
 ******************************************************************************/

export const ATTENDANCE_LAYOUT = Object.freeze({

    headerRows: 6,

    firstDataRow: 7,

    lastDataRow: 50,

    columns: Object.freeze({

        bil: 0,

        name: 1,

        ic: 2,

        interactionHours: 23,

        presentHours: 24,

        absentHours: 25,

        attendancePercentage: 26

    })

});

/******************************************************************************
 * Marks Sheet Layout ("REKOD PEMARKAHAN SUBJEK UMUM DAN BINA INSAN")
 * ----------------------------------------------------------------------------
 * Each tab has a main list (starting row 4) PLUS a formula-driven
 * "overflow" mini table further down (confirmed exact trigger rows:
 * SMB=41, SMO=43, SMS=45, SMV=43 - varies per course since it depends
 * on where that course's main list + signature block ends). The
 * overflow table only contains a real row when a name is manually
 * entered there. CONFIRMED real-world case: SMV has exactly 1 extra
 * student (Bil=26, "MUHAMMAD AFFIQ DANIEL BIN MOHD ZAINUDDIN") in its
 * overflow table - this is why total enrolment is 86, not 85
 * (SMB 12 + SMO 25 + SMS 23 + SMV 26).
 *
 * A SEPARATE, always-broken duplicate table for subject UIT2221
 * (#REF! errors) also sits somewhere in this range on most courses.
 *
 * lastDataRow is intentionally generous (50, not a tight 28) so the
 * scan covers every course's overflow row regardless of position.
 * Blank rows, #REF! rows, and the UIT2221 block are all automatically
 * excluded by _isValidRow()'s Bil-must-be-a-positive-integer check in
 * parser.js - only genuinely numbered student rows are kept, so a
 * single shared layout works for every course without per-course
 * row numbers.
 *
 * Columns (0-indexed), MAIN segment (rows 4-28):
 *   A(0)=Bil  B(1)=Nama  C(2)=No.KP
 *   D(3)=Peratus Kehadiran  - NOT mapped (owned by AttendanceEngine)
 *   E(4)=Kuiz 1  F(5)=Kuiz 2  G(6)=Tugasan 1
 *   H(7)=Tugasan 2           - NOT mapped (confirmed blank on every tab)
 *   I(8)=Ujian 1  J(9)=Ujian 2
 *   K,L,M(10-12) blank
 *   N(13)=Penilaian Lain (%)  O(14)=Penilaian Lain (mata/weighted points)
 *
 * OVERFLOW segment (rows 29-50) - CONFIRMED DIFFERENT via the real SMV
 * Bil=26 row: this mini table has 3 fewer blank columns before
 * "Penilaian Lain" than the main table. Verified against the raw row
 * (100,100,100,98,,84,80,80,32) - Penilaian Lain(80)/Score(32) sit at
 * columns 10/11, not 13/14. Getting this wrong silently zeroed out
 * otherAssessment for an overflow student, which dropped their weighted
 * total below the at-risk threshold (54.4% instead of the correct
 * ~86.4%) - reported by the user as an unexpected addition to the
 * "Pelajar Berisiko" list.
 ******************************************************************************/

const MARKS_MAIN_COLUMNS = Object.freeze({

    bil: 0,

    name: 1,

    ic: 2,

    quiz1: 4,

    quiz2: 5,

    assignment1: 6,

    test1: 8,

    test2: 9,

    otherAssessment: 13,

    otherAssessmentScore: 14

});

const MARKS_OVERFLOW_COLUMNS = Object.freeze({

    bil: 0,

    name: 1,

    ic: 2,

    quiz1: 4,

    quiz2: 5,

    assignment1: 6,

    test1: 8,

    test2: 9,

    otherAssessment: 10,

    otherAssessmentScore: 11

});

export const MARKS_LAYOUT = Object.freeze({

    headerRows: 3,

    segments: Object.freeze([

        Object.freeze({

            firstDataRow: 4,

            lastDataRow: 28,

            columns: MARKS_MAIN_COLUMNS

        }),

        Object.freeze({

            firstDataRow: 29,

            lastDataRow: 50,

            columns: MARKS_OVERFLOW_COLUMNS

        })

    ])

});

/******************************************************************************
 * Private Helper: Build "Publish to Web" CSV export URL
 * ----------------------------------------------------------------------------
 * publishedKey is the long "2PACX-..." identifier from a pubhtml URL,
 * e.g. https://docs.google.com/spreadsheets/d/e/{publishedKey}/pubhtml
 *
 * Without &gid=, this returns the first/active sheet tab only.
 ******************************************************************************/

function buildCSVUrl(publishedKey, gid = null) {

    const base = `https://docs.google.com/spreadsheets/d/e/${publishedKey}/pub?output=csv`;

    return gid ? `${base}&gid=${gid}&single=true` : base;

}

/******************************************************************************
 * Private Helper: Build a unique, collision-safe source ID
 * ----------------------------------------------------------------------------
 * {CATEGORY}_{SESSION}_{SUBJECT_CODE}_{COURSE}[_{PART}]
 * e.g. "ATTENDANCE_1_2026_USK3311_SMS" or
 *      "ATTENDANCE_1_2026_USK3311_SMS_P2" (a second tab for the same
 *      course/category - see registerSource `part`)
 ******************************************************************************/

function buildSourceId({ category, session, subjectCode, course, part }) {

    const sessionSlug = session.replace(/\//g, "_");

    const base = `${category}_${sessionSlug}_${subjectCode}_${course}`;

    return part ? `${base}_${part}` : base;

}

/******************************************************************************
 * Private Helper: Register a single source declaratively
 * ----------------------------------------------------------------------------
 * Every field an entry needs, in one place, so adding a new subject/
 * session/semester/course combination is a single call rather than a
 * hand-written object. Returns a fully-formed, frozen source object.
 *
 * @param {Object} params
 * @param {string} params.category      - SOURCE_CATEGORY value
 * @param {string} params.session       - e.g. "1/2026"
 * @param {number} params.semester      - e.g. 3
 * @param {string} params.subjectCode   - e.g. "USK3311"
 * @param {string} params.subjectName   - e.g. "Sains Kejuruteraan 1"
 * @param {string} params.course        - e.g. "SMS"
 * @param {string} params.publishedKey  - the "2PACX-..." pubhtml key
 * @param {string} [params.gid]         - tab gid, if the doc has multiple tabs
 * @param {string} [params.part]        - discriminator for a second/third
 *   tab covering the SAME course+category (e.g. "P2" for a physically
 *   separate "overflow" continuation tab). DataHub.getByCategory()
 *   aggregates every source in a category regardless of `part`, so this
 *   only exists to keep the source ID unique - it has no runtime effect
 *   beyond that.
 * @param {Object} params.layout        - ATTENDANCE_LAYOUT / MARKS_LAYOUT / etc.
 * @returns {Object}
 ******************************************************************************/

function registerSource({

    category,
    session,
    semester,
    subjectCode,
    subjectName,
    course,
    publishedKey,
    gid = null,
    part = null,
    layout

}) {

    const id = buildSourceId({ category, session, subjectCode, course, part });

    return Object.freeze({

        id,

        category,

        session,

        semester,

        course,

        subjectCode,

        subject: subjectName,

        publishedKey,

        gid,

        part,

        url: buildCSVUrl(publishedKey, gid),

        enabled: true,

        status: SOURCE_STATUS.ACTIVE,

        layout

    });

}

/******************************************************************************
 * Source Index
 * ----------------------------------------------------------------------------
 * Session 1/2026, Subject USK3311 (Sains Kejuruteraan 1), Semester 3.
 * Add new sessions/subjects/semesters below using registerSource() -
 * do not hand-write new entries.
 ******************************************************************************/

const SESSION_1_2026_USK3311 = [

    // --- Attendance ---

    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMS",
        publishedKey: "2PACX-1vTECtlLJ74hxyoqiiWF6wtTePLHqkjxa93hph_Z3H1gVV0uJKQ76PCPr6Yi5TLlg3R2STY3TPiMnUr8",
        gid: "1449797067",
        layout: ATTENDANCE_LAYOUT
    }),

    // SMS overflow tab - a separate physical tab (not a lower row range
    // in the same tab, unlike marks) that only gains a real row when a
    // name is entered at B7, at which point A7 formula-generates Bil=26
    // and continues downward. Same layout applies since the tab starts
    // its own row 7 the same way the main tab does.
    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMS",
        publishedKey: "2PACX-1vTECtlLJ74hxyoqiiWF6wtTePLHqkjxa93hph_Z3H1gVV0uJKQ76PCPr6Yi5TLlg3R2STY3TPiMnUr8",
        gid: "706820806",
        part: "P2",
        layout: ATTENDANCE_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMV",
        publishedKey: "2PACX-1vQrgpwQqJan6gWRME9Gm7OjqUglIez00nnMSF_gQDrAgnr7QE5LjjK4khKiHzzAqvD3nSXCp7K1Higb",
        gid: "700096875",
        layout: ATTENDANCE_LAYOUT
    }),

    // SMV overflow tab - see SMS overflow note above.
    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMV",
        publishedKey: "2PACX-1vQrgpwQqJan6gWRME9Gm7OjqUglIez00nnMSF_gQDrAgnr7QE5LjjK4khKiHzzAqvD3nSXCp7K1Higb",
        gid: "1742271341",
        part: "P2",
        layout: ATTENDANCE_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMB",
        publishedKey: "2PACX-1vTQc7TMdiAVRFgWjuD78QUSaNauoadGuJS2P7TPOorP4suCIGy9mcGpsmLiYA6BsmRtpZzJx1ju4rvR",
        gid: "1699644708",
        layout: ATTENDANCE_LAYOUT
    }),

    // SMB overflow tab - see SMS overflow note above.
    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMB",
        publishedKey: "2PACX-1vTQc7TMdiAVRFgWjuD78QUSaNauoadGuJS2P7TPOorP4suCIGy9mcGpsmLiYA6BsmRtpZzJx1ju4rvR",
        gid: "565959526",
        part: "P2",
        layout: ATTENDANCE_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMO",
        publishedKey: "2PACX-1vTYx9Vgkk5JNJG4i4675nCkG4T1ZRE-zo3KmKFx4nS3YAdyrlIuWbCRD6P1cAzmNgrF_m_P0qQ2TmIq",
        gid: "1108876152",
        layout: ATTENDANCE_LAYOUT
    }),

    // SMO overflow tab - see SMS overflow note above.
    registerSource({
        category: SOURCE_CATEGORY.ATTENDANCE,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMO",
        publishedKey: "2PACX-1vTYx9Vgkk5JNJG4i4675nCkG4T1ZRE-zo3KmKFx4nS3YAdyrlIuWbCRD6P1cAzmNgrF_m_P0qQ2TmIq",
        gid: "725868921",
        part: "P2",
        layout: ATTENDANCE_LAYOUT
    }),

    // --- Marks ---
    // All 4 tabs live in ONE published spreadsheet, distinguished by gid.

    registerSource({
        category: SOURCE_CATEGORY.MARKS,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMS",
        publishedKey: "2PACX-1vTpOLwui7HxX8K8A2BiykCHEqvEXLvGuLAEASsxHapgwGIHBb0ppthE2d6-wbotL_92oA2mTRShhy3o",
        gid: "1689895725",
        layout: MARKS_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.MARKS,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMV",
        publishedKey: "2PACX-1vTpOLwui7HxX8K8A2BiykCHEqvEXLvGuLAEASsxHapgwGIHBb0ppthE2d6-wbotL_92oA2mTRShhy3o",
        gid: "1866696418",
        layout: MARKS_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.MARKS,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMB",
        publishedKey: "2PACX-1vTpOLwui7HxX8K8A2BiykCHEqvEXLvGuLAEASsxHapgwGIHBb0ppthE2d6-wbotL_92oA2mTRShhy3o",
        gid: "753096382",
        layout: MARKS_LAYOUT
    }),

    registerSource({
        category: SOURCE_CATEGORY.MARKS,
        session: "1/2026",
        semester: 3,
        subjectCode: "USK3311",
        subjectName: "Sains Kejuruteraan 1",
        course: "SMO",
        publishedKey: "2PACX-1vTpOLwui7HxX8K8A2BiykCHEqvEXLvGuLAEASsxHapgwGIHBb0ppthE2d6-wbotL_92oA2mTRShhy3o",
        gid: "534936949",
        layout: MARKS_LAYOUT
    })

];

/******************************************************************************
 * All Sources
 * ----------------------------------------------------------------------------
 * Append future session/subject arrays here, e.g.:
 *   const SESSION_2_2026_MATH = [ ... ];
 *   const ALL_SOURCES = [...SESSION_1_2026_USK3311, ...SESSION_2_2026_MATH];
 ******************************************************************************/

const ALL_SOURCES = [

    ...SESSION_1_2026_USK3311

];

const sourceIndex = Object.freeze(

    Object.fromEntries(ALL_SOURCES.map(source => [source.id, source]))

);

/******************************************************************************
 * Public API
 ******************************************************************************/

function getSource(sourceId) {

    return sourceIndex[sourceId] ?? null;

}

function hasSource(sourceId) {

    return sourceId in sourceIndex;

}

function listSources() {

    return Object.values(sourceIndex);

}

function listByCategory(category) {

    return listSources().filter(source => source.category === category);

}

function listBySession(session) {

    return listSources().filter(source => source.session === session);

}

function listBySubject(subjectCode) {

    return listSources().filter(source => source.subjectCode === subjectCode);

}

function listBySemester(semester) {

    return listSources().filter(source => source.semester === semester);

}

function listByCourse(course) {

    return listSources().filter(source => source.course === course);

}

/******************************************************************************
 * Export
 * ----------------------------------------------------------------------------
 * `sourceIndex` is exposed directly (not just through getSource) because
 * csvLoader.js reads `DATASOURCES.sourceIndex[sourceId]` directly.
 ******************************************************************************/

export const DATASOURCES = Object.freeze({

    sourceIndex,

    getSource,

    hasSource,

    listSources,

    listByCategory,

    listBySession,

    listBySubject,

    listBySemester,

    listByCourse

});
