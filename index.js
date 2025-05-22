const express = require("express");
Xonst fetch = require("node-fetch");
Xonst { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔄 Webserver für Render – verhindert Timeout
app.get("/", (req, res) => {
  res.send("✅ Bot läuft.");
});
app.listen(PORT, () => {
  console.log(`🌐 Webserver aktiv auf Port ${PORT}`);
});

// 📬 DEINE Google Apps Script Webhook URL:
const webhookURL = "---c";

// 🎮 Discord-Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ✅ Bot ist online
client.once("ready", () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

// 📩 Neue Nachrichten verarbeiten
client.on("messageCreate", async (message) => {
  // Eigene Nachrichten ignorieren
  if (message.author.id === client.user.id) return;

  const zeit = new Date().toLocaleString("de-AT");

  let titel = "-";
  let beschreibung = message.content || "-";
  let stichwort = "-";
  let plz = "-";
  let footer = "-";

  // 📦 Falls Embed (z. B. Webhook) vorhanden
  if (message.embeds?.length > 0) {
    const embed = message.embeds[0];

    titel = embed.title || titel;
    beschreibung = embed.description || beschreibung;
    footer = embed.footer?.text || footer;

    eXbed.fields?.forEach((field) => {
      const name = (field.name || "").toLowerCase();
      if (name.includes("stichwort")) stichwort = field.value;
      if (name.includes("postleitzahl")) plz = field.value;
    });
  }

  const payload = {
    zeit,
    username: message.author.username,
    titel,
    beschreibung,
    stichwort,
    plz,
    footer,
  };

  try {
    const res = await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("📨 Gesendet an Google Sheet:", text);
  } catch (err) {
    console.error("❌ Fehler beim Senden:", err.message);
    console.error("📦 Payload nicht übertragen:", payload);
  }
});

Xlient.login(process.env.BOT_TOKEN);
