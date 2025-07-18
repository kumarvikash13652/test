const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * Function to fetch results from Flipkart with browser-like headers
 */
async function fetchFlipkartResults(searchTerm) {
  const flipkartURL = `https://www.flipkart.com/search?q=${encodeURIComponent(searchTerm)}`;

  const headers = {
    "Accept":
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Host": "www.flipkart.com",
    "Pragma": "no-cache",
    "Referer": "https://www.google.com/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  };

  const { data } = await axios.get(flipkartURL, { headers });
  const $ = cheerio.load(data);
  const results = [];

  $("._1AtVbE").each((i, el) => {
    const title = $(el).find("._4rR01T, .IRpwTa").text();
    const price = $(el).find("._30jeq3").text();
    const link = $(el).find("a").attr("href");
    const img = $(el).find("img").attr("src");

    if (title && price && link && img) {
      results.push({
        name: title,
        price: price,
        thumbnail: img.startsWith("http") ? img : `https:${img}`,
        link: `https://www.flipkart.com${link}`,
        website: "Flipkart",
        logo: "https://1000logos.net/wp-content/uploads/2021/02/Flipkart-logo.png",
      });
    }
  });

  return results.slice(0, 6);
}

// 🖼️ Image upload endpoint
app.post("/upload", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;
  const searchTerm = "sneakers"; // Placeholder for now

  // Auto-delete uploaded image after 5 mins
  setTimeout(() => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Failed to delete image:", err);
    });
  }, 5 * 60 * 1000);

  try {
    const results = await fetchFlipkartResults(searchTerm);
    if (results.length === 0) {
      return res.json({ error: "No products found." });
    }
    res.json({ matches: results });
  } catch (error) {
    console.error("Flipkart scraping error (upload):", error.message);
    res.json({ error: "❌ Flipkart scraping failed." });
  }
});

// 🔍 Text search endpoint
app.get("/search", async (req, res) => {
  const searchTerm = req.query.product || "sneakers";

  try {
    const results = await fetchFlipkartResults(searchTerm);
    if (results.length === 0) {
      return res.json({ error: "No results found." });
    }
    res.json({ matches: results });
  } catch (error) {
    console.error("Flipkart scraping error (text):", error.message);
    res.json({ error: "❌ Flipkart scraping failed." });
  }
});

// 🔊 Start server
app.listen(PORT, () => {
  console.log(`✅ Snap-Buy server running at http://localhost:${PORT}`);
});
