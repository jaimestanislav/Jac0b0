/**
 * Entry point for the sports betting odds scraper
 * Usage:
 *   const Scraper = require('./index');
 *   const scraper = new Scraper(apiKey);
 *   const results = await scraper.run(url);
 */

const Scraper = require('./scraper');
const config = require('./config');

// Export the main Scraper class
module.exports = Scraper;

// Also export individual modules for advanced usage
module.exports.Browser = require('./browser');
module.exports.DeepSeekOCR = require('./deepseek-ocr');
module.exports.Parser = require('./parser');
module.exports.config = config;

// Example usage function (can be called directly)
async function example() {
  // Get API key from environment variable
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('Error: DEEPSEEK_API_KEY environment variable is required');
    console.log('\nUsage:');
    console.log('  export DEEPSEEK_API_KEY="your-api-key"');
    console.log('  node index.js');
    process.exit(1);
  }

  // Get target URL from command line or use default
  const targetUrl = process.argv[2] || config.scraping.targetUrl;

  console.log('Sports Betting Odds Scraper');
  console.log('============================');
  console.log(`Target URL: ${targetUrl}`);
  console.log('');

  try {
    // Create and run scraper
    const scraper = new Scraper(apiKey);
    const results = await scraper.run(targetUrl);

    // Display results
    console.log('\n=== Results ===');
    console.log(JSON.stringify(results, null, 2));

    if (results.success) {
      console.log(`\nSuccessfully scraped ${results.summary.totalEntries} betting entries`);
    } else {
      console.error(`\nScraping failed: ${results.error}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run example if called directly
if (require.main === module) {
  example().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
