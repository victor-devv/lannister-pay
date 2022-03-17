const express = require('express');
const router = express.Router();

const { validateFeeConfiguration } = require("../middlewares/fc-validator.middleware");


router.get('/', (req,res)=>{
  return res.status(200).send(`Lannister Pay`);
});

router.get('/healthcheck', (req,res)=>{
  return res.status(200).send(`App Running`);
});

router.post('/fees', validateFeeConfiguration, (req,res)=>{
   res.status(200).json({
        "status": "ok",
      });
});


module.exports = router;
