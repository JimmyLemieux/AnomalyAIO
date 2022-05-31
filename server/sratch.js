const puppeteer = require('puppeteer-extra');
const { Cluster } = require('puppeteer-cluster');
const Stealth = require('puppeteer-extra-plugin-stealth');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const ncp = require("copy-paste");
const fs = require('fs');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const useProxy = require('puppeteer-page-proxy');
const HttpsProxyAgent = require('https-proxy-agent');
let FormData = require('form-data');



const timer = ms => new Promise(res => setTimeout(res, ms));

// Trying to generate gmails
async function gmails() {
  puppeteer.use(Stealth());

  const browser = await puppeteer.launch({headless: false});
  const [page] = await browser.pages();
  await page.setDefaultNavigationTimeout(0);
  // await page.allo wRequestInterception(true);
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3738.0 Safari/537.36');

  await page.goto("https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&flowName=GlifWebSignIn&flowEntry=SignUp");

  let id = uuidv4();
  console.log(id);
  let response = await fetch('https://randomuser.me/api/');
  let resp = await response.json();
  let nameObj = resp.results[0].name;
  console.log(resp.results[0].name);
  await page.type('input[name=firstName]', nameObj.first);
  await page.type('input[name=lastName]', nameObj.last);
  await page.type('input[name=Username]', nameObj.first+id.split('-')[0]);
  await page.type('input[name=Passwd]', 'Abc123!!!');
  await page.type('input[name=ConfirmPasswd]', 'Abc123!!!');
  const [button] = await page.$x('//button[contains(., \'Next\')]');
  if (button) {
    await button.click();
  } else {
    console.log("button not found!");
  }
  await page.waitForNavigation();

  // await page.click('button[class="styles_container__1vHo2"]');

 // await browser.close();

}

// Temp email hack
(async () => {
  puppeteer.use(Stealth());

  for (let i = 0;i<500;i++) {
    try {
      const browser = await puppeteer.launch({headless: false, args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu"]});
        
      const [pager] = await browser.pages();
      let username = 'geonode_7Hbuw9KHL0-country-US-autoReplace-True';
      let password_node = 'fc96bf48-5382-4176-8e51-299191d4ff9d';
      let GEONODE_DNS = 'premium-residential.geonode.com';
      let GEONODE_PORT = 9010;
      var proxyUrl = "http://" + username + ":" + password_node + "@" + GEONODE_DNS + ":" + GEONODE_PORT;
    
      await pager.setDefaultNavigationTimeout(0);
  
    
      await pager.goto('https://temp-mail.org/en/');
      await timer(5000);
      const button = await pager.waitForSelector('button#click-to-copy:not([disabled])');
      await button.click();
      // paste from the clipboard
      let email = await ncp.paste();
      let password = 'Abc123!!!';
      var form_data = new FormData();
      form_data.append('email', email);
      form_data.append('password', password);
      console.log("Creating account with email: "+ email);
  
      var proxyAgent = new HttpsProxyAgent(proxyUrl);
      var config = {
        method: 'POST',
        agent: proxyAgent,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          'Origin': 'https://droppp.io',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
        },
        body : form_data
      };
      let url = "https://api.droppp.io/v1/user/add";
      let resp = await fetch(url, config);
      let respJSON = await resp.json();
      console.log(respJSON);
      console.log("Got account Access Token");
      let userAccessToken = respJSON.token.access_token;
  
      var proxyAgent = new HttpsProxyAgent(proxyUrl);
  
      var send_config = {
        method: 'POST',
        agent: proxyAgent,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Authorization": `Bearer ${userAccessToken}`,
          'Origin': 'https://droppp.io',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
        }
      };
      let sendUrl = "https://api.droppp.io/v1/user/email/verify/send";
      let sendResp = await fetch(sendUrl, send_config);
      let sendJSON = await sendResp.json();
      console.log("Sending Email Verification");
      let element = await pager.waitForXPath("//*[@class='inbox-dataList']/ul/li[2]/div/a", {timeout: 0});
      let link = await element.getProperty('href');
      await pager.goto(link._remoteObject.value);
      element = await pager.waitForXPath("//tbody/tr/td[2]/table/tbody/tr/td/table[2]/tbody/tr/td/table/tbody/tr/td", {timeout: 0});
      let code = await pager.evaluate(el => el.textContent, element);
      var form_data = new FormData();
      form_data.append('code', code);
      console.log("Got Verification Code: " + code);
  
      var proxyAgent = new HttpsProxyAgent(proxyUrl);
  
      var codeConfig = {
        method: 'POST',
        agent: proxyAgent,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Authorization": `Bearer ${userAccessToken}`,
          'Origin': 'https://droppp.io',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36'
        },
        body : form_data
      };
      let codeUrl = "https://api.droppp.io/v1/user/email/verify/set";
      let codeResp = await fetch(codeUrl, codeConfig);
      let codeJSON = await codeResp.json();
  
      console.log("EMAIL VERIFIED!");
      await browser.close();
      fs.appendFileSync('./emails.txt',  `${email}\r\n`);
      console.log(`Created Dropp Account! Email ${email} Password: ${password}`);
      await timer(60000);

    } catch {
      console.log("Account Failed...");
    }
  }

})();


// Another captcha test!
(async () => {
  await puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: '2captcha',
        token: '560bd7b49d7c0825d3440d33115fe1cc'
      },
      visualFeedback: true}),
    Stealth());

    const browser = await puppeteer.launch({headless: false});
    const [page] = await browser.pages();
    await page.setRequestInterception(true);
    page.on('request', async request => {
      console.log(request.url());
      console.log(request.method());
      console.log(request.headers());
      console.log(request.postData());
      console.log("------------------------");
      request.continue();
    });

    await page.goto("https://droppp.io/login/");
    // console.log("Looking for Captcha");
    // await page.waitForSelector('iframe[src*="recaptcha/"]', {timeout: 200000}); 
    // console.log("Found the Captcha");
    // await page.solveRecaptchas();
    // console.log("Solved Captcha");
});