import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, BarChart3, Calendar, Award } from 'lucide-react';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import SentimentBadge from '../components/ui/SentimentBadge';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { entries, isLoading } = useJournal();
  
  // Get most recent entry
  const latestEntry = entries.length > 0 ? entries[0] : null;
  
  // Calculate positive/negative days
  const sentimentCounts = entries.reduce(
    (acc, entry) => {
      if (entry.sentiment?.label === 'Positive') acc.positive += 1;
      else if (entry.sentiment?.label === 'Negative') acc.negative += 1;
      else acc.neutral += 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Section */}
        <section>
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold mb-2">
              Welcome back, {user?.name || 'there'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {entries.length > 0 
                ? `You have written ${entries.length} journal ${entries.length === 1 ? 'entry' : 'entries'}.`
                : 'Start your journaling journey today.'}
            </p>
          </div>
          
          {/* Call to Action Card */}
          <Card className="mb-8 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:w-2/3">
                <h2 className="text-2xl font-bold font-serif mb-2">Ready to reflect on your day?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Taking a few minutes to journal can help you process your thoughts and emotions.
                </p>
                <Button 
                  variant="primary"
                  leftIcon={<PlusCircle size={20} />}
                  onClick={() => navigate('/new-entry')}
                >
                  Create New Entry
                </Button>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900/30 p-6 md:w-1/3 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-bold text-5xl font-serif text-primary-700 dark:text-primary-300">
                    {user?.streak || 0}
                  </div>
                  <div className="text-primary-600 dark:text-primary-400 mt-2 flex items-center justify-center">
                    <Award size={18} className="mr-1" />
                    <span>Day Streak</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardBody className="text-center">
                <BookOpen size={24} className="mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-bold mb-1">{entries.length}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Entries</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="text-center">
                <BarChart3 size={24} className="mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-bold mb-1">
                  {sentimentCounts.positive} <span className="text-green-500">↑</span> {sentimentCounts.negative} <span className="text-red-500">↓</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Mood Distribution</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="text-center">
                <Calendar size={24} className="mx-auto mb-2 text-primary-600 dark:text-primary-400" />
                <h3 className="text-xl font-bold mb-1">
                  {new Date().toLocaleDateString('en-US', { month: 'long' })}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Current Month</p>
              </CardBody>
            </Card>
          </div>
        </section>
        
        {/* Latest Entry */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-serif">Latest Entry</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/journal')}
            >
              View All
            </Button>
          </div>
          
          {isLoading ? (
            <Card>
              <CardBody>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </CardBody>
            </Card>
          ) : latestEntry ? (
            <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/entries/${latestEntry.id}`)}>
              <Card>
                <CardBody>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium mb-1">
                        {new Date(latestEntry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(latestEntry.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {latestEntry.sentiment && (
                      <SentimentBadge sentiment={latestEntry.sentiment} showLabel={true} />
                    )}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 line-clamp-3">
                    {latestEntry.steps.step1}
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-8">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-400" />
                <h3 className="font-medium mb-2">No entries yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Create your first journal entry to start reflecting.
                </p>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/new-entry')}
                >
                  Create First Entry
                </Button>
              </CardBody>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;