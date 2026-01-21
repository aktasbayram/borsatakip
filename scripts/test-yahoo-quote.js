
const yahooFinanceModule = require('yahoo-finance2');
const YahooFinance = yahooFinanceModule.default || yahooFinanceModule;
const yahooFinance = (typeof YahooFinance === 'function' && YahooFinance.prototype) ? new YahooFinance() : YahooFinance;

async function run() {
    try {
        console.log("Fetching XU100.IS quote via Yahoo...");
        const result = await yahooFinance.quote('XU100.IS');
        console.log("Result:", result);
    } catch (error) {
        console.error("Yahoo Error:", error.message);
    }
}

run();
