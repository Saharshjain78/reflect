import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Calendar, List, Grid, ChevronDown } from 'lucide-react';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useJournal } from '../contexts/JournalContext';
import { JournalEntry } from '../types';
import SentimentBadge from '../components/ui/SentimentBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const JournalList: React.FC = () => {
  const navigate = useNavigate();
  const { entries, isLoading } = useJournal();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'positive' | 'negative'>('newest');
  
  // Filter and sort entries when dependencies change
  useEffect(() => {
    let filtered = [...entries];
    
    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        Object.values(entry.steps).some(text => 
          text.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    // Apply sorting
    filtered = sortEntries(filtered, sortBy);
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, sortBy]);
  
  // Sort entries based on the selected sort option
  const sortEntries = (entriesToSort: JournalEntry[], sortType: string): JournalEntry[] => {
    switch (sortType) {
      case 'newest':
        return [...entriesToSort].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return [...entriesToSort].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'positive':
        return [...entriesToSort].sort((a, b) => 
          (b.sentiment?.score || 0) - (a.sentiment?.score || 0)
        );
      case 'negative':
        return [...entriesToSort].sort((a, b) => 
          (a.sentiment?.score || 0) - (b.sentiment?.score || 0)
        );
      default:
        return entriesToSort;
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get content preview (first few words of the first step)
  const getContentPreview = (entry: JournalEntry): string => {
    const content = entry.steps.step1;
    if (!content) return '';
    
    const words = content.split(' ');
    return words.slice(0, 15).join(' ') + (words.length > 15 ? '...' : '');
  };

  const handleEntryClick = (entryId: string) => {
    navigate(`/entries/${entryId}`);
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif font-bold">My Journal</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white w-full sm:w-auto"
            />
          </div>
          
          <Button
            variant="primary"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => navigate('/new-entry')}
          >
            New Entry
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === 'list' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<List size={18} />}
            onClick={() => setViewType('list')}
          >
            List
          </Button>
          <Button
            variant={viewType === 'grid' ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Grid size={18} />}
            onClick={() => setViewType('grid')}
          >
            Grid
          </Button>
        </div>
        
        <div className="relative">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-1.5 pl-3 pr-8 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="positive">Most Positive</option>
              <option value="negative">Most Negative</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : filteredEntries.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium mb-2">No journal entries found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? "No entries match your search. Try different keywords." 
                : "Start journaling to reflect on your thoughts and experiences."}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/new-entry')}
            >
              Create Your First Entry
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          {viewType === 'list' ? (
            <div className="space-y-4">
              {filteredEntries.map(entry => (
                <div 
                  key={entry.id}
                  onClick={() => handleEntryClick(entry.id)}
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-medium">
                              {formatDate(entry.createdAt)}
                            </span>
                            {entry.scrapbookLayout && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                Gallery
                              </span>
                            )}
                            {entry.sentiment && (
                              <div className="ml-3">
                                <SentimentBadge sentiment={entry.sentiment} />
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {getContentPreview(entry)}
                          </p>
                        </div>
                        <div className="mt-3 md:mt-0 md:ml-4">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map(entry => (
                <div
                  key={entry.id}
                  onClick={() => handleEntryClick(entry.id)}
                  className="cursor-pointer"
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {formatDate(entry.createdAt)}
                          </span>
                          {entry.scrapbookLayout && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              Gallery
                            </span>
                          )}
                        </div>
                        {entry.sentiment && <SentimentBadge sentiment={entry.sentiment} />}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-4 mb-3">
                        {getContentPreview(entry)}
                      </p>
                      <div className="mt-auto pt-2">
                        <Button variant="ghost" size="sm">
                          View Entry
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JournalList;