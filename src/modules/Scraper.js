const puppeteer = require('puppeteer');
const Config = require('./Config');
const fs = require('fs');




module.exports = async () => {
    const browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto(Config.pageURL);


    function urlLink(url) {
        if (url.includes("otodom.pl")) {
            return url
        }
        else {
            return Config.olxLink + url;
        }
    }


    const fetchedOffers = await page.evaluate(() => {
        const offers = Array.from(document.querySelectorAll('[data-cy="l-card"]'));
        const offersTitles = offers.map(offer => {
            const title = offer.querySelector('h6').innerText.trim();
            const url = offer.querySelector('a').getAttribute('href').trim();
            const price = offer.querySelector('p[data-testid="ad-price"]').innerText.trim();
            const location = offer.querySelector('p[data-testid="location-date"]').innerText.trim();
            const image = offer.querySelector('img').getAttribute('src');

            return { title, url, price, location, image };
        });

        return offersTitles;
    });


    const cachedOffers = getCachedOffers();
    const newOffers = getNewOffers(cachedOffers, fetchedOffers.map(offer => ({
        ...offer,
        url: urlLink(offer.url)
    })));
    const addedOffers = logOffers(cachedOffers, newOffers);

    await browser.close();
    
    return addedOffers;
};



function getCachedOffers() {
    const cacheFilePath = './cache/offers.json';
    if (fs.existsSync(cacheFilePath)) {
        const cacheData = fs.readFileSync(cacheFilePath);
        return JSON.parse(cacheData);
    } else {
        return [];
    }
}

function logOffers(cachedOffers, fetchedOffers) {
    const newOffers = getNewOffers(cachedOffers, fetchedOffers);
    const data = JSON.stringify([...cachedOffers, ...newOffers], null, 2);
    const path = './cache/offers.json';
    fs.mkdirSync('./cache', { recursive: true }); // create the cache directory if it does not exist
    fs.writeFileSync(path, data);
    return newOffers;
}

function getNewOffers(cachedOffers, fetchedOffers) {
    const cachedUrls = cachedOffers.map(offer => offer.url);
    const newOffers = fetchedOffers.filter(offer => !cachedUrls.includes(offer.url));
    return newOffers;
}