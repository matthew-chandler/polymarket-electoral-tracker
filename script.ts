import { ClobClient } from "@polymarket/clob-client";
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

const allStates : string[] = ["1st-maine","2nd-maine","1st-nebraska","2nd-nebraska","3rd-nebraska","alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico","new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania","rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont","virginia","washington","washington-dc","west-virginia","wisconsin","wyoming"];
const electoralVotes: {[state : string] : number} = {"1st-maine" : 1, "2nd-maine" : 1, "1st-nebraska" : 1, "2nd-nebraska" : 1, "3rd-nebraska" : 1, "alabama": 9, "alaska": 3, "arizona": 11, "arkansas": 6, "california": 54, "colorado": 10, "connecticut": 7, "delaware": 3, "washington-dc": 3, "florida": 30, "georgia": 16, "hawaii": 4, "idaho": 4, "illinois": 19, "indiana": 11, "iowa": 6, "kansas": 6, "kentucky": 8, "louisiana": 8, "maine": 2, "maryland": 10, "massachusetts": 11, "michigan": 15, "minnesota": 10, "mississippi": 6, "missouri": 10, "montana": 4, "nebraska": 2, "nevada": 6, "new-hampshire": 4, "new-jersey": 14, "new-mexico": 5, "new-york": 28, "north-carolina": 16, "north-dakota": 3, "ohio": 17, "oklahoma": 7, "oregon": 8, "pennsylvania": 19, "rhode-island": 4, "south-carolina": 9, "south-dakota": 3, "tennessee": 11, "texas": 40, "utah": 6, "vermont": 3, "virginia": 13, "washington": 12, "west-virginia": 4, "wisconsin": 10, "wyoming": 3};

const mainPattern = /will-a-[a-z-]+-win-[a-z-]+-presidential-election/;
const alternatePattern = /will-a-[a-z]+-win-[a-z-]+-in-the-2024-us-presidential-election/;
const dividedPattern = /congressional-district-[a-zA-Z0-9]+-(nebraska|maine)-will-a-[a-zA-Z-]+-win/

const POLYMARKET_HOST = "https://clob.polymarket.com";
const POLYGON_CHAINID = 137;

// create polymarket clob client
const clobClient : ClobClient = new ClobClient(POLYMARKET_HOST,POLYGON_CHAINID);

interface Row {
    state: string;
    votes: number;
    democrat: number;
    republican: number;
    other: number;
}

// Helper function to promisify db.run
function runAsync(db: Database, sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function compileTokenIDs(client : ClobClient, db : Database, verbose : boolean = true) {
    let next_cursor = "";
    while (true) {
        if (verbose === true)
            console.log("cursor: " + next_cursor)

        const response = await client.getMarkets(next_cursor);
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

    console.log("Finished adding token IDs");
}

// setup database for state info if not setup already
const statesDb : Database = new sqlite3.Database('./markets.db',sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the states database.');
});

async function setupStatesDb(db : Database, verbose : boolean = true) {
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

    compileTokenIDs(clobClient,statesDb);
}

async function main() {
    await setupStatesDb(statesDb);
    
};

main();