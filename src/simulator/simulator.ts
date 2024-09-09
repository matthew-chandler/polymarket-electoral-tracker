import { electoralVotes, MarketRow } from '../common';
import { getCurrentMarketData } from '../db/marketsDatabase';
import * as weighted from 'weighted';

const NUM_ITERATIONS = 1000000;

export async function simulateWinner() {
    const markets = await getCurrentMarketData();
    let democratWins : number = 0;
    let republicanWins : number = 0;
    let otherWins : number = 0;
    let undecidedWins : number = 0;

    // weight the midpoints
    for (const row of markets) {
        const sum : number = Number(row.democrat) + Number(row.republican) + Number(row.other);
        row.democrat = Number(row.democrat) / sum;
        row.republican = Number(row.republican) / sum;
        row.other = Number(row.other) / sum;
    }

    console.log(markets)

    // compute monte carlo simulation
    for (let i = 0; i < NUM_ITERATIONS; i++) {
        let democratVotes : number = 0;
        let republicanVotes : number = 0;
        let otherVotes : number = 0;

        if (i % 10000 === 0) {
            console.log(`Iteration ${i}`);
        }
        
        // iterate over each state
        for (const row of markets) {
            const state = row.state;
            const votes = electoralVotes[state];
            const weights : number[] = [row.democrat, row.republican, row.other];

            // compute winner
            const winner = weighted.select(["democrat", "republican", "other"], weights);
            // console.log(`${winner} wins ${state}, adding ${votes} votes`);
            if (winner === "democrat") {
                democratVotes += votes;
            } else if (winner === "republican") {
                republicanVotes += votes;
            } else {
                otherVotes += votes;
            }
        }

        if (democratVotes > 269) {
            democratWins++;
        } else if (republicanVotes > 269) {
            republicanWins++;
        } else if (otherVotes > 269) {
            otherWins++;
        } else {
            undecidedWins++;
        }
        // console.log(`Democrat votes: ${democratVotes}`, `Republican votes: ${republicanVotes}`, `Other votes: ${otherVotes}`);
    }

    console.log(`Democrat wins: ${democratWins}`, `Republican wins: ${republicanWins}`, `Other wins: ${otherWins}`, `Undecided wins: ${undecidedWins}`);
}

simulateWinner();