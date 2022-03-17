const redisClient = require('../utils/redis-client');
const shortid = require('shortid');

let configurationSyntaxErrors = [];

module.exports = {
  validateFeeConfiguration: function (req, res, next) {
    if (req.body && req.body.FeeConfigurationSpec) {
      const { FeeConfigurationSpec } = req.body;
      
      const configurations = (FeeConfigurationSpec).split("\n");

      //check fc syntax
      configurations.forEach(checkConfigurationSyntax);

      if (configurationSyntaxErrors.length == 0) {

        for(let i=0 ; i < configurations.length ; i++) {
          let configuration = configurations[i].split(" ");
          configuration.splice(4, 2);

          extractConfigDetails(configuration, res)
            .then(() => {
              //viewInsertedConfig(configuration[0]);
            });
        }

        if (configurationSyntaxErrors.length == 0) {
          return next();
        } else {
          returnBadRequest(res);
        }

      } else {
        returnBadRequest(res);
      }

    } else {
      return res.status(400).json(
          {
            "status": "error",
            "data": {
                "message": "Required field(s) missing"
            }
          }
      );
    }
  },

  validateFeeComputeBody:  function (req, res, next) {
    const { ID, Amount, Currency, CurrencyCountry, Customer, PaymentEntity } = req.body;
    
    if (ID && Amount && Currency && CurrencyCountry && Customer && PaymentEntity) {

      if( Currency != 'NGN' || CurrencyCountry != 'NG') {
        return res.status(400).json(
          {
            "Error": `No fee configuration for ${Currency} transactions.`
          }
        );
      } else {
        return next();
      }
    
    } else {
      return res.status(400).json(
          {
            "status": "error",
            "data": {
                "message": "Required field(s) missing"
            }
          }
      );
    }

  }

};

const checkConfigurationSyntax = fc => {
  let regex = /[a-zA-Z0-9] [a-zA-Z*]+ [a-zA-Z*]+ [a-zA-Z*-]+\([a-zA-Z*]+\) : APPLY [a-zA-Z_]+ [0-9]\d*(\.\d+)?/i;

  if(!regex.test(fc)) {
    configurationSyntaxErrors.push('Invalid Fee Configuration Syntax');
  }
};

const extractConfigDetails = async (config, res) => {
  //{FEE-ID} {FEE-CURRENCY} {FEE-LOCALE} {FEE-ENTITY}({ENTITY-PROPERTY}) : APPLY {FEE-TYPE} {FEE-VALUE}
  const FEE_ID = config[0];
  validateDetails(FEE_ID, 1);

  const FEE_CURRENCY = config[1];
  validateDetails(FEE_CURRENCY, 2);

  const FEE_LOCALE = config[2];
  validateDetails(FEE_LOCALE, 3);

  let fe = config[3].split("(");
  let fp = fe[1].split(")");

  const FEE_ENTITY = fe[0];
  validateDetails(FEE_ENTITY, 4);

  const ENTITIY_PROPERTY = fp[0];

  const FEE_TYPE = config[4];
  validateDetails(FEE_TYPE, 5);

  const FEE_VALUE = config[5];

  if (configurationSyntaxErrors.length == 0) {
    const id = shortid.generate();

    await Promise.all([
      redisClient.json.set(`noderedis:config:${id}`, '$', {
        feeId: FEE_ID,
        feeCurrency: FEE_CURRENCY,
        feeLocale: FEE_LOCALE,
        feeEntity: FEE_ENTITY,
        entityProperty: ENTITIY_PROPERTY,
        feeType: FEE_TYPE,
        feeValue: FEE_VALUE,
        timestamp: new Date().toLocaleString().replace(',','')
      })
    ]
    );

  } else {
    returnBadRequest(res);
  }

};

const validateDetails = (item, identifier) => {
  const feeLocales = ['*', 'LOCL', 'INTL'];
  const feeEntities = ['*', 'CREDIT-CARD', 'DEBIT-CARD', 'BANK-ACCOUNT', 'USSD', 'WALLET-ID'];
  const feeTypes = ['*', 'FLAT', 'PERC', 'FLAT_PERC'];

  switch (identifier) {
    case 1:
      if(item.length == 8) {
        return true;
      } else {
        configurationSyntaxErrors.push(`Invalid FEE-ID - ${item}`);
      }
      break;

    case 2:
      if(item.length == 3 || item == '*') {
        return true;
      } else {
        configurationSyntaxErrors.push(`Invalid FEE-CURRENCY - ${item}`);
      }
      break;

    case 3:
      if(feeLocales.includes(item)) {
        return true;
      } else {
        configurationSyntaxErrors.push(`Invalid FEE-LOCALE - ${item}`);
      }
      break;

    case 4:
      if(feeEntities.includes(item)) {
        return true;
      } else {
        configurationSyntaxErrors.push(`Invalid FEE-ENTITY - ${item}`);
      }
      break;

    case 5:
      if(feeTypes.includes(item)) {
        return true;
      } else {
        configurationSyntaxErrors.push(`Invalid FEE-TYPE - ${item}`);
      }
      break;
  
    default:
      break;
  }
};

const viewInsertedConfig = async (id) => {
  console.log(
    JSON.stringify(await redisClient.ft.search('idx:config', `@feeId:${id}`), null, 2)
  );

};

const returnBadRequest = (res) => {
  return res.status(400).json(
    {
      "status": "error",
      "data": {
        "message": "Bad Request",
        "errors": configurationSyntaxErrors
      }
    }
  );
};


