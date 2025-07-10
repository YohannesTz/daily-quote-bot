const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3500;
const CHAT_ID = process.env.CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Helper to fetch a verse and format it
async function getFormattedVerse() {
    const res = await fetch("https://bible-api.com/data/web/random/NT");
    const data = await res.json();

    const verse = data.random_verse;
    const text = verse.text.trim();
    const location = `${verse.book} ${verse.chapter}:${verse.verse}`;

    return `"${text}"\n-- ${location}`;
}

// Helper to send a message
async function sendTelegramMessage(message) {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body = {
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "Markdown",
    };

    const res = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to send message:", errorText);
    }
}

// Express route
app.get("/new-quote", async (req, res) => {
    try {
        const message = await getFormattedVerse();
        await sendTelegramMessage(message);
        res.send("Verse sent!");
    } catch (error) {
        console.error("Error in /new-quote:", error);
        res.status(500).send("Failed to send verse.");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});