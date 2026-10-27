import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const questions = [
  {
    id: 'skinType',
    question: 'What is your skin type?',
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
    description: 'Understanding your skin type helps us recommend the right products.',
  },
  {
    id: 'concerns',
    question: 'What are your main skin concerns?',
    options: ['Acne', 'Dark spots', 'Wrinkles', 'Dullness', 'Dryness', 'Redness', 'Large pores', 'Uneven tone'],
    multi: true,
    description: 'Select all that apply.',
  },
  {
    id: 'ageGroup',
    question: 'What is your age group?',
    options: ['Under 20', '20-30', '30-40', '40-50', '50+'],
    description: 'This helps us tailor anti-aging recommendations.',
  },
  {
    id: 'routine',
    question: 'How would you describe your current routine?',
    options: ['Minimal (1-2 products)', 'Basic (3-4 products)', 'Intermediate (5-6 products)', 'Advanced (7+ products)'],
    description: 'We\'ll match the complexity of our recommendations.',
  },
  {
    id: 'budget',
    question: 'What\'s your monthly skincare budget?',
    options: ['Under ₹500', '₹500-₹1000', '₹1000-₹2000', '₹2000+'],
    description: 'We\'ll find the best products within your budget.',
  },
];

export default function SkinQuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const currentQ = questions[step];
  const isComplete = step >= questions.length;

  const handleSelect = (option) => {
    if (currentQ.multi) {
      const current = answers[currentQ.id] || [];
      setAnswers({
        ...answers,
        [currentQ.id]: current.includes(option)
          ? current.filter(o => o !== option)
          : [...current, option],
      });
    } else {
      setAnswers({ ...answers, [currentQ.id]: option });
      // Auto-advance for single select
      setTimeout(() => {
        if (step < questions.length - 1) {
          setStep(step + 1);
        }
      }, 300);
    }
  };

  const handleFinish = async () => {
    if (!isAuthenticated) {
      toast.info('Log in to save your skin profile and get personalized recommendations');
      // Still show some results based on answers
    }

    try {
      setLoading(true);
      if (isAuthenticated) {
        await api.post('/skin/profile', {
          skinType: answers.skinType?.toLowerCase(),
          concerns: (answers.concerns || []).map(c => c.toLowerCase()),
          ageGroup: answers.ageGroup,
        });
      }

      // Get product recommendations based on skin type
      const skinType = answers.skinType?.toLowerCase();
      const res = await api.get('/products', {
        params: { skinType, limit: 8, sort: 'rating' },
      });
      setRecommendations(res.data.data.products);
    } catch {
      // Fallback — just show featured
      try {
        const res = await api.get('/products/featured');
        setRecommendations(res.data.data.products);
      } catch {
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
      setStep(questions.length); // Move to results
    }
  };

  const isSelected = (option) => {
    if (currentQ?.multi) {
      return (answers[currentQ.id] || []).includes(option);
    }
    return answers[currentQ?.id] === option;
  };

  const progress = (step / questions.length) * 100;

  // Results screen
  if (isComplete) {
    return (
      <div className="page-enter">
        <div className="bg-gradient-to-r from-blush via-rose-light to-cream py-16">
          <div className="container text-center">
            <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-brown mb-3">Your Skin Profile</h1>
            <p className="text-taupe max-w-md mx-auto">
              Based on your {answers.skinType?.toLowerCase()} skin type, here are our top picks for you.
            </p>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="container py-8">
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {Object.entries(answers).map(([key, val]) => {
              const q = questions.find(q => q.id === key);
              return (
                <div key={key} className="bg-white rounded-xl border border-cream p-4 text-center">
                  <p className="text-xs text-taupe mb-1">{q?.question?.replace('?', '')}</p>
                  <p className="text-sm font-semibold text-brown">{Array.isArray(val) ? val.join(', ') : val}</p>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <h2 className="section-title">Recommended Products</h2>
          <p className="section-subtitle">Curated just for your skin</p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-rose border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {recommendations.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-taupe mb-4">No specific matches found, but check out our full collection!</p>
              <button onClick={() => navigate('/shop')} className="btn btn-primary">Browse All Products</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter min-h-[80vh] flex items-center">
      <div className="container max-w-2xl py-12">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-taupe font-medium">Question {step + 1} of {questions.length}</span>
            <span className="text-xs text-taupe font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-rose to-blush rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="animate-fade-in" key={step}>
          <span className="inline-flex items-center gap-2 text-rose text-xs font-semibold mb-3">
            <Sparkles size={14} /> Skin Quiz
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-brown mb-2">{currentQ.question}</h2>
          <p className="text-taupe text-sm mb-8">{currentQ.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map(option => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  isSelected(option)
                    ? 'border-rose bg-rose-light/40 text-brown'
                    : 'border-cream bg-white text-brown/80 hover:border-blush hover:bg-cream/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {step === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              disabled={!answers[currentQ.id] || (currentQ.multi && (answers[currentQ.id] || []).length === 0)}
              className="btn btn-primary btn-lg"
            >
              See My Results <Sparkles size={18} />
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!answers[currentQ.id] || (currentQ.multi && (answers[currentQ.id] || []).length === 0)}
              className="btn btn-primary"
            >
              Next <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
