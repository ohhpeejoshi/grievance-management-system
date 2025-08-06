// File: backend/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the connection pool using the promise-based library
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: "+05:30",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('MySQL Promise Pool configured.');

// Export a hybrid db object that supports both patterns
export const db = {
    /**
     * The promise() function now simply returns the pool itself,
     * as the pool is already promise-enabled. This is for use with async/await.
     * e.g., await db.promise().query(...)
     */
    promise: () => pool,

    /**
     * The query() function is for the parts of the app that use callbacks.
     * It executes a query using the promise-based pool and then calls the
     * callback function to maintain compatibility.
     */
    query: (sql, params, callback) => {
        // Handle the case where params are omitted (e.g., db.query(sql, callback))
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        // Use the promise-based query and then invoke the callback
        pool.query(sql, params)
            .then(([results]) => {
                // Call the callback with (error, results) signature
                callback(null, results);
            })
            .catch(err => {
                // Call the callback with an error
                console.error('Database Query Error:', err);
                callback(err, null);
            });
    }
};