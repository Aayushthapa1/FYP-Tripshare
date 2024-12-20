import React from 'react';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  Cloud, 
  LineChart,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8 text-indigo-500" />,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with our optimized infrastructure.'
  },
  {
    icon: <Shield className="w-8 h-8 text-indigo-500" />,
    title: 'Enterprise Security',
    description: 'Bank-grade security protocols keeping your data safe 24/7.'
  },
  {
    icon: <Smartphone className="w-8 h-8 text-indigo-500" />,
    title: 'Mobile First',
    description: 'Seamless experience across all devices with responsive design.'
  },
  {
    icon: <Globe className="w-8 h-8 text-indigo-500" />,
    title: 'Global Scale',
    description: 'Deploy worldwide with our distributed network infrastructure.'
  },
  {
    icon: <Cloud className="w-8 h-8 text-indigo-500" />,
    title: 'Cloud Native',
    description: 'Built on modern cloud architecture for ultimate reliability.'
  },
  {
    icon: <LineChart className="w-8 h-8 text-indigo-500" />,
    title: 'Analytics',
    description: 'Comprehensive insights and metrics at your fingertips.'
  }
];

function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Powerful Features for</span>
                  <span className="block text-indigo-600">Modern Teams</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Discover why thousands of teams choose our platform for their daily operations.
                  Built with cutting-edge technology for the modern workplace.
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out blur"></div>
              <div className="relative bg-white p-6 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-300">
                Get started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;
