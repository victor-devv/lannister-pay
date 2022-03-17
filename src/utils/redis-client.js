//const redis = require('redis');

const { createClient, SchemaFieldTypes, } = require('redis');

const redisClient = createClient({ url: 'redis://redis:6379' });

async function connectRedis() {

    await redisClient.connect();

    redisClient.on('connect', () => {
        console.log('Redis client connected');
    });

    redisClient.on('error', (err) => {
        console.log(err);
    });
    //{FEE-ID} {FEE-CURRENCY} {FEE-LOCALE} {FEE-ENTITY}({ENTITY-PROPERTY}) : APPLY {FEE-TYPE} {FEE-VALUE}
    // Create an index.
    try {
        await redisClient.ft.create('idx:fc', {
            '$.feeId': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeId'
            },
            '$.feeCurrency': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeCurrency'
            },
            '$.feeLocale': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeLocale'
            },
            '$.feeEntity': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeEntity'
            },
            '$.entityProperty': {
                type: SchemaFieldTypes.TEXT,
                AS: 'entityProperty'
            },
            '$.feeType': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeType'
            },
            '$.feeValue': {
                type: SchemaFieldTypes.TEXT,
                AS: 'feeValue'
            }
        }, {
            ON: 'JSON',
            PREFIX: 'noderedis:fc'
        });
    } catch (e) {
        if (e.message === 'Index already exists') {
            console.log('Index exists already, skipped creation.');
        } else {
            // Something went wrong, perhaps RediSearch isn't installed...
            console.error(e);
            process.exit(1);
        }
    }

    await redisClient.json.set(`noderedis:fc:1`, '$', {
        feeId: 'LNPY1221',
        feeCurrency: 'NGN',
        feeLocale: '*',
        feeEntity: '*',
        entityProperty: '*',
        feeType: 'PERC',
        feeValue: '1.4'
    });

    console.log(
        JSON.stringify(await redisClient.ft.search('idx:fc', '@feeId:{LNPY1221}'), null, 2)
    );

} 

async function getAll() {
    console.log(
        JSON.stringify(
            await redisClient.ft.search('idx:fc'), 
            null, 
            2
        )
    );
}
connectRedis();
///getAll();

module.exports = redisClient;