const express = require('express');
const router = express.Router();

const { validateFeeConfiguration, validateFeeComputeBody } = require("../middlewares/index.middleware");
const { saveConfiguration, computeTransactionFee } = require('../controllers/index.controller');

router.get('/', (req,res)=>{
  return res.status(200).send(`Lannister Pay`);
});

router.get('/healthcheck', (req,res)=>{
  return res.status(200).send(`App Running`);
});

router.post('/fees', validateFeeConfiguration, saveConfiguration);

router.post('/compute-transaction-fee', validateFeeComputeBody, computeTransactionFee);

module.exports = router;
