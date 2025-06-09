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

    await driver.sleep(5000); // Wait for page to load

    // Fill in form fields
    await driver.findElement(By.id('first_name')).sendKeys(posteddata?.name);
    await driver.findElement(By.id('last_name')).sendKeys(posteddata?.lname);
    await driver.findElement(By.id('email')).sendKeys(posteddata?.email);
    await driver.findElement(By.id('phone')).sendKeys(posteddata?.phone);
  
  await driver.sleep(4000);
	const dropdownlc = await driver.findElement(By.id('candidate-location')); // The placeholder div
	await dropdownlc.click(); // Open dropdown
	await driver.sleep(2000); // Small delay
	const inputtlc = await driver.switchTo().activeElement(); // Focus on input
	await inputtlc.sendKeys(posteddata?.location); // Type the text
	await driver.sleep(1000); // Allow suggestions to appear
    await inputtlc.sendKeys(Key.ENTER); // Select the first option
	await driver.sleep(1000); // Wait for page to load
	
  

    // Fill LinkedIn URL (optional)
    const linkedin = await driver.findElements(By.id('question_50560353'));
    if (linkedin.length > 0) {
      await linkedin[0].sendKeys(posteddata?.linkedin);
    }
 
   // Upload resume
    /*const resumePath = path.resolve(__dirname, './resume.pdf');
    await driver.findElement(By.id('resume')).sendKeys(resumePath);*/

      // Education - if present
    /* const school = await driver.findElements(By.id('school--0'));
    if (school.length > 0) {
      await school[0].sendKeys(posteddata?.school);
    }
    const degree = await driver.findElements(By.id('degree--0'));
    if (degree.length > 0) {
      await degree[0].sendKeys(posteddata?.degree);
    }
    */

  await driver.sleep(7000);

  const dropdowntg = await driver.findElement(By.id('864')); // The placeholder div
	await dropdowntg.click(); // Open dropdown
	await driver.sleep(1500); // Small delay
	const inputtwt = await driver.switchTo().activeElement(); // Focus on input
	await inputtwt.sendKeys(posteddata?.gender); // Type the text
	await driver.sleep(1000); // Allow suggestions to appear
  await inputtwt.sendKeys(Key.ENTER); // Select the first option
	await driver.sleep(1000); // Wait for page to load
	
	
	const dropdowntw = await driver.findElement(By.id('1332')); // The placeholder div
	await dropdowntw.click(); // Open dropdown
	await driver.sleep(1500); // Small delay
	const inputtw = await driver.switchTo().activeElement(); // Focus on input
	await inputtw.sendKeys(posteddata?.hispanic); // Type the text
	await driver.sleep(1500); // Allow suggestions to appear
    await inputtw.sendKeys(Key.ENTER); // Select the first option
	await driver.sleep(1500); // Wait for page to load
	
	const dropdownt = await driver.findElement(By.id('1333')); // The placeholder div
	await dropdownt.click(); // Open dropdown
	await driver.sleep(1500); // Small delay
	const inputt = await driver.switchTo().activeElement(); // Focus on input
	await inputt.sendKeys(posteddata?.race); // Type the text
	await driver.sleep(1500); // Allow suggestions to appear
    await inputt.sendKeys(Key.ENTER); // Select the first option
	await driver.sleep(1500); // Wait for page to load

	
	const dropdowns = await driver.findElement(By.id('1336')); // The placeholder div
	await dropdowns.click(); // Open dropdown
	await driver.sleep(1500); // Small delay
	const inputs = await driver.switchTo().activeElement(); // Focus on input
	await inputs.sendKeys(posteddata?.veteran); // Type the text
	await driver.sleep(1500); // Allow suggestions to appear
    await inputs.sendKeys(Key.ENTER); // Select the first option
	await driver.sleep(1000); // Wait for page to load

    const dropdown = await driver.findElement(By.id('1337')); // The placeholder div
	await dropdown.click(); // Open dropdown
	await driver.sleep(1500); // Small delay
	const input = await driver.switchTo().activeElement(); // Focus on input
	await input.sendKeys(posteddata?.disability); // Type the text
	await driver.sleep(1500); // Allow suggestions to appear
    await input.sendKeys(Key.ENTER); // Select the first option
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // await driver.quit(); // Uncomment when needed
  }
}
