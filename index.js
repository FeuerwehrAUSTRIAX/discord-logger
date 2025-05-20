const express = require("express");
const fetch = require("node-fetch");
const { Client, GatewayIntentBits } = require("discord.js");

// Webserver für Render (verhindert Timeout)
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot läuft.");
});
app.listen(PORT, () => {
  console.log(`🌐 Webserver aktiv auf Port ${PORT}`);
});

// Google Apps Script Webhook URL
const webhookURL = "https://script.google.com/macros/library/d/1StJtxjwG7sEoKRm7UAgnN89M7ZgRRZjEWCNvsBoOQxzawICJrQJo5esj/3";

// Discord Bot einrichten
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

client.on("messageCreate", async (message) => {
  if (!message.author.bot) return;
  if (!message.embeds || message.embeds.length === 0) return;

  const embed = message.embeds[0];

  const zeit = new Date().toLocaleString("de-AT");
  const titel = embed.title || "";
  const beschreibung = embed.description || "";

  let stichwort = "";
  let plz = "";
  const footer = embed.footer?.text || "";

  embed.fields?.forEach((field) => {
    const name = field.name.toLowerCase();
    if (name.includes("stichwort")) stichwort = field.value;
    if (name.includes("postleitzahl")) plz = field.value;
  });

  const payload = {
    zeit,
    titel,
    beschreibung,
    stichwort,
    plz,
    footer
  };

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📨 Webhook-Daten an Google Sheet gesendet");
  } catch (err) {
    console.error("❌ Fehler beim Senden:", err);
  }
});

client.login(process.env.BOT_TOKEN);
