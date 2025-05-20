const { Client, GatewayIntentBits } = require("discord.js");

const webhookURL = "https://script.google.com/macros/s/AKfycbwAgUGc-2N8Mx2lN23M6O6hlZpt6pXgBopDkSMG6b_nyLoFICc5xOGRx_3V3d58l_3cgQ/exec";


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Bot online als ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const payload = {
    username: message.author.username,
    content: message.content
  };

  await fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("📨 Nachricht an Google Sheet gesendet");
});

client.login(process.env.BOT_TOKEN);
