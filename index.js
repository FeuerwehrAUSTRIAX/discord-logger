const express = require("express");
const fetch = require("node-fetch");
const { Client, GatewayIntentBits } = require("discord.js");

// 🔹 Fake-Webserver für Render
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

// 🔹 Discord-Bot starten
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
  if (!message.author.bot) return;
  if (!message.embeds || message.embeds.length === 0) return;

  // Alle Embeds in lesbaren Text umwandeln
  const embedTexts = message.embeds.map((embed) => {
    let parts = [];

    if (embed.title) parts.push(`🟥 Titel:\n${embed.title}`);
    if (embed.description) parts.push(`🟦 Beschreibung:\n${embed.description}`);

    if (embed.fields && embed.fields.length > 0) {
      embed.fields.forEach((field) => {
        parts.push(`🟨 ${field.name}:\n${field.value}`);
      });
    }

    if (embed.footer?.text) parts.push(`⬜ Footer:\n${embed.footer.text}`);
    if (embed.author?.name) parts.push(`🟩 Author:\n${embed.author.name}`);
    if (embed.url) parts.push(`🔗 URL:\n${embed.url}`);

    return parts.join("\n\n");
  });

  const payload = {
    zeit: new Date().toLocaleString("de-AT"),
    titel: message.author.username,
    beschreibung: embedTexts.join("\n\n"),
  };

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📨 Webhook-Embed an Google Sheet gesendet");
  } catch (err) {
    console.error("❌ Fehler beim Senden:", err);
  }
});

// 🔹 Bot starten mit Secret
client.login(process.env.BOT_TOKEN);
