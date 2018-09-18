
var webdriver = require('selenium-webdriver');
var By = webdriver.By;
var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

driver.get('index.html');

driver.findElement(By.id('auth-signin-button')).click();