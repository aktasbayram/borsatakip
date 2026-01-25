
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const prisma = new PrismaClient();
const NEW_KEY = "AIzaSyBAy3oSTjv01VaYLhBLnR_ulWuOyOXFKR4";

async function main() {
    console.log("Updating GEMINI_API_KEY...");

    // 1. Update DB
    await prisma.systemSetting.upsert({
        where: { key: 'GEMINI_API_KEY' },
        update: { value: NEW_KEY, isSecret: true },
        create: {
            key: 'GEMINI_API_KEY',
            value: NEW_KEY,
            category: 'AI',
            isSecret: true
        },
    });
    console.log("✅ Database updated.");

    // 2. Test the new key
    console.log("Testing new key with gemini-pro...");
    try {
        const genAI = new GoogleGenerativeAI(NEW_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say 'Hello'");
        console.log("✅ API Test Success:", result.response.text());
    } catch (error) {
        console.error("❌ API Test Warning:", error.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
