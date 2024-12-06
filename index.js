require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const receiptDetails_router = require('./routes/receipt');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(receiptDetails_router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
