const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const app = express();

dotenv.config();

const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("✅ Airtable OAuth server is running.");
});

// Step 1: Login – Redirect user to Airtable authorization page
app.get("/login", (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const scope = "data.records:read";

  const authUrl = `https://airtable.com/oauth2/v1/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

  console.log("🔍 CLIENT_ID:", clientId);
  console.log("🔍 REDIRECT_URI:", redirectUri);
  console.log("🔗 OAuth URL:", authUrl);

  res.redirect(authUrl);
});

// Step 2: Callback – Handle redirect and exchange code for token
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("⚠️ Authorization code missing in callback.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
            ).toString("base64")
        }
      }
    );

    console.log("✅ Access Token Response:", tokenResponse.data);

    // For demo: display access token in browser (you'll store this securely in real apps)
    res.send(`
      <h2>🎉 OAuth Success</h2>
      <pre>${JSON.stringify(tokenResponse.data, null, 2)}</pre>
    `);
  } catch (error) {
    console.error("❌ Token exchange error:", error.response?.data || error.message);
    res.status(500).send("❌ Token exchange failed: " + JSON.stringify(error.response?.data));
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OAuth server running on port ${PORT}`);
});
