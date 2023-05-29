const https = require('https');
const reqUrl = 'https://apps.shopify.com/adoric-popups/reviews';

exports.createStatisticReport = async (req, res) => {
    const adoric = req.query.adoric;
    if (!adoric) {
        return res.status(400).send('Error- request');

    }
    https.get(reqUrl, (resp) => {
        let data = '';
        resp.on('data', chunk => {
            data += chunk;
        });
        resp.on('end', () => {
            return res.status(200).send(data);
        })
    });

};