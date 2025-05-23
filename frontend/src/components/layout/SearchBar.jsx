import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { searchTrips } from "../Slices/tripSlice"; // Update this path if needed

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Dispatch the search action with the appropriate search parameters
      dispatch(
        searchTrips({
          departureLocation: searchQuery,
          destinationLocation: searchQuery,
        })
      );

      // Navigate to trips page instead of search page
      navigate(`/trips?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="relative hidden md:block">
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where to?"
            className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
      </form>
    </div>
  );
}
