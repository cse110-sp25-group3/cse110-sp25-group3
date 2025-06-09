/**
 * @jest-environment node
 */
const { Builder, By, until } = require('selenium-webdriver');

jest.setTimeout(30000);

describe("Feed UI flows (Selenium)", () => {
  let driver, mainHandle;

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:5500/source/pages/feed/feed.html');

    // Remember our main window handle
    mainHandle = (await driver.getAllWindowHandles())[0];

    // Wait for the SPA shell (#content) then job cards container
    await driver.wait(until.elementLocated(By.id('content')), 10000);
    await driver.wait(until.elementLocated(By.id('job-cards-container')), 10000);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  test("flip card on click (front → back)", async () => {
    const card = await driver.findElement(
      By.xpath("//div[contains(@class,'job-card') and contains(@class,'active')]")
    );
    await card.click();
    // wait for flipped class
    await driver.wait(async () => {
      const cls = await card.getAttribute('class');
      return cls.split(' ').includes('flipped');
    }, 2000);
  });

  test("skip button advances to next card", async () => {
    const card = await driver.findElement(
      By.xpath("//div[contains(@class,'job-card') and contains(@class,'active')]")
    );
    const firstIdx = Number(await card.getAttribute('data-index'));

    const skipBtn = await card.findElement(By.className('skip-button'));
    await skipBtn.click();
    await driver.sleep(600);

    const newCard = await driver.findElement(
      By.xpath("//div[contains(@class,'job-card') and contains(@class,'active')]")
    );
    const newIdx = Number(await newCard.getAttribute('data-index'));
    expect(newIdx).toBeGreaterThan(firstIdx);
  });

  test("reaching end shows 'No more jobs!'", async () => {
    // ensure we’re in main window
    await driver.switchTo().window(mainHandle);

    // skip until no skip button
    let skips;
    do {
      skips = await driver.findElements(By.className('skip-button'));
      if (skips.length) {
        await skips[0].click();
        await driver.sleep(600);
      }
    } while (skips.length);

    // assert the end-message <h3>
    const h3 = await driver
      .findElement(By.className('end-message'))
      .findElement(By.tagName('h3'));
    expect(await h3.getText()).toBe("No more jobs!");
  });
});
