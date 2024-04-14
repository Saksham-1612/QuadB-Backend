import { Pool } from "pg";

// export const pool = new Pool({
//   host: "db",
//   port: 5432,
//   user: "user",
//   password: "pass123",
//   database: "holdinfo",
// });

const connectionString =
  "postgresql://Saksham-1612:TVYkXwgp56No@ep-summer-limit-79446715.us-east-2.aws.neon.tech/holdinfo?sslmode=require";

export const pool = new Pool({
  connectionString: connectionString,
});
