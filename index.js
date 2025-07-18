const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;
  const searchTerm = "sneakers"; // Placeholder until AI detection added

  // Auto delete image after 5 min
  setTimeout(() => {
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Image deletion error:", err);
    });
  }, 5 * 60 * 1000);

  try {
    const flipkartURL = `https://www.flipkart.com/search?q=${encodeURIComponent(searchTerm)}`;
    const { data } = await axios.get(flipkartURL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
      },
    });

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

    if (results.length === 0) return res.json({ error: "No products found." });

    res.json({ matches: results.slice(0, 6) });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.json({ error: "Flipkart scraping failed." });
  }
});

app.get("/search", async (req, res) => {
  const searchTerm = req.query.product || "sneakers";
  const flipkartURL = `https://www.flipkart.com/search?q=${encodeURIComponent(searchTerm)}`;

  try {
    const { data } = await axios.get(flipkartURL, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
      },
    });

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

    if (results.length === 0) return res.json({ error: "No results found." });

    res.json({ matches: results.slice(0, 6) });
  } catch (error) {
    console.error("Flipkart search error:", error.message);
    res.json({ error: "Flipkart text search failed." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Snap-Buy running at http://localhost:${PORT}`);
});
