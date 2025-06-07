const { Builder, By, Key, until } = require('selenium-webdriver');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {

  applyGreenhouseJob(JSON.parse(req?.query?.data),JSON.parse(req?.query?.jobs));
 
  res.send('Please wait we are redirecting!');

});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



async function applyGreenhouseJob(posteddata,jobsdata) {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    await driver.get(jobsdata?.applicationLink); // Replace with real URL

    await driver.sleep(3000); // Wait for page to load

    // Fill in form fields
    await driver.findElement(By.id('first_name')).sendKeys(posteddata?.name);
    await driver.findElement(By.id('last_name')).sendKeys(posteddata?.lname);
    await driver.findElement(By.id('email')).sendKeys(posteddata?.email);
    await driver.findElement(By.id('phone')).sendKeys(posteddata?.phone);
    await driver.findElement(By.id('candidate-location')).sendKeys(posteddata?.location);

    await driver.sleep(4000);
    // Education - if present
    const school = await driver.findElements(By.id('school--0'));
    if (school.length > 0) {
      await school[0].sendKeys(posteddata?.school);
    }
    const degree = await driver.findElements(By.id('degree--0'));
    if (degree.length > 0) {
      await degree[0].sendKeys(posteddata?.degree);
    }

    // Fill LinkedIn URL (optional)
    const linkedin = await driver.findElements(By.id('question_50560353'));
    if (linkedin.length > 0) {
      await linkedin[0].sendKeys(posteddata?.linkedin);
    }

    // Demographics - send exact text values shown in dropdown
    const gender = await driver.findElements(By.id('864'));
    if (gender.length > 0) await gender[0].sendKeys(posteddata?.gender);

    const hispanic = await driver.findElements(By.id('1332'));
    if (hispanic.length > 0) await hispanic[0].sendKeys(posteddata?.hispanic);

    const race = await driver.findElements(By.id('1333'));
    if (race.length > 0) await race[0].sendKeys(posteddata?.race);

    const veteran = await driver.findElements(By.id('1336'));
    if (veteran.length > 0) await veteran[0].sendKeys(posteddata?.veteran);

    const disability = await driver.findElements(By.id('1337'));
    if (disability.length > 0) await disability[0].sendKeys(posteddata?.disability);

    // Upload resume
    const resumePath = path.resolve(__dirname, 'resume.pdf');
    await driver.findElement(By.id('resume')).sendKeys(resumePath);

    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await driver.quit(); // Uncomment when needed
  }
}
