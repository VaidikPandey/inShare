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

// Allow only your deployed frontend
app.use(
  cors({
    origin: "https://in-share-frontend.vercel.app","http://127.0.0.1:8080",
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
