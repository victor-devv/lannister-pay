const redisClient = require('../utils/redis-client');
const shortid = require('shortid');

module.exports = class Config {

  async save(feeId, feeCurrency, feeLocale, feeEntity, entityProperty, feeType, feeValue) {
    if (feeId == '*') {
      feeId = 'all';
    }

    if (feeCurrency == '*') {
      feeCurrency = 'all';
    }

    if (feeLocale == '*') {
      feeLocale = 'all';
    }

    if (feeEntity == '*') {
      feeEntity = 'all';
    }
    if (entityProperty == '*') {
      entityProperty = 'all';
    }    
    
    if (feeType == '*') {
      feeType = 'all';
    }    
    
    if (feeValue == '*') {
      feeValue = 'all';
    }    
    
    let id = shortid.generate();

    await Promise.all([
      redisClient.json.set(`noderedis:configs:${id}`, '$', {
        feeId: feeId,
        feeCurrency: feeCurrency,
        feeLocale: feeLocale,
        feeEntity: feeEntity,
        entityProperty: entityProperty,
        feeType: feeType,
        feeValue: feeValue,
        timestamp: new Date().toLocaleString().replace(',','')
      })
    ]
    );

    return true;
  }

  async find(feeLocale, feeEntity, entityProperty) {
    //escape '-' due to tokenization
    if (feeEntity == 'CREDIT-CARD') {
      feeEntity = 'CREDIT';
    } else if (feeEntity == 'DEBIT-CARD') {
      feeEntity = 'DEBIT';
    } 

    let doc;

    //feeEntity = feeEntity.replace(/[.@]/g, '\\$&');
    doc = await redisClient.ft.search('idx:configs', `@feeLocale:${feeLocale} @feeEntity:${feeEntity} @entityProperty:${entityProperty}`);

    if (doc.total == 0) {
      doc = await redisClient.ft.search('idx:configs', `@feeLocale:${feeLocale} @feeEntity:${feeEntity} @entityProperty:all `);
    }

    if (doc.total == 0) {
      doc = await redisClient.ft.search('idx:configs', `@feeLocale:${feeLocale} @feeEntity:all @entityProperty:all `);
    }

    if (doc.total == 0) {
      doc = await redisClient.ft.search('idx:configs', `@feeLocale:all @feeEntity:all @entityProperty:all`);
    }

    return doc;
  }
  // @feeLocale:${feeLocale} @feeEntity:${feeEntity}
    // console.log(JSON.stringify(await redisClient.ft.search('idx:config', `(@feeLocale:${feeLocale} | @feeLocale:*) (@feeEntity:${feeEntity} | @feeEntity:*) (@entityProperty:${entityProperty} | @entityProperty:*)`), null, 2));

};