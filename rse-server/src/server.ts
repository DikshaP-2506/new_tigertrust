import express from "express";
import routes from "./routes";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
res.send("RSE Server Running");
});

app.listen(4000, () => {
console.log("RSE server running on port 4000");
});
