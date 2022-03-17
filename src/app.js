const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require('cors');
const compression = require('compression');
const responseTime = require('response-time');

const IndexRoutes = require('./routes/index.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseTime());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Routes
app.use('/', IndexRoutes);


//handle 404
app.use('*', (req, res) => {
  res.status(404).json(
    {
      "status" : "error",
      "data": {
        "message": "Resource Not Found"
      }
    }
  );
});

const PORT = process.env.PORT || 3500;

app.listen(
  PORT,
  () => {
    console.log(`Lannister Pay running in ${process.env.NODE_ENV} mode on ${PORT}`);
  }
);

