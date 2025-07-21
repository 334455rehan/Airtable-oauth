const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Home route for testing
app.get("/", (req, res) => {
  res.send("✅ Airtable OAuth Server is running.");
});

// Login route - redirects to Airtable OAuth
app.get("/login", (req, res) => {
  const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=data.records:read`;
  res.redirect(authUrl);
});

// Callback route - handles Airtable redirect
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    res.send(`✅ Access token received: ${accessToken}`);
  } catch (error) {
    console.error("Token exchange error:", error.response?.data || error.message);
    res.status(500).send("❌ Failed to exchange code for token.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`OAuth server running on port ${port}`);
});
