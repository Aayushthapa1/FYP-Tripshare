/**
 * Gets traffic data from Google Maps Directions API
 * @param {Object} origin - Pickup location {lat, lng}
 * @param {Object} destination - Dropoff location {lat, lng}
 * @returns {Promise} - Returns traffic condition as 'light', 'moderate', or 'heavy'
 */
export const getTrafficCondition = async (origin, destination) => {
    try {
        // Make request to Google Maps Directions API
        // Note: You need to replace YOUR_API_KEY with your actual Google Maps API key
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&departure_time=now&traffic_model=best_guess&key=AIzaSyAfVD-fFk1aa4yy4YFesrLIXhxwNHhQtxU`
        );

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error("No routes found");
        }

        // Get the first route and its legs
        const route = data.routes[0];
        const leg = route.legs[0];

        // Get duration with and without traffic
        const durationInTraffic = leg.duration_in_traffic?.value || 0;
        const normalDuration = leg.duration?.value || 0;

        // Calculate traffic ratio
        // If durationInTraffic is significantly higher than normalDuration, there's heavy traffic
        if (normalDuration === 0) return "light"; // Fallback

        const trafficRatio = durationInTraffic / normalDuration;

        // Determine traffic condition based on ratio
        if (trafficRatio > 1.5) {
            return "heavy";
        } else if (trafficRatio > 1.2) {
            return "moderate";
        } else {
            return "light";
        }
    } catch (error) {
        console.error("Error getting traffic data:", error);
        return "light"; // Default to light traffic if there's an error
    }
};

/**
 * Calculate fare with traffic-based pricing
 * @param {number} distKm - Distance in kilometers
 * @param {string} vehicleType - "Bike", "Car", or "Electric"
 * @param {string} trafficCondition - "light", "moderate", or "heavy"
 * @returns {Object} - Fare calculation details
 */
export const calculateFareWithTraffic = (distKm, vehicleType, trafficCondition = "light") => {
    let baseFare = 0;
    let ratePerKm = 0;
    
    // Set base rates by vehicle type
    switch (vehicleType) {
        case "Bike":
            baseFare = 50;
            ratePerKm = 15;
            break;
        case "Car":
            baseFare = 100;
            ratePerKm = 30;
            break;
        case "Electric":
            baseFare = 80;
            ratePerKm = 25;
            break;
        default:
            baseFare = 100;
            ratePerKm = 30;
    }
    
    // Apply traffic multiplier
    let trafficMultiplier = 1.0;
    switch (trafficCondition) {
        case "heavy":
            trafficMultiplier = 1.5; // 50% increase for heavy traffic
            break;
        case "moderate":
            trafficMultiplier = 1.2; // 20% increase for moderate traffic
            break;
        case "light":
        default:
            trafficMultiplier = 1.0; // No increase for light traffic
            break;
    }
    
    // Calculate normal fare and traffic-adjusted fare
    const normalFare = Math.round(baseFare + distKm * ratePerKm);
    const trafficAdjustedFare = Math.round(normalFare * trafficMultiplier);
    
    return {
        baseFare,
        ratePerKm,
        normalFare,
        trafficMultiplier,
        trafficAdjustedFare
    };
};

/**
 * Get human-readable description of traffic conditions
 * @param {string} trafficCondition - "light", "moderate", or "heavy"
 * @returns {string} - Human-readable description
 */
export const getTrafficDescription = (trafficCondition) => {
    switch (trafficCondition) {
        case "heavy":
            return "Heavy traffic detected. Surge pricing in effect.";
        case "moderate":
            return "Moderate traffic. Slight price increase applied.";
        case "light":
            return "Light traffic. Standard pricing applied.";
        default:
            return "Standard pricing applied.";
    }
};

/**
 * Get color for traffic condition
 * @param {string} trafficCondition - "light", "moderate", or "heavy"
 * @returns {string} - CSS color class (for Tailwind)
 */
export const getTrafficColorClass = (trafficCondition) => {
    switch (trafficCondition) {
        case "heavy":
            return "text-red-600";
        case "moderate":
            return "text-orange-500";
        case "light":
            return "text-green-600";
        default:
            return "text-green-600";
    }
};

/**
 * Get background color class for traffic condition
 * @param {string} trafficCondition - "light", "moderate", or "heavy"
 * @returns {string} - CSS background color class (for Tailwind)
 */
export const getTrafficBgClass = (trafficCondition) => {
    switch (trafficCondition) {
        case "heavy":
            return "bg-red-100";
        case "moderate":
            return "bg-orange-100";
        case "light":
            return "bg-green-100";
        default:
            return "bg-green-100";
    }
};