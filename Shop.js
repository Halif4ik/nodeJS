const http = require('http')
const https = require('https')
const hostname = '127.0.0.1'
const port = 3000
const reqUrl = 'https://apps.shopify.com/adoric-popups/reviews'

const server = http.createServer((req, res) => {
    let currency = new URLSearchParams(req.url).get('/rates?adoric');
    if (currency != 'shopifiy') {
        res.writeHead(404);
        res.end('Error- request');
        return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    https.get(reqUrl, (resp) => {
        let data = '';
        resp.on('data', chunk => {
            data += chunk;
        });
        resp.on('end', () => {
            res.end(data);
        })
    });

})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})