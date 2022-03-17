const express = require('express');
const router = express.Router();

router.get('/', (req,res)=>{
  return res.status(200).send(`Lannister Pay`);
});

router.get('/healthcheck', (req,res)=>{
  return res.status(200).send(`App Running`);
});

module.exports = router;
