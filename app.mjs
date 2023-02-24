"use strict"

import puppeteer from "puppeteer";
import fetch from "node-fetch";

let isTwitterAuthenticated = false;
let isFacebookAuthenticated = false;
let browser = await puppeteer.launch({
  headless: false,
  slowMo: 20
});

const init = async () => {
  console.log("Initializing the page💡...");
  console.log("browser.isConnected()", !!browser?.isConnected())
  if (!browser?.isConnected()) {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 20
    });

    isTwitterAuthenticated = false; // To re-authenticate
  }

  const page = await browser.newPage();
  await (await page).setViewport({ width: 1560, height: 1000 });
  await (await page).setDefaultNavigationTimeout(15000);
  return page;
}

const getNewAyahByNumber = async (ayahNum) => {
  console.log("ayahNum: " + ayahNum);
  const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}`);
  const data = await res.json();

  const ayah = data.data.text.replace(/[\n\r]/g, ``);
  return {
    ayah,
    surahName: data.data.surah.name,
    ayahNumberInSurah: data.data.numberInSurah,
  }
};

const signInToUserFacebookAccount = async (page, gotoPage, userId) => {
  console.log("---------------------------------------");
  console.log("browser?.isConnected() && isAuthenticated: ", browser?.isConnected() && isFacebookAuthenticated);

  if (browser?.isConnected() && isFacebookAuthenticated) {
    return await page.goto(`https://www.facebook.com/RayyanX95`);
  }
  // Navigate to the Facebook login page
  await page.goto(`https://www.facebook.com`);

  // Enter login credentials and submit the form
  await page.type(`#email`, `ibrahim.alrayyan@gmail.com`);
  await page.type(`#pass`, `Facebook@2018`);
  await page.click(`button[type="submit"]`);

  // Wait for the Facebook homepage to load
  await page.waitForNavigation();

  // Navigate to the user`s timeline
  await page.goto(`https://www.facebook.com/RayyanX95`);

  // Sleep till the dark screen appears
  await new Promise(r => setTimeout(r, 4000));
  await page.keyboard.press("Escape");
  // Sleep till dark screen removed completely
  await new Promise(r => setTimeout(r, 1500));

  isFacebookAuthenticated = true;
}

const signInToUserTwitterAccount = async (page, gotoPage, userId) => {
  console.log("---------------------------------------");
  console.log("browser?.isConnected() && isAuthenticated: ", browser?.isConnected() && isTwitterAuthenticated);
  if (browser?.isConnected() && isTwitterAuthenticated) {
    return await page.goto(`https://twitter.com`);
  }
  // Navigate to the Facebook login page
  await page.goto(`https://twitter.com/i/flow/login`);

  //* Enter login credentials and submit the form
  await page.waitForSelector(`input[type="text"]`);
  await page.type(`input[type="text"]`, `RayyanX95`);
  await page.waitForSelector(`div[data-testid="apple_sign_in_button"] ~ div[role="button"]`);
  await page.click(`div[data-testid="apple_sign_in_button"] ~ div[role="button"]`);

  //* Sign in
  await page.waitForSelector(`input[name="password"]`);
  await page.type(`input[name="password"]`, `Twitter@2021`);
  await page.keyboard.press("Enter");

  //* Wait for the page to load
  await page.waitForNavigation();
  await page.keyboard.press("Escape");

  isTwitterAuthenticated = true; // To not authenticate again
}

const twitToTwitter = async (page) => {
  //* Get new Ayah
  const ayahNum = Math.floor(Math.random() * (6236 - 2 + 1)) + 2;
  const { ayah, surahName, ayahNumberInSurah } = await getNewAyahByNumber(ayahNum);
  console.log(surahName, ayahNumberInSurah);

  const twit = `{${ayah}}
  [${surahName}: ${ayahNumberInSurah}]
  
  Posted by Nur-Bot💡`;

  //* Type the post message and submit the post
  await page.waitForSelector(`div[role="textbox"]`);
  await page.type(`div[role="textbox"]`, twit);
  //TODO: Remove this sleep
  await new Promise(r => setTimeout(r, 3000));
  await page.click(`[data-testid="tweetButtonInline"]`);
  console.log("Twitted Successfully 💡");

  // await new Promise(r => setTimeout(r, 15000));
  // page.close();
};

const postToFacebook = async (page) => {
  //* Click to add new post
  await page.waitForSelector(`div[role="button"] > div > span`);
  await page.click(`div[role="button"] > div > span`);

  //* Get new Ayah
  const ayahNum = Math.floor(Math.random() * (6236 - 2 + 1)) + 2;
  const { ayah, surahName, ayahNumberInSurah } = await getNewAyahByNumber(ayahNum);
  console.log(surahName, ayahNumberInSurah);
  const post = `{${ayah}}
  [${surahName}: ${ayahNumberInSurah}]

  Posted by Nur-Bot💡`;

  //* Type the post message and submit the post
  await page.waitForSelector(`form[method="POST"] div[role="textbox"]`);
  await page.type(`form[method="POST"] div[role="textbox"]`, post);
  //TODO: Remove this sleep
  await new Promise(r => setTimeout(r, 3000));
  await page.click(`div[aria-label="Post"]`);
  console.log("Posted Successfully 💡");

  await new Promise(r => setTimeout(r, 15000));
  page.close();
}

const postOperations = async () => {
  const page = await init();
  await signInToUserTwitterAccount(page);
  await twitToTwitter(page);

  // ----------------------------------
  console.log(`\nMoving to Facebook in 7 seconds...\n`);
  await new Promise(r => setTimeout(r, 7000));

  await signInToUserFacebookAccount(page);
  await postToFacebook(page);

  // await browser.close();
};
postOperations();

const startInterval = () => {
  setInterval(() => {

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const times = [
      { hour: 5, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 15, minute: 0 },
      { hour: 20, minute: 0 },
      { hour: 23, minute: 0 },
      { hour: 2, minute: 0 },
    ];

    console.log(`Checking...🔎 ${hours}:${minutes}\n`);
    times.some((time) => {
      if (hours === time.hour && minutes === time.minute) {
    console.log(`Matched time⏲️ ${hours}:${minutes}\n`);

        postOperations();
        return true; // stop iterating
      }
      return false;
    });
  }, 60000); // check every minute
};

startInterval();