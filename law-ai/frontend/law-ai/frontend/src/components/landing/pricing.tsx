'use client'


import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { PRICING_PLANS } from '@/const/pricing'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

const plans = PRICING_PLANS.map(plan => ({
  ...plan,
  cta: plan.buttonText,
  color: plan.popular ? '#3b82f6' : '#e5e7eb'
}))

function Pricing() {
  const { user } = useAuth()

  const handlePlanSelect = (plan: typeof plans[0]) => {
    console.log('Plan selected:', plan.name, 'User:', user)
    
    if (!user) {
      console.log('No user, redirecting to signup')
      window.location.href = '/auth/signup?redirect=/dashboard'
      return
    }
    
    // User is logged in, redirect to dashboard
    console.log('User logged in, going to dashboard')
    window.location.href = '/dashboard'
  }

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '4rem'
        }}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors">
            Choose the perfect plan for your legal practice. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
            willChange: 'transform'
          }}
          className="pricing-grid"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-gray-900/25 border-2 ${plan.popular ? 'border-blue-500 dark:border-blue-400 scale-105' : 'border-gray-200 dark:border-gray-700'} overflow-hidden transition-all duration-300`}
              onMouseEnter={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!plan.popular) {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  zIndex: 10
                }}>
                  <span>⭐</span>
                  <span>Most Popular</span>
                </div>
              )}

              <div style={{ padding: '1.2rem' }}>
                {/* Plan Header */}
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed transition-colors">
                    {plan.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}>
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">
                      {plan.currency}{plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm transition-colors">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div style={{
                  marginBottom: '1.5rem'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '0.125rem'
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '700'
                        }}>✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed transition-colors">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 border-none cursor-pointer ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-1'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Money Back Guarantee */}
                {plan.name !== 'Free' && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 transition-colors">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <div style={{
          marginTop: '5rem',
          textAlign: 'center'
        }}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 transition-colors">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-left p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base transition-colors">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed transition-colors">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base transition-colors">
                Is my data secure?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed transition-colors">
                Absolutely. We use bank-grade encryption and comply with all legal industry standards.
              </p>
            </div>
            <div className="text-left p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base transition-colors">
                Do you offer custom plans?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed transition-colors">
                Yes, we offer custom enterprise plans for large organizations with specific needs.
              </p>
            </div>
            <div className="text-left p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 text-sm sm:text-base transition-colors">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed transition-colors">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing