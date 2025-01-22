import React from 'react';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  Cloud, 
  LineChart
} from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-8 h-8 text-[#70F17D]" />,
    title: 'Lightning Fast',
    description: 'Experience blazing-fast performance with our optimized infrastructure.'
  },
  {
    icon: <Shield className="w-8 h-8 text-[#70F17D]" />,
    title: 'Enterprise Security',
    description: 'Bank-grade security protocols keeping your data safe 24/7.'
  },
  {
    icon: <Smartphone className="w-8 h-8 text-[#70F17D]" />,
    title: 'Mobile First',
    description: 'Seamless experience across all devices with responsive design.'
  },
  {
    icon: <Globe className="w-8 h-8 text-[#70F17D]" />,
    title: 'Global Scale',
    description: 'Deploy worldwide with our distributed network infrastructure.'
  },
  {
    icon: <Cloud className="w-8 h-8 text-[#70F17D]" />,
    title: 'Cloud Native',
    description: 'Built on modern cloud architecture for ultimate reliability.'
  },
  {
    icon: <LineChart className="w-8 h-8 text-[#70F17D]" />,
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
                  <span className="block text-[#70F17D]">Modern Teams</span>
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
              className="relative group bg-white p-6 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <div className="relative bg-white p-6 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
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
    </div>
  );
}

export default Features;