import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Image, Grid, Film } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useJournal } from '../contexts/JournalContext';
import { JournalEntry } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SentimentBadge from '../components/ui/SentimentBadge';

// Journal prompts
const PROMPTS = [
  "How was your day overall?",
  "What was the highlight of your day?",
  "What's one thing you wish you had done differently?",
  "How are you feeling emotionally right now?",
  "What's one thing you could improve on?",
  "What's one action you'll take tomorrow?",
  "What are you grateful for today?"
];

const JournalEntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEntry, deleteEntry, isLoading } = useJournal();
  
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadEntry = async () => {
      if (id) {
        const fetchedEntry = await getEntry(id);
        if (fetchedEntry) {
          setEntry(fetchedEntry);
        } else {
          // Entry not found, redirect to journal list
          navigate('/journal');
        }
      }
    };
    
    loadEntry();
  }, [id, getEntry, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await deleteEntry(id);
      navigate('/journal');
    } catch (error) {
      console.error('Failed to delete entry', error);
      // Handle error
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || !entry) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Back</span>
        </button>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit size={16} />}
            onClick={() => navigate(`/entries/${id}/edit`)}
          >
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 size={16} />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold">
                Journal Entry
              </h1>
              <div className="flex items-center mt-1 text-gray-500 dark:text-gray-400 text-sm">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}</span>
              </div>
            </div>
            
            {entry.sentiment && (
              <SentimentBadge sentiment={entry.sentiment} size="lg" showLabel={true} />
            )}
          </div>
        </CardHeader>
        
        <CardBody>
          <div className="space-y-8">
            {Object.entries(entry.steps).map(([key, value], index) => (
              <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                <h2 className="text-lg font-medium mb-3 text-primary-700 dark:text-primary-400 font-serif">
                  {PROMPTS[index]}
                </h2>
                <p className="whitespace-pre-line dark:text-gray-300">
                  {value || <span className="text-gray-400 dark:text-gray-500 italic">No response</span>}
                </p>
              </div>
            ))}
          </div>
        </CardBody>
        
        <CardFooter className="flex flex-col space-y-6">
          {/* Scrapbook Gallery Section */}
          {entry.scrapbookLayout ? (
            <div className="w-full border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Scrapbook Gallery</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/scrapbook/${id}`)}
                >
                  View Gallery Wall
                </Button>
              </div>
              
              <div 
                className="relative h-40 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => navigate(`/scrapbook/${id}`)}
              >
                {/* Gallery preview - simplified version showing a few items */}
                <div className="absolute inset-0 p-3">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                      {entry.media && entry.media.slice(0, 4).map((media, index) => (
                        <div 
                          key={media.id} 
                          className={`
                            ${media.type === 'audio' ? 'rounded-full' : 'rounded'}
                            border-2 border-white dark:border-gray-600 shadow-sm overflow-hidden
                            ${index % 2 === 0 ? 'rotate-[-3deg]' : 'rotate-[3deg]'}
                          `}
                          style={{
                            backgroundColor: ['#f9d6d3', '#d3f9d6', '#d3d6f9', '#f9f9d3'][index % 4],
                            height: '50px'
                          }}
                        >
                          {media.type === 'image' && (
                            <img 
                              src={media.url} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                          )}
                          {media.type === 'video' && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              <Film size={18} className="text-white opacity-75" />
                            </div>
                          )}
                          {media.type === 'audio' && (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl">🔈</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!entry.media || entry.media.length === 0) && (
                        <div className="col-span-2 text-center text-gray-500 dark:text-gray-400">
                          Gallery Wall Preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Create a Gallery Wall</h3>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/scrapbook/${id}`)}
                >
                  Create Scrapbook
                </Button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create a personal gallery wall with your photos and audio recordings.
                Arrange and customize your memories in a creative way.
              </p>
            </div>
          )}
          
          {/* Media Attachments Section */}
          {entry.media && entry.media.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Attachments</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {entry.media.map(media => (
                  <div key={media.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {media.type === 'image' ? (
                      <img 
                        src={media.url} 
                        alt="Journal entry attachment" 
                        className="w-full h-32 object-cover"
                      />
                    ) : media.type === 'video' ? (
                      <video
                        src={media.url}
                        controls
                        className="w-full h-32 object-cover"
                      />
                    ) : (
                      <div 
                        className="bg-gradient-to-br from-yellow-100 to-yellow-300 dark:from-yellow-800 dark:to-yellow-600 h-32 flex flex-col items-center justify-center cursor-pointer group"
                        onClick={() => {
                          const audio = document.getElementById(`entry-audio-${media.id}`) as HTMLAudioElement;
                          if (audio) {
                            if (audio.paused) {
                              audio.play();
                            } else {
                              audio.pause();
                              audio.currentTime = 0;
                            }
                          }
                        }}
                      >
                        <audio id={`entry-audio-${media.id}`} src={media.url} />
                        <span className="text-3xl mb-1">🔈</span>
                        <span className="text-gray-800 dark:text-gray-200 text-xs font-medium">Click to play</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-medium mb-4">Delete Journal Entry</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntryDetail;