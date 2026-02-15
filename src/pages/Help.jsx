import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: 'How do I place an order?',
    answer: 'Browse products from your nearest Grabbi store, add items to your cart, set your delivery address, and complete checkout. You can track your order in real-time from your dashboard.',
  },
  {
    question: 'What are the delivery hours?',
    answer: 'Delivery hours vary by franchise location. Most stores deliver from 8am to 10pm. Check your local store for specific operating hours.',
  },
  {
    question: 'How much does delivery cost?',
    answer: 'Delivery fees are set by each franchise location. Many stores offer free delivery on orders above a certain threshold (typically displayed at checkout). Check the checkout page for delivery fee details.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'You can cancel orders that are in "pending" or "confirmed" status from your dashboard. Once an order is being prepared, cancellation may not be possible.',
  },
  {
    question: 'How do loyalty points work?',
    answer: 'You earn 1 point for every pound spent. Points can be redeemed for discounts on future orders. View your points balance and history on your dashboard under the Club Card tab.',
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot password?" on the login form. Enter your email address and we will send you a link to reset your password.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We currently accept debit and credit card payments. Additional payment methods including Apple Pay and Google Pay are coming soon.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can reach our support team at support@grabbi.co.uk. We aim to respond within 24 hours.',
  },
]

export default function Help() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Centre</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">Frequently asked questions and support</p>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 md:p-8 shadow-card space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-white/10 last:border-b-0">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between py-4 text-left"
            >
              <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
              <ChevronDownIcon className={`h-5 w-5 text-gray-400 dark:text-white/40 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && (
              <div className="pb-4 text-sm text-gray-600 dark:text-white/70 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 shadow-card text-center space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Still need help?</h2>
        <p className="text-sm text-gray-600 dark:text-white/70">
          Contact our support team at <span className="text-brand-mint font-medium">support@grabbi.co.uk</span>
        </p>
      </div>
    </div>
  )
}
