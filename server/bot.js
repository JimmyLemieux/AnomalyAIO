
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

module.exports = {
  session: testSession,
  checkout: launchCheckoutPage,
  test: testingLaunch,
  getSessions: returnSessions,
  killAll: killAllSessions
};

var qArray = [];


function getProxyUrl() {
  var username = 'geonode_7Hbuw9KHL0-country-US-autoReplace-True';
  var password = 'fc96bf48-5382-4176-8e51-299191d4ff9d';
  var GEONODE_DNS = 'premium-residential.geonode.com';
  var GEONODE_PORT = 9002;
  var proxyUrl = "http://" + username + ":" + password + "@" + GEONODE_DNS + ":" + GEONODE_PORT;
  return proxyUrl;
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
async function testSession(reqData, res) {
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
        '--no-zygote', 
        '--no-sandbox',
        '--disable-setuid-sandbox'],
      },
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: reqData.concurrency,
    monitor: false,
    timeout: 100000000
  });

  cluster.task(async ({page, data: test_url}) => {
    var username = 'geonode_7Hbuw9KHL0-country-US-autoReplace-True';
    var password = 'fc96bf48-5382-4176-8e51-299191d4ff9d';
    var GEONODE_DNS = 'premium-residential.geonode.com';
    var GEONODE_PORT = 9005;
    var proxyUrl = "http://" + username + ":" + password + "@" + GEONODE_DNS + ":" + GEONODE_PORT;
    const proxyAgent = new HttpsProxyAgent(proxyUrl);
    var form_data = new FormData();
    form_data.append('email', 'videki3368@idurse.com');
    form_data.append('password', 'Abc123!!!');
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
    // console.log(resp_data);
    await timer(2000);
    let access_token = resp_data.token.access_token;
    let refresh_token = resp_data.token.refresh_token;
    let access_expire = resp_data.token.expires_in;
    let refresh_expire = resp_data.token.refresh_token_expires_in;
    let page_cookies = [
      {
        "name": "token",
        "value": access_token,
        "domain": "droppp.io",
        "path": "/",
        "expires": Date.now() + access_expire,
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
        "value": refresh_token,
        "domain": "droppp.io",
        "path": "/",
        "expires": Date.now() + refresh_expire,
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

    await page.setRequestInterception(true);
    await page.on('request', async (request) => {
      await proxyRequest({
        page,
        proxyUrl: proxyUrl,
        request,
      });
    });
    // await page.setExtraHTTPHeaders({proxy_addr: proxyUrl, proxy_port: GEONODE_PORT.toString()});
    let cookie_json = JSON.parse(JSON.stringify(page_cookies));
    await page.setDefaultNavigationTimeout(0);
    await page.setCookie(...cookie_json);
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    await timer(2000);
    await page.goto(`https://droppp.io/inventory/`);

    let bb = await puppeteer.launch({headless: false});
    let [pp] = await bb.pages();
    await pp.setCookie(...cookie_json);
    await pp.goto(page.url());

    //await page.waitForSelector('body');
    await page.screenshot({path: `./${Math.random() % 30}.png`, fullPage: true})
    // let product_id = 39;
    console.log("Solving Captcha!");
    await page.solveRecaptchas();
    console.log("\x1b[42m%s\x1b[0m", ` captcha solved!! 🎉`);
    // await page.waitForNavigation();
    console.log("Entered the Queue! Waiting for checkout URL....");
    await page.waitForNavigation();
    // This is where we will pring out the checkout link!
  });

  cluster.on('taskerror', (error) => {
    console.log("this is an error!");
    console.log(error);
  });

  cluster.on('queue', (data) => {

    console.log("queued!");
    // qArray.push({
    //   "id": data.id,
    //   "type": "create-session", "status": data.Status,
    //   "info": {"email": data.Email, "password": data.Password}});
  });

  let workers = reqData.workers;
  for (let i = 0;i<workers;i++) {
    await cluster.queue('https://google.com');
  }

  await cluster.idle();
  await cluster.close();

}

// For Front end to update sessions view!
async function returnSessions() {
  return qArray;
}

// HERE FOR NOW
async function testingLaunch(data, res) {
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '560bd7b49d7c0825d3440d33115fe1cc'
      },
      visualFeedback: true}),
    Stealth());

  let proxyUrl = getProxyUrl();
//  const proxyAgent = new HttpsProxyAgent(proxyUrl);
  let concurrency = 1000;

  if (!isNaN(data.threads)) {
    concurrency = +data.threads;
  }
  
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
    maxConcurrency: concurrency,
    monitor: false,
    timeout: 150000 * 1000
  });

  // Keep track of the sessions that are in q and running!

  await cluster.task(async ({page, data}) => {
    let index = await qArray.findIndex(x => x.id === data.id);
    qArray[index].page = page;
    await page.setDefaultNavigationTimeout(0);

    // Proxy info!
    await useProxy(page, proxyUrl);
    console.log("FINE");
    const ipJSON = await useProxy.lookup(page);
    console.log(ipJSON);
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    console.log("proxy");
    await page.goto("https://www.google.com/");
    qArray[index].status = "ON GOOGLE!";
    qArray[index].ip = ipJSON.ip;

    await timer(2000);
    qArray[index].status = "Almost done!";
    // await page.close();
    qArray[index].status = "🎉  CHECKOUT! 🎉";
    const page_cookies = await page.cookies();
    qArray[index].cookies = page_cookies;

  });
  
  cluster.on('queue', (data) => {
    qArray.push({
      "id": data.id,
      "type": "create-session", "status": data.Status,
      "info": {"email": data.Email, "password": data.Password}});
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
          console.log("Error: with queuing task!");
          console.log(err);
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
    await useProxy(currPage, "http://"+ foundPage.ip + ":9002"); // this doesnt work
    console.log("DONE");
    await currPage.authenticate({username: "geonode_7Hbuw9KHL0", password: "fc96bf48-5382-4176-8e51-299191d4ff9d"});
    console.log("AUTH");
    await currPage.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');
    // console.log(foundPage.ip);
    await currPage.setCookie(...foundPage.cookies);
    await currPage.goto("https://www.pornhub.com/");
  }
  return;
}
