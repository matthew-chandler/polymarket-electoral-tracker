import { ClobClient, BookParams } from "@polymarket/clob-client";
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { POLYMARKET_HOST, POLYGON_CHAINID, Row, runAsync, allStates, electoralVotes } from './common';
import { marketsDb, getAllStateInfo } from "./statesDatabase";
import { get } from "http";

export async function createMarketTable(db : Database, verbose : boolean = true) {
    // create table
    const sql = `CREATE TABLE CurrentMarkets (state, democrat, republican, other)`;
    await runAsync(db, sql);

    if (verbose === true)
        console.log('Table created');

    // insert initial state and vote info
    for (const state of await getAllStateInfo()) {
        console.log(state);
    }
}

export async function updateMarketTable(db : Database, client : ClobClient, verbose : boolean = true) {
    const stateInfo = await getAllStateInfo();
    for (const row of stateInfo) {
        const state : string = row.state;
        const democratTokenID : string = row.democrat;
        const republicanTokenID : string = row.republican;
        const otherTokenID : string = row.other;

        const midpoints = await client.getMidpoints([
            { token_id: democratTokenID, side : "BUY" },
            { token_id: republicanTokenID, side : "BUY" },
            { token_id: otherTokenID, side : "BUY" }
          ] as BookParams[]);

        const sql = `INSERT INTO CurrentMarkets (state, democrat, republican, other) VALUES (?, ?, ?, ?)`;
        await runAsync(db, sql, [state, midpoints[democratTokenID], midpoints[republicanTokenID], midpoints[otherTokenID]]);
        if (verbose === true)
            console.log(`Market info inserted for ${state}`);
    }
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

updateMarketTable(marketsDb, new ClobClient(POLYMARKET_HOST, POLYGON_CHAINID));