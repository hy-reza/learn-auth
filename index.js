import express from "express";
import db from "./config/database.js";
import "dotenv/config";
import cookieParser from "cookie-parser";
// import Users from "./models/UserModel.js";
import routes from "./routes/index.js";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", routes);

try {
  await db.authenticate();
  // await Users.sync(); generate table
  console.log("Database authenticated successfully !");
  app.listen(5000, () => {
    console.log("Server allready listening for request on port 5000...");
  });
} catch (error) {
  console.error(error);
}
