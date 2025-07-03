import React, { createContext, useContext, useState, useEffect } from 'react';
import { JournalEntry, JournalContextType, Media } from '../types';
import { journalService } from '../services/journalService';
import { useAuth } from './AuthContext';

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Load entries when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      getEntries();
    }
  }, [isAuthenticated, user]);

  const getEntries = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedEntries = await journalService.getEntries();
      setEntries(fetchedEntries);
    } catch (err) {
      setError('Failed to load journal entries');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEntry = async (id: string): Promise<JournalEntry | undefined> => {
    try {
      // First check if entry is in state
      const cachedEntry = entries.find(entry => entry.id === id);
      if (cachedEntry) return cachedEntry;
      
      // If not, fetch from API
      const entry = await journalService.getEntry(id);
      return entry;
    } catch (err) {
      setError('Failed to load journal entry');
      console.error(err);
      return undefined;
    }
  };

  const createEntry = async (entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newEntry = await journalService.createEntry(entry);
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError('Failed to create journal entry');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedEntry = await journalService.updateEntry(id, entry);
      setEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
      return updatedEntry;
    } catch (err) {
      setError('Failed to update journal entry');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await journalService.deleteEntry(id);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      setError('Failed to delete journal entry');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSentiment = async (text: string): Promise<JournalEntry['sentiment']> => {
    try {
      const sentiment = await journalService.analyzeSentiment(text);
      return sentiment;
    } catch (err) {
      console.error('Failed to analyze sentiment', err);
      throw err;
    }
  };

  const uploadMedia = async (entryId: string, file: File): Promise<Media> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const media = await journalService.uploadMedia(entryId, file);
      
      // Update the entries state to include the new media
      setEntries(prev => prev.map(entry => {
        if (entry.id === entryId) {
          return {
            ...entry,
            media: [...(entry.media || []), media]
          };
        }
        return entry;
      }));
      
      return media;
    } catch (err) {
      setError('Failed to upload media');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMedia = async (mediaId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await journalService.deleteMedia(mediaId);
      
      // Update entries to remove the deleted media
      setEntries(prev => prev.map(entry => {
        if (entry.media?.some(m => m.id === mediaId)) {
          return {
            ...entry,
            media: entry.media.filter(m => m.id !== mediaId)
          };
        }
        return entry;
      }));
    } catch (err) {
      setError('Failed to delete media');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    entries,
    isLoading,
    error,
    getEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    analyzeSentiment,
    uploadMedia,
    deleteMedia
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

export const useJournal = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};