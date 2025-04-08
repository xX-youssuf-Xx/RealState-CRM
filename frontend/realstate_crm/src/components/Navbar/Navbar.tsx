"use client";

import type React from "react";
import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; // Add useNavigate
import { useAuth } from "../../contexts/auth";
import styles from "./Navbar.module.css";

interface NavbarProps {
  toggleSidebar: () => void;
  logo?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  toggleSidebar,
  logo = "/1logo_no_bg.png",
}) => {
  const { employee, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Add navigation hook

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent handlers from firing
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      logout(); // Call logout from AuthContext
      setIsDropdownOpen(false);
      navigate("/login"); // Navigate to login after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Updated handler with explicit type and stopPropagation
  const handleToggleSidebar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default browser behavior
    e.stopPropagation(); // Stop the event from bubbling up
    toggleSidebar(); // Call the toggle function from props
  };

  // Handle login navigation
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo on the right */}
        <div className={styles.logoContainer}>
          <img src={logo} alt="شعار العقارات" className={styles.logo} />
        </div>

        {/* Mobile menu button with className for targeting */}
        {employee && (
          <button
            className={`${styles.mobileMenuButton} mobileMenuButton`}
            onClick={handleToggleSidebar}
            aria-label="القائمة"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Auth Section on the left */}
        <div className={styles.authSection}>
          {employee ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <span>اهلا {employee.name}</span>
                <ChevronDown
                  className={`${styles.chevron} ${
                    isDropdownOpen ? styles.chevronUp : ""
                  }`}
                  size={18}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className={styles.dropdown}
                  onClick={(e) => e.stopPropagation()} // Prevent clicks in dropdown from closing sidebar
                >
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Only show Login if not on the login page
            location.pathname !== "/login" && (
              <button onClick={handleLoginClick} className={styles.loginButton}>
                تسجيل الدخول
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
