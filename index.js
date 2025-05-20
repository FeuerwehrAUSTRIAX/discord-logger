const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Webserver für Render, damit der Bot aktiv bleibt
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot läuft.");
});
app.listen(PORT, () => {
  console.log(`🌐 Webserver aktiv auf Port ${PORT}`);
});

// Google Apps Script Webhook
const webhookURL = "https://script.google.com/macros/s/AKfycbwAgUGc-2N8Mx2lN23M6O6hlZpt6pXgBopDkSMG6b_nyLoFICc5xOGRx_3V3d58l_3cgQ/exec";

// Discord-Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Bot bereit
client.once("ready", () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// Embed-Nachrichten von Bots (z. B. Webhooks) auslesen
client.on("messageCreate", async (message) => {
  if (!message.author.bot) return; // Nur Bot/Webhook-Nachrichten

  const embed = message.embeds[0];
  if (!embed) return;

  const zeit = new Date().toLocaleString("de-AT");
  const titel = embed.title || "";
  const beschreibung = embed.description || "";

  // Felder extrahieren
  let stichwort = "";
  let plz = "";
  let uhrzeit = "";

  embed.fields?.forEach((field) => {
    const name = field.name.toLowerCase();
    if (name.includes("stichwort")) stichwort = field.value;
    else if (name.includes("postleitzahl")) plz = field.value;
    else if (name.includes("uhrzeit")) uhrzeit = field.value;
  });

  const payload = {
    zeit,
    titel,
    beschreibung,
    stichwort,
    plz,
    uhrzeit,
  };

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📨 Embed-Daten an Google Sheet gesendet");
  } catch (err) {
    console.error("❌ Fehler beim Senden:", err);
  }
});

// Bot starten
client.login(process.env.BOT_TOKEN);
