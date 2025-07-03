import { JournalEntry, Media } from '../types';
import { generateId } from '../utils/helpers';

// Mock data for development
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    userId: '1',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    steps: {
      step1: 'I felt really productive today.',
      step2: 'I completed the project proposal ahead of schedule.',
      step3: 'I should take more breaks between tasks.',
      step4: 'I feel proud of my work ethic.',
      step5: 'I could improve my communication with the team.',
      step6: 'I will schedule regular check-ins with team members.',
      step7: 'I am grateful for the support of my colleagues.'
    },
    sentiment: {
      score: 0.75,
      label: 'Positive'
    },
    isSync: true
  },
  {
    id: '2',
    userId: '1',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    steps: {
      step1: 'Today was challenging.',
      step2: 'I struggled with focusing on my tasks.',
      step3: 'I need to establish a better morning routine.',
      step4: 'I feel a bit overwhelmed.',
      step5: 'I could improve my time management.',
      step6: 'I will try the Pomodoro technique tomorrow.',
      step7: 'I am grateful for having the opportunity to learn from today.'
    },
    sentiment: {
      score: -0.2,
      label: 'Negative'
    },
    isSync: true
  }
];

// LocalStorage keys
const ENTRIES_KEY = 'journal_entries';
const MEDIA_KEY = 'journal_media';

// Initialize localStorage with mock data if empty
const initializeLocalStorage = () => {
  if (!localStorage.getItem(ENTRIES_KEY)) {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(mockEntries));
  }
  
  if (!localStorage.getItem(MEDIA_KEY)) {
    localStorage.setItem(MEDIA_KEY, JSON.stringify([]));
  }
};

initializeLocalStorage();

// Helper to get entries from localStorage
const getEntriesFromStorage = (): JournalEntry[] => {
  const entries = localStorage.getItem(ENTRIES_KEY);
  return entries ? JSON.parse(entries) : [];
};

// Helper to save entries to localStorage
const saveEntriesToStorage = (entries: JournalEntry[]): void => {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

// Helper to get media from localStorage
const getMediaFromStorage = (): Media[] => {
  const media = localStorage.getItem(MEDIA_KEY);
  return media ? JSON.parse(media) : [];
};

// Helper to save media to localStorage
const saveMediaToStorage = (media: Media[]): void => {
  localStorage.setItem(MEDIA_KEY, JSON.stringify(media));
};

export const journalService = {
  // Get all entries
  getEntries: async (): Promise<JournalEntry[]> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getEntriesFromStorage();
  },

  // Get a single entry
  getEntry: async (id: string): Promise<JournalEntry> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const entries = getEntriesFromStorage();
    const entry = entries.find(e => e.id === id);
    
    if (!entry) {
      throw new Error('Entry not found');
    }
    
    return entry;
  },

  // Create a new entry
  createEntry: async (entryData: Partial<JournalEntry>): Promise<JournalEntry> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const entries = getEntriesFromStorage();
    const now = new Date().toISOString();
    
    const newEntry: JournalEntry = {
      id: generateId(),
      userId: '1', // Mock user ID
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
    saveEntriesToStorage(updatedEntries);
    
    return newEntry;
  },

  // Update an existing entry
  updateEntry: async (id: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const entries = getEntriesFromStorage();
    const entryIndex = entries.findIndex(e => e.id === id);
    
    if (entryIndex === -1) {
      throw new Error('Entry not found');
    }
    
    const updatedEntry = {
      ...entries[entryIndex],
      ...entryData,
      steps: {
        ...entries[entryIndex].steps,
        ...(entryData.steps || {})
      },
      updatedAt: new Date().toISOString(),
      isSync: true
    };
    
    entries[entryIndex] = updatedEntry;
    saveEntriesToStorage(entries);
    
    return updatedEntry;
  },

  // Delete an entry
  deleteEntry: async (id: string): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const entries = getEntriesFromStorage();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    saveEntriesToStorage(filteredEntries);
    
    // Also delete associated media
    const media = getMediaFromStorage();
    const filteredMedia = media.filter(item => item.entryId !== id);
    
    saveMediaToStorage(filteredMedia);
  },

  // Analyze sentiment
  analyzeSentiment: async (text: string): Promise<JournalEntry['sentiment']> => {
    // Simulate API call to sentiment analysis service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock sentiment analysis
    // In a real app, this would call an AI service
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
    
    return { score: clampedScore, label };
  },

  // Upload media
  uploadMedia: async (entryId: string, file: File): Promise<Media> => {
    // Simulate API call with delay - longer for larger files to simulate realistic upload times
    const delayMs = Math.min(2000, 800 + (file.size / (1024 * 1024)) * 10);
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    // In a real app, this would upload to cloud storage
    // and return a URL. For the mock, we'll create a local URL
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    // Detailed file type validation
    if (!isImage && !isVideo && !isAudio) {
      throw new Error(`Unsupported file type: ${file.type}. Please upload an image, video, or audio file.`);
    }
    
    // Browser compatibility check for specific formats
    const format = file.type.split('/')[1]?.toLowerCase();
    if (format) {
      const limitedSupportFormats = {
        'image': ['webp', 'avif', 'heic', 'heif', 'tiff', 'svg+xml'],
        'video': ['webm', 'ogv', 'mov', 'mkv'],
        'audio': ['ogg', 'flac', 'wav']
      };
      
      const category = isImage ? 'image' : isVideo ? 'video' : 'audio';
      if (limitedSupportFormats[category].includes(format)) {
        console.warn(`File format ${format} has limited browser support and may cause playback issues.`);
      }
    }
    
    // Check for common problematic file extensions
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
      // HEIC is problematic in many browsers
      console.warn('HEIC/HEIF format has limited browser support');
    } else if (fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
      console.warn('TIFF format has limited browser support');
    }
    
    // Create file URL for mock storage
    let fileUrl = '';
    
    // For small files, use FileReader (up to 5MB)
    if (file.size < 5 * 1024 * 1024) {
      try {
        fileUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          
          // Set a timeout to simulate failure after 10 seconds for testing error handling
          const timeout = setTimeout(() => {
            if (Math.random() < 0.05) { // 5% chance of simulated timeout failure
              reject(new Error('Failed to read file: Operation timed out'));
            }
          }, 10000);
          
          reader.onload = () => {
            clearTimeout(timeout);
            
            // Additional validation for loaded content
            const result = reader.result as string;
            if (!result || result === 'data:') {
              return reject(new Error('Failed to read file: Empty or invalid file content'));
            }
            
            // Check if the file appears to be corrupted by validating data URL format
            const validDataUrlPattern = /^data:([\w\/\+]+);base64,/;
            if (!validDataUrlPattern.test(result)) {
              return reject(new Error('Failed to read file: Invalid file format or corrupted content'));
            }
            
            resolve(result);
          };
          
          reader.onerror = (e) => {
            clearTimeout(timeout);
            console.error('FileReader error:', e);
            
            // More detailed error message based on error code
            const errorMessages: {[key: number]: string} = {
              1: 'The file was not found',  // NOT_FOUND_ERR
              2: 'Permission denied', // SECURITY_ERR
              3: 'Operation aborted',  // ABORT_ERR
              4: 'File cannot be read (potential corruption)',  // NOT_READABLE_ERR
              5: 'File encoding error (invalid format)'  // ENCODING_ERR
            };
            
            const errorDetail = e.target?.error?.code ? 
              errorMessages[e.target.error.code] || 'Unknown error' : 
              'The file may be corrupted or in an unsupported format';
              
            reject(new Error(`Failed to read file: ${errorDetail}`));
          };
          
          reader.readAsDataURL(file);
        });
      } catch (error: any) {
        console.error('Error creating file URL with FileReader:', error);
        
        // Attempt object URL as fallback
        try {
          fileUrl = URL.createObjectURL(file);
          console.log('Falling back to ObjectURL for small file');
        } catch (secondError) {
          console.error('Both FileReader and ObjectURL failed:', secondError);
          
          // Enhanced error message with more specific details 
          const errorMsg = error.message || 'Unable to process file';
          const specificError = errorMsg.includes('timeout') ? 
            'Upload timed out. Your file may be too large or your connection too slow.' :
            errorMsg.includes('corrupted') ? 
            'Your file appears to be corrupted. Try creating or saving it again.' :
            `File upload failed: ${errorMsg}`;
            
          throw new Error(specificError);
        }
      }
    } else {
      // For larger files, use createObjectURL
      try {
        // Additional check for very large files
        const sizeMB = Math.round(file.size / (1024 * 1024));
        if (sizeMB > 200) {
          console.warn(`File size (${sizeMB}MB) is very large and may cause performance issues`);
        }
        
        // Simulate failure for very large files (>300MB) occasionally to test error handling
        if (file.size > 300 * 1024 * 1024 && Math.random() < 0.2) {
          throw new Error('Simulated failure for large file upload');
        }
        
        // Add format-specific checks for large files
        if (isVideo && file.size > 50 * 1024 * 1024) {
          // Check video format specifically for large videos
          const videoFormat = file.type.split('/')[1]?.toLowerCase();
          const highCompressionFormats = ['mp4', 'webm'];
          
          if (videoFormat && !highCompressionFormats.includes(videoFormat)) {
            console.warn(`Large video in ${videoFormat} format may cause performance issues. MP4 is recommended.`);
          }
        }
        
        fileUrl = URL.createObjectURL(file);
      } catch (error: any) {
        console.error('Error creating object URL:', error);
        
        // Enhanced error diagnosis
        // Check if browser storage might be full
        if (error.name === 'QuotaExceededError' || 
           (error.message && error.message.toLowerCase().includes('quota'))) {
          throw new Error('Browser storage quota exceeded. Try clearing browser data or using a smaller file.');
        }
        
        // Check for memory limitations
        if (file.size > 100 * 1024 * 1024 && 
           (error.name === 'NotSupportedError' || error.message?.includes('memory'))) {
          throw new Error('File is too large for browser memory limits. Try compressing it or using a smaller file.');
        }
        
        // Final fallback to mock URL - this would be removed in production
        try {
          const fileTypePrefix = isImage ? 'image' : isVideo ? 'video' : 'audio';
          const randomId = Math.random().toString(36).substring(2, 9);
          fileUrl = `https://example.com/${fileTypePrefix}/${randomId}`;
          console.warn('Using mock URL as last resort fallback');
        } catch (finalError) {
          throw new Error(`Failed to create any URL for file: ${error.message || 'Unknown error'}`);
        }
      }
    }
    
    // Determine media type
    let mediaType: 'image' | 'video' | 'audio';
    if (isImage) mediaType = 'image';
    else if (isVideo) mediaType = 'video';
    else mediaType = 'audio';
    
    const media = getMediaFromStorage();
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
    
    // Save to localStorage
    saveMediaToStorage([...media, newMedia]);
    
    return newMedia;
  },

  // Delete media
  deleteMedia: async (mediaId: string): Promise<void> => {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const media = getMediaFromStorage();
    const filteredMedia = media.filter(item => item.id !== mediaId);
    
    saveMediaToStorage(filteredMedia);
  }
};