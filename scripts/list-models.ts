import axios from 'axios';
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("GEMINI_API_KEY is missing!");
} else {
    // console.log(`Key found: ${API_KEY.substring(0, 4)}...`);
}

async function checkRawApi() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        console.log(`fetching: ${url.replace(API_KEY!, 'HIDDEN_KEY')}`);

        const res = await axios.get(url);

        console.log("✅ RAW API SUCCESS!");
        console.log("Available Models:");
        if (res.data.models) {
            res.data.models.forEach((m: any) => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
                }
            });
        } else {
            console.log("No models returned.");
        }

    } catch (error: any) {
        console.error("❌ RAW API ERROR:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

checkRawApi();
