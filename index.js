const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Fake-Webserver für Render (verhindert Timeout)
app.get("/", (req, res) => {
  res.send("✅ Bot läuft – alles gut.");
});
app.listen(PORT, () => {
  console.log(`🌐 Fake-Server aktiv auf Port ${PORT}`);
});

// 🔹 Google Apps Script Webhook
const webhookURL = "https://script.google.com/macros/s/AKfycbwAgUGc-2N8Mx2lN23M6O6hlZpt6pXgBopDkSMG6b_nyLoFICc5xOGRx_3V3d58l_3cgQ/exec";

// 🔹 Discord-Bot erstellen
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
// Webhook-Nachrichten zulassen, aber eigene ignorieren:
if (message.author.id === client.user.id) return;


  const payload = {
    username: message.author.username,
    content: message.content,
  };

  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("📨 Nachricht an Google Sheet gesendet");
  } catch (err) {
    console.error("❌ Fehler beim Senden an Google Sheet:", err);
  }
});

client.login(process.env.BOT_TOKEN);
