import express from "express";
import { pool } from "./db";
import cors from "cors";

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello Server");
});

app.get("/setup", async (req: express.Request, res: express.Response) => {
  try {
    await pool.query(
      "CREATE TABLE IF NOT EXISTS tickers (id SERIAL PRIMARY KEY, ticker_name VARCHAR(255), data JSON)"
    );
    res.send("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).send("Internal server error");
  }
});

app.get(
  "/fetch-and-store",
  async (req: express.Request, res: express.Response) => {
    try {
      const response = await fetch("https://api.wazirx.com/api/v2/tickers");
      const tickersData: Record<string, any> = await response.json(); // Explicitly declare the type of tickersData

      // Extract top 10 tickers
      const top10Tickers: Record<string, any> = {};
      const tickers = Object.keys(tickersData).slice(0, 10);
      for (const ticker of tickers) {
        top10Tickers[ticker] = tickersData[ticker];
      }

      // Store top 10 tickers data into the database
      const queryText =
        "INSERT INTO tickers (ticker_name, data) VALUES ($1, $2)";
      const queryValues = Object.entries(top10Tickers).map(([ticker, data]) => [
        ticker,
        JSON.stringify(data),
      ]);
      await Promise.all(
        queryValues.map(([ticker, data]) =>
          pool.query(queryText, [ticker, data])
        )
      );

      res.send("Top 10 tickers data stored successfully");
    } catch (error) {
      console.error("Error fetching and storing data:", error);
      res.status(500).send("Internal server error");
    }
  }
);

app.get("/tickers", async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query("SELECT ticker_name, data FROM tickers");
    const tickers = result.rows;
    res.json(tickers);
  } catch (error) {
    console.error("Error fetching tickers:", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
