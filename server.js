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
  const results = [];

  for (const feed of feeds) {
    const data = await parser.parseURL(feed.url);
    data.items.forEach(item => {
      results.push({
        title: item.title,
        source: feed.source,
        level: item.title?.toLowerCase().includes(\"critique\") ? \"Critique\" : \"Élevé\"
      });
    });
  }

  res.json(results);
});

app.listen(3001, () => {
  console.log(\"API OnSecure démarrée\");
});
