'use client'

import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "LAW.AI saves me hours every week on drafting and research. It's like having a junior associate who never sleeps.",
    author: "Advocate Sharma",
    role: "Senior Advocate, Delhi High Court",
    avatar: "AS"
  },
  {
    quote: "The judgment summarizer is incredibly accurate. I can review 10x more cases in the same time now.",
    author: "Advocate Patel",
    role: "Corporate Lawyer, Mumbai",
    avatar: "AP"
  },
  {
    quote: "Finally, a legal tech tool built for Indian law. The AI understands our legal system perfectly.",
    author: "Advocate Singh",
    role: "District Court Advocate, Chandigarh",
    avatar: "RS"
  }
]

export function LegalTestimonials() {
  return (
    <section className="relative py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-gray-100 border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6 shadow-sm">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-5 tracking-tight">
            Trusted by Legal Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            See what advocates and lawyers across India are saying about LAW.AI
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.author}>
              <div className="relative bg-white rounded-3xl border border-gray-200 p-7 sm:p-8 h-full hover:border-gray-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                {/* Quote Icon */}
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                  <Quote size={22} className="text-gray-400" />
                </div>

                {/* Quote */}
                <p className="text-gray-700 leading-relaxed mb-8 text-[17px]">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-sm">
                    <span className="text-white font-medium text-sm">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
