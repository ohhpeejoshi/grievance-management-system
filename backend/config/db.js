import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

let pool;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    timezone: "+05:30",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

function handleDisconnect() {
    pool = mysql.createPool(dbConfig);

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('DB Pool Connection Failed:', err);
            // Retry connection after a short delay
            setTimeout(handleDisconnect, 2000);
        }
        if (connection) {
            connection.release();
            console.log('MySQL Pool Connected Successfully');
        }
    });

    pool.on('error', function (err) {
        console.error('Database Pool Error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
            // Connection lost. Re-establish the pool.
            console.log('Reconnecting to the database...');
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

// Initialize the connection pool
handleDisconnect();

export const db = {
    query: (sql, params, callback) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                console.error('Database Query Error:', error);
            }
            callback(error, results);
        });
    },
    promise: () => pool.promise()
};