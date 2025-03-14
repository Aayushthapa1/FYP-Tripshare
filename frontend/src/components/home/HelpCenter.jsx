
import { useState } from "react"
import Navbar from "./../layout/Navbar"
import Footer from "./../layout/Footer"
import { Search, ChevronDown, Paperclip, Send, HelpCircle } from "lucide-react"



function HelpCenter() {
  const [activeQuestion, setActiveQuestion] = useState(null)

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I reset my password?",
      answer:
        'To reset your password, click on the "Forgot Password" link on the login page and follow the instructions sent to your email. If you don\'t receive an email within a few minutes, please check your spam folder.',
    },
    {
      question: "How do I upgrade my subscription?",
      answer:
        'Go to your account settings and click on "Subscription". From there, you can view and select available upgrade options. Changes to your subscription will take effect immediately.',
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for business accounts. All payments are processed securely through our payment gateway.",
    },
    {
      question: "How can I cancel my account?",
      answer:
        'You can cancel your account by going to your account settings and selecting the "Cancel Account" option. Please note that cancellation will take effect at the end of your current billing cycle.',
    },
    {
      question: "Is my data secure with TripShare?",
      answer:
        "Yes, we take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security protocols and regularly audit our systems to ensure your information remains protected.",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-green-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search for help..."
              className="w-full pl-10 p-4 bg-white border border-gray-200 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">
              ?
            </span>
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  activeQuestion === index ? "border-green-200 bg-green-50" : "border-gray-200"
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                >
                  <span className="font-medium text-gray-800">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                      activeQuestion === index ? "transform rotate-180 text-green-600" : ""
                    }`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    activeQuestion === index ? "max-h-60 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Support Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Support</h2>
          <p className="text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help you.
          </p>

          <form className="space-y-6">
            {/* Name inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                           transition-all duration-200"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         transition-all duration-200"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                id="subject"
                type="text"
                placeholder="How can we help you?"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         transition-all duration-200"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Please describe your issue in detail..."
                rows={5}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                         transition-all duration-200"
              />
            </div>

            {/* File attachment */}
            <div className="space-y-2">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Attach files (Max file size: 10MB)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg hover:border-green-300 transition-colors">
                <div className="space-y-1 text-center">
                  <Paperclip className="mx-auto h-12 w-12 text-gray-300" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-green-500 text-white 
                       font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </button>
          </form>
        </section>

        {/* Additional Help Options */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
            <a href="mailto:support@tripshare.com" className="text-blue-600 hover:underline font-medium">
              support@tripshare.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
            <button className="text-purple-600 hover:underline font-medium">Start Chat</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
            <p className="text-gray-600 mb-4">Browse our detailed documentation</p>
            <a href="#" className="text-amber-600 hover:underline font-medium">
              View Articles
            </a>
          </div>
        </section>
      </div>
    
      <Footer/>
    </div>
    
  )
}

export default HelpCenter

