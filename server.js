import express from "express";
import Parser from "rss-parser";
import cors from "cors";

const app = express();

const parser = new Parser({
  headers: {
    "User-Agent": "OnSecure-RSS-Monitor/1.0"
  }
});

app.use(cors());

const feeds = [
  { url: "https://www.cert.ssi.gouv.fr/alerte/feed/", source: "CERT-FR" },
  { url: "https://www.cert.ssi.gouv.fr/avis/feed/", source: "CERT-FR" }
];

app.get("/api/alerts", async (req, res) => {
  const results = [];

  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);

      data.items.forEach(item => {
        const title = item.title || "";
        const lowerTitle = title.toLowerCase();

        let level = "Moyen";
        if (lowerTitle.includes("critique")) level = "Critique";
        else if (lowerTitle.includes("important") || lowerTitle.includes("élevé")) level = "Élevé";

        results.push({
          title,
          source: feed.source,
          level
        });
      });
    } catch (err) {
      console.error(`Erreur flux ${feed.url}`, err.message);
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API OnSecure démarrée sur le port ${PORT}`);
});
