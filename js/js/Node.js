const amazonPaapi = require('amazon-paapi');

const commonParameters = {
  AccessKey: 'YOUR_ACCESS_KEY',
  SecretKey: 'YOUR_SECRET_KEY',
  PartnerTag: 'yourtag-20',
  PartnerType: 'Associates',
  Marketplace: 'www.amazon.com',
};

const requestParameters = {
  ItemIds: ['B08XJG8MQM'],
  Resources: ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
};

amazonPaapi.GetItems(commonParameters, requestParameters)
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
