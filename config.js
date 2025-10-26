/**
 * Configuration module for the sports betting scraper
 */

module.exports = {
  // Browser configuration
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  },

  // Scraping configuration
  scraping: {
    // Wait time for dynamic content to load (in milliseconds)
    waitTime: 3000,
    // Target URL - can be overridden when calling the scraper
    targetUrl: 'https://example.com',
    // Screenshot options
    screenshot: {
      type: 'png',
      fullPage: true,
      encoding: 'base64'
    }
  },

  // DeepSeek OCR configuration
  deepseek: {
    // API endpoint for DeepSeek OCR
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    // Model to use
    model: 'deepseek-chat',
    // Max tokens for response
    maxTokens: 4000,
    // Temperature for OCR processing
    temperature: 0.1
  },

  // Parser configuration
  parser: {
    // Expected data structure for sports betting odds
    fields: [
      'team',
      'odds',
      'market',
      'timestamp'
    ]
  }
};
