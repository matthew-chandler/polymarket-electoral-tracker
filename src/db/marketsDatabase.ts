import { ClobClient } from "@polymarket/clob-client";
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { POLYMARKET_HOST, POLYGON_CHAINID, Row, runAsync, allStates, electoralVotes } from './common';
import { marketsDb, getAllStateInfo } from "./statesDatabase";
import { get } from "http";

export async function createMarketTable(db : Database, verbose : boolean = true) {
    let sql : string;

    const fullCurrentTime = (await fetch("https://worldtimeapi.org/api/ip").then(response => response.json())).datetime;
    const currentTime = fullCurrentTime.replaceAll("-","").replaceAll(":","").slice(0,15);

    // create table
    // sql = `CREATE TABLE CurrentMarkets (state, democrat, republican, other)`;
    // await runAsync(db, sql);
    // console.log('Table created');

    // sql = `DROP TABLE Markets20240908T230238`
    // await runAsync(db, sql);
    // console.log('Table dropped');

    // insert initial state and vote info
    for (const state of await getAllStateInfo()) {
        console.log(state);
    }

    // // verify elecoral vote data
    // await new Promise<void>((resolve, reject) => {
    //     db.all(`SELECT * FROM States`, [], (err, rows : Row[]) => {
    //         if (err) {
    //             reject(err);
    //         }
    //         let sum : number = 0;
    //         rows.forEach((row : Row) => {
    //             sum += row.votes;
    //         });
    //         console.log(`Total electoral votes: ${sum}`);
    //         if (sum === 538) {
    //             console.log("Total electoral votes correct");
    //         } else {
    //             console.log("Total electoral votes not correct");
    //         }
    //         resolve();
    //     });
    // });

    // compileTokenIDs(marketsDb);
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

createMarketTable(marketsDb);