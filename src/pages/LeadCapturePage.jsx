import { useState, lazy, Suspense } from 'react';
import { Send, CheckCircle2, ArrowRight, Briefcase, Mail, User, MessageSquare, Sparkles } from 'lucide-react';

// Lazy load the heavy LiquidChrome component
const LiquidChrome = lazy(() => import('../components/LiquidChrome'));

// Simple CSS-based fallback for the background
const SimpleBackground = () => (
  <div 
    className="absolute inset-0 w-full h-full"
    style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(49, 46, 129, 0.85) 100%)'
    }}
  />
);

// Budget ranges for the dropdown
const BUDGET_RANGES = [
  { value: '', label: 'Select your budget range' },
  { value: 'under-5k', label: 'Under $5,000' },
  { value: '5k-10k', label: '$5,000 - $10,000' },
  { value: '10k-25k', label: '$10,000 - $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-plus', label: '$50,000+' },
];

// Simple fade-in animation using CSS instead of Framer Motion
const FadeIn = ({ children, delay = 0, className = '' }) => (
  <div 
    className={`animate-fade-in ${className}`}
    style={{ 
      animationDelay: `${delay}ms`,
      animationFillMode: 'both'
    }}
  >
    {children}
  </div>
);

// Optimized form error animation
const ErrorMessage = ({ children }) => (
  <p className="text-error text-sm mt-1 animate-slide-down">
    {children}
  </p>
);

const LeadCapturePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.budget) {
      newErrors.budget = 'Please select a budget range';
    }
    
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Store submission in Supabase
      const { createClient } = await import('../lib/supabaseClient');
      const supabase = createClient();
      
      const { error } = await supabase
        .from('leads')
        .insert([{
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          budget_range: formData.budget,
          message: formData.message.trim(),
          status: 'new',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <Suspense fallback={<SimpleBackground />}>
          <LiquidChrome intensity={0.4} speed={0.25} />
        </Suspense>
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <FadeIn className="max-w-md w-full">
            <div className="glass-card p-8 text-center">
              <FadeIn delay={200}>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-vivid flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
              </FadeIn>
              <h2 className="font-display text-3xl font-bold text-content mb-4">
                Thank You!
              </h2>
              <p className="text-content-secondary mb-6">
                We've received your inquiry and will get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', email: '', budget: '', message: '' });
                }}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 hover:scale-102 transition-transform"
              >
                Submit Another
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Lazy loaded Liquid Chrome Background */}
      <Suspense fallback={<SimpleBackground />}>
        <LiquidChrome intensity={0.4} speed={0.25} />
      </Suspense>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left side - Hero text */}
          <FadeIn>
            <FadeIn delay={200}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-elevated/70 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-accent-amber" />
                <span className="text-sm font-medium text-content-secondary">
                  <span className="gradient-text font-bold">New:</span> Premium services available
                </span>
              </div>
            </FadeIn>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-content">Transform Your</span>
              <br />
              <span className="gradient-text-hero">Digital Presence</span>
            </h1>
            
            <p className="text-lg text-content-secondary mb-8 max-w-md leading-relaxed">
              Get a custom solution tailored to your needs. Tell us about your project 
              and we'll help you achieve your goals.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm text-content-muted">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                Free consultation
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                24h response time
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                No commitment
              </span>
            </div>
          </FadeIn>

          {/* Right side - Lead Form */}
          <FadeIn delay={200}>
            <div className="glass-card p-8 relative overflow-hidden">
              {/* Decorative glow - simplified */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-cyan/20 rounded-full blur-3xl" />
              
              <div className="relative">
                <h2 className="font-display text-2xl font-bold text-content mb-2">
                  Get Started
                </h2>
                <p className="text-content-secondary mb-6">
                  Fill out the form below and we'll be in touch shortly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-content mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`input-field pl-12 ${errors.name ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      />
                    </div>
                    {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-content mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`input-field pl-12 ${errors.email ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      />
                    </div>
                    {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                  </div>

                  {/* Budget Range Field */}
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-content mb-1.5">
                      Budget Range
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className={`input-field pl-12 appearance-none cursor-pointer ${errors.budget ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      >
                        {BUDGET_RANGES.map(range => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.budget && <ErrorMessage>{errors.budget}</ErrorMessage>}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-content mb-1.5">
                      Message
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-content-muted" />
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project..."
                        rows={4}
                        className={`input-field pl-12 resize-none ${errors.message ? 'border-error focus:border-error focus:ring-error/20' : ''}`}
                      />
                    </div>
                    {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm animate-fade-in">
                      {errors.submit}
                    </div>
                  )}

                  {/* Submit Button - CSS animations instead of Framer Motion */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-content-muted mt-4">
                  By submitting, you agree to our privacy policy.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default LeadCapturePage;
