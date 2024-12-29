import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const PopularRoutes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const routes = [
    {
      id: 1,
      from: "Kathmandu",
      to: "Pokhara",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70", // Scenic mountains
      description: "Travel from the bustling capital to the serene lakeside city of Pokhara, known for its breathtaking Annapurna views.",
      subRoutes: [
        { from: "Kathmandu - Tribhuvan Airport", price: "NPR 2000", description: "Direct flights from Kathmandu to Pokhara." },
        { from: "Kurintar", price: "NPR 850", description: "A stopover en route to Pokhara, famous for the Manakamana Temple." }
      ]
    },
    {
      id: 2,
      from: "Pokhara",
      to: "Kathmandu",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0", // Annapurna range
      description: "Return journey to the capital with scenic mountain views.",
      subRoutes: [
        { from: "Pokhara Bus Park", price: "NPR 1000", description: "Affordable bus services available daily." },
        { from: "Muglin", price: "NPR 600", description: "Midway refreshment stop." }
      ]
    },
    {
      id: 3,
      from: "Biratnagar",
      to: "Itahari",
      price: "NPR 350",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce", // Green landscapes
      description: "Short ride connecting major eastern cities.",
      subRoutes: [
        { from: "Biratnagar Airport", price: "NPR 500", description: "Easy access for travelers flying into Biratnagar." },
        { from: "Duhabi", price: "NPR 150", description: "Small town between Biratnagar and Itahari." }
      ]
    },
    {
      id: 4,
      from: "Itahari",
      to: "Dharan",
      price: "NPR 200",
      image: "https://images.unsplash.com/photo-1585829366114-6d67d3014d68", // Hills and forests
      description: "Gateway to the beautiful hill town of Dharan.",
      subRoutes: [
        { from: "Itahari Chowk", price: "NPR 100", description: "Local buses are available frequently." },
        { from: "BP Koirala Institute", price: "NPR 150", description: "En route to the medical hub of eastern Nepal." }
      ]
    },
    {
      id: 5,
      from: "Dharan",
      to: "Bhedetar",
      price: "NPR 500",
      image: "https://images.unsplash.com/photo-1591439147235-ec38e2f38e0f", // Serene hill station
      description: "A scenic drive to the cool hilltop of Bhedetar.",
      subRoutes: [
        { from: "Dharan Clock Tower", price: "NPR 300", description: "Starting point in Dharan city." },
        { from: "Namaste Falls", price: "NPR 400", description: "A quick stop to visit the waterfall en route." }
      ]
    },
    {
      id: 6,
      from: "Birtamod",
      to: "Ilam",
      price: "NPR 600",
      image: "https://images.unsplash.com/photo-1580658438438-94a3d8a7a2da", // Tea gardens
      description: "Journey through lush tea gardens to Ilam.",
      subRoutes: [
        { from: "Charali", price: "NPR 300", description: "Tea estate views begin here." },
        { from: "Kanyam", price: "NPR 500", description: "Popular tourist stop with panoramic tea garden views." }
      ]
    },
    {
      id: 7,
      from: "Ilam",
      to: "Bhadrapur",
      price: "NPR 650",
      image: "https://images.unsplash.com/photo-1565557620330-e9dddc870192", // Rural Nepal
      description: "Return trip to the southern lowlands from Ilam.",
      subRoutes: [
        { from: "Fikkal", price: "NPR 350", description: "Small town with local food options." },
        { from: "Kakarvitta", price: "NPR 500", description: "Border crossing point to India." }
      ]
    },
    {
      id: 8,
      from: "Kathmandu",
      to: "Chitwan",
      price: "NPR 800",
      image: "https://images.unsplash.com/photo-1587148811906-7a2d1fa2eb08", // Chitwan wildlife
      description: "Experience Nepal's wildlife in Chitwan National Park.",
      subRoutes: [
        { from: "Thamel", price: "NPR 700", description: "Pick-up point for tourist buses." },
        { from: "Sauraha", price: "NPR 1000", description: "Entry point to the National Park." }
      ]
    },
    {
      id: 9,
      from: "Pokhara",
      to: "Lumbini",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1587282321140-d3c0d97e6af8", // Peace Pagoda
      description: "Visit the birthplace of Lord Buddha.",
      subRoutes: [
        { from: "Butwal", price: "NPR 800", description: "Major stop en route to Lumbini." },
        { from: "Devdaha", price: "NPR 1000", description: "Historical site near Lumbini." }
      ]
    },
    {
      id: 10,
      from: "Lumbini",
      to: "Kathmandu",
      price: "NPR 2000",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", // Cultural heritage
      description: "Return journey from the peaceful plains to the bustling capital.",
      subRoutes: [
        { from: "Bharatpur", price: "NPR 1500", description: "Midway stop for refreshments." },
        { from: "Kalanki", price: "NPR 1800", description: "Entry to Kathmandu Valley." }
      ]
    }
  ];
  
  
  const slideLeft = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? routes.length - 1 : prevIndex - 1
    );
  };

  const slideRight = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === routes.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
        Our best selling bus routes
      </h2>

      <div className="relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {routes.map((route) => (
              <div 
                key={route.id}
                className="w-full min-w-full md:min-w-[50%] lg:min-w-[33.333%] px-4"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 md:h-56 lg:h-64 overflow-hidden">
                    <img
                      src={route.image}
                      alt={`${route.from} to ${route.to}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {route.from} → {route.to}
                      </h3>
                      <button className="p-2 rounded-full bg-blue-100/50 text-blue-500 hover:bg-blue-100 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-2xl font-bold text-gray-800">
                          £{route.price}
                        </p>
                      </div>

                      {route.subRoutes && (
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700">
                            To London from
                          </p>
                          {route.subRoutes.map((subRoute, index) => (
                            <div 
                              key={index}
                              className="flex justify-between items-center"
                            >
                              <span className="text-gray-600">{subRoute.from}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">£{subRoute.price}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={slideLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all z-10"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <button
          onClick={slideRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all z-10"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default PopularRoutes;