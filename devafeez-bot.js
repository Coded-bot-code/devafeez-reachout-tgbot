import { Telegraf } from "telegraf";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Nodemailer config
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

console.log("🚀 DevAfeez ReachOut Bot is now running...");

// Reply email command (for admin use)
bot.command("replyemail", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  if (parts.length < 3) {
    return ctx.reply("⚠️ Usage: /replyemail recipient@example.com Your message here");
  }

  const recipient = parts[1];
  const message = parts.slice(2).join(" ");

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: recipient,
      subject: "Reply from DevAfeez ReachOut Center",
      html: `<p>${message}</p><hr><p>🌐 <b>Powered by DevAfeez</b></p>`
    });

    ctx.reply(`✅ Email sent successfully to ${recipient}`);
  } catch (error) {
    console.error("Email error:", error);
    ctx.reply("❌ Failed to send email. Check server logs or credentials.");
  }
});

// When new message arrives (from your web frontend)
bot.on("text", async (ctx) => {
  if (ctx.chat.id.toString() === ADMIN_CHAT_ID) return;

  const userMessage = ctx.message.text;

  const formattedMessage = `
📩 <b>New Message from DevAfeez ReachOut Center 💬</b>

👤 <b>Sender Name:</b> ${ctx.from.first_name || "Unknown"}
💬 <b>Message Content:</b>
<pre>${userMessage}</pre>

⏰ <b>Received At:</b> ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━
🌐 <b>Powered by DevAfeez</b>
  `;

  try {
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, formattedMessage, { parse_mode: "HTML" });
    ctx.reply("✅ Your message has been delivered securely to DevAfeez.");
  } catch (err) {
    console.error("Telegram error:", err);
    ctx.reply("⚠️ There was a problem delivering your message.");
  }
});

// Start the bot
bot.launch();

// Graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
