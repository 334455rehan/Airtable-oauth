
const express = require("express");
const axios = require("axios");
const app = express();
require("dotenv").config();

app.get("/", (req, res) => {
  res.send("✅ OAuth Server is Running");
});

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.send("❌ No code provided");

  try {
    const response = await axios.post("https://airtable.com/oauth2/token", null, {
      params: {
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    const { access_token } = response.data;
    res.send(`✅ Access Token: ${access_token}`);
  } catch (error) {
    console.error(error.response?.data || error);
    res.send("❌ Token exchange failed.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
