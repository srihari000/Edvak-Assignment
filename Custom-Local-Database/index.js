const { initialize, loadIndex, inserBatchRecords, fetchRecord, searchRecords, insertRecord } = require('./database');

(async () => {
    const records = [
        { id: '1', data: { name: 'A', age: 25 } },
        { id: '2', data: { name: 'B', age: 30 } },
        { id: '3', data: { name: 'C', age: 35 } },
        { id: '4', data: { name: 'D', age: 40 } },
        { id: '5', data: { name: 'E', age: 45 } },
        { id: '6', data: { name: 'F', age: 50 } },
    ];

    // Ensure the directory and index file are set up
    await initialize(); 
    await loadIndex(); 

    // Insert records in batches
    await inserBatchRecords(records);

    await insertRecord('7', { name: 'G', age: 20 })

    // Fetch and log a record
    const record = await fetchRecord('3')
    console.log("Fetched record::", record);

    // Search records (e.g., find all users over 30)
    const results = searchRecords(record => record.age > 30, 10, 1);
    console.log("Search results::", results);
})();
