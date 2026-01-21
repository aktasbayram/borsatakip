
const yf = require('yahoo-finance2');
console.log('Type of yf:', typeof yf);
console.log('Keys of yf:', Object.keys(yf));

if (yf.default) {
    console.log('Type of yf.default:', typeof yf.default);
    console.log('Keys of yf.default:', Object.keys(yf.default));

    // Check if it's a class
    try {
        const instance = new yf.default();
        console.log('Successfully newed yf.default');
    } catch (e) {
        console.log('yf.default is not a constructor');
    }
}

if (yf.YahooFinance) {
    console.log('Found YahooFinance in root exports');
    try {
        const instance = new yf.YahooFinance();
        console.log('Successfully newed yf.YahooFinance');
    } catch (e) {
        console.log('yf.YahooFinance is not a constructor');
    }
}
