import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Save } from 'lucide-react';
import Card, { CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ReflectionAnswers {
  challenge: string;
  proudMoment: string;
  growth: string;
  goals: string;
  influence: string;
}

const ReflectionForm: React.FC = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<ReflectionAnswers>({
    challenge: '',
    proudMoment: '',
    growth: '',
    goals: '',
    influence: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof ReflectionAnswers, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/scrapbook/create');
    } catch (error) {
      console.error('Failed to save reflection', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = [
    {
      id: 'challenge',
      question: 'What was your biggest challenge this year and how did you overcome it?',
      placeholder: 'Reflect on a significant challenge and your response to it...'
    },
    {
      id: 'proudMoment',
      question: 'Describe a moment you\'re most proud of and explain why it matters to you.',
      placeholder: 'Share a meaningful achievement or moment...'
    },
    {
      id: 'growth',
      question: 'How have you grown or changed over the past year?',
      placeholder: 'Consider personal development and changes...'
    },
    {
      id: 'goals',
      question: 'What are three goals you want to achieve next year?',
      placeholder: 'List your aspirations and objectives...'
    },
    {
      id: 'influence',
      question: 'Who has positively influenced you this year and how?',
      placeholder: 'Reflect on important relationships and their impact...'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
          <BookOpen size={32} className="text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Annual Reflection</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Take a moment to reflect on your journey this year. Your thoughtful responses will unlock your personalized digital scrapbook.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h2 className="text-xl font-medium">Reflection Questions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your responses will be analyzed for depth of reflection, personal growth insights, goal clarity, and relationship understanding.
            </p>
          </CardHeader>

          <CardBody>
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <label className="block font-medium">
                    {index + 1}. {q.question}
                  </label>
                  <textarea
                    value={answers[q.id as keyof ReflectionAnswers]}
                    onChange={(e) => handleChange(q.id as keyof ReflectionAnswers, e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder={q.placeholder}
                    required
                  />
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {answers[q.id as keyof ReflectionAnswers].length}/500 characters
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>

          <CardFooter className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All fields are required for a meaningful reflection
            </p>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              leftIcon={<Save size={18} />}
            >
              Complete Reflection
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ReflectionForm;