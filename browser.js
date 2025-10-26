/**
 * Browser management module
 * Handles browser instance creation and page navigation
 */

const puppeteer = require('puppeteer');
const config = require('./config');

class Browser {
  constructor(customConfig = {}) {
    this.config = { ...config.browser, ...customConfig };
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser instance
   */
  async init() {
    try {
      this.browser = await puppeteer.launch(this.config);
      this.page = await this.browser.newPage();
      console.log('Browser initialized successfully');
      return this;
    } catch (error) {
      console.error('Error initializing browser:', error);
      throw error;
    }
  }

  /**
   * Navigate to a URL and wait for content to load
   * @param {string} url - Target URL
   * @param {number} waitTime - Time to wait for dynamic content (ms)
   */
  async navigateTo(url, waitTime = config.scraping.waitTime) {
    try {
      console.log(`Navigating to: ${url}`);
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // Wait for dynamic content to load
      console.log(`Waiting ${waitTime}ms for dynamic content...`);
      await this.page.waitForTimeout(waitTime);
      
      console.log('Page loaded successfully');
      return this;
    } catch (error) {
      console.error('Error navigating to URL:', error);
      throw error;
    }
  }

  /**
   * Capture full-page screenshot in base64 format
   * @returns {string} Base64 encoded PNG screenshot
   */
  async captureScreenshot() {
    try {
      console.log('Capturing full-page screenshot...');
      const screenshot = await this.page.screenshot(config.scraping.screenshot);
      console.log('Screenshot captured successfully');
      return screenshot;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  /**
   * Close browser instance
   */
  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log('Browser closed successfully');
      }
    } catch (error) {
      console.error('Error closing browser:', error);
      throw error;
    }
  }
}

module.exports = Browser;
