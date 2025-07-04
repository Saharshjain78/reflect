import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../services/logger.js';
import { auditLog } from '../services/audit.js';
import { encryptionService } from '../services/encryption.js';
import { ownershipMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mock journal database - replace with actual database
const journalEntries = new Map();

// Validation rules
const entryValidation = [
  body('title').optional().isLength({ max: 200 }).trim(),
  body('content').isLength({ min: 1, max: 10000 }).trim(),
  body('mood').optional().isIn(['very_negative', 'negative', 'neutral', 'positive', 'very_positive']),
  body('tags').optional().isArray({ max: 10 })
];

// Get all journal entries for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Filter entries by user and decrypt content
    const userEntries = Array.from(journalEntries.values())
      .filter(entry => entry.userId === userId)
      .map(entry => ({
        ...entry,
        content: encryptionService.decrypt(entry.encryptedContent),
        title: entry.encryptedTitle ? encryptionService.decrypt(entry.encryptedTitle) : entry.title
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    auditLog('JOURNAL_LIST_ACCESS', {
      userId,
      ip: req.ip,
      entriesCount: userEntries.length
    });
    
    res.json({
      entries: userEntries,
      total: userEntries.length
    });
    
  } catch (error) {
    logger.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific journal entry
router.get('/:id', ownershipMiddleware(), async (req, res) => {
  try {
    const entryId = req.params.id;
    const entry = journalEntries.get(entryId);
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Decrypt content before sending
    const decryptedEntry = {
      ...entry,
      content: encryptionService.decrypt(entry.encryptedContent),
      title: entry.encryptedTitle ? encryptionService.decrypt(entry.encryptedTitle) : entry.title
    };
    
    auditLog('JOURNAL_ENTRY_ACCESS', {
      userId: req.user.userId,
      entryId,
      ip: req.ip
    });
    
    res.json({ entry: decryptedEntry });
    
  } catch (error) {
    logger.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new journal entry
router.post('/', entryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { title, content, mood, tags } = req.body;
    const userId = req.user.userId;
    
    // Generate entry ID
    const entryId = encryptionService.generateSecureToken();
    
    // Encrypt sensitive content
    const encryptedContent = encryptionService.encrypt(content);
    const encryptedTitle = title ? encryptionService.encrypt(title) : null;
    
    const entry = {
      id: entryId,
      userId,
      title: title || '',
      encryptedTitle,
      encryptedContent,
      mood: mood || 'neutral',
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    journalEntries.set(entryId, entry);
    
    auditLog('JOURNAL_ENTRY_CREATED', {
      userId,
      entryId,
      ip: req.ip,
      contentLength: content.length
    });
    
    // Return decrypted entry
    res.status(201).json({
      message: 'Entry created successfully',
      entry: {
        ...entry,
        content,
        title: title || ''
      }
    });
    
  } catch (error) {
    logger.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a journal entry
router.put('/:id', ownershipMiddleware(), entryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const entryId = req.params.id;
    const { title, content, mood, tags } = req.body;
    
    const entry = journalEntries.get(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    // Encrypt updated content
    const encryptedContent = encryptionService.encrypt(content);
    const encryptedTitle = title ? encryptionService.encrypt(title) : null;
    
    const updatedEntry = {
      ...entry,
      title: title || '',
      encryptedTitle,
      encryptedContent,
      mood: mood || entry.mood,
      tags: tags || entry.tags,
      updatedAt: new Date().toISOString()
    };
    
    journalEntries.set(entryId, updatedEntry);
    
    auditLog('JOURNAL_ENTRY_UPDATED', {
      userId: req.user.userId,
      entryId,
      ip: req.ip,
      contentLength: content.length
    });
    
    // Return decrypted entry
    res.json({
      message: 'Entry updated successfully',
      entry: {
        ...updatedEntry,
        content,
        title: title || ''
      }
    });
    
  } catch (error) {
    logger.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a journal entry
router.delete('/:id', ownershipMiddleware(), async (req, res) => {
  try {
    const entryId = req.params.id;
    
    const entry = journalEntries.get(entryId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    journalEntries.delete(entryId);
    
    auditLog('JOURNAL_ENTRY_DELETED', {
      userId: req.user.userId,
      entryId,
      ip: req.ip
    });
    
    res.json({ message: 'Entry deleted successfully' });
    
  } catch (error) {
    logger.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;