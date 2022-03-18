const Config = require("../models/index.model");

exports.saveConfiguration = async (req, res) => {

    const { FeeConfigurationSpec } = req.body;

    const configurations = (FeeConfigurationSpec).split("\n");

    await Promise.all(configurations.map(async (configuration) => {
        configuration = configuration.split(" ");

        configuration.splice(4, 2);

        let feeId = configuration[0];

        let feeCurrency = configuration[1];

        let feeLocale = configuration[2];

        let fe = configuration[3].split("(");
        let fp = fe[1].split(")");

        let feeEntity = fe[0];

        let entityProperty = fp[0];

        let feeType = configuration[4];

        let feeValue = configuration[5];

        let config = new Config();

        await config.save(feeId, feeCurrency, feeLocale, feeEntity, entityProperty, feeType, feeValue);

    }));

    return res.status(200).json({
        "status": "ok",
    });

};

exports.computeTransactionFee = async (req, res) => {
    const { Amount, CurrencyCountry, Customer, PaymentEntity } = req.body;
    let feeLocale;

    if (CurrencyCountry == 'NG' && PaymentEntity.Country == 'NG') {
        feeLocale = 'LOCL';
    } else {
        feeLocale = 'INTL';
    }

    const feeEntity = PaymentEntity.Type;
    const entityProperty = PaymentEntity.Brand;

    let config = new Config();
    const doc = await config.find(feeLocale, feeEntity, entityProperty);
    //JSON.stringify(await redisClient.ft.search('idx:config', `@feeId:${id}`), null, 2)

    if (doc.total > 0) {
        const appliedFeeId = doc.documents[doc.total - 1].value.feeId;
        const appliedFeeType = doc.documents[doc.total - 1].value.feeType;
        let appliedFeeValue;
        let flatPercArr;
        let flatPerc;
        let flatAmt;

        switch (appliedFeeType) {
            case 'FLAT':
                appliedFeeValue = doc.documents[doc.total - 1].value.feeValue;
                break;

            case 'PERC':
                appliedFeeValue = ((doc.documents[doc.total - 1].value.feeValue * Amount) / 100);
                break;

            case 'FLAT_PERC':
                flatPercArr = doc.documents[doc.total - 1].value.feeValue.split(":");
                flatAmt = flatPercArr[0];
                flatPerc = ((flatPercArr[1] * Amount) / 100);

                appliedFeeValue = flatAmt + flatPerc;
                break;
        }

        let chargeAmount;

        if (Customer.BearsFee == true) {
            chargeAmount = Amount + appliedFeeValue;
        } else {
            chargeAmount = Amount;
        }

        const settlementAmount = chargeAmount - appliedFeeValue;

        return res.status(200).json(
            {
                "AppliedFeeID": appliedFeeId,
                "AppliedFeeValue": appliedFeeValue,
                "ChargeAmount": chargeAmount,
                "SettlementAmount": settlementAmount
            }
        );

    } else {
        return res.status(404).json(
            {
                "status": "error",
                "data": {
                    "message": "Oops! No fee configuration found for this payment.",
                }
            }
        );
    }
}; 