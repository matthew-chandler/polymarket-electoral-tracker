import { ClobClient, BookParams } from "@polymarket/clob-client";
import { MarketRow, runAsync, marketsDb } from '../common';
import { getAllStateInfo } from "./states";

// creates CurrentMarkets table
export async function createMarketTable(verbose : boolean = true) {
    // create table
    const sql = `CREATE TABLE CurrentMarkets (state, democrat, republican, other)`;
    await runAsync(marketsDb, sql);

    if (verbose === true)
        console.log('Table created');

    // insert initial state and vote info
    for (const state of await getAllStateInfo()) {
        console.log(state);
    }
}

export async function createArchiveTable(verbose : boolean = true) {
    // create table
    const sql = `CREATE TABLE MarketArchive (state, democrat, republican, other, timestamp)`;
    await runAsync(marketsDb, sql);

    if (verbose === true)
        console.log('Table created');
}

// updates CurrentMarkets table with current market data
export async function updateMarketTable(client : ClobClient, verbose : boolean = true) {
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
        await runAsync(marketsDb, sql, [state, midpoints[democratTokenID], midpoints[republicanTokenID], midpoints[otherTokenID]]);
        if (verbose === true)
            console.log(`Market info inserted for ${state}`);
    }
}

// deletes and recreates CurrentMarkets table
export async function recreateMarketTable(client : ClobClient, verbose : boolean = true) {
    const sql = `DROP TABLE IF EXISTS CurrentMarkets`;
    await runAsync(marketsDb, sql);
    if (verbose === true)
        console.log('Table dropped');
    await createMarketTable();
    await updateMarketTable(client);
}

// retreives current market data from database
export async function getCurrentMarketData() {
    return new Promise<MarketRow[]>((resolve, reject) => {
        marketsDb.all(`SELECT * FROM CurrentMarkets`, [], (err, rows : MarketRow[]) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
}
