import { JournalEntry, Media } from '../types';
import { generateId } from '../utils/helpers';
import { auth } from './authService';

// Secure journal service with user isolation
const ENTRIES_KEY_PREFIX = 'journal_entries_';
const MEDIA_KEY_PREFIX = 'journal_media_';

class SecureJournalService {
  // Get user-specific storage key
  private getUserEntriesKey(userId: string): string {
    return `${ENTRIES_KEY_PREFIX}${userId}`;
  }

  private getUserMediaKey(userId: string): string {
    return `${MEDIA_KEY_PREFIX}${userId}`;
  }

  // Validate user session and get current user
  private async getCurrentUser() {
    const user = await auth.getCurrentUser();
    if (!user) {
      throw new Error('Authentication required. Please login to access your journal.');
    }
    return user;
  }

  // Get entries from user-specific storage
  private getEntriesFromStorage(userId: string): JournalEntry[] {
    const key = this.getUserEntriesKey(userId);
    const entries = localStorage.getItem(key);
    return entries ? JSON.parse(entries) : [];
  }

  // Save entries to user-specific storage
  private saveEntriesToStorage(userId: string, entries: JournalEntry[]): void {
    const key = this.getUserEntriesKey(userId);
    localStorage.setItem(key, JSON.stringify(entries));
  }

  // Get media from user-specific storage
  private getMediaFromStorage(userId: string): Media[] {
    const key = this.getUserMediaKey(userId);
    const media = localStorage.getItem(key);
    return media ? JSON.parse(media) : [];
  }

  // Save media to user-specific storage
  private saveMediaToStorage(userId: string, media: Media[]): void {
    const key = this.getUserMediaKey(userId);
    localStorage.setItem(key, JSON.stringify(media));
  }

  // Validate entry ownership
  private validateEntryOwnership(entry: JournalEntry, userId: string): void {
    if (entry.userId !== userId) {
      this.logSecurityViolation('UNAUTHORIZED_ENTRY_ACCESS', {
        entryId: entry.id,
        entryOwner: entry.userId,
        requestingUser: userId
      });
      throw new Error('Access denied. You do not have permission to access this entry.');
    }
  }

  // Get all entries for authenticated user
  getEntries = async (): Promise<JournalEntry[]> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const entries = this.getEntriesFromStorage(user.id);
    
    this.logSecurityEvent('ENTRIES_ACCESSED', {
      userId: user.id,
      entryCount: entries.length
    });
    
    return entries;
  };

  // Get a single entry with ownership validation
  getEntry = async (id: string): Promise<JournalEntry> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const entries = this.getEntriesFromStorage(user.id);
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      this.logSecurityEvent('ENTRY_NOT_FOUND', {
        userId: user.id,
        requestedEntryId: id
      });
      throw new Error('Entry not found');
    }
    
    // Validate ownership
    this.validateEntryOwnership(entry, user.id);
    
    this.logSecurityEvent('ENTRY_ACCESSED', {
      userId: user.id,
      entryId: id
    });
    
    return entry;
  };

  // Create a new entry with user association
  createEntry = async (entryData: Partial<JournalEntry>): Promise<JournalEntry> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const entries = this.getEntriesFromStorage(user.id);
    const now = new Date().toISOString();
    
    const newEntry: JournalEntry = {
      id: generateId(),
      userId: user.id, // Ensure entry is associated with current user
      createdAt: now,
      updatedAt: now,
      steps: entryData.steps || {
        step1: '',
        step2: '',
        step3: '',
        step4: '',
        step5: '',
        step6: '',
        step7: ''
      },
      sentiment: entryData.sentiment,
      isSync: true
    };
    
    // Add to beginning of array (newest first)
    const updatedEntries = [newEntry, ...entries];
    this.saveEntriesToStorage(user.id, updatedEntries);
    
    this.logSecurityEvent('ENTRY_CREATED', {
      userId: user.id,
      entryId: newEntry.id
    });
    
    return newEntry;
  };

  // Update an existing entry with ownership validation
  updateEntry = async (id: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const entries = this.getEntriesFromStorage(user.id);
    const entryIndex = entries.findIndex(e => e.id === id);
    
    if (entryIndex === -1) {
      this.logSecurityEvent('ENTRY_UPDATE_FAILED', {
        userId: user.id,
        entryId: id,
        reason: 'Entry not found'
      });
      throw new Error('Entry not found');
    }
    
    const existingEntry = entries[entryIndex];
    
    // Validate ownership
    this.validateEntryOwnership(existingEntry, user.id);
    
    const updatedEntry = {
      ...existingEntry,
      ...entryData,
      steps: {
        ...existingEntry.steps,
        ...(entryData.steps || {})
      },
      updatedAt: new Date().toISOString(),
      userId: user.id, // Ensure user ID cannot be changed
      isSync: true
    };
    
    entries[entryIndex] = updatedEntry;
    this.saveEntriesToStorage(user.id, entries);
    
    this.logSecurityEvent('ENTRY_UPDATED', {
      userId: user.id,
      entryId: id
    });
    
    return updatedEntry;
  };

  // Delete an entry with ownership validation
  deleteEntry = async (id: string): Promise<void> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const entries = this.getEntriesFromStorage(user.id);
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      this.logSecurityEvent('ENTRY_DELETE_FAILED', {
        userId: user.id,
        entryId: id,
        reason: 'Entry not found'
      });
      throw new Error('Entry not found');
    }
    
    // Validate ownership
    this.validateEntryOwnership(entry, user.id);
    
    const filteredEntries = entries.filter(entry => entry.id !== id);
    this.saveEntriesToStorage(user.id, filteredEntries);
    
    // Also delete associated media
    const media = this.getMediaFromStorage(user.id);
    const filteredMedia = media.filter(item => item.entryId !== id);
    this.saveMediaToStorage(user.id, filteredMedia);
    
    this.logSecurityEvent('ENTRY_DELETED', {
      userId: user.id,
      entryId: id
    });
  };

  // Analyze sentiment (unchanged but with user validation)
  analyzeSentiment = async (text: string): Promise<JournalEntry['sentiment']> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call to sentiment analysis service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock sentiment analysis
    const wordCount = text.split(/\s+/).length;
    const positiveWords = ['good', 'great', 'happy', 'excited', 'joy', 'love', 'grateful', 'thankful', 'positive'];
    const negativeWords = ['bad', 'sad', 'angry', 'upset', 'disappointed', 'worried', 'stressed', 'negative', 'tired'];
    
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Count positive and negative words
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) score -= matches.length;
    });
    
    // Normalize score to range between -1 and 1
    const normalizedScore = wordCount > 0 ? score / (wordCount * 0.3) : 0;
    const clampedScore = Math.max(-1, Math.min(1, normalizedScore));
    
    // Determine label based on score
    let label: 'Negative' | 'Neutral' | 'Positive';
    if (clampedScore < -0.1) label = 'Negative';
    else if (clampedScore > 0.1) label = 'Positive';
    else label = 'Neutral';
    
    this.logSecurityEvent('SENTIMENT_ANALYZED', {
      userId: user.id,
      textLength: text.length,
      sentiment: label
    });
    
    return { score: clampedScore, label };
  };

  // Upload media with user validation and ownership
  uploadMedia = async (entryId: string, file: File): Promise<Media> => {
    const user = await this.getCurrentUser();
    
    // Validate that the entry belongs to the user
    const entry = await this.getEntry(entryId); // This will validate ownership
    
    // Simulate API call with delay
    const delayMs = Math.min(2000, 800 + (file.size / (1024 * 1024)) * 10);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // File validation
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isImage && !isVideo && !isAudio) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload an image, video, or audio file.`);
    }
    
    // Create file URL
    let fileUrl: string;
    try {
      fileUrl = URL.createObjectURL(file);
    } catch (error: any) {
      throw new Error(`Failed to process file: ${error.message}`);
    }
    
    // Determine media type
    let mediaType: 'image' | 'video' | 'audio';
    if (isImage) mediaType = 'image';
    else if (isVideo) mediaType = 'video';
    else mediaType = 'audio';
    
    const media = this.getMediaFromStorage(user.id);
    const newMedia: Media = {
      id: generateId(),
      entryId,
      type: mediaType,
      url: fileUrl,
      thumbnail: (isImage || isVideo) ? fileUrl : undefined,
      createdAt: new Date().toISOString(),
      position: { x: 100 + (Math.random() * 200), y: 100 + (Math.random() * 200) },
      rotation: Math.random() * 8 - 4,
      scale: 1,
      zIndex: 1,
      isPlaying: false
    };
    
    // Save to user-specific storage
    this.saveMediaToStorage(user.id, [...media, newMedia]);
    
    this.logSecurityEvent('MEDIA_UPLOADED', {
      userId: user.id,
      entryId,
      mediaId: newMedia.id,
      mediaType,
      fileSize: file.size
    });
    
    return newMedia;
  };

  // Delete media with ownership validation
  deleteMedia = async (mediaId: string): Promise<void> => {
    const user = await this.getCurrentUser();
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const media = this.getMediaFromStorage(user.id);
    const mediaItem = media.find(item => item.id === mediaId);
    
    if (!mediaItem) {
      this.logSecurityEvent('MEDIA_DELETE_FAILED', {
        userId: user.id,
        mediaId,
        reason: 'Media not found'
      });
      throw new Error('Media not found');
    }
    
    // Validate that the associated entry belongs to the user
    try {
      await this.getEntry(mediaItem.entryId); // This will validate ownership
    } catch (error) {
      this.logSecurityViolation('UNAUTHORIZED_MEDIA_ACCESS', {
        userId: user.id,
        mediaId,
        entryId: mediaItem.entryId
      });
      throw new Error('Access denied. You do not have permission to delete this media.');
    }
    
    const filteredMedia = media.filter(item => item.id !== mediaId);
    this.saveMediaToStorage(user.id, filteredMedia);
    
    this.logSecurityEvent('MEDIA_DELETED', {
      userId: user.id,
      mediaId,
      entryId: mediaItem.entryId
    });
  };

  // Security logging methods
  private logSecurityEvent(event: string, data: any): void {
    const securityLog = {
      event,
      data,
      timestamp: new Date().toISOString(),
      service: 'journalService'
    };
    
    // Store security logs
    const logs = JSON.parse(localStorage.getItem('journal_security_logs') || '[]');
    logs.push(securityLog);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('journal_security_logs', JSON.stringify(logs));
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Journal Security Event:', securityLog);
    }
  }

  private logSecurityViolation(violation: string, data: any): void {
    const violationLog = {
      violation,
      data,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
      service: 'journalService'
    };
    
    // Store security violations
    const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
    violations.push(violationLog);
    localStorage.setItem('security_violations', JSON.stringify(violations));
    
    // Log to console
    console.error('SECURITY VIOLATION:', violationLog);
    
    // In production, this would trigger alerts
    if (process.env.NODE_ENV === 'production') {
      // Send alert to security team
      // this.sendSecurityAlert(violationLog);
    }
  }
}

export const journalService = new SecureJournalService();