document.addEventListener("DOMContentLoaded", function() {
    // Sample value from JavaScript
    let value = "Hello, World!";
    
    // Display the value in the HTML
    document.getElementById("valueDisplay").textContent = value;
});

async function fetchData() {
    try {
        const response = await fetch("https://clob.polymarket.com/markets");
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json(); // or response.text() if you're expecting text
        console.log(data); // Log the actual data from the response
    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
    }
}

fetchData();




/*
token IDs:

democrat win: 11015470973684177829729219287262166995141465048508201953575582100565462316088
republican win: 65444287174436666395099524416802980027579283433860283898747701594488689243696




*/