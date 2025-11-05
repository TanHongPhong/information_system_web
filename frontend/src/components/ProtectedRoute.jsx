import { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute - Component để bảo vệ các routes theo role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component cần render
 * @param {string|string[]} props.allowedRoles - Role hoặc mảng roles được phép truy cập
 * @param {boolean} props.requireAuth - Yêu cầu đăng nhập (mặc định: true)
 */
export default function ProtectedRoute({ children, allowedRoles, requireAuth = true }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Hàm kiểm tra role và authentication (dùng useCallback để tránh re-render)
  const checkAuthAndRole = useCallback(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    // Kiểm tra authentication
    if (requireAuth && !userData) {
      console.warn("Access denied: No user data found");
      return false;
    }

    // Kiểm tra role nếu có yêu cầu
    if (requireAuth && allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = role || "";

      // Kiểm tra đặc biệt cho transport_company: chỉ admin mới được phép
      if (roles.includes("transport_company")) {
        if (userRole === "transport_company" && !isAdmin) {
          console.warn(`Access denied: Only admin can access transport company pages. User role: '${userRole}', isAdmin: ${isAdmin}`);
          return false;
        }
        // Nếu là admin transport_company, cho phép vào
        if (userRole === "transport_company" && isAdmin) {
          return true;
        }
      }

      // Kiểm tra role có trong danh sách allowed không
      if (!roles.includes(userRole)) {
        console.warn(`Access denied: Role '${userRole}' is not allowed for this route. Required: ${roles.join(", ")}`);
        return false;
      }
    }

    return true;
  }, [allowedRoles, requireAuth]);

  useEffect(() => {
    // Kiểm tra ngay khi component mount
    const isValid = checkAuthAndRole();
    if (!isValid) {
      logout();
      setShouldRedirect(true);
    }
    setIsChecking(false);
  }, [checkAuthAndRole, location.pathname]);

  // Listen for storage changes (khi user logout ở tab khác hoặc đổi role)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!checkAuthAndRole()) {
        logout();
        setShouldRedirect(true);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [checkAuthAndRole]);

  // Hiển thị loading trong khi kiểm tra
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect nếu không có quyền
  if (shouldRedirect) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  // Kiểm tra lại lần cuối trước khi render (double check)
  if (!isChecking && !shouldRedirect) {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (requireAuth && !userData) {
      logout();
      return <Navigate to="/sign-in" replace state={{ from: location }} />;
    }

    if (requireAuth && allowedRoles) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      const userRole = role || "";

      // Kiểm tra đặc biệt cho transport_company: chỉ admin mới được phép
      if (roles.includes("transport_company")) {
        if (userRole === "transport_company" && !isAdmin) {
          logout();
          return <Navigate to="/sign-in" replace state={{ from: location }} />;
        }
        // Nếu là admin transport_company, cho phép vào
        if (userRole === "transport_company" && isAdmin) {
          return <>{children}</>;
        }
      }

      // Kiểm tra role có trong danh sách allowed không
      if (!roles.includes(userRole)) {
        console.error(`❌ Role mismatch detected: User has role '${userRole}' but route requires: ${roles.join(", ")}`);
        logout();
        return <Navigate to="/sign-in" replace state={{ from: location }} />;
      }
    }
  }

  // Redirect nếu không có quyền
  if (shouldRedirect) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

/**
 * Hàm logout - xóa dữ liệu và redirect về trang đăng nhập
 */
function logout() {
  // Xóa tất cả dữ liệu authentication
  localStorage.removeItem("gd_user");
  localStorage.removeItem("role");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("remember");
  localStorage.removeItem("auth_token");
  
  // Sử dụng window.location.href để đảm bảo redirect hoàn toàn và reload page
  // Điều này đảm bảo không có state nào còn sót lại
  window.location.href = "/sign-in";
}

