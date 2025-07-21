const express = require("express");
const axios = require("axios");
const app = express();

require("dotenv").config();

const port = process.env.PORT || 10000;

// ✅ LOGIN ROUTE — Sends user to Airtable for login
app.get("/login", (req, res) => {
  const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=data.records:read`;

  console.log("🔍 CLIENT_ID:", process.env.CLIENT_ID);
  console.log("🔍 REDIRECT_URI:", process.env.REDIRECT_URI);
  console.log("🔗 OAuth URL:", authUrl);

  res.redirect(authUrl);
});

// ✅ CALLBACK ROUTE — Airtable sends user here after login
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post("https://airtable.com/oauth2/v1/token", null, {
      params: {
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = tokenResponse.data.access_token;
    console.log("✅ Access token received:", accessToken);

    res.send(`✅ Access token received: ${accessToken}`);
  } catch (error) {
    console.error("❌ Token exchange error:", error.response?.data || error.message);
    res.status(500).send(`❌ Token exchange error: ${JSON.stringify(error.response?.data || error.message)}`);
  }
});

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("🌐 OAuth server is running");
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
