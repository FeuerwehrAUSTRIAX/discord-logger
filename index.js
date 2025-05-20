const express = require("express");
const fetch = require("node-fetch");
const { Client, GatewayIntentBits } = require("discord.js");

// 🔹 Fake-Webserver für Render (verhindert Shutdown)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot läuft.");
});
app.listen(PORT, () => {
  console.log(`🌐 Webserver aktiv auf Port ${PORT}`);
});

// 🔹 Deine Google Apps Script Webhook URL
const webhookURL = "https://script.google.com/macros/s/AKfycbwAgUGc-2N8Mx2lN23M6O6hlZpt6pXgBopDkSMG6b_nyLoFICc5xOGRx_3V3d58l_3cgQ/exec";

// 🔹 Discord-Bot initialisieren
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// 🔹 Nur Webhook-/Bot-Nachrichten analysieren
client.on("messageCreate", async (message) => {
  if (!message.author.bot) return; // Nur Webhook-Nachrichten

  const embed = message.embeds[0];
  if (!embed) return;

  const zeit = new Date().toLocaleString("de-AT");
  const titel = embed.title || "";
  const beschreibung = embed.description || "";

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
    console.error("❌ Fehler beim Senden an Google Sheet:", err);
  }
});

// 🔹 Bot starten mit Secret
client.login(process.env.BOT_TOKEN);
