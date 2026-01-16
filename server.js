import express from "express";
import Parser from "rss-parser";
import cors from "cors";

const app = express();

// Parser RSS avec User-Agent (CERT-FR sensible aux bots cloud)
const parser = new Parser({
  headers: {
    "User-Agent": "OnSecure-RSS-Monitor/1.0 (+public-dashboard)"
  },
  timeout: 10000
});

app.use(cors());

// Route racine
app.get("/", (req, res) => {
  res.send("API OnSecure active – utilisez /api/alerts");
});

const feeds = [
  {
    url: "https://www.cert.ssi.gouv.fr/alerte/feed/",
    source: "CERT-FR"
  },
  {
    url: "https://www.cert.ssi.gouv.fr/avis/feed/",
    source: "CERT-FR"
  }
];

// Données de secours (fallback) – IMPORTANT pour dashboard public
const fallbackAlerts = [
  {
    title: "[Exemple] Vulnérabilité critique sur un produit réseau",
    source: "CERT-FR",
    level: "Critique"
  },
  {
    title: "[Exemple] Correctifs de sécurité mensuels",
    source: "CERT-FR",
    level: "Élevé"
  }
];

app.get("/api/alerts", async (req, res) => {
  const results = [];

  for (const feed of feeds) {
    try {
      const data = await parser.parseURL(feed.url);
      if (!data.items) continue;

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
      console.warn(`Flux inaccessible (${feed.url}) : ${err.message}`);
    }
  }

  // Si aucun flux n'est accessible, on renvoie des données de démonstration
  if (results.length === 0) {
    return res.json(fallbackAlerts);
  }

  res.json(results);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API OnSecure démarrée sur le port ${PORT}`);
});
