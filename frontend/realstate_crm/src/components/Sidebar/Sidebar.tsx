"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { Home, Users, Building2, Briefcase, Calendar, LogOut, X, ChevronRight } from "lucide-react"
import { useAuth } from "../../contexts/auth"
import styles from "./Sidebar.module.css"

// Define the structure for our links
interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
}

// Define the links for the sidebar

interface SidebarProps {
  isMobileSidebarOpen: boolean
  closeMobileSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileSidebarOpen, closeMobileSidebar }) => {
  const { employee, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate() // Add useNavigate hook
  const [isExpanded, setIsExpanded] = useState(false)
  const isAdmin = employee?.role === "ADMIN"
  
  const sidebarLinks: NavItem[] =  isAdmin ? [
    { path: "/dashboard", label: "الرئيسية", icon: <Home size={20} /> },
    { path: "/upcoming", label: "المواعيد", icon: <Calendar size={20} /> },
    { path: "/leads", label: "العملاء", icon: <Users size={20} /> },
    { path: "/employees", label: "الموظفين", icon: <Briefcase size={20} /> },
    { path: "/projects", label: "المشاريع", icon: <Building2 size={20} /> },
  ] : [
    { path: "/dashboard", label: "الرئيسية", icon: <Home size={20} /> },
    { path: "/upcoming", label: "المواعيد", icon: <Calendar size={20} /> },
    { path: "/leads", label: "العملاء", icon: <Users size={20} /> },
  ] ;


  // Check if we're on the login page
  const isLoginPage = location.pathname === "/login"

  // Modified handler for mobile navigation
  const handleNavClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault() // Prevent default link behavior
    e.stopPropagation() // Stop propagation
    
    // First navigate to the path
    navigate(path)
    
    // Then close the sidebar
    if (isMobileSidebarOpen) {
      closeMobileSidebar()
    }
  }

  // Handle logout and close sidebar
  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation() // Stop propagation
    logout()
    closeMobileSidebar()
  }

  // Close mobile sidebar on route change, not on every re-render
  useEffect(() => {
    closeMobileSidebar()
  }, [location.pathname]) // Removed closeMobileSidebar from dependency array

  // Don't render sidebar on login page
  if (isLoginPage && !isMobileSidebarOpen) {
    return null
  }

  // Stop click propagation on mobile sidebar to prevent immediate closing
  const handleMobileSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`${styles.sidebar} ${isExpanded ? styles.expanded : ""} ${isLoginPage ? styles.hidden : ""}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {sidebarLinks.map((link) => (
              <li key={link.path} className={styles.navItem}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                >
                  <span className={styles.icon}>{link.icon}</span>
                  <span className={styles.label}>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay - Modified to use stopPropagation */}
      {isMobileSidebarOpen && (
        <div 
          className={styles.overlay} 
          onClick={(e) => {
            e.stopPropagation()
            closeMobileSidebar()
          }}
        ></div>
      )}


      {/* Mobile Sidebar - Added onClick handler to prevent propagation */}
      <aside 
        className={`${styles.mobileSidebar} ${isMobileSidebarOpen ? styles.open : ""}`}
        onClick={handleMobileSidebarClick}
      >

        
        <div className={styles.mobileHeader}>
          <button 
            className={styles.closeButton} 
            onClick={(e) => {
              e.stopPropagation()
              closeMobileSidebar()
            }}
          >
            <X size={24} />
          </button>
          {employee && (
            <div className={styles.userInfo}>
              <span>اهلا {employee.name}</span>
            </div>
          )}
        </div>

        <nav className={styles.mobileNav}>
          <ul className={styles.mobileNavList}>
            {sidebarLinks.map((link) => (
              <li key={link.path} className={styles.mobileNavItem}>
                {/* Modified to use div instead of NavLink for more control */}
                <div
                  className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.mobileNavLinkActive : ""}`}
                  onClick={(e) => handleNavClick(link.path, e)}
                >
                  <span className={styles.mobileIcon}>{link.icon}</span>
                  <span className={styles.mobileLabel}>{link.label}</span>
                  <ChevronRight size={16} className={styles.chevron} />
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileFooter}>
          {employee ? (
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          ) : (
            <div 
              className={styles.loginButton} 
              onClick={(e) => handleNavClick("/login", e)}
            >
              <span>تسجيل الدخول</span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar