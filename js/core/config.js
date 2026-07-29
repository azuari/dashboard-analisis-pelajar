/**
 * ==========================================================
 * IPSAS V2 - System Configuration
 * ----------------------------------------------------------
 * Integrated Pelajar Smart Analytics System
 * ==========================================================
 * Version : 2.0.0
 * Build   : 2026.06.30.001
 * ==========================================================
 */

export const CONFIG = Object.freeze({

    // ======================================================
    // SYSTEM
    // ======================================================

    system: Object.freeze({

        mode: "development",

        environment: "localhost",

        dataSource: "Google Sheets",

        defaultDepartment: "Pesawat",

        defaultCourse: "SMS",

        defaultSemester: 1,

        defaultSession: "1/2026"

    }),

    // ======================================================
    // APPLICATION
    // ======================================================

    app: Object.freeze({

        language: "ms",

        timezone: "Asia/Kuala_Lumpur",

        dateFormat: "DD/MM/YYYY",

        timeFormat: "24H"

    }),

    // ======================================================
    // DASHBOARD
    // ======================================================

    dashboard: Object.freeze({

        title: "Dashboard Analisis Pelajar",

        refreshInterval: 300000,      // 5 minit

        autoRefresh: true,

        showClock: true,

        animation: true,

        defaultTab:"attendance",

        showStatistics:true,

        showCharts:true,

        showProfile:true

    }),

    // ======================================================
    // CHART
    // ======================================================

    chart: Object.freeze({

        responsive: true,

        maintainAspectRatio: false,

        defaultMaxAttendance: 100,

        defaultMaxMarks: 100

    }),

    // ======================================================
    // TABLE
    // ======================================================

    table: Object.freeze({

        pageSize: 20,

        enableSearch: true,

        enableSorting: true,

        enableFilter: true

    }),

    // ======================================================
    // REPORT
    // ======================================================

    report: Object.freeze({

        enablePDF: true,

        enableExcel: true,

        enablePrint: true,

        defaultFormat:"pdf",

        includeLogo:true,

        includeTimestamp:true

    }),

    // ======================================================
    // AUDIT
    // ======================================================

    audit: Object.freeze({

        enableAudit: true,

        logLoadTime: true,

        logSourceStatus: true,

        showDebugPanel: false

    }),

    // ======================================================
    // AI
    // ======================================================

    ai: Object.freeze({

        provider: "Gemini",

        enabled: false,

        autoRecommendation: false,

        model:"gemini",

        temperature:0.2,

        maxTokens:2048

    }),

    // ======================================================
    // CACHE
    // ======================================================

    cache: Object.freeze({

        enabled: false,

        expireMinutes: 30

    }),

    // ======================================================
    // NOTIFICATION
    // ======================================================

    notification: Object.freeze({

        enabled: true,

        duration: 4000

    })

});export default CONFIG;
