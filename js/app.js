/******************************************************************************
 * IPSAS V2
 * ----------------------------------------------------------------------------
 * Module       : app.js
 * Layer        : Presentation Layer
 * Domain       : Dashboard Bootstrap
 *
 * Description
 * ----------------------------------------------------------------------------
 * Wires DataHub + Business Engines (Student/Attendance/Marks) to the
 * dashboard DOM defined in index.html.
 *
 * Responsibilities
 * ----------------------------------------------------------------------------
 * - Load every registered data source
 * - Initialize Business Engines
 * - Compute dashboard-level aggregates (totals, averages, risk list)
 * - Render charts, tables, and system status
 *
 * This module DOES NOT:
 * - contain business rules that belong in a Business Engine (it only
 *   calls engine public APIs and formats their output for display)
 * - parse or fetch data directly (DataHub/CSVLoader/Parser own that)
 *
 * =============================================================================
 * Version      : 1.0.0
 * Build        : 2026.07.28.001
 * Status       : Development (RC1)
 *
 * Known Limitations (flagged, not silently hidden)
 * ----------------------------------------------------------------------------
 * - "Purata Markah" now uses marksEngine's official `total` field
 *   (marksEngine.js v2.0.0 - weights confirmed by IKBN Pekan, 2026-07-29:
 *   Quiz1 10%, Quiz2 10%, Assignment1 10%, Test1 15%, Test2 15%,
 *   Other Assessment 40%). No longer provisional.
 * - "Jumlah Pelajar" counts unique ICs seen across ATTENDANCE + MARKS
 *   records, since no STUDENTS-category source exists yet in
 *   dataSources.js. StudentEngine.count() would return 0 today - it is
 *   still initialized here so it's ready the moment a STUDENTS source
 *   is registered.
 * - "Pelajar Berisiko" uses ACADEMIC.academicRules (minimumAttendance=80,
 *   minimumPassingMark=60) from academic.js - the only officially defined
 *   thresholds - rather than an invented cutoff.
 * =============================================================================
 ******************************************************************************/

import { CONFIG } from "./core/config.js";
import { ACADEMIC } from "./core/academic.js";
import { Helper } from "./core/helper.js";
import { DataHub } from "./data/dataHub.js";
import { DATASOURCES } from "./data/dataSources.js";
import StudentEngine from "./engine/studentEngine.js";
import { attendanceEngine } from "./engine/attendanceEngine.js";
import { marksEngine } from "./engine/marksEngine.js";

/******************************************************************************
 * DOM Shortcuts
 ******************************************************************************/

const $ = id => document.getElementById(id);

/******************************************************************************
 * Chart Instances (module-level so they can be destroyed on refresh)
 ******************************************************************************/

let attendanceChartInstance = null;
let marksChartInstance = null;

/******************************************************************************
 * Pure Business Helpers
 * ----------------------------------------------------------------------------
 * Kept pure (no DOM access) so they can be unit tested in isolation.
 ******************************************************************************/

/**
 * isAtRisk()
 *
 * A student is "at risk" if attendance falls below the minimum
 * attendance rule OR their provisional marks average falls below the
 * minimum passing mark - both sourced from ACADEMIC.academicRules
 * (academic.js), not invented thresholds.
 *
 * @param {Object} params
 * @param {number} params.attendancePercentage
 * @param {number} params.marksAverage
 * @returns {boolean}
 */
export function isAtRisk({ attendancePercentage, marksAverage }) {

    const { minimumAttendance, minimumPassingMark } = ACADEMIC.academicRules;

    const lowAttendance = Helper.isNumber(attendancePercentage) &&
        attendancePercentage < minimumAttendance;

    const lowMarks = Helper.isNumber(marksAverage) &&
        marksAverage < minimumPassingMark;

    return lowAttendance || lowMarks;

}

/**
 * groupByCourse()
 *
 * Group a list of records by their `course` field.
 *
 * @param {Object[]} records
 * @returns {Object.<string, Object[]>}
 */
export function groupByCourse(records) {

    const groups = {};

    for (const record of records ?? []) {

        const course = record.course || "UNKNOWN";

        if (!groups[course]) {

            groups[course] = [];

        }

        groups[course].push(record);

    }

    return groups;

}

/**
 * buildStudentIndex()
 *
 * Build a merged per-IC view combining attendance + marks, since no
 * STUDENTS source exists yet to provide names/IC as the canonical list.
 *
 * @param {Object[]} attendanceList
 * @param {Object[]} marksList
 * @returns {Map<string, Object>}
 */
export function buildStudentIndex(attendanceList, marksList) {

    const index = new Map();

    for (const attendance of attendanceList ?? []) {

        if (!attendance.ic) continue;

        if (!index.has(attendance.ic)) {

            index.set(attendance.ic, { ic: attendance.ic, name: attendance.name, course: attendance.course });

        }

        index.get(attendance.ic).attendance = attendance;

    }

    for (const marksRecords of (marksList ?? [])) {

        if (!marksRecords.ic) continue;

        if (!index.has(marksRecords.ic)) {

            index.set(marksRecords.ic, { ic: marksRecords.ic, name: marksRecords.name, course: marksRecords.course });

        }

        index.get(marksRecords.ic).marks = marksRecords;

    }

    return index;

}

/******************************************************************************
 * Data Loading
 ******************************************************************************/

/**
 * loadAllSources()
 *
 * Load every registered source in dataSources.js into DataHub.
 * Failures are collected (not thrown) so one broken sheet doesn't stop
 * the rest of the dashboard from loading.
 *
 * @returns {Promise<{ok: string[], failed: {sourceId:string, error:string}[]}>}
 */
async function loadAllSources() {

    const sourceIds = Object.keys(DATASOURCES.sourceIndex);

    const ok = [];

    const failed = [];

    for (const sourceId of sourceIds) {

        try {

            await DataHub.load({ sourceId });

            ok.push(sourceId);

        } catch (error) {

            failed.push({ sourceId, error: error.message });

        }

    }

    return { ok, failed };

}

/******************************************************************************
 * Rendering: Summary Cards
 ******************************************************************************/

function renderSummaryCards() {

    const attendanceList = attendanceEngine.getAttendance();

    const marksList = marksEngine.getMarks();

    const studentIndex = buildStudentIndex(attendanceList, marksList);

    $("totalPelajar").textContent = studentIndex.size;

    const attendanceStats = attendanceEngine.getAttendanceStatistics();

    $("avgAttendance").textContent = Helper.formatPercent(attendanceStats.averageAttendance ?? 0);

    const marksAverages = marksList.map(m => m.total);

    $("avgMarks").textContent = Helper.formatPercent(Helper.average(marksAverages));

    let riskCount = 0;

    for (const student of studentIndex.values()) {

        const attendancePercentage = student.attendance?.attendancePercentage ?? 0;

        const marksAverage = student.marks?.total ?? 0;

        if (isAtRisk({ attendancePercentage, marksAverage })) {

            riskCount++;

        }

    }

    $("riskStudent").textContent = riskCount;

    return { studentIndex, attendanceStats };

}

/******************************************************************************
 * Rendering: Charts
 ******************************************************************************/

function renderCharts() {

    const attendanceByCourse = groupByCourse(attendanceEngine.getAttendance());

    const marksByCourse = groupByCourse(marksEngine.getMarks());

    // Union of both, not just attendance keys - a course with marks but
    // no attendance data (or vice versa) would otherwise be silently
    // dropped from one of the two charts.
    const courses = [...new Set([

        ...Object.keys(attendanceByCourse),
        ...Object.keys(marksByCourse)

    ])].sort();

    // Weighted by actual hours (sum of Jam Hadir / sum of Jam Interaksi),
    // not a plain average of each student's individual percentage - a
    // simple average would let a student with few interaction slots
    // count as much as one with many. See marksEngine.js-style weighting
    // discussion; requested explicitly by the user.
    const attendanceAverages = courses.map(course => {

        const records = attendanceByCourse[course] ?? [];

        const totalInteraction = records.reduce((sum, a) => sum + a.interactionHours, 0);

        const totalPresent = records.reduce((sum, a) => sum + a.presentHours, 0);

        return totalInteraction === 0
            ? 0
            : Number(((totalPresent / totalInteraction) * 100).toFixed(2));

    });

    const marksAverages = courses.map(course =>
        Number(Helper.average((marksByCourse[course] ?? []).map(m => m.total)).toFixed(2))
    );

    if (attendanceChartInstance) attendanceChartInstance.destroy();

    if (marksChartInstance) marksChartInstance.destroy();

    attendanceChartInstance = new Chart($("attendanceChart"), {

        type: "bar",

        data: {
            labels: courses,
            datasets: [{
                label: "Kehadiran Berwajaran Jam (%)",
                data: attendanceAverages,
                backgroundColor: "#2563eb"
            }]
        },

        options: {
            responsive: CONFIG.chart.responsive,
            maintainAspectRatio: CONFIG.chart.maintainAspectRatio,
            scales: { y: { beginAtZero: true, max: CONFIG.chart.defaultMaxAttendance } }
        }

    });

    marksChartInstance = new Chart($("marksChart"), {

        type: "bar",

        data: {
            labels: courses,
            datasets: [{
                label: "Purata Markah (%)",
                data: marksAverages,
                backgroundColor: "#7c3aed"
            }]
        },

        options: {
            responsive: CONFIG.chart.responsive,
            maintainAspectRatio: CONFIG.chart.maintainAspectRatio,
            scales: { y: { beginAtZero: true, max: CONFIG.chart.defaultMaxMarks } }
        }

    });

}

/******************************************************************************
 * Rendering: Tables
 ******************************************************************************/

function renderAttendanceTable(course) {

    const rows = attendanceEngine.getAttendance().filter(a => a.course === course);

    const table = $("attendanceTable");

    table.innerHTML = `
        <tr><th>Nama</th><th>No. KP</th><th>Jam Interaksi</th><th>Jam Hadir</th><th>Jam Tidak Hadir</th><th>Peratus (%)</th></tr>
        ${rows.map(a => `
            <tr>
                <td class="student-link" data-ic="${a.ic}">${a.name}</td>
                <td>${a.ic}</td>
                <td>${a.interactionHours}</td>
                <td>${a.presentHours}</td>
                <td>${a.absentHours}</td>
                <td>${Helper.formatPercent(a.attendancePercentage)}</td>
            </tr>
        `).join("")}
    `;

    attachStudentLinkHandlers(table);

}

function renderMarksTable(course) {

    const rows = marksEngine.getMarks().filter(m => m.course === course);

    const table = $("marksTable");

    table.innerHTML = `
        <tr><th>Nama</th><th>No. KP</th><th>Kuiz 1</th><th>Kuiz 2</th><th>Tugasan 1</th><th>Ujian 1</th><th>Ujian 2</th><th>Penilaian Lain</th><th>Jumlah</th><th>Gred</th></tr>
        ${rows.map(m => `
            <tr>
                <td class="student-link" data-ic="${m.ic}">${m.name}</td>
                <td>${m.ic}</td>
                <td>${m.quiz1}</td>
                <td>${m.quiz2}</td>
                <td>${m.assignment1}</td>
                <td>${m.test1}</td>
                <td>${m.test2}</td>
                <td>${m.otherAssessment}</td>
                <td>${Helper.formatPercent(m.total)}</td>
                <td>${m.grade}</td>
            </tr>
        `).join("")}
    `;

    attachStudentLinkHandlers(table);

}

function attachStudentLinkHandlers(table) {

    table.querySelectorAll(".student-link").forEach(cell => {

        cell.style.cursor = "pointer";

        cell.style.color = "#2563eb";

        cell.addEventListener("click", () => renderStudentProfile(cell.dataset.ic));

    });

}

/******************************************************************************
 * Rendering: Student Profile
 ******************************************************************************/

function renderStudentProfile(ic) {

    const attendanceRecords = attendanceEngine.getAttendanceByIC(ic);

    const marksRecords = marksEngine.findByIC(ic);

    const name = attendanceRecords?.name ?? marksRecords[0]?.name ?? ic;

    $("studentProfile").innerHTML = `
        <h3>${name}</h3>
        <p><b>No. KP:</b> ${ic}</p>
        ${attendanceRecords ? `<p><b>Kehadiran:</b> ${Helper.formatPercent(attendanceRecords.attendancePercentage)} (${attendanceRecords.course})</p>` : "<p>Tiada rekod kehadiran.</p>"}
        ${marksRecords.length > 0
            ? marksRecords.map(m => `<p><b>Markah (${m.subject}):</b> ${Helper.formatPercent(m.total)} (Gred ${m.grade})</p>`).join("")
            : "<p>Tiada rekod markah.</p>"}
    `;

}

/******************************************************************************
 * Rendering: Top 10 / Risk Lists
 ******************************************************************************/

function renderTopAndRiskLists(studentIndex) {

    const students = [...studentIndex.values()];

    const byAttendance = [...students]
        .filter(s => s.attendance)
        .sort((a, b) => b.attendance.attendancePercentage - a.attendance.attendancePercentage)
        .slice(0, 10);

    $("topAttendance").innerHTML = byAttendance
        .map((s, i) => `<div>${i + 1}. ${s.name} - ${Helper.formatPercent(s.attendance.attendancePercentage)}</div>`)
        .join("") || "-";

    const byMarks = [...students]
        .filter(s => s.marks)
        .sort((a, b) => b.marks.total - a.marks.total)
        .slice(0, 10);

    $("topMarks").innerHTML = byMarks
        .map((s, i) => `<div>${i + 1}. ${s.name} - ${Helper.formatPercent(s.marks.total)} (${s.marks.grade})</div>`)
        .join("") || "-";

    const risky = students.filter(s => isAtRisk({
        attendancePercentage: s.attendance?.attendancePercentage ?? 0,
        marksAverage: s.marks?.total ?? 0
    }));

    $("riskList").innerHTML = risky
        .map(s => `<div>${s.name} (${s.course})</div>`)
        .join("") || "-";

}

/******************************************************************************
 * Rendering: Audit Center + System Info
 ******************************************************************************/

function renderAuditCenter(loadResult, studentIndex) {

    const diagnostics = DataHub.diagnostics();

    $("auditCenter").innerHTML = `
        <p><b>Sumber dimuat:</b> ${loadResult.ok.length} / ${loadResult.ok.length + loadResult.failed.length}</p>
        ${loadResult.failed.length > 0
            ? `<p style="color:#dc2626"><b>Gagal:</b> ${loadResult.failed.map(f => `${f.sourceId} (${f.error})`).join(", ")}</p>`
            : ""}
        <p><b>Rekod:</b> Pelajar ${studentIndex.size} (ikut IC unik), Kehadiran ${diagnostics.stats.attendance}, Markah ${diagnostics.stats.marks}</p>
    `;

}

function renderSystemInfo(loadResult) {

    $("googleStatus").textContent = loadResult.failed.length === 0
        ? "OK"
        : `${loadResult.failed.length} sumber gagal`;

    $("attendanceStatus").textContent = attendanceEngine.getAttendanceSummary().status ?? "UNKNOWN";

    $("marksStatus").textContent = marksEngine.getMarksSummary().status ?? "UNKNOWN";

    $("lastRefresh").textContent = Helper.formatDate(new Date(), "DD/MM/YYYY") + " " + new Date().toLocaleTimeString();

}

/******************************************************************************
 * Live Clock
 ******************************************************************************/

function startLiveClock() {

    if (!CONFIG.dashboard.showClock) {

        return;

    }

    const tick = () => {

        $("liveClock").textContent = new Date().toLocaleTimeString("ms-MY");

    };

    tick();

    setInterval(tick, 1000);

}

/******************************************************************************
 * Main Dashboard Load
 ******************************************************************************/

async function loadDashboard() {

    const loadResult = await loadAllSources();

    StudentEngine.initialize();

    attendanceEngine.initialize();

    marksEngine.initialize();

    const { studentIndex } = renderSummaryCards();

    renderCharts();

    renderAttendanceTable($("attendanceCourse").value);

    renderMarksTable($("marksCourse").value);

    renderTopAndRiskLists(studentIndex);

    renderAuditCenter(loadResult, studentIndex);

    renderSystemInfo(loadResult);

}

/******************************************************************************
 * Event Wiring
 ******************************************************************************/

$("refreshBtn").addEventListener("click", () => {

    loadDashboard();

});

$("attendanceCourse").addEventListener("change", event => {

    renderAttendanceTable(event.target.value);

});

$("marksCourse").addEventListener("change", event => {

    renderMarksTable(event.target.value);

});

/******************************************************************************
 * Bootstrap
 ******************************************************************************/

startLiveClock();

loadDashboard();

if (CONFIG.dashboard.autoRefresh) {

    setInterval(loadDashboard, CONFIG.dashboard.refreshInterval);

}
