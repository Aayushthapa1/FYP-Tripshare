"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./../layout/Navbar";
import Footer from "./../layout/Footer";
import {
  Search,
  ChevronDown,
  Paperclip,
  Send,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Users,
  Star,
  Play,
  ChevronLeft,
} from "lucide-react";

function HelpCenter() {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    file: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setFormErrors({
        ...formErrors,
        file: "File size exceeds 10MB limit",
      });
      return;
    }

    setFormData({
      ...formData,
      file: file,
    });

    if (formErrors.file) {
      setFormErrors({
        ...formErrors,
        file: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      document
        .getElementById(firstErrorField)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessMessage(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        file: null,
      });

      // Reset file input
      const fileInput = document.getElementById("file-upload");
      if (fileInput) fileInput.value = "";

      // Reset success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      // Scroll to success message
      document
        .getElementById("success-message")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 1500);
  };

  const faqs = [
    {
      category: "account",
      question: "How do I reset my password?",
      answer:
        'To reset your password, click on the "Forgot Password" link on the login page and follow the instructions sent to your email. If you don\'t receive an email within a few minutes, please check your spam folder.',
    },
    {
      category: "billing",
      question: "How do I upgrade my subscription?",
      answer:
        'Go to your account settings and click on "Subscription". From there, you can view and select available upgrade options. Changes to your subscription will take effect immediately.',
    },
    {
      category: "billing",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for business accounts. All payments are processed securely through our payment gateway.",
    },
    {
      category: "account",
      question: "How can I cancel my account?",
      answer:
        'You can cancel your account by going to your account settings and selecting the "Cancel Account" option. Please note that cancellation will take effect at the end of your current billing cycle.',
    },
    {
      category: "security",
      question: "Is my data secure with TripShare?",
      answer:
        "Yes, we take data security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security protocols and regularly audit our systems to ensure your information remains protected.",
    },
    {
      category: "rides",
      question: "How do I book a ride?",
      answer:
        "To book a ride, open the app and enter your pickup location and destination. You'll see available ride options with prices. Select your preferred option and tap 'Book Now'. You can track your driver in real-time once the ride is confirmed.",
    },
    {
      category: "rides",
      question: "Can I schedule a ride in advance?",
      answer:
        "Yes, you can schedule rides up to 7 days in advance. Simply select the 'Schedule' option when booking and choose your preferred date and time. You'll receive a confirmation and reminder before your scheduled pickup.",
    },
    {
      category: "drivers",
      question: "How do I become a driver?",
      answer:
        "To become a driver, you need to sign up through our app or website, submit required documentation (valid driver's license, vehicle registration, insurance), pass a background check, and complete our onboarding process. The entire process typically takes 3-5 business days.",
    },
    {
      category: "drivers",
      question: "How do driver payments work?",
      answer:
        "Drivers are paid weekly for all completed rides. Earnings include base fares, distance and time rates, plus any tips from passengers. Payments are automatically deposited to your linked bank account every Monday for the previous week's rides.",
    },
    {
      category: "security",
      question: "What safety features are available during rides?",
      answer:
        "Our app includes several safety features: share your trip details with trusted contacts, an emergency assistance button, driver and vehicle verification, and post-ride feedback. All rides are GPS-tracked and we have a 24/7 safety response team.",
    },
  ];

  const popularArticles = [
    {
      id: 1,
      title: "Getting Started with TripShare",
      category: "basics",
      excerpt: "Learn how to set up your account and book your first ride.",
      readTime: "5 min read",
      content: `
        <h2>Getting Started with TripShare</h2>
        <p>Welcome to TripShare! This guide will help you set up your account and book your first ride in just a few simple steps.</p>
        
        <h3>Creating Your Account</h3>
        <p>To get started with TripShare, download our app from the App Store or Google Play Store. Once installed, open the app and tap "Sign Up" to create a new account.</p>
        <p>You can sign up using your email address, or connect with your Google or Facebook account for faster registration. You'll need to verify your phone number for security purposes.</p>
        
        <h3>Setting Up Your Profile</h3>
        <p>After creating your account, complete your profile by adding your name, profile picture, and payment method. Adding a payment method is required before booking your first ride.</p>
        
        <h3>Booking Your First Ride</h3>
        <p>To book a ride:</p>
        <ol>
          <li>Open the TripShare app</li>
          <li>Enter your destination in the "Where to?" field</li>
          <li>Confirm your pickup location or adjust it as needed</li>
          <li>Choose your ride type (economy, comfort, or premium)</li>
          <li>Tap "Book Ride" to confirm</li>
        </ol>
        
        <p>Once your ride is confirmed, you'll see your driver's information, vehicle details, and estimated arrival time. You can track your driver in real-time on the map.</p>
        
        <h3>After Your Ride</h3>
        <p>When your ride is complete, you'll be prompted to rate your driver and leave a tip if you wish. Your payment will be processed automatically using your selected payment method.</p>
        
        <p>That's it! You've successfully completed your first TripShare ride. If you have any questions or need assistance, our support team is available 24/7 through the app.</p>
      `,
    },
    {
      id: 2,
      title: "Understanding Ride Pricing",
      category: "billing",
      excerpt:
        "Learn about our pricing structure, surge pricing, and how to estimate fares.",
      readTime: "4 min read",
      content: `
        <h2>Understanding Ride Pricing</h2>
        <p>TripShare uses a transparent pricing model to calculate your fare. This article explains how our pricing works and what factors affect your ride cost.</p>
        
        <h3>Base Fare Components</h3>
        <p>Every TripShare ride fare consists of:</p>
        <ul>
          <li><strong>Base Rate:</strong> A fixed amount that starts the fare</li>
          <li><strong>Time Rate:</strong> Cost per minute of the ride</li>
          <li><strong>Distance Rate:</strong> Cost per mile/kilometer traveled</li>
          <li><strong>Booking Fee:</strong> A small fee that helps support our platform operations</li>
        </ul>
        
        <h3>Surge Pricing</h3>
        <p>During periods of high demand, surge pricing may apply. This happens when there are more ride requests than available drivers in a specific area. The app will notify you if surge pricing is in effect before you confirm your ride.</p>
        
        <h3>Estimating Your Fare</h3>
        <p>Before confirming a ride, the app shows you an upfront price estimate. This estimate is based on the expected route, estimated time, and current demand. The final fare may differ slightly if your route changes or if the ride takes longer than expected.</p>
        
        <h3>Additional Charges</h3>
        <p>Additional charges may apply for:</p>
        <ul>
          <li>Waiting time (if the driver waits more than 2 minutes)</li>
          <li>Tolls or airport fees</li>
          <li>Cleaning fees (if necessary)</li>
          <li>Cancellation fees (if you cancel after a driver has been assigned)</li>
        </ul>
        
        <h3>Tipping</h3>
        <p>Tipping is optional but appreciated by drivers. You can add a tip after your ride is completed, and 100% of tips go directly to your driver.</p>
        
        <p>For any questions about a specific fare, you can review your ride receipt in the app or contact our support team for assistance.</p>
      `,
    },
    {
      id: 3,
      title: "Safety Features and Guidelines",
      category: "security",
      excerpt:
        "Discover the safety features available and best practices for secure rides.",
      readTime: "6 min read",
      content: `
        <h2>Safety Features and Guidelines</h2>
        <p>At TripShare, your safety is our top priority. We've implemented numerous features and protocols to ensure every ride is safe and secure.</p>
        
        <h3>In-App Safety Features</h3>
        <p>Our app includes several safety features designed to protect both riders and drivers:</p>
        <ul>
          <li><strong>Trip Sharing:</strong> Share your trip details and real-time location with trusted contacts</li>
          <li><strong>Emergency Assistance:</strong> Access emergency services directly from the app during a ride</li>
          <li><strong>Driver Verification:</strong> All drivers undergo background checks and identity verification</li>
          <li><strong>Anonymous Communication:</strong> Contact your driver without sharing your personal phone number</li>
          <li><strong>GPS Tracking:</strong> All rides are tracked from start to finish</li>
        </ul>
        
        <h3>Before Your Ride</h3>
        <p>Follow these safety guidelines before getting in the vehicle:</p>
        <ul>
          <li>Verify the driver's name, photo, and vehicle details match what's shown in the app</li>
          <li>Ask the driver to confirm your name before entering the vehicle</li>
          <li>If possible, request pickup in well-lit, public locations</li>
          <li>Check that child safety seats are properly installed if traveling with children</li>
        </ul>
        
        <h3>During Your Ride</h3>
        <p>Stay safe during your journey by:</p>
        <ul>
          <li>Wearing your seatbelt at all times</li>
          <li>Monitoring your route on the app to ensure you're heading in the right direction</li>
          <li>Keeping personal belongings secure and within sight</li>
          <li>Using the in-app emergency button if you feel unsafe</li>
        </ul>
        
        <h3>After Your Ride</h3>
        <p>After completing your trip:</p>
        <ul>
          <li>Check that you have all your belongings before exiting the vehicle</li>
          <li>Provide honest feedback about your experience</li>
          <li>Report any safety concerns immediately through the app</li>
        </ul>
        
        <h3>24/7 Support</h3>
        <p>Our safety team is available 24/7 to address any concerns. If you experience any issues during or after a ride, please contact us immediately through the app or call our emergency hotline.</p>
        
        <p>By following these guidelines and utilizing our safety features, you can enjoy peace of mind during every TripShare ride.</p>
      `,
    },
    {
      id: 4,
      title: "Becoming a TripShare Driver",
      category: "drivers",
      excerpt:
        "Learn about driver requirements, the application process, and earning potential.",
      readTime: "7 min read",
      content: `
        <h2>Becoming a TripShare Driver</h2>
        <p>Interested in earning money as a TripShare driver? This guide covers everything you need to know about joining our driver community.</p>
        
        <h3>Driver Requirements</h3>
        <p>To become a TripShare driver, you must meet these basic requirements:</p>
        <ul>
          <li>Be at least 21 years old</li>
          <li>Have a valid driver's license</li>
          <li>Have at least one year of driving experience</li>
          <li>Pass a background check</li>
          <li>Own or have access to an eligible vehicle</li>
          <li>Have a smartphone compatible with our driver app</li>
        </ul>
        
        <h3>Vehicle Requirements</h3>
        <p>Your vehicle must meet these criteria:</p>
        <ul>
          <li>4-door sedan, SUV, or minivan</li>
          <li>Model year 2008 or newer (varies by city)</li>
          <li>Good condition with no cosmetic damage</li>
          <li>Pass a vehicle inspection</li>
          <li>Current registration and insurance</li>
          <li>No commercial branding</li>
        </ul>
        
        <h3>Application Process</h3>
        <p>The application process typically takes 3-5 business days and includes:</p>
        <ol>
          <li>Sign up online or through the TripShare Driver app</li>
          <li>Submit required documentation (driver's license, vehicle registration, insurance)</li>
          <li>Consent to a background check</li>
          <li>Complete a vehicle inspection</li>
          <li>Attend a brief online orientation</li>
          <li>Set up your driver profile and payment information</li>
        </ol>
        
        <h3>Earning Potential</h3>
        <p>Your earnings as a TripShare driver depend on several factors:</p>
        <ul>
          <li>Number of hours you drive</li>
          <li>Your city and local demand</li>
          <li>Time of day (peak hours typically offer higher earnings)</li>
          <li>Type of vehicle you drive</li>
          <li>Tips from passengers</li>
        </ul>
        
        <p>Drivers are paid weekly, with earnings automatically deposited to your linked bank account. You can track your earnings in real-time through the driver app.</p>
        
        <h3>Driver Support</h3>
        <p>As a TripShare driver, you'll have access to:</p>
        <ul>
          <li>24/7 driver support</li>
          <li>In-app navigation</li>
          <li>Insurance coverage while driving</li>
          <li>Driver community forums</li>
          <li>Regular promotions and incentives</li>
        </ul>
        
        <p>Ready to get started? Download the TripShare Driver app today and begin the application process!</p>
      `,
    },
    {
      id: 5,
      title: "Managing Your TripShare Account",
      category: "account",
      excerpt:
        "Tips for updating your profile, managing payment methods, and account settings.",
      readTime: "3 min read",
      content: `
        <h2>Managing Your TripShare Account</h2>
        <p>Learn how to manage your TripShare account settings, update your profile, and handle payment methods.</p>
        
        <h3>Updating Your Profile</h3>
        <p>To update your profile information:</p>
        <ol>
          <li>Open the TripShare app and tap on your profile icon</li>
          <li>Select "Edit Profile"</li>
          <li>Update your name, email, phone number, or profile picture</li>
          <li>Tap "Save" to confirm your changes</li>
        </ol>
        
        <h3>Managing Payment Methods</h3>
        <p>To add, remove, or update payment methods:</p>
        <ol>
          <li>Go to your profile and select "Payment"</li>
          <li>To add a new payment method, tap "Add Payment Method" and follow the prompts</li>
          <li>To set a default payment method, select it and tap "Set as Default"</li>
          <li>To remove a payment method, swipe left on it and tap "Delete"</li>
        </ol>
        
        <h3>Viewing Ride History</h3>
        <p>To access your ride history:</p>
        <ol>
          <li>Tap on "Your Trips" in the app menu</li>
          <li>Browse your past rides chronologically</li>
          <li>Tap on any ride to view details, receipt, or report an issue</li>
        </ol>
        
        <h3>Account Security</h3>
        <p>To enhance your account security:</p>
        <ol>
          <li>Go to "Account Settings" > "Security"</li>
          <li>Enable two-factor authentication for additional protection</li>
          <li>Update your password regularly (we recommend every 3 months)</li>
          <li>Review connected apps and devices, and remove any you no longer use</li>
        </ol>
        
        <h3>Notification Preferences</h3>
        <p>To manage your notification settings:</p>
        <ol>
          <li>Go to "Account Settings" > "Notifications"</li>
          <li>Toggle on/off notifications for ride updates, promotions, and account alerts</li>
          <li>Customize how you receive notifications (push, email, SMS)</li>
        </ol>
        
        <h3>Deleting Your Account</h3>
        <p>If you wish to delete your account:</p>
        <ol>
          <li>Go to "Account Settings" > "Privacy"</li>
          <li>Select "Delete Account"</li>
          <li>Follow the prompts to confirm deletion</li>
          <li>Note that account deletion is permanent and cannot be undone</li>
        </ol>
        
        <p>For any additional help managing your account, contact our support team through the app or website.</p>
      `,
    },
    {
      id: 6,
      title: "Troubleshooting Common App Issues",
      category: "technical",
      excerpt:
        "Solutions for common technical problems with the TripShare app.",
      readTime: "5 min read",
      content: `
        <h2>Troubleshooting Common App Issues</h2>
        <p>Experiencing problems with the TripShare app? Here are solutions to the most common technical issues.</p>
        
        <h3>App Crashing or Freezing</h3>
        <p>If the app crashes or freezes:</p>
        <ol>
          <li>Force close the app and restart it</li>
          <li>Ensure your app is updated to the latest version</li>
          <li>Restart your device</li>
          <li>Check your internet connection</li>
          <li>If problems persist, try uninstalling and reinstalling the app</li>
        </ol>
        
        <h3>Location Services Issues</h3>
        <p>If the app can't detect your location:</p>
        <ol>
          <li>Verify location permissions are enabled for TripShare in your device settings</li>
          <li>Turn GPS on and ensure it's set to "High Accuracy" mode</li>
          <li>Try moving to an area with better GPS signal</li>
          <li>Restart your device's location services</li>
        </ol>
        
        <h3>Payment Problems</h3>
        <p>For issues with payments:</p>
        <ol>
          <li>Verify your payment method is valid and hasn't expired</li>
          <li>Check that your card has sufficient funds</li>
          <li>Try adding an alternative payment method</li>
          <li>Contact your bank to ensure they're not blocking the transaction</li>
        </ol>
        
        <h3>Connectivity Issues</h3>
        <p>If you're having trouble connecting to the app:</p>
        <ol>
          <li>Check your internet connection (Wi-Fi or mobile data)</li>
          <li>Switch between Wi-Fi and mobile data to see if one works better</li>
          <li>Try enabling airplane mode for 30 seconds, then turning it off</li>
          <li>Clear the app cache in your device settings</li>
        </ol>
        
        <h3>Driver Matching Problems</h3>
        <p>If you can't get matched with a driver:</p>
        <ol>
          <li>Verify you're in a service area (check the coverage map in the app)</li>
          <li>Try requesting at a different time (peak hours may have longer wait times)</li>
          <li>Check if your account has any restrictions or outstanding issues</li>
          <li>Try a different pickup location nearby</li>
        </ol>
        
        <h3>Notification Issues</h3>
        <p>If you're not receiving notifications:</p>
        <ol>
          <li>Check notification permissions for TripShare in your device settings</li>
          <li>Verify you haven't muted notifications in the app settings</li>
          <li>Ensure your device is not in Do Not Disturb mode</li>
          <li>Update to the latest version of the app</li>
        </ol>
        
        <p>If you've tried these solutions and are still experiencing issues, please contact our support team with details about your device model, operating system version, and the specific problem you're encountering.</p>
      `,
    },
  ];

  const videoTutorials = [
    {
      id: 1,
      title: "How to Book Your First Ride",
      duration: "2:45",
      thumbnail: "/placeholder.svg?height=120&width=200",
      url: "#",
    },
    {
      id: 2,
      title: "Setting Up Payment Methods",
      duration: "3:12",
      thumbnail: "/placeholder.svg?height=120&width=200",
      url: "#",
    },
    {
      id: 3,
      title: "Using Scheduled Rides",
      duration: "4:05",
      thumbnail: "/placeholder.svg?height=120&width=200",
      url: "#",
    },
  ];

  const supportCategories = [
    { id: "all", name: "All Topics" },
    { id: "account", name: "Account" },
    { id: "billing", name: "Billing & Payments" },
    { id: "rides", name: "Rides & Booking" },
    { id: "drivers", name: "Drivers" },
    { id: "security", name: "Safety & Security" },
    { id: "technical", name: "Technical Support" },
  ];

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const searchedFaqs = searchQuery
    ? filteredFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredFaqs;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    // Scroll to top of article
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-green-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Box */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 p-4 bg-white border border-gray-200 rounded-xl shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       transition-all duration-200"
            />
          </div>
        </div>

        {/* Quick Help Categories */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="#faq-section"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow hover:border-green-200"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">FAQs</h3>
              <p className="text-sm text-gray-500 mt-1">Common questions</p>
            </a>

            <a
              href="#contact-section"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow hover:border-green-200"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Contact Us</h3>
              <p className="text-sm text-gray-500 mt-1">Get support</p>
            </a>

            <a
              href="#articles-section"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow hover:border-green-200"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Articles</h3>
              <p className="text-sm text-gray-500 mt-1">Detailed guides</p>
            </a>

            <a
              href="#videos-section"
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow hover:border-green-200"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-medium text-gray-900">Videos</h3>
              <p className="text-sm text-gray-500 mt-1">Visual tutorials</p>
            </a>
          </div>
        </div>

        {/* Knowledge Base Articles or Selected Article */}
        {selectedArticle ? (
          <section
            id="article-detail"
            className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
          >
            <button
              onClick={handleBackToArticles}
              className="flex items-center text-green-600 hover:text-green-700 mb-6 font-medium"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Articles
            </button>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedArticle.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {selectedArticle.readTime}
                </span>
                <span className="mx-3">•</span>
                <span className="capitalize">{selectedArticle.category}</span>
              </div>
            </div>

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            ></div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-700 mb-4">Was this article helpful?</p>
              <div className="flex space-x-4">
                <button className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Yes, it helped
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  No, I need more help
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section
            id="articles-section"
            className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
              Knowledge Base
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularArticles.slice(0, 4).map((article) => (
                <div
                  key={article.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-green-200 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleArticleSelect(article)}
                >
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium mb-3 capitalize">
                    {article.category}
                  </span>
                  <h3 className="font-medium text-lg text-gray-900 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {article.readTime}
                    </span>
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      Read more
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/knowledge-base")}
                className="inline-flex items-center px-4 py-2 text-green-600 font-medium hover:text-green-700"
              >
                View all articles
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </section>
        )}

        {/* Video Tutorials Section */}
        <section
          id="videos-section"
          className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Video className="h-6 w-6 text-amber-600 mr-3" />
            Video Tutorials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoTutorials.map((video) => (
              <div key={video.id} className="group">
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-gray-900 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900">{video.title}</h3>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="inline-flex items-center px-4 py-2 text-amber-600 font-medium hover:text-amber-700">
              View all videos
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          id="faq-section"
          className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm">
              ?
            </span>
            Frequently Asked Questions
          </h2>

          {/* FAQ Categories */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {supportCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeCategory === category.id
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {searchedFaqs.length > 0 ? (
            <div className="space-y-4">
              {searchedFaqs.map((faq, index) => (
                <div
                  key={index}
                  className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                    activeQuestion === index
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  >
                    <span className="font-medium text-gray-800">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                        activeQuestion === index
                          ? "transform rotate-180 text-green-600"
                          : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ${
                      activeQuestion === index ? "max-h-60 pb-4" : "max-h-0"
                    }`}
                  >
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No results found
              </h3>
              <p className="text-gray-600">
                We couldn't find any FAQs matching your search. Try different
                keywords or browse by category.
              </p>
            </div>
          )}
        </section>

        {/* Contact Support Section */}
        <section
          id="contact-section"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Contact Support
          </h2>
          <p className="text-gray-600 mb-8">
            Can't find what you're looking for? Our support team is here to help
            you.
          </p>

          {showSuccessMessage ? (
            <div
              id="success-message"
              className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for contacting us. Our support team will get back to
                you within 24 hours.
              </p>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className={`w-full p-3 bg-gray-50 border ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className={`w-full p-3 bg-gray-50 border ${
                      formErrors.lastName ? "border-red-500" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@example.com"
                  className={`w-full p-3 bg-gray-50 border ${
                    formErrors.email ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subject *
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="How can we help you?"
                  className={`w-full p-3 bg-gray-50 border ${
                    formErrors.subject ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                />
                {formErrors.subject && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  className={`w-full p-3 bg-gray-50 border ${
                    formErrors.message ? "border-red-500" : "border-gray-200"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                />
                {formErrors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.message}
                  </p>
                )}
              </div>

              {/* File attachment */}
              <div className="space-y-2">
                <label
                  htmlFor="file-upload"
                  className="block text-sm font-medium text-gray-700"
                >
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
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                    {formData.file && (
                      <p className="text-sm text-green-600 mt-2">
                        {formData.file.name} (
                        {Math.round(formData.file.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                </div>
                {formErrors.file && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-green-500 text-white 
                       font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Additional Help Options */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Get help via email within 24 hours
            </p>
            <a
              href="mailto:support@tripshare.com"
              className="text-blue-600 hover:underline font-medium"
            >
              support@tripshare.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with our support team in real-time
            </p>
            <button className="text-purple-600 hover:underline font-medium">
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">
              Call us for immediate assistance
            </p>
            <a
              href="tel:+18001234567"
              className="text-amber-600 hover:underline font-medium"
            >
              +1 (800) 123-4567
            </a>
          </div>
        </section>

        {/* Community Support */}
        <section className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Join Our Community
              </h2>
              <p className="text-gray-600 mb-4">
                Connect with other TripShare users, share tips, and get help
                from our community experts.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Community Forum
                </a>
                <a
                  href="#"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Driver Community
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/3">
              <img
                src="/placeholder.svg?height=200&width=300"
                alt="Community"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default HelpCenter;
