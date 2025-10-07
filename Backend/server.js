const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const request = require("request");
const PORT = 3000;
app.use(express.json());
app.use(express.static("public"));

const connectDB = require("./config/db");
connectDB();

// Allow your deployed frontend and Vercel preview deployments
app.use(
  cors({
    origin: [
      "https://in-share-frontend.vercel.app",
      "https://in-share-frontend-h6omgkw4s-vaidikpandeys-projects.vercel.app",
      /^https:\/\/in-share-frontend.*\.vercel\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);

app.get("/api/files", (req, res) => {
  request(
    { url: "http://localhost:3000/api/files" },
    (error, response, body) => {
      res.send(body);
    },
  );
});

//template engine:
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

//Routes:
app.use("/api/files", require("./routes/files"));
app.use("/files", require("./routes/show"));
app.use("/files/download", require("./routes/download"));
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
