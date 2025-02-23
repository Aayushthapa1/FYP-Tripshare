import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ role, children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  

  if (role === "Admin") {
    // Admin trying to access user pages
    if (user?.role === "Admin" && !location.pathname.includes("/admin")) {
      return <Navigate to="/login" />;
    }
  }
  // Redirect non-admin users from admin routes
  if (role === "Admin" && user?.role !== "Admin") {
    return <Navigate to="/unauth-page" />;
  }

  // Allow access if authenticated and role matches
  return children;
}

export default CheckAuth;