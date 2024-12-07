require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const receiptDetailsRouter = require("./api/receipt");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(express.json());

app.use(cors());

app.use(receiptDetailsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
