import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

// connect to DB
const markets_db : Database = new sqlite3.Database('./markets.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the markets database.');
});


// creating table
function createTable(db : Database) {
    const sql : string = `CREATE TABLE Markets (state, token_id, votes, democratic, republican, other)`;
    db.run(sql, (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Table created');
    });
}

// drop table
function dropTable(db : Database) {
    db.run('DROP TABLE Markets', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Table dropped');
    });
}

// insert data
function insertData(db : Database, state : string, token_id : string, votes : number, democratic : number, republican : number, other : number) {
    const sql : string = `INSERT INTO Markets(state, token_id, votes, democratic, republican, other) VALUES(?,?,?,?,?,?)`;
    db.run(sql, [state, token_id, votes, democratic, republican, other], (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Data inserted');
    });
}

await createTable(markets_db);
insertData(markets_db, 'CA', '1', 54, 90, 9, 1);
