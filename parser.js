/**
 * Spatial parser module (Core)
 * Parses raw OCR data and extracts structured betting information
 * Maintains spatial order and relationships between data elements
 */

const config = require('./config');

class Parser {
  constructor(customConfig = {}) {
    this.config = { ...config.parser, ...customConfig };
  }

  /**
   * Parse raw OCR text into structured betting data
   * @param {Object} ocrData - Raw OCR data from DeepSeek
   * @returns {Array} Array of structured betting entries
   */
  parse(ocrData) {
    try {
      console.log('Starting spatial parsing of OCR data...');
      
      if (!ocrData || !ocrData.rawText) {
        throw new Error('Invalid OCR data provided');
      }

      const rawText = ocrData.rawText;
      const entries = this.extractBettingEntries(rawText);
      const structured = this.structureData(entries);

      console.log(`Parsed ${structured.length} betting entries successfully`);
      
      return {
        data: structured,
        metadata: {
          timestamp: ocrData.timestamp || new Date().toISOString(),
          totalEntries: structured.length,
          parseSuccess: true
        }
      };
    } catch (error) {
      console.error('Error parsing OCR data:', error);
      return {
        data: [],
        metadata: {
          timestamp: new Date().toISOString(),
          totalEntries: 0,
          parseSuccess: false,
          error: error.message
        }
      };
    }
  }

  /**
   * Extract betting entries from raw text
   * Preserves spatial order (top-to-bottom, left-to-right)
   * @param {string} rawText - Raw OCR text
   * @returns {Array} Array of text entries in spatial order
   */
  extractBettingEntries(rawText) {
    // Split by lines and filter empty lines
    const lines = rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return lines;
  }

  /**
   * Structure extracted data into betting format
   * @param {Array} entries - Array of text entries
   * @returns {Array} Structured betting data
   */
  structureData(entries) {
    const structured = [];
    // Fixed regex pattern to avoid ReDoS vulnerability
    // Limit digit repetitions to prevent backtracking attacks
    // Matches: decimal odds (1.50-999.99), fractional (1/2-99/99), American (+100 to +9999, -100 to -9999)
    const oddsPattern = /(?:\d{1,3}\.\d{1,2})|(?:\d{1,2}\/\d{1,2})|(?:\+\d{1,4})|(?:-\d{1,4})/g;
    const numericPattern = /\d/;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      // Look for odds patterns in the entry
      const oddsMatches = entry.match(oddsPattern);
      
      if (oddsMatches) {
        // This line likely contains betting odds
        const item = {
          position: i + 1,
          text: entry,
          odds: oddsMatches,
          type: this.detectBettingType(entry),
          rawLine: entry
        };

        // Try to extract team/market name (text before odds)
        const textBeforeOdds = entry.split(oddsPattern)[0];
        if (textBeforeOdds && textBeforeOdds.trim()) {
          item.team = textBeforeOdds.trim();
        }

        structured.push(item);
      } else if (entry.length > 3 && !numericPattern.test(entry.charAt(0))) {
        // This might be a team name or market without odds on the same line
        structured.push({
          position: i + 1,
          text: entry,
          team: entry,
          type: 'label',
          rawLine: entry
        });
      }
    }

    return structured;
  }

  /**
   * Detect the type of betting market
   * @param {string} text - Text to analyze
   * @returns {string} Betting type
   */
  detectBettingType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('moneyline') || lowerText.includes('winner')) {
      return 'moneyline';
    } else if (lowerText.includes('spread') || lowerText.includes('handicap')) {
      return 'spread';
    } else if (lowerText.includes('over') || lowerText.includes('under') || lowerText.includes('total')) {
      return 'total';
    } else if (lowerText.includes('prop')) {
      return 'proposition';
    }
    
    return 'general';
  }

  /**
   * Get detailed data in correct order
   * @param {Array} structuredData - Structured betting data
   * @returns {Array} Detailed ordered data
   */
  getDetailedOrderedData(structuredData) {
    // Data is already in spatial order from parsing
    return structuredData.map((item, index) => ({
      index: index + 1,
      position: item.position,
      team: item.team || 'N/A',
      odds: item.odds || [],
      market: item.type || 'unknown',
      text: item.text,
      timestamp: new Date().toISOString()
    }));
  }
}

module.exports = Parser;
