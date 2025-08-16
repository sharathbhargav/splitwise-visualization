import { Request, Response } from 'express';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { Transaction, PersonShare } from '../types/Transaction';

class UploadController {
  constructor() {
    this.handleUpload = this.handleUpload.bind(this);
  }
  /**
   * Handles the CSV file upload and parsing
   * Stores the parsed data in the session
   */
  async handleUpload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const results: Transaction[] = [];
      const fileBuffer = req.file.buffer;
      const stream = Readable.from(fileBuffer);

      // Create a promise to handle the stream processing
      const parsePromise = new Promise<void>((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (row: any) => {
            // Skip empty rows
            if (!row.Date || !row.Description) return;

            // Extract person shares (columns after Currency)
            const shares: PersonShare[] = [];
            const knownFields = ['Date', 'Description', 'Category', 'Cost', 'Currency'];
            
            Object.entries(row).forEach(([key, value]) => {
              if (!knownFields.includes(key) && key.trim()) {
                const amount = parseFloat(value as string);
                if (!isNaN(amount)) {
                  shares.push({
                    name: key,
                    amount: amount
                  });
                }
              }
            });

            // Create transaction object
            const transaction: Transaction = {
              date: row.Date,
              description: row.Description,
              category: row.Category,
              cost: parseFloat(row.Cost),
              currency: row.Currency,
              shares
            };

            results.push(transaction);
          })
          .on('end', () => resolve())
          .on('error', (error) => reject(error));
      });

      // Wait for parsing to complete
      await parsePromise;

      // Store results in session
      req.session.data = {
        transactions: results,
        storeMappings: {}
      };

      // Return success response with summary
      res.json({
        message: 'File uploaded and parsed successfully',
        summary: {
          totalTransactions: results.length,
          dateRange: {
            start: results[0]?.date,
            end: results[results.length - 1]?.date
          },
          people: [...new Set(results.flatMap(t => t.shares.map(s => s.name)))],
          categories: [...new Set(results.map(t => t.category))]
        }
      });

    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ error: 'Error processing file' });
    }
  }
}

export const uploadController = new UploadController();