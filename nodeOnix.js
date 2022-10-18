const http = require('http')
const https = require('https')
const hostname = '127.0.0.1'
const fs = require('fs')
const path = require('path')
const port = 3000
const reqUrl = 'api.coincap.io'


const server = http.createServer((req, res) => {
    let currency = new URLSearchParams(req.url).get('/rates?currency');
    if (!currency) {
        res.writeHead(404);
        res.end('Error- absent name currency');
        return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    let result = '';
    https.get('https://api.coincap.io/v2/rates/'+currency, (resp) => {
        let data = '';
        resp.on('data', chunk => {
            data += chunk;
        });
        resp.on('end', () => {
            let obj = JSON.parse(data);
            result = obj.data.rateUsd;
            res.end("usd :" + result);
        })
    });

})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})