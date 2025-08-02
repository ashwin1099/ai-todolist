const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Middleware to validate message format
const validateMessages = (req, res, next) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages format" });
  }
  const isValid = messages.every(
    (m) => m && typeof m.role === "string" && typeof m.content === "string"
  );
  if (!isValid) {
    return res.status(400).json({ error: "Invalid message structure" });
  }
  next();
};

app.post("/ask", validateMessages, async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios({
      method: "post",
      url: "https://api.groq.com/openai/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: {
        model: "llama3-70b-8192",
        messages,
        stream: true,
      },
      responseType: "stream",
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";
    let buffer = "";

    response.data.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const message = line.replace("data: ", "").trim();

        if (message === "[DONE]") {
          res.write(`event: done\ndata: {}\n\n`);
          return res.end();
        }

        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
            if (res.flush) res.flush();
          }
        } catch {
          // Silent fail for incomplete JSON chunks
        }
      }
    });

    response.data.on("end", () => {
      res.end();
    });

    response.data.on("error", (err) => {
      console.error("Stream error:", err);
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({
      error: "Groq API call failed",
      details: err.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT);
