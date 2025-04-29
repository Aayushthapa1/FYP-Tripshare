import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ role, children }) {
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const location = useLocation();
  const userRole = user?.role || "guest";

  console.log("CheckAuth rendering:", {
    isAuthenticated,
    userRole,
    expectedRole: role,
    path: location.pathname,
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // Generate appropriate error message based on the access violation
  const getAccessDeniedMessage = (requiredRole, currentRole, path) => {
    // For role array (multiple roles accepted)
    if (Array.isArray(requiredRole)) {
      const rolesList = requiredRole.join(", ");
      return {
        title: "Access Restricted",
        message: `This area requires ${rolesList} privileges. Your current role (${currentRole}) doesn't have access to this section.`,
        suggestion:
          "Please contact support if you believe this is an error or need access to this feature.",
      };
    }

    // For admin paths
    if (path.startsWith("/admin") || requiredRole === "Admin") {
      return {
        title: "Administrative Area Restricted",
        message: "This section is reserved for administrators only.",
        suggestion:
          "If you need to perform administrative actions, please contact your system administrator.",
      };
    }

    // For driver paths
    if (path.startsWith("/driver") || requiredRole === "driver") {
      return {
        title: "Driver Access Only",
        message: "This section is only accessible to registered drivers.",
        suggestion:
          "To access driver features, you need to register as a driver and complete the verification process.",
      };
    }

    // For user paths
    if (path.startsWith("/user") || requiredRole === "user") {
      return {
        title: "User Area Restricted",
        message: "This section is designed for passenger accounts only.",
        suggestion:
          "If you're currently logged in as a driver, please use the driver-specific features instead.",
      };
    }

    // Default message
    return {
      title: "Access Denied",
      message: `You don't have the required permissions to access this area. This section requires ${requiredRole} privileges.`,
      suggestion:
        "Please navigate to an area that matches your current role or contact support for assistance.",
    };
  };

  // Role-based access control
  if (role) {
    // If role is an array, check if the user's role is included
    if (Array.isArray(role)) {
      if (!role.includes(userRole)) {
        const errorInfo = getAccessDeniedMessage(
          role,
          userRole,
          location.pathname
        );
        console.log(
          `User role ${userRole} not in allowed roles: ${role.join(
            ", "
          )}, redirecting`
        );
        return <Navigate to="/unauth-page" state={{ error: errorInfo }} />;
      }
    }
    // If role is a string, check if it matches the user's role
    else if (role !== userRole) {
      const errorInfo = getAccessDeniedMessage(
        role,
        userRole,
        location.pathname
      );
      console.log(
        `User role ${userRole} doesn't match required role ${role}, redirecting`
      );
      return <Navigate to="/unauth-page" state={{ error: errorInfo }} />;
    }
  }

  // Special case handling for specific paths
  if (location.pathname.startsWith("/admin") && userRole !== "Admin") {
    const errorInfo = getAccessDeniedMessage(
      "Admin",
      userRole,
      location.pathname
    );
    console.log("Non-admin trying to access admin route, redirecting");
    return <Navigate to="/unauth-page" state={{ error: errorInfo }} />;
  }

  if (location.pathname.startsWith("/driver") && userRole !== "driver") {
    const errorInfo = getAccessDeniedMessage(
      "driver",
      userRole,
      location.pathname
    );
    console.log("Non-driver trying to access driver route, redirecting");
    return <Navigate to="/unauth-page" state={{ error: errorInfo }} />;
  }

  if (location.pathname.startsWith("/user") && userRole !== "user") {
    const errorInfo = getAccessDeniedMessage(
      "user",
      userRole,
      location.pathname
    );
    console.log("Non-user trying to access user route, redirecting");
    return <Navigate to="/unauth-page" state={{ error: errorInfo }} />;
  }

  // Allow access if all checks passed
  console.log("Access granted to:", location.pathname);
  return children;
}

export default CheckAuth;
