"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
} from "lucide-react";

const PopularRoutes = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Handle responsive carousel display
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setVisibleItems(3);
      } else if (window.innerWidth >= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      slideRight();
    } else if (isRightSwipe) {
      slideLeft();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const routes = [
    {
      id: 1,
      from: "Kathmandu",
      to: "Pokhara",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70", // Scenic mountains
      description:
        "Travel from the bustling capital to the serene lakeside city of Pokhara, known for its breathtaking Annapurna views.",
      duration: "6-7 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Kathmandu Airport",
          price: "NPR 2000",
          description: "Direct flights from Kathmandu to Pokhara.",
        },
        {
          from: "Kurintar",
          price: "NPR 850",
          description:
            "A stopover en route to Pokhara, famous for the Manakamana Temple.",
        },
      ],
    },
    {
      id: 2,
      from: "Pokhara",
      to: "Kathmandu",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0", // Annapurna range
      description: "Return journey to the capital with scenic mountain views.",
      duration: "6-7 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Pokhara Bus Park",
          price: "NPR 1000",
          description: "Affordable bus services available daily.",
        },
        {
          from: "Muglin",
          price: "NPR 600",
          description: "Midway refreshment stop.",
        },
      ],
    },
    {
      id: 3,
      from: "Biratnagar",
      to: "Itahari",
      price: "NPR 350",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce", // Green landscapes
      description: "Short ride connecting major eastern cities.",
      duration: "1 hour",
      frequency: "Hourly",
      subRoutes: [
        {
          from: "Biratnagar Airport",
          price: "NPR 500",
          description: "Easy access for travelers flying into Biratnagar.",
        },
        {
          from: "Duhabi",
          price: "NPR 150",
          description: "Small town between Biratnagar and Itahari.",
        },
      ],
    },
    {
      id: 4,
      from: "Itahari",
      to: "Dharan",
      price: "NPR 200",
      image: "https://images.unsplash.com/photo-1585829366114-6d67d3014d68", // Hills and forests
      description: "Gateway to the beautiful hill town of Dharan.",
      duration: "30 minutes",
      frequency: "Every 15 min",
      subRoutes: [
        {
          from: "Itahari Chowk",
          price: "NPR 100",
          description: "Local buses are available frequently.",
        },
        {
          from: "BP Koirala Institute",
          price: "NPR 150",
          description: "En route to the medical hub of eastern Nepal.",
        },
      ],
    },
    {
      id: 5,
      from: "Dharan",
      to: "Bhedetar",
      price: "NPR 500",
      image: "https://images.unsplash.com/photo-1591439147235-ec38e2f38e0f", // Serene hill station
      description: "A scenic drive to the cool hilltop of Bhedetar.",
      duration: "1.5 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Dharan Clock Tower",
          price: "NPR 300",
          description: "Starting point in Dharan city.",
        },
        {
          from: "Namaste Falls",
          price: "NPR 400",
          description: "A quick stop to visit the waterfall en route.",
        },
      ],
    },
    {
      id: 6,
      from: "Birtamod",
      to: "Ilam",
      price: "NPR 600",
      image: "https://images.unsplash.com/photo-1580658438438-94a3d8a7a2da", // Tea gardens
      description: "Journey through lush tea gardens to Ilam.",
      duration: "3 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Charali",
          price: "NPR 300",
          description: "Tea estate views begin here.",
        },
        {
          from: "Kanyam",
          price: "NPR 500",
          description: "Popular tourist stop with panoramic tea garden views.",
        },
      ],
    },
    {
      id: 7,
      from: "Ilam",
      to: "Bhadrapur",
      price: "NPR 650",
      image: "https://images.unsplash.com/photo-1565557620330-e9dddc870192", // Rural Nepal
      description: "Return trip to the southern lowlands from Ilam.",
      duration: "4 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Fikkal",
          price: "NPR 350",
          description: "Small town with local food options.",
        },
        {
          from: "Kakarvitta",
          price: "NPR 500",
          description: "Border crossing point to India.",
        },
      ],
    },
    {
      id: 8,
      from: "Kathmandu",
      to: "Chitwan",
      price: "NPR 800",
      image: "https://images.unsplash.com/photo-1587148811906-7a2d1fa2eb08", // Chitwan wildlife
      description: "Experience Nepal's wildlife in Chitwan National Park.",
      duration: "5 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Thamel",
          price: "NPR 700",
          description: "Pick-up point for tourist buses.",
        },
        {
          from: "Sauraha",
          price: "NPR 1000",
          description: "Entry point to the National Park.",
        },
      ],
    },
    {
      id: 9,
      from: "Pokhara",
      to: "Lumbini",
      price: "NPR 1500",
      image: "https://images.unsplash.com/photo-1587282321140-d3c0d97e6af8", // Peace Pagoda
      description: "Visit the birthplace of Lord Buddha.",
      duration: "7 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Butwal",
          price: "NPR 800",
          description: "Major stop en route to Lumbini.",
        },
        {
          from: "Devdaha",
          price: "NPR 1000",
          description: "Historical site near Lumbini.",
        },
      ],
    },
    {
      id: 10,
      from: "Lumbini",
      to: "Kathmandu",
      price: "NPR 2000",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957", // Cultural heritage
      description:
        "Return journey from the peaceful plains to the bustling capital.",
      duration: "9 hours",
      frequency: "Daily",
      subRoutes: [
        {
          from: "Bharatpur",
          price: "NPR 1500",
          description: "Midway stop for refreshments.",
        },
        {
          from: "Kalanki",
          price: "NPR 1800",
          description: "Entry to Kathmandu Valley.",
        },
      ],
    },
  ];

  const slideLeft = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      return newIndex < 0 ? routes.length - visibleItems : newIndex;
    });
  };

  const slideRight = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      return newIndex > routes.length - visibleItems ? 0 : newIndex;
    });
  };

  // Calculate how many dots to show
  const totalSlides = Math.ceil(routes.length / visibleItems);
  const currentSlide = Math.floor(currentIndex / visibleItems);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popular Bus Routes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the most traveled routes across Nepal with comfortable
            buses and affordable prices
          </p>
        </div>

        <div className="relative">
          {/* Carousel Container */}
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / visibleItems
                }%)`,
                width: `${(routes.length / visibleItems) * 100}%`,
              }}
            >
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="px-3 md:px-4"
                  style={{ width: `${(100 / routes.length) * visibleItems}%` }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 h-full flex flex-col border border-gray-100">
                    {/* Image with gradient overlay */}
                    <div className="relative h-52 sm:h-56 md:h-60 overflow-hidden">
                      <img
                        src={`${route.image}?auto=format&fit=crop&w=800&q=80`}
                        alt={`${route.from} to ${route.to}`}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                      {/* Route badge */}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                        Popular Route
                      </div>

                      {/* Route info overlay */}
                      <div className="absolute bottom-0 left-0 w-full text-white p-4">
                        <div className="flex items-center mb-1">
                          <MapPin className="w-4 h-4 mr-1 text-green-400" />
                          <h3 className="text-xl font-bold">
                            {route.from} → {route.to}
                          </h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-200 space-x-3">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {route.frequency}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {route.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Starting From
                          </p>
                          <p className="text-2xl font-bold text-gray-800">
                            {route.price}
                          </p>
                        </div>
                        <button
                          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                          aria-label="View Route Details"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {route.description}
                      </p>

                      {route.subRoutes && (
                        <div className="space-y-3 mt-auto">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            Available Sub-Routes
                          </h4>
                          <div className="space-y-2">
                            {route.subRoutes.map((subRoute, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center border-b border-gray-100 py-2 group"
                              >
                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                  {subRoute.from}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">
                                    {subRoute.price}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Hidden on small screens, visible on medium and up */}
          <button
            onClick={slideLeft}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-green-500 items-center justify-center"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={slideRight}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-green-500 items-center justify-center"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * visibleItems)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-green-500 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Navigation Buttons */}
        <div className="flex justify-center mt-6 space-x-4 md:hidden">
          <button
            onClick={slideLeft}
            className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={slideRight}
            className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopularRoutes;
