/**
 * ==========================================================
 * IPSAS V2 - CSV Loader
 * ----------------------------------------------------------
 * Integrated Pelajar Smart Analytics System
 * ==========================================================
 * Version      : 2.1.0
 * Build        : 2026.07.28.001
 * Module       : CSV Loader
 * Layer        : Data Layer
 * Status       : Development (RC2)
 * Dependencies :
 *      dataSources.js
 *      helper.js
 *
 * Change Log (2.1.0)
 * ----------------------------------------------------------
 * - Added ES6 export (class was previously not exported).
 * - Added explicit import for DATASOURCES (previously referenced
 *   from implicit global scope).
 * ==========================================================
 */

import { DATASOURCES } from "./dataSources.js";

export class CSVLoader {

    // ======================================================
    // CACHE
    // ======================================================

    static cache = new Map();

    // ======================================================
    // GET SOURCE
    // ======================================================

    static getSource(sourceId) {

        return DATASOURCES.sourceIndex[sourceId] ?? null;

    }

    // ======================================================
    // VALIDATE SOURCE
    // ======================================================

    static validate(sourceId) {

        const source = this.getSource(sourceId);

        if (!source) {

            throw new Error(`[CSVLoader] Source '${sourceId}' not found.`);

        }

        if (!source.enabled) {

            throw new Error(`[CSVLoader] Source '${sourceId}' is disabled.`);

        }

        if (source.status !== "ACTIVE") {

            throw new Error(`[CSVLoader] Source '${sourceId}' is not active.`);

        }

        if (!source.url) {

            throw new Error(`[CSVLoader] Source '${sourceId}' URL is empty.`);

        }

        return source;

    }

    // ======================================================
    // HAS CACHE
    // ======================================================

    static hasCache(sourceId) {

        return this.cache.has(sourceId);

    }

    // ======================================================
    // GET CACHE
    // ======================================================

    static getCache(sourceId) {

        return this.cache.get(sourceId);

    }

    // ======================================================
    // CACHE SIZE
    // ======================================================

    static cacheSize() {

        return this.cache.size;

    }

    // ======================================================
    // FETCH CSV
    // ======================================================

    static async fetchCSV(url) {

        try {

            const response = await fetch(url, {

                method: "GET",

                cache: "no-store"

            });

            if (!response.ok) {

                throw new Error(

                    `[CSVLoader] HTTP ${response.status} (${response.statusText})`

                );

            }

            return await response.text();

        } catch (error) {

            throw new Error(

                `[CSVLoader] Failed to fetch CSV. ${error.message}`

            );

        }
    }

    // ======================================================
    // LOAD SOURCE
    // ======================================================

    static async load(sourceId, options = {}) {

        const {

            useCache = true

        } = options;

        const source = this.validate(sourceId);

        if (useCache && this.hasCache(sourceId)) {

            return this.getCache(sourceId);

        }

        const csvText = await this.fetchCSV(source.url);

        this.cache.set(sourceId, csvText);

        // Return raw CSV text.
        // Parsing is handled by parser.js

        return csvText;

    }

    // ======================================================
    // REMOVE CACHE
    // ======================================================

    static removeCache(sourceId) {

        return this.cache.delete(sourceId);

    }

    // ======================================================
    // CLEAR CACHE
    // ======================================================

    static clearCache(sourceId) {

        this.cache.delete(sourceId);

    }

    // ======================================================
    // CLEAR ALL CACHE
    // ======================================================

    static clearAllCache() {

        this.cache.clear();

    }

    // ======================================================
    // CACHE INFO
    // ======================================================

    static cacheInfo() {

        return {

            total: this.cache.size,

            sourceIds: [...this.cache.keys()]

        };

    }

}
