# Jac0b0 - Sports Betting Odds Scraper

A modular Node.js project for scraping sports betting odds using DeepSeek OCR.

## Overview

This project implements a complete workflow for scraping and parsing sports betting odds from websites using browser automation and AI-powered OCR.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         index.js                             │
│                    (Entry Point / Exports)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       scraper.js                             │
│                   (Main Orchestrator)                        │
└─────────────────────────────────────────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────────┐    ┌──────────┐
    │browser.js│      │deepseek-ocr.js│    │parser.js │
    │(Puppeteer│      │  (OCR API)   │    │ (Core)   │
    │  Manager)│      │              │    │ Spatial  │
    └──────────┘      └──────────────┘    │ Parsing  │
                                           └──────────┘
                              │
                              ▼
                       ┌──────────┐
                       │config.js │
                       │(Settings)│
                       └──────────┘
```

### Core Modules

1. **browser.js** - Browser management
   - Initializes Puppeteer browser instance
   - Handles page navigation
   - Captures full-page screenshots

2. **deepseek-ocr.js** - OCR integration
   - Processes screenshots using DeepSeek API
   - Extracts text with spatial information
   - Returns structured OCR data

3. **parser.js** - Spatial parsing (Core)
   - Parses raw OCR data
   - Maintains spatial order (top-to-bottom, left-to-right)
   - Structures betting information
   - Detects betting types and odds formats

4. **scraper.js** - Main orchestrator
   - Coordinates the complete workflow
   - Manages component lifecycle
   - Returns structured results

5. **config.js** - Configuration
   - Browser settings
   - Scraping parameters
   - DeepSeek API configuration
   - Parser options

6. **index.js** - Entry point
   - Exports main Scraper class
   - Provides CLI interface

## Execution Flow

1. **Initialize** Browser and DeepSeekOCR with config
2. **Navigate** to target URL
3. **Wait** 3 seconds for dynamic JavaScript content to load
4. **Capture** full-page screenshot in PNG base64 format
5. **Process** screenshot with DeepSeek OCR
6. **Parse** spatial data with parser.js to get detailed data in correct order

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Set your DeepSeek API key as an environment variable:

```bash
export DEEPSEEK_API_KEY="your-api-key-here"
```

## Usage

### Command Line

```bash
# Scrape default URL
npm start

# Scrape specific URL
node index.js https://example.com/sports-betting
```

### Programmatic Usage

```javascript
const Scraper = require('./index');

async function scrapeOdds() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const scraper = new Scraper(apiKey);
  
  const results = await scraper.run('https://example.com/sports-betting');
  
  console.log(results.detailedOrderedData);
}

scrapeOdds();
```

### Advanced Usage

```javascript
const { Browser, DeepSeekOCR, Parser } = require('./index');

async function customWorkflow() {
  // Use individual modules for custom workflows
  const browser = new Browser();
  await browser.init();
  await browser.navigateTo('https://example.com');
  
  const screenshot = await browser.captureScreenshot();
  
  const ocr = new DeepSeekOCR(apiKey);
  const ocrData = await ocr.extractBettingData(screenshot);
  
  const parser = new Parser();
  const parsed = parser.parse(ocrData);
  
  await browser.close();
  
  return parsed;
}
```

## Output Format

The scraper returns structured data with the following format:

```javascript
{
  success: true,
  url: "https://example.com",
  timestamp: "2024-10-26T03:10:47.526Z",
  ocrData: {
    rawText: "...",
    success: true
  },
  parsedData: {
    entries: [...],
    metadata: {
      timestamp: "...",
      totalEntries: 10,
      parseSuccess: true
    }
  },
  detailedOrderedData: [
    {
      index: 1,
      position: 1,
      team: "Team A",
      odds: ["1.85"],
      market: "moneyline",
      text: "Team A 1.85",
      timestamp: "..."
    },
    // ... more entries
  ],
  summary: {
    totalEntries: 10,
    scrapedAt: "..."
  }
}
```

## Module Details

### Browser Module

Manages Puppeteer browser instances with configurable options for headless operation, viewport size, and browser arguments.

### DeepSeek OCR Module

Integrates with DeepSeek API to process screenshots and extract text with spatial positioning information.

### Parser Module (Core)

The core spatial parsing component that:
- Extracts betting entries from raw OCR text
- Preserves spatial order
- Detects betting types (moneyline, spread, total, proposition)
- Structures data with team names, odds, and markets
- Provides detailed ordered data output

### Scraper Module

Orchestrates the complete workflow and provides a simple interface for the entire scraping process.

## Requirements

- Node.js >= 18.0.0
- DeepSeek API key
- Internet connection for browser automation and API calls

## License

ISC

