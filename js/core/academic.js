/**
 * ==========================================================
 * IPSAS V2 - Academic Registry
 * ----------------------------------------------------------
 * Academic Registry
 * ----------------------------------------------------------
 * Version      : 2.0.0
 * Build        : 2026.06.30.003
 * Registry     : Academic
 * Status       : Final RC3
 * Dependencies : identity.js, config.js
 * ==========================================================
 */

export const ACADEMIC = Object.freeze({

    // ======================================================
    // INSTITUTION
    // ======================================================

    institution: Object.freeze({

        name: "Institut Kemahiran Belia Negara Pekan",

        shortName: "IKBN Pekan",

        country: "Malaysia",

        ministry: "Kementerian Belia dan Sukan"

    }),

    // ======================================================
    // DEPARTMENTS
    // ======================================================

    departments: Object.freeze({

        PESAWAT: Object.freeze({

            code: "JP",

            name: "Jabatan Pesawat",

            courses: ["SMS", "SMV"]

        }),

        MEKANIKAL: Object.freeze({

            code: "JM",

            name: "Jabatan Mekanikal",

            courses: ["SMB", "SMO"]

        })

    }),

    // ======================================================
    // PROGRAMS
    // ======================================================

    programs: Object.freeze({

        SMS: Object.freeze({

            code: "SMS",

            name: "Program Komposit",

            department: "PESAWAT",

            pathway: "SIJIL",

            active: true,

            level: "SIJIL"

        }),

        SMV: Object.freeze({

            code: "SMV",

            name: "Program Kepingan Logam",

            department: "PESAWAT",

            pathway: "SIJIL",

            active: true,

            level: "SIJIL"

        }),

        SMB: Object.freeze({

            code: "SMB",

            name: "Program Fabrikasi Vessel",

            department: "MEKANIKAL",

            pathway: "SIJIL",

            active: true,

            level: "SIJIL"

        }),

        SMO: Object.freeze({

            code: "SMO",

            name: "Program Operasi Fabrikasi Paip",

            department: "MEKANIKAL",

            pathway: "SIJIL",

            active: true,

            level: "SIJIL"

        }),

        SMO_DIPLOMA: Object.freeze({

            code: "SMO-D",

            name: "Diploma Fabrikasi Paip, Minyak dan Gas",

            department: "MEKANIKAL",

            pathway: "DIPLOMA",

            active: true,

            level: "DIPLOMA"

        })

    }),

    // ======================================================
    // PATHWAYS
    // ======================================================

    pathways: Object.freeze({

        SIJIL: Object.freeze({

            code: "SIJIL",

            durationSemester: 3,

            industrialTraining: true,

            description:"Program Sijil"

        }),

        DIPLOMA: Object.freeze({

            code: "DIPLOMA",

            durationSemester: 2,

            industrialTraining: true,

            description:"Program Diploma"

        })

    }),


    // ======================================================
    // PROGRAM LEVELS
    // ======================================================

    programLevels: Object.freeze({

        SIJIL: Object.freeze({

            code: "SIJIL",

            totalSemesters: 3,

            semesterList: [1, 2, 3],

            industrialTraining: true,

            description:"Program Sijil"

        }),

        DIPLOMA: Object.freeze({

            code: "DIPLOMA",

            totalSemesters: 2,

            semesterList: [5, 6],

            industrialTraining: true,

            description:"Program Diploma"

        })

    }),

    // ======================================================
    // SEMESTERS
    // ======================================================

    semesters: Object.freeze({

        SEM1: Object.freeze({

            order: 1,

            code: 1,

            name: "Semester 1",

            durationMonths: 6

        }),

        SEM2: Object.freeze({

            order: 2,

            code: 2,

            name: "Semester 2",

            durationMonths: 6

        }),

        SEM3: Object.freeze({
            
            order: 3,
                    
            code: 3,

            name: "Semester 3",

            durationMonths: 6

        }),

        SEM5: Object.freeze({

            order: 5,

            code: 5,

            name: "Semester 5",

            durationMonths: 6

        }),

        SEM6: Object.freeze({
            
            order: 6,

            code: 6,

            name: "Semester 6",

            durationMonths: 6

        })

    }),

    // ======================================================
    // INDUSTRIAL TRAINING
    // ======================================================

    industrialTraining: Object.freeze({

        enabled: true,

        durationMonths: 3,

        name: "Latihan Industri",

        shortName: "LI",

        status: "ACTIVE"

    }),

    // ======================================================
    // ACADEMIC CALENDAR
    // ======================================================

    calendar: Object.freeze({

        semestersPerYear: 2,

        semesterDurationMonths: 6,

        industrialTrainingMonths: 3,

        academicYearStart: 1,

        academicYearEnd: 12,

        sessionsPerYear: 2

    }),

    // ======================================================
    // SESSIONS
    // ======================================================

    sessions: Object.freeze({

        SESSION_1: Object.freeze({

            code: "SESSION_1",

            description: "Sesi 1",

            startMonth: 1,

            endMonth: 6,

            display: "1"

        }),

        SESSION_2: Object.freeze({

            code: "SESSION_2",

            description: "Sesi 2",

            startMonth: 7,

            endMonth: 12,

            display: "2"

        })

    }),

    // ======================================================
    // SUBJECT CATEGORIES
    // ======================================================

    subjectCategories: Object.freeze({

        GENERAL: Object.freeze({

            code: "GENERAL",

            name: "General Subject",

            description: "Subjek Umum"

        }),

        CORE: Object.freeze({

            code: "CORE",

            name: "Core Subject",

            description: "Subjek Teras"

        })

    }),

    // ======================================================
    // SUBJECT LEVELS
    // ======================================================

    subjectLevels: Object.freeze({

        BASIC: Object.freeze({

            code: "BASIC",

            order: 1,

            description: "Tahap Asas"

        }),

        INTERMEDIATE: Object.freeze({

            code: "INTERMEDIATE",

            order: 2,

            description: "Tahap Pertengahan"

        }),

        ADVANCED: Object.freeze({

            code: "ADVANCED",

            order: 3,

            description: "Tahap Lanjutan"

        })

    }),

    // ======================================================
    // ASSESSMENT TYPES
    // ======================================================

    assessmentTypes: Object.freeze({

        COURSEWORK: Object.freeze({

            code: "COURSEWORK",

            description: "Kerja Kursus",

            weightApplicable: true

        }),

        EXAMINATION: Object.freeze({

            code: "EXAMINATION",

            description: "Peperiksaan",

            weightApplicable: true

        })

    }),

    // ======================================================
    // SUBJECTS
    // ======================================================

    subjects: Object.freeze({

        GENERAL: Object.freeze({

            ENGINEERING_SCIENCE: Object.freeze({

                code: "ENGSCI",

                name: "Sains Kejuruteraan",

                category: "GENERAL",

                level:"BASIC",

                assessmentType:"COURSEWORK",

                assessment: {

                    coursework: 100,

                    examination: 0

                },

                active: true

            }),

            ENGLISH: Object.freeze({

                code: "ENG",

                name: "Bahasa Inggeris",

                category: "GENERAL",

                level:"BASIC",

                assessmentType:"COURSEWORK",

                assessment: {

                    coursework: 100,

                    examination: 0

                },

                active: true

            }),

            MATHEMATICS: Object.freeze({

                code: "MATH",

                name: "Matematik",

                category: "GENERAL",

                level: "BASIC",

                assessmentType: "COURSEWORK",

                assessment: {

                    coursework: 100,

                    examination: 0

                },

                active: true

            }),

            INFORMATION_TECHNOLOGY: Object.freeze({

                code: "IT",

                name: "Teknologi Komputer",

                category: "GENERAL",

                level: "BASIC",

                assessmentType: "COURSEWORK",

                assessment: {

                    coursework: 100,

                    examination: 0

                },

                active: true

            })

        }),

        CORE: Object.freeze({

            assessment: {

                coursework: 60,

                examination: 40

            },

            active: true

        })

    }),

    // ======================================================
    // ASSESSMENT COMPONENTS
    // ======================================================

    assessmentComponents: Object.freeze({

        coursework: Object.freeze([

           {

                code:"QUIZ",

                name:"Kuiz"

            },

            {

                code:"ASSIGNMENT",

                name:"Tugasan"

            },

            {

                code:"TEST",

                name:"Ujian"

            },

            {

                code:"PRACTICAL",

                name:"Amali"

            },

            {

                code:"PRESENTATION",

                name:"Pembentangan"

            },

            {

                code:"REPORT",

                name:"Laporan"

            }

        ]),

        examination: Object.freeze([

            {

                code:"FINAL_EXAM",

                name:"Peperiksaan Akhir"

            }

        ])

    }),

    // ======================================================
    // GRADING SYSTEM
    // ======================================================

    grading: Object.freeze({

        scale: Object.freeze([

            { grade:"A",  min:95, max:100, point:4.00, status:"LULUS", classification:"Excellent" },

            { grade:"A-", min:90, max:94, point:3.70, status:"LULUS", classification:"Excellent" },

            { grade:"B+", min:85, max:89, point:3.30, status:"LULUS", classification:"Very Good" },

            { grade:"B",  min:80, max:84, point:3.00, status:"LULUS", classification:"Good" },

            { grade:"B-", min:75, max:79, point:2.70, status:"LULUS", classification:"Good" },

            { grade:"C+", min:70, max:74, point:2.30, status:"LULUS", classification:"Satisfactory" },

            { grade:"C",  min:60, max:69, point:2.00, status:"LULUS", classification:"Pass" },

            { grade:"C-", min:50, max:59, point:1.70, status:"GAGAL", classification:"Fail" },

            { grade:"D+", min:45, max:49, point:1.30, status:"GAGAL", classification:"Fail" },

            { grade:"D",  min:40, max:44, point:1.00, status:"GAGAL", classification:"Fail" },

            { grade:"E",  min:30, max:39, point:0.70, status:"GAGAL", classification:"Fail" },

            { grade:"F",  min:0, max:29, point:0.00, status:"GAGAL", classification:"Fail" }

        ])

    }),

    // ======================================================
    // STUDENT STATUS
    // ======================================================

    studentStatus: Object.freeze({

        ACTIVE: Object.freeze({

            code: "ACTIVE",

            description: "Pelajar Aktif"

        }),

        INDUSTRIAL_TRAINING: Object.freeze({

            code: "LI",

            description: "Latihan Industri"

        }),

        GRADUATED: Object.freeze({

            code: "GRAD",

            description: "Graduan"

        }),

        DEFERRED: Object.freeze({

            code: "DEFER",

            description: "Tangguh"

        }),

        TERMINATED: Object.freeze({

            code: "TERM",

            description: "Berhenti"

        })

    }),

    // ======================================================
    // ACADEMIC RULES
    // ======================================================

    academicRules: Object.freeze({

        minimumAttendance: 80,

        minimumPassingMark: 60,

        gradingMethod:"PERCENTAGE",

        defaultAssessment: "Coursework"

    })

});export default ACADEMIC;
