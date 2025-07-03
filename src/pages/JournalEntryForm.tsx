import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image, Mic, PartyPopper } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { useJournal } from '../contexts/JournalContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const JournalEntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEntry, createEntry, updateEntry, analyzeSentiment, isLoading } = useJournal();
  const [activeStep, setActiveStep] = useState(0);
  
  // State for steps content
  const [steps, setSteps] = useState({
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
    step6: '',
    step7: ''
  });

  // State to track when all questions are complete
  const [isComplete, setIsComplete] = useState(false);
  
  // For autosave
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Generate prompts based on previous answers
  const getPrompts = () => {
    const initialPrompts = [
      "How was your day overall?",
      "What was the highlight of your day?",
      "What's one thing you wish you had done differently?"
    ];
    
    // Only generate contextual prompts after the first 3 questions have been answered
    if (steps.step1 && steps.step2 && steps.step3) {
      const contextWords1 = steps.step1.split(' ').slice(0, 3).join(' ');
      const contextWords2 = steps.step2.split(' ').slice(0, 5).join(' ');
      const contextWords3 = steps.step3.split(' ').slice(0, 3).join(' ');
      
      const contextualPrompts = [
        `Based on how your day went, how are you feeling emotionally right now?`,
        `Thinking about "${contextWords1}...", what's one thing you could improve on?`,
        `Considering "${contextWords2}...", what's one action you'll take tomorrow?`,
        `After reflecting on "${contextWords3}...", what are you grateful for today?`
      ];
      
      return [...initialPrompts, ...contextualPrompts];
    }
    
    // If the context questions aren't ready yet, use generic placeholders
    return [
      ...initialPrompts,
      "How are you feeling emotionally right now?",
      "What's one thing you could improve on?",
      "What's one action you'll take tomorrow?",
      "What are you grateful for today?"
    ];
  };
  
  const prompts = getPrompts();
  
  // Fetch entry if editing
  useEffect(() => {
    const loadEntry = async () => {
      if (id) {
        const entry = await getEntry(id);
        if (entry) {
          setSteps(entry.steps);
          setEntryId(entry.id);
        }
      }
    };
    
    loadEntry();
  }, [id, getEntry]);
  
  // Autosave functionality
  useEffect(() => {
    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Don't save if all fields are empty
    const isEmpty = Object.values(steps).every(step => !step.trim());
    if (isEmpty) return;
    
    // Set new timer for autosave
    autoSaveTimerRef.current = setTimeout(async () => {
      await saveEntry(true);
    }, 5000); // Autosave after 5 seconds of inactivity
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [steps]);
  
  const handleChange = (step: string, value: string) => {
    setSteps(prev => ({
      ...prev,
      [step]: value
    }));
  };
  
  const handleNext = () => {
    if (activeStep < 6) {
      setActiveStep(prev => prev + 1);
      
      // If moved to the last step and all questions are answered, mark as complete
      if (activeStep === 5 && Object.values(steps).every(step => step.trim().length > 0)) {
        setIsComplete(true);
      }
    }
  };
  
  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      // Reset completion state if going back from last question
      if (isComplete) {
        setIsComplete(false);
      }
    }
  };
  
  const saveEntry = async (isAutosave = false) => {
    if (!isAutosave) setIsSaving(true);
    
    try {
      // Analyze sentiment
      const combinedText = Object.values(steps).join(' ');
      const sentiment = await analyzeSentiment(combinedText);
      
      if (id || entryId) {
        // Update existing entry
        const entryToUpdate = id || entryId;
        await updateEntry(entryToUpdate!, { steps, sentiment });
      } else {
        // Create new entry
        const newEntry = await createEntry({ steps, sentiment });
        setEntryId(newEntry.id);
        
        // If manual save, redirect to the new entry or scrapbook page
        if (!isAutosave) {
          if (isComplete) {
            // If entry is complete, go to scrapbook page
            navigate(`/scrapbook/${newEntry.id}`);
          } else {
            // Otherwise go to entry detail
            navigate(`/entries/${newEntry.id}`);
          }
          return;
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save entry', error);
      // Handle error (show message to user)
    } finally {
      if (!isAutosave) setIsSaving(false);
    }
  };
  
  const getStepCompletionStatus = () => {
    return Object.entries(steps).map(([_, value]) => value.trim().length > 0);
  };
  
  const stepStatus = getStepCompletionStatus();
  const completedSteps = stepStatus.filter(Boolean).length;
  const progress = (completedSteps / 7) * 100;
  
  // Continue to scrapbook after completing all questions
  const handleContinueToScrapbook = async () => {
    if (!entryId) {
      // Save the entry first
      await saveEntry();
    } else {
      // Navigate to scrapbook with existing entry ID
      navigate(`/scrapbook/${entryId}`);
    }
  };
  
  if (isLoading && id) {
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
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <h1 className="text-2xl font-serif font-bold">
            {id ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h1>
          
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{completedSteps}/7 completed</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </CardHeader>
        
        <CardBody>
          {isComplete ? (
            // Completion celebration view
            <div className="py-8 text-center">
              <div className="flex justify-center mb-4">
                <PartyPopper size={60} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-medium mb-3 text-primary-700 dark:text-primary-400">
                Hooray! You've completed your journal entry!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Now it's time to create your scrapbook gallery wall! Add photos, record audio, and arrange everything just the way you like.
              </p>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContinueToScrapbook}
                  isLoading={isSaving}
                >
                  Continue to Scrapbook
                </Button>
              </div>
            </div>
          ) : (
            // Journal entry questions view
            <div className="space-y-6">
              {/* Step indicator */}
              <div className="flex justify-center mb-4">
                {[0, 1, 2, 3, 4, 5, 6].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`
                      w-8 h-8 rounded-full mx-1 flex items-center justify-center text-sm
                      ${activeStep === step ? 'bg-primary-500 text-white' : 
                        stepStatus[step] ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}
                      transition-colors duration-200
                    `}
                  >
                    {step + 1}
                  </button>
                ))}
              </div>
              
              {/* Active step prompt */}
              <div>
                <h2 className="text-xl font-medium mb-3 dark:text-white">
                  {prompts[activeStep]}
                </h2>
                
                <textarea
                  value={steps[`step${activeStep + 1}` as keyof typeof steps]}
                  onChange={(e) => handleChange(`step${activeStep + 1}`, e.target.value)}
                  className="w-full p-3 min-h-[150px] border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  placeholder={`Write your thoughts about ${prompts[activeStep].toLowerCase()}...`}
                  maxLength={1000}
                />
                
                <div className="flex justify-end mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {steps[`step${activeStep + 1}` as keyof typeof steps].length}/1000
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {activeStep < 6 ? (
                    <Button
                      variant="outline"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setIsComplete(true)}
                      disabled={!steps.step7.trim()}
                    >
                      Complete
                    </Button>
                  )}
                  
                  <Button
                    variant="primary"
                    onClick={() => saveEntry()}
                    isLoading={isSaving}
                    leftIcon={<Save size={18} />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
        
        {!isComplete && (
          <CardFooter className="flex justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Image size={18} />}
                disabled
              >
                Add Image
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Mic size={18} />}
                disabled
                className="ml-2"
              >
                Add Audio
              </Button>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 italic">
              Media uploads available in scrapbook
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default JournalEntryForm;