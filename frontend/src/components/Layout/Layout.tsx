"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "../Navbar/Navbar"
import Sidebar from "../Sidebar/Sidebar"
import Footer from "../Footer/Footer"
import styles from "./Layout.module.css"

const Layout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const isLoginPage = location.pathname === "/login"

  // Modified: Only add click outside listener if sidebar is open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only process if sidebar is open
      if (!isMobileSidebarOpen) return;
      
      const target = event.target as HTMLElement
      
      // Don't close if clicking the menu button (which should have a specific class or id)
      if (target.closest('.mobileMenuButton')) return;
      
      // Don't close if clicking inside the sidebar
      if (target.closest(`.${styles.mobileSidebar}`) || target.closest('.sidebar')) return;
      
      // If we get here, we're clicking outside both the button and sidebar
      setIsMobileSidebarOpen(false);
    }

    // Only add the listener when sidebar is open
    if (isMobileSidebarOpen) {
      // Use mousedown to capture the event early
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileSidebarOpen])

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    // Stop any existing toggle operation that might be in progress
    setIsMobileSidebarOpen(prevState => !prevState)
  }

  // Close mobile sidebar
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className={styles.layout} dir="rtl">
      <Navbar toggleSidebar={toggleMobileSidebar} />
      <div className={styles.mainWrapper}>
        <Sidebar isMobileSidebarOpen={isMobileSidebarOpen} closeMobileSidebar={closeMobileSidebar} />
        <main className={`${styles.content} ${isLoginPage ? styles.fullWidth : ""}`}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default Layout