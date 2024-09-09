import { Database } from 'sqlite3';

export const POLYMARKET_HOST = "https://clob.polymarket.com";
export const POLYGON_CHAINID = 137;

export const allStates : string[] = ["1st-maine","2nd-maine","1st-nebraska","2nd-nebraska","3rd-nebraska","alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico","new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania","rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont","virginia","washington","washington-dc","west-virginia","wisconsin","wyoming"];
export const electoralVotes: {[state : string] : number} = {"1st-maine" : 1, "2nd-maine" : 1, "1st-nebraska" : 1, "2nd-nebraska" : 1, "3rd-nebraska" : 1, "alabama": 9, "alaska": 3, "arizona": 11, "arkansas": 6, "california": 54, "colorado": 10, "connecticut": 7, "delaware": 3, "washington-dc": 3, "florida": 30, "georgia": 16, "hawaii": 4, "idaho": 4, "illinois": 19, "indiana": 11, "iowa": 6, "kansas": 6, "kentucky": 8, "louisiana": 8, "maine": 2, "maryland": 10, "massachusetts": 11, "michigan": 15, "minnesota": 10, "mississippi": 6, "missouri": 10, "montana": 4, "nebraska": 2, "nevada": 6, "new-hampshire": 4, "new-jersey": 14, "new-mexico": 5, "new-york": 28, "north-carolina": 16, "north-dakota": 3, "ohio": 17, "oklahoma": 7, "oregon": 8, "pennsylvania": 19, "rhode-island": 4, "south-carolina": 9, "south-dakota": 3, "tennessee": 11, "texas": 40, "utah": 6, "vermont": 3, "virginia": 13, "washington": 12, "west-virginia": 4, "wisconsin": 10, "wyoming": 3};

export interface Row {
    state: string;
    votes: number;
    democrat: string;
    republican: string;
    other: string;
}

// Helper function to promisify db.run
export function runAsync(db: Database, sql: string, params: any[] = []): Promise<void> {
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