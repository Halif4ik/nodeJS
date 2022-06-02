const http = require('http')
const hostname = '127.0.0.1'
const fs = require('fs')
const path = require('path')
const port = 3000

function titleCase(string) {
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

const server = http.createServer((req, res) => {
    let findCountry = 'India'
    let country = new URLSearchParams(req.url).get('/capital?country');
    if (country) findCountry = titleCase(country);

    const filepath = path.join(__dirname, 'node_modules/country-json/src', 'country-by-capital-city.json')
    fs.readFile(filepath, (err, data) => {
        if (err) throw err;
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        let arraysCountryCity = JSON.parse(data)

        let currentCountry = (el) => el['country'] === findCountry;
        let result = arraysCountryCity.find(currentCountry)

        res.end(`Capital of ${findCountry} is ${result['city']}`)
    })

})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})