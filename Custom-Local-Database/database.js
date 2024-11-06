const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

// Ensure data directory and index file exist
async function initialize() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        if (!await fileExists(INDEX_FILE)) {
            await fs.writeFile(INDEX_FILE, JSON.stringify({}), 'utf8');
        }
    } catch (error) {
        console.error("Initialization error:", error);
    }
}

// Load index file (in-memory for faster access)
let index = {};
async function loadIndex() {
    try {
        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        index = JSON.parse(indexData);
        console.log('Index loaded:', index);
    } catch (error) {
        console.error("Error loading index:", error);
    }
}

// Helper to check if a file exists
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Helper function to save index periodically to reduce I/O
async function saveIndex() {
    try {
        await fs.writeFile(INDEX_FILE, JSON.stringify(index), 'utf8');
        console.log("Index saved successfully.");
    } catch (error) {
        console.error("Error saving index:", error);
    }
}

/**
 * Inserts multiple records into the "database" in batches.
 * @param {Array} records - An array of objects to insert, each with a unique ID.
 */
async function inserBatchRecords(records) {
    try {
        const batchSize = 5;
        const batches = [];

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            batches.push(batch);
        }

        for (const batch of batches) {
            await insertBatch(batch);
        }

        await saveIndex();
        console.log("All records inserted successfully.");
    } catch (err) { 
        console.error("Error inserting records:", err);
    }
}

/**
 * Inserts a single record into the "database".
 * @param {string} id - Unique identifier for the record.
 * @param {object} data - The data to insert.
 */
async function insertRecord(id, data) {
    console.time(`Insert Record ${id}`);
    const recordFile = path.join(DATA_DIR, `${id}.json`);
    if (await fileExists(recordFile)) {
        console.error(`Error: Record with ID ${id} already exists.`);
        console.timeEnd(`Insert Record ${id}`);
        throw new Error(`Record with ID ${id} already exists.`);
    }

    await fs.writeFile(recordFile, JSON.stringify(data), 'utf8');
    index[id] = data;
    console.log(`Record ${id} inserted successfully.`);
    console.timeEnd(`Insert Record ${id}`);
    await saveIndex();
}

/**
 * Inserts a batch of records into the "database".
 * @param {Array} batch - An array of records to insert.
 */
async function insertBatch(batch) {
    console.log(`Processing batch of ${batch.length} records...`);
    await Promise.all(batch.map(record => insertRecord(record.id, record.data)));
}

/**
 * Updates an existing record in the "database".
 * @param {string} id - Unique identifier for the record.
 * @param {object} newData - New data to replace the existing data.
 */
async function updateRecord(id, newData) {
    console.time(`Update Record ${id}`);
    const recordFile = path.join(DATA_DIR, `${id}.json`);
    if (!await fileExists(recordFile)) {
        console.error(`Error: Record with ID ${id} not found.`);
        console.timeEnd(`Update Record ${id}`);
        throw new Error(`Record with ID ${id} not found.`);
    }

    await fs.writeFile(recordFile, JSON.stringify(newData), 'utf8');
    index[id] = newData;
    console.log(`Record ${id} updated successfully.`);
    console.timeEnd(`Update Record ${id}`);

    await saveIndex();
}

/**
 * Fetches a record by its ID.
 * @param {string} id - Unique identifier for the record.
 * @returns {object|null} - The record data or null if not found.
 */
async function fetchRecord(id) {
    console.time(`Fetch Record ${id}`);
    const record = index[id] || null;
    console.log(`Record ${id} fetched successfully.`);
    console.timeEnd(`Fetch Record ${id}`);
    return record;
}

/**
 * Searches for records based on a filter function.
 * @param {function} filterFn - Function that returns true for matching records.
 * @param {number} limit - Optional limit for pagination.
 * @param {number} offset - Optional offset for pagination.
 * @returns {array} - Array of matching records.
 */
function searchRecords(filterFn, limit = 100, offset = 0) {
    console.time('Search Records');
    const results = []; 
    const allRecords = Object.values(index);
    for (let i = offset; i < allRecords.length && results.length < limit; i++) {
        if (filterFn(allRecords[i])) {
            results.push(allRecords[i]);
        }
    }

    console.log(`Search completed with ${results.length} matching records.`);
    console.timeEnd('Search Records');
    return results;
}

module.exports = {
    initialize,
    loadIndex,
    insertRecord,
    inserBatchRecords,
    updateRecord,
    fetchRecord,
    searchRecords
};