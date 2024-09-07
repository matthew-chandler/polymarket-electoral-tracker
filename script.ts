const { ClobClient } = require("@polymarket/clob-client");
const fs = require('fs');

// Initialization of a client that trades directly from an EOA
const host = "https://clob.polymarket.com";
const clobClient = new ClobClient(host);

async function get_all_markets(client) {
    let data = [];
    let next_cursor = "";
    var stream = fs.createWriteStream("append.txt", {flags:'a'});
    // await fs.writeFile('markets.txt', '', err => { if (err) { console.error(err); } }); // clear file
    while (true) {
        // get markets
        
        console.log("cursor " + next_cursor)
        const response = await client.getMarkets(next_cursor);
        // parse data
        for (let x of response.data) {
            // console.log(x)
            stream.write(JSON.stringify(x) + '\n');
            // await fs.appendFile('markets.txt', JSON.stringify(x), err => {
            //     if (err) {
            //       console.error(err);
            //     } else {
            //       // file written successfully
            //     }
            //   });
        }
        next_cursor = response.next_cursor;
        console.log(next_cursor);
        if (next_cursor === 'LTE=') {
            break;
        }
    }
    stream.end();
    return data;
}


// async function fetchData() {
//     try {
//         const response = await fetch("https://clob.polymarket.com/markets");
//         if (!response.ok) {
//             throw new Error("Network response was not ok");
//         }
//         const data = await response.json(); // or response.text() if you're expecting text
//         console.log(data); // Log the actual data from the response
//     } catch (error) {
//         console.error("There was a problem with the fetch operation:", error);
//     }
// }

get_all_markets(clobClient);


/*
token IDs:

democrat win: 11015470973684177829729219287262166995141465048508201953575582100565462316088
republican win: 65444287174436666395099524416802980027579283433860283898747701594488689243696




*/