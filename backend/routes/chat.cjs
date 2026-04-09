const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { PickupRequest } = require('../models/index');

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

router.post('/', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const user = req.user;

    const pickups = await PickupRequest.find({ citizenId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    const nextPickup = pickups.find(
      p => p.status === 'pending' || p.status === 'confirmed'
    );

    const levelMap = [
      { min: 0, label: 'Eco Beginner' },
      { min: 100, label: 'Eco Explorer' },
      { min: 300, label: 'Eco Champion' },
      { min: 600, label: 'Eco Warrior' },
      { min: 1000, label: 'Eco Legend' },
    ];

    const level =
      [...levelMap].reverse().find(l => (user.ecoPoints || 0) >= l.min)?.label ||
      'Eco Beginner';

    const systemPrompt = `
You are EcoAssist, an AI assistant for waste management.

User:
- Name: ${user.fullName}
- Eco Points: ${user.ecoPoints || 0}
- Level: ${level}
- Next Pickup: ${
      nextPickup
        ? new Date(nextPickup.scheduledDate).toLocaleDateString()
        : 'None'
    }

Give simple, helpful eco-friendly answers.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({
        role: h.role || "user",
        content: h.content || ""
      })),
      { role: "user", content: message }
    ];

const prompt = `
${systemPrompt}

User: ${message}
`;

const result = await ai.models.generateContent({
  model: "gemini-2.0-flash",   // ✅ correct working model
  contents: [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ]
});

const reply = result.candidates[0].content.parts[0].text;

    res.json({ reply });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error);
    res.status(500).json({
      reply: "AI error. Check backend console."
    });
  }
});

module.exports = router;