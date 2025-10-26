/**
 * DeepSeek OCR integration module
 * Handles OCR processing using DeepSeek API
 */

const config = require('./config');

class DeepSeekOCR {
  constructor(apiKey, customConfig = {}) {
    if (!apiKey) {
      throw new Error('DeepSeek API key is required');
    }
    this.apiKey = apiKey;
    this.config = { ...config.deepseek, ...customConfig };
  }

  /**
   * Process screenshot with DeepSeek OCR
   * @param {string} base64Image - Base64 encoded image
   * @returns {Object} OCR results with extracted text and spatial data
   */
  async processImage(base64Image) {
    try {
      console.log('Processing image with DeepSeek OCR...');
      
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all visible text from this image, including sports betting odds, team names, and any numerical values. Preserve the spatial layout and order of the text as it appears in the image. Return the data in a structured format with position information (top to bottom, left to right).'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/png;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const ocrText = data.choices[0].message.content;
      
      console.log('OCR processing completed successfully');
      
      return {
        rawText: ocrText,
        timestamp: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      console.error('Error processing image with DeepSeek OCR:', error);
      return {
        rawText: '',
        timestamp: new Date().toISOString(),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract sports betting data from OCR text
   * @param {string} base64Image - Base64 encoded image
   * @returns {Object} Structured betting data
   */
  async extractBettingData(base64Image) {
    const ocrResult = await this.processImage(base64Image);
    
    if (!ocrResult.success) {
      throw new Error(`OCR failed: ${ocrResult.error}`);
    }

    return ocrResult;
  }
}

module.exports = DeepSeekOCR;
