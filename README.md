# LannisterPay

This is a transaction fee processing service. It calculates fees applicable to a transaction based on specific fee configurations set.

## Hosting

The API is hosted on AWS at
[http://13.246.34.164:3500](http://13.246.34.164:3500)

## Endpoints

- /fees
``` json
{
  "FeeConfigurationSpec": "LNPY1221 NGN * *(*) : APPLY PERC 1.4\nLNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0\nLNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4\nLNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100\nLNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55"
}
```

- /compute-transaction-fee
``` json
{
    "ID": 91203,
    "Amount": 5000,
    "Currency": "NGN",
    "CurrencyCountry": "NG",
    "Customer": {
        "ID": 2211232,
        "EmailAddress": "anonimized29900@anon.io",
        "FullName": "Abel Eden",
        "BearsFee": true
    },
    "PaymentEntity": {
        "ID": 2203454,
        "Issuer": "GTBANK",
        "Brand": "MASTERCARD",
        "Number": "530191******2903",
        "SixID": 530191,
        "Type": "CREDIT-CARD",
        "Country": "NG"
    }
}
```

## Stack

- NodeJs
- Express
- Redis
- Docker
- POSTMAN


## Requirements and Installation

To run this API:

- Clone this repository
- Create .env file (check .env.example for sample)
- Run docker compose up --build


## Author

Victor Ikuomola (victorikuomola.k@gmail.com)

