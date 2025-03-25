import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ role, children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  
  console.log("CheckAuth rendering:", {
    isAuthenticated,
    userRole: user?.role,
    expectedRole: role,
    path: location.pathname
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Redirect non-admin users from admin routes
  if (role === "Admin" && user?.role !== "Admin") {
    console.log("Non-admin trying to access admin route, redirecting");
    return <Navigate to="/unauth-page" />;
  }
  
  // This was causing problems - removing this confusing condition
  // The first check above already handles non-admins trying to access admin routes

  // Allow access if authenticated and role matches
  console.log("Access granted to:", location.pathname);
  return children;
}

export default CheckAuth;