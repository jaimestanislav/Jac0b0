/**
 * Main scraper module
 * Orchestrates the complete scraping workflow:
 * 1. Initialize Browser and DeepSeekOCR
 * 2. Navigate to target URL
 * 3. Wait 3 seconds for dynamic content
 * 4. Capture full-page screenshot
 * 5. Process with DeepSeek OCR
 * 6. Parse spatial data with parser.js
 */

const Browser = require('./browser');
const DeepSeekOCR = require('./deepseek-ocr');
const Parser = require('./parser');
const config = require('./config');

class Scraper {
  constructor(apiKey, customConfig = {}) {
    this.apiKey = apiKey;
    this.customConfig = customConfig;
    this.browser = null;
    this.ocr = null;
    this.parser = null;
  }

  /**
   * Initialize all components
   */
  async init() {
    try {
      console.log('=== Initializing Scraper ===');
      
      // Step 1: Initialize Browser and DeepSeekOCR with config
      console.log('Step 1: Initializing Browser and DeepSeekOCR...');
      this.browser = new Browser(this.customConfig.browser || {});
      await this.browser.init();
      
      this.ocr = new DeepSeekOCR(this.apiKey, this.customConfig.deepseek || {});
      this.parser = new Parser(this.customConfig.parser || {});
      
      console.log('All components initialized successfully');
      return this;
    } catch (error) {
      console.error('Error initializing scraper:', error);
      throw error;
    }
  }

  /**
   * Execute complete scraping workflow
   * @param {string} url - Target URL to scrape
   * @returns {Object} Complete scraping results with parsed data
   */
  async scrape(url) {
    try {
      console.log('\n=== Starting Scraping Workflow ===');
      const targetUrl = url || config.scraping.targetUrl;

      // Step 2: Navigate to target URL
      console.log('\nStep 2: Navigating to target URL...');
      await this.browser.navigateTo(targetUrl);

      // Step 3: Wait 3 seconds for dynamic JavaScript content to load
      console.log('\nStep 3: Dynamic content already loaded (wait handled in navigation)');

      // Step 4: Capture full-page screenshot in PNG base64
      console.log('\nStep 4: Capturing full-page screenshot...');
      const screenshot = await this.browser.captureScreenshot();

      // Step 5: Process with DeepSeek OCR
      console.log('\nStep 5: Processing screenshot with DeepSeek OCR...');
      const ocrData = await this.ocr.extractBettingData(screenshot);

      // Step 6: Parse spatial data (Core - parser.js)
      console.log('\nStep 6: Parsing spatial data with parser.js (Core)...');
      const parsedData = this.parser.parse(ocrData);

      // Get detailed ordered data
      const detailedData = this.parser.getDetailedOrderedData(parsedData.data);

      console.log('\n=== Scraping Workflow Completed ===');
      
      return {
        success: true,
        url: targetUrl,
        timestamp: new Date().toISOString(),
        ocrData: {
          rawText: ocrData.rawText,
          success: ocrData.success
        },
        parsedData: {
          entries: parsedData.data,
          metadata: parsedData.metadata
        },
        detailedOrderedData: detailedData,
        summary: {
          totalEntries: detailedData.length,
          scrapedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error during scraping workflow:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clean up and close browser
   */
  async cleanup() {
    try {
      console.log('\nCleaning up resources...');
      if (this.browser) {
        await this.browser.close();
      }
      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
      throw error;
    }
  }

  /**
   * Execute complete scraping process with cleanup
   * @param {string} url - Target URL
   * @returns {Object} Scraping results
   */
  async run(url) {
    try {
      await this.init();
      const results = await this.scrape(url);
      await this.cleanup();
      return results;
    } catch (error) {
      await this.cleanup();
      throw error;
    }
  }
}

module.exports = Scraper;
