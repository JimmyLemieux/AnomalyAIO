
const fetch = require('node-fetch');
const puppeteer = require('puppeteer-extra');

const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const { Cluster } = require('puppeteer-cluster');
const Stealth = require('puppeteer-extra-plugin-stealth');
const useProxy = require('puppeteer-page-proxy');
const proxyChain = require('proxy-chain');
const { Browser } = require('puppeteer');
const fs = require('fs-extra');
const csv = require('csv-parser');
// const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
let FormData = require('form-data');
const { randomInt } = require('crypto');
const {proxyRequest} = require('puppeteer-proxy');

const timer = ms => new Promise(res => setTimeout(res, ms))
const CLUSTER_TIMEOUT = 1000000 * 150;
const product_id = 41;
const cookie_domain = "droppp.io";

module.exports = {
  session: BotSessions,
  checkout: launchCheckoutPage,
  test: testingLaunch,
  getSessions: returnSessions,
  killAll: killAllSessions
};

var qArray = [];

function calculateConcurrency(threads) {
  return !isNaN(threads) ? +threads : 1000;
}

function getProxyUrl() {
  var username = 'geonode_7Hbuw9KHL0-country-US-autoReplace-True';
  var password = 'fc96bf48-5382-4176-8e51-299191d4ff9d';
  var GEONODE_DNS = 'premium-residential.geonode.com';
  var GEONODE_PORT = 9002;
  var proxyUrl = "http://" + username + ":" + password + "@" + GEONODE_DNS + ":" + GEONODE_PORT;
  return proxyUrl;
}

function createAccessTokenCookies(accessToken, accessExpire, refreshToken, refreshExpire, cookieDomain) {
  return [
    {
      "name": "token",
      "value": accessToken,
      "domain": cookieDomain,
      "path": "/",
      "expires": Date.now() + accessExpire,
      "size": 69,
      "httpOnly": false,
      "secure": false,
      "session": false,
      "priority": "Medium",
      "sameParty": false,
      "sourceScheme": "Secure",
      "sourcePort": 443
    },
    {
      "name": "refresh_token",
      "value": refreshToken,
      "domain": cookieDomain,
      "path": "/",
      "expires": Date.now() + refreshExpire,
      "size": 77,
      "httpOnly": false,
      "secure": false,
      "session": false,
      "priority": "Medium",
      "sameParty": false,
      "sourceScheme": "Secure",
      "sourcePort": 443
    }
  ];
}

// TODO!
async function killAllSessions() {
  for (let i  = 0;i<qArray.length;i++) {
    qArray[i].status = "Killing Task :(";
     await qArray[i].page.close();
  }
  qArray = [];
}

// ACTUAL BOT
async function BotSessions(data) {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '560bd7b49d7c0825d3440d33115fe1cc'
      },
      visualFeedback: true}),
    Stealth());

  const cluster = await Cluster.launch({
    puppeteer,
    puppeteerOptions: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-notifications"],
      },
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: calculateConcurrency(data.threads),
    monitor: false,
    timeout: CLUSTER_TIMEOUT
  });

  cluster.task(async ({page, data}) => {
    
    let index = await qArray.findIndex(x => x.id === data.id);
    qArray[index].page = page;
    await page.setDefaultNavigationTimeout(0);

    var proxyUrl = getProxyUrl();
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    
    var form_data = new FormData();
    form_data.append('email', data.Email);
    form_data.append('password', data.Password);
    
    var config = {
      method: 'POST',
      agent: proxyAgent,
      headers: { 
        ...form_data.getHeaders(),
        "Access-Control-Allow-Origin": "*",
        'Origin': 'https://droppp.io',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
      },
      body : form_data
    };

    let url = "https://api.droppp.io/v1/user/login";
    let resp = await fetch(url, config);
    let resp_data = await resp.json();
    
    await timer(500);

    let access_token = resp_data.token.access_token;
    let refresh_token = resp_data.token.refresh_token;
    let access_expire = resp_data.token.expires_in;
    let refresh_expire = resp_data.token.refresh_token_expires_in;

    let page_cookies = createAccessTokenCookies(access_token, access_expire, refresh_token, refresh_expire, cookie_domain);
    
    await useProxy(page, proxyUrl);
    qArray[index].sort = 1;
    qArray[index].status = "Started Proxy Connection...";
    let cookie_json = JSON.parse(JSON.stringify(page_cookies));
    qArray[index].sort = 2;
    qArray[index].status = "Setting page cookies...";
    await page.setCookie(...cookie_json);
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
  
    qArray[index].sort = 3;
    qArray[index].status = "Entering the queue";
    await page.goto(`https://droppp.io/reserve-drop/?drop_id=${product_id}`);

    qArray[index].sort = 4;
    qArray[index].status = "Looking for Captcha...";
    await page.waitForSelector('iframe[src*="recaptcha/"]')
    qArray[index].sort = 5;
    qArray[index].status = "Found Captcha attempting solve...";
    await page.solveRecaptchas();
    qArray[index].sort = 6;
    qArary[index].status = "Captcha Solved!! 🎉";
    await page.waitForNavigation();
    qArray[index].sort = 7;
    qArray[index].status = "Successfully entered the queue! Waiting for checkout URL...";
    await page.waitForNavigation();
    // This is where we will pring out the checkout link!
    qArray[index].sort = 8;
    qArray[index].status = "🎉  CHECKOUT! 🎉";
    let checkout_page_cookies = await page.cookies();
    qArray[index].cookies = checkout_page_cookies;
  });

  cluster.on('taskerror', (error) => {
    console.log(error);
  });

  cluster.on('queue', (data) => {
    qArray.push({
      "id": data.id,
      "type": "create-session", "status": data.Status,
      "info": {"email": data.Email, "password": data.Password},
      "sort": 0});
  });

  let workerCount = 0;
  fs.createReadStream('./uploads/users.csv')
  .pipe(csv())
  .on('data', async function(row) {
      console.log(row);
      cluster.queue({ "id": ++workerCount, "Email": row.Email, "Password": row.Password, "Status": "Worker Queued" })
        .catch((err) => {
          console.err("Error: with queuing task!");
          console.err(err);
        });
    });

  await cluster.idle();
  await cluster.close();
}

// For Front end to update sessions view!
async function returnSessions() {
  return qArray;
}

// TESTING!
async function testingLaunch(data) {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '560bd7b49d7c0825d3440d33115fe1cc'
      },
      visualFeedback: true}),
    Stealth());
  
  const cluster = await Cluster.launch({
    puppeteer,
    puppeteerOptions: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-notifications"]},
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: calculateConcurrency(data.threads),
    monitor: false,
    timeout: CLUSTER_TIMEOUT
  });

  // Keep track of the sessions that are in q and running!

  await cluster.task(async ({page, data}) => {
    let index = await qArray.findIndex(x => x.id === data.id);
    qArray[index].page = page;
    await page.setDefaultNavigationTimeout(0);

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    await page.goto("https://droppp.io/");
    qArray[index].status = "ON DROPPP!";
    await timer(2000);
    qArray[index].sort = 1;
    qArray[index].status = "Almost done!";
    await timer(1000);
    qArray[index].sort = 2;
    qArray[index].status = "🎉  CHECKOUT! 🎉";
    const page_cookies = await page.cookies();

    qArray[index].cookies = createAccessTokenCookies('James', 10, 'Lemieux', 10, cookie_domain);

  });
  
  cluster.on('queue', (data) => {
    qArray.push({
      "id": data.id,
      "type": "create-session", "status": data.Status,
      "info": {"email": data.Email, "password": data.Password},
      "sort": 0});
  });

  cluster.on('taskerror', (err, data, willRetry) => {
    console.log(err.message);
  });

  let workerCount = 0;
  fs.createReadStream('./uploads/users.csv')
  .pipe(csv())
  .on('data', function (row) {
      cluster.queue({ "id": ++workerCount, "Email": row.Email, "Password": row.Password, "Status": "Worker Queued" })
        .catch((err) => {
          console.err("Error: with queuing task!");
          console.err(err);
        });
    });

  await cluster.idle();
  await cluster.close();
}

// SHOW CHECKOUTS
async function launchCheckoutPage(session) {
  const foundPage = qArray.find(x => x.id === session.id);
  if (foundPage !== undefined && foundPage.cookies !== undefined) {
    console.log(foundPage.page.url());
    const newBrowser = await puppeteer.launch({headless: false, args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu"],
    ignoreHTTPSErrors: true
  });
    let [currPage] = await newBrowser.pages();
    await currPage.setDefaultNavigationTimeout(0);
    // let proxyUrl = getProxyUrl();
    // await useProxy(currPage, proxyUrl);
    await currPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    await currPage.setCookie(...foundPage.cookies);
    await currPage.goto(foundPage.page.url());
  }
  return;
}
