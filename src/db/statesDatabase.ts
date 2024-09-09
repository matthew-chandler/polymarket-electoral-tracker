import { ClobClient } from "@polymarket/clob-client";
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { POLYMARKET_HOST, POLYGON_CHAINID, Row, runAsync, allStates, electoralVotes } from './common';

const mainPattern = /will-a-[a-z-]+-win-[a-z-]+-presidential-election/;
const alternatePattern = /will-a-[a-z]+-win-[a-z-]+-in-the-2024-us-presidential-election/;
const dividedPattern = /congressional-district-[a-zA-Z0-9]+-(nebraska|maine)-will-a-[a-zA-Z-]+-win/

// setup database for state info if not setup already
export const marketsDb : Database = new sqlite3.Database('./src/db/markets.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the states database.');
});

export async function compileTokenIDs(db : Database, verbose : boolean = true) {
    // create polymarket clob client
    const clobClient : ClobClient = new ClobClient(POLYMARKET_HOST,POLYGON_CHAINID);
            
    
    let next_cursor = "";
    while (true) {
        if (verbose === true)
            console.log("cursor: " + next_cursor)

        const response = await clobClient.getMarkets(next_cursor);
        for (const market of response.data) {
            if ([mainPattern,alternatePattern,dividedPattern].some(p => p.test(market.market_slug))) {
                if (verbose === true)
                    console.log("found " + market.market_slug);

                // determine parameters
                const token_id : string = market.tokens[0].token_id;
                const foundStates: string[] = allStates.filter(name => market.market_slug.includes(name));
                const state = foundStates.reduce((acc, curr) => acc.length > curr.length ? acc : curr);
                let party : string = ["democrat","republican"].find(p => market.market_slug.includes(p)) ?? "other";
                
                let sql = `UPDATE States
                            SET ${party} = ?
                            WHERE state = ?`;
                await runAsync(db, sql, [token_id, state]);
            } 
        }
        next_cursor = response.next_cursor;
        if (next_cursor === 'LTE=') {
            break;
        }
    }

    // manual entry for republicans winning washington, which had a typo in the market-slug
    let sql = `UPDATE States
                SET republican = '94235946906178658512456575183052971380329766947917734276009677699582786499833'
                WHERE state = 'washington'`;
    await runAsync(db, sql);

    if (verbose === true)
        console.log("Finished adding token IDs");
}

export async function setupStatesDb(db : Database, verbose : boolean = true) {
    let sql : string;

    // drop table if it already exists
    sql = `DROP TABLE IF EXISTS States`;
    await runAsync(db, sql);
    console.log('Table dropped');

    // create table
    sql = `CREATE TABLE States (state, votes, democrat, republican, other)`;
    await runAsync(db, sql);
    console.log('Table created');

    // insert initial state and vote info
    for (const state in electoralVotes) {
        const sql : string = `INSERT INTO States (state, votes, democrat, republican, other) VALUES (?, ?, ?, ?, ?)`;
        await runAsync(db, sql, [state, electoralVotes[state], 0, 0, 0]);
        if (verbose === true)
            console.log(`Initial info inserted for ${state}`);
    }

    // verify elecoral vote data
    await new Promise<void>((resolve, reject) => {
        db.all(`SELECT * FROM States`, [], (err, rows : Row[]) => {
            if (err) {
                reject(err);
            }
            let sum : number = 0;
            rows.forEach((row : Row) => {
                sum += row.votes;
            });
            console.log(`Total electoral votes: ${sum}`);
            if (sum === 538) {
                console.log("Total electoral votes correct");
            } else {
                console.log("Total electoral votes not correct");
            }
            resolve();
        });
    });

    compileTokenIDs(marketsDb);
}

export async function getStateInfo(state : string) {
    return new Promise<Row>((resolve, reject) => {
        marketsDb.get(`SELECT * FROM States WHERE state = ?`, [state], (err, row : Row) => {
            if (err) {
                reject(err);
            }
            resolve(row);
        });
    });
}

export async function getAllStateInfo() {
    return new Promise<Row[]>((resolve, reject) => {
        marketsDb.all(`SELECT * FROM States`, [], (err, rows : Row[]) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}
