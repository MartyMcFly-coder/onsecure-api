import express from "express";
import Parser from "rss-parser";
import cors from "cors";

const app = express();
const parser = new Parser();

app.use(cors());

const feeds = [
  { url: "https://www.cert.ssi.gouv.fr/alerte/feed/", source: "CERT-FR" },
  { url: "https://www.cert.ssi.gouv.fr/avis/feed/", source: "CERT-FR" },
  { url: "https://www.cisa.gov/cybersecurity-advisories/feed", source: "CISA" }
];

app.get("/api/alerts", async (req, res) => {
  try {
    const results = [];

    for (const feed of feeds) {
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
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des flux" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API OnSecure démarrée sur le port ${PORT}`);
});

