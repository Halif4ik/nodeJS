const https = require('https');
const reqUrl = 'https://apps.shopify.com/adoric-popups/reviews';

exports.createStatisticReport = async (req, res) => {
    let {productList, relatedProductsCounter, totalCounter, endDate, startDate, maxResults, userDomain} = req.query;


    let idIteration;
    let needToFindPopularId = false;

    if (!userDomain) {
        return res.send('userDomain is required');
    }

    if (!startDate) {
        startDate = '7daysAgo';
    }

    if (!endDate) {
        endDate = 'yesterday';
    }

    if (!maxResults) {
        maxResults = '1000';
    }

    if (!totalCounter) {
        idIteration = 10;
    } else {
        idIteration = parseInt(totalCounter);
    }

    if (!productList) {

        needToFindPopularId = true;
    } else {
        productList = productList.split(',');
        idIteration = productList.length;
    }

    if (!relatedProductsCounter) {
        relatedProductsCounter = 10;
    }

    if (!clients[userDomain]) {
        return res.send('please, add the credentials for this domain');
    }

    const accessToken = await getAccesTokenbyClient(gaCredentials, clients[userDomain]);
    console.log('accessToken - ', JSON.stringify(accessToken));
    if (accessToken && accessToken.access_token) {
        const resultData = await getDataDirectlyFromGA(accessToken.access_token, endDate, startDate, maxResults, clients[userDomain].userId);
        if (resultData && resultData.rows) {
            relatedByIdRevenue(resultData.rows);
        } else {
            res.status(400).send(resultData);
        }

    } else {
        res.status(410).send(accessToken);
    }


    function relatedByIdRevenue(response) {
        const result = [];
        for (let i = 0; i < idIteration; i++) {
            let id;
            if (needToFindPopularId) {
                id = findFrequency(response);
                id = id.id;
            } else {
                id = productList[i];
            }
            let filteredTransactions = response.filter(item => item[1] == id);
            const transactions = filteredTransactions;
            filteredTransactions = filteredTransactions.map(item => item[0]);
            const allTransactions = filteredTransactions.length;
            let relatedTransactions = response.filter(item => {
                if (filteredTransactions.some(i => item[0] == i)) {
                    return item
                }
            });

            response = response.filter(item => item[1] != id);
            const allQuantity = relatedTransactions.reduce((sum, item) => sum + parseInt(item[2]), 0);
            let allRevenue = relatedTransactions.reduce((sum, item) => sum + parseFloat(('' + item[4]).replace(',', '').replace('₪', '')), 0);
            allRevenue = allRevenue.toFixed(2);
            relatedTransactions = relatedTransactions.filter(item => item[1] != id);
            let singleTransactions = [];
            transactions.map(item => {
                if (!relatedTransactions.some(i => item[0] == i[0])) {
                    singleTransactions.push(item);
                }
            });
            const singleTransactionsQuantity = singleTransactions.reduce((sum, item) => sum + parseInt(item[2]), 0);
            const singleTransactionsRevenue = singleTransactions.reduce((sum, item) => sum + parseFloat(('' + item[4]).replace(',', '').replace('₪', '')), 0);


            const relatedTransactionsQuantity = relatedTransactions.reduce((sum, item) => sum + parseInt(item[2]), 0);
            const relatedProductsRevenue = relatedTransactions.reduce((sum, item) => sum + parseFloat(('' + item[4]).replace(',', '').replace('₪', '')), 0);
            const quantityRelated = findRelatedProducts(relatedTransactions, relatedTransactionsQuantity, relatedProductsRevenue);
            const resultObj = {
                [id]:
                    {
                        totalTransactions: allTransactions,
                        totalQuantity: allQuantity - relatedTransactionsQuantity,
                        totalRevenue: `${(allRevenue - relatedProductsRevenue).toFixed(2)}$`,
                        singleItem: {
                            quantity: singleTransactionsQuantity,
                            revenue: `${singleTransactionsRevenue.toFixed(2)}$`,
                        },
                        relatedProducts: quantityRelated
                    }
            };
            result.push(resultObj);
        }
        ;

        res.status(200).send(result);
    }

    function findRelatedProducts(transactionsArray, totalSum, relatedProductsRevenue) {
        const relatedProducts = [];
        let arrayToSearch = transactionsArray;
        for (let i = 0; i < relatedProductsCounter; i++) {
            const related = findFrequency(arrayToSearch);
            if (!related.id) break;
            arrayToSearch = arrayToSearch.filter(item => item[1] != related.id);
            related.persentageQuantity = `${(parseFloat(related.quantity) * 100 / totalSum).toFixed(2)}%`;
            related.persentageRevenue = `${(parseFloat(related.productRevenue) * 100 / relatedProductsRevenue).toFixed(2)}%`;
            relatedProducts.push(related);
        }
        return relatedProducts;
    }

    function findFrequency(array) {
        const ranks = array.reduce(function (totals, num) {
            if (num[1]) {
                const id = num[1];
                if (!totals[id]) totals[id] = 0;
                totals[id] += parseInt(num[2]);
                return totals;
            } else {
                return totals
            }
        }, {});

        let max = 0;
        let id = '';

        Object.entries(ranks).forEach(function (num) {
            if (num[1] > max) {
                max = num[1];
                id = num[0];
            }
        });

        const productRevenue = array.reduce((sum, item) => {
            if (item[1] == id) {
                return sum + parseFloat(('' + item[4]).replace(',', '').replace('₪', ''));
            } else {
                return sum;
            }
        }, 0);

        return {
            id: id,
            quantity: max,
            productRevenue: `${productRevenue.toFixed(2)}$`,
        };
    }


};

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