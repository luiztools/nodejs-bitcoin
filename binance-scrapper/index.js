const puppeteer = require('puppeteer');

async function scrap() {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://launchpad.binance.com/pt-BR/');
    await page.waitForNetworkIdle();

    const launchpad = await page.evaluate(() => {
        return document.querySelector('div.css-1q7tw3q').innerText;
    })

    const launchpool = await page.evaluate(() => {
        return document.querySelector('div.css-13to1co').innerText;
    })

    browser.close();

    if (!launches.includes(launchpad)) {
        launches.push(launchpad);
        console.log("Novo Launchpad: " + launchpad);
    }

    if (!launches.includes(launchpool)) {
        launches.push(launchpool);
        console.log("Novo Launchpool: " + launchpool);
    }
};

const launches = [];
scrap();
setInterval(scrap, 60 * 60 * 1000);