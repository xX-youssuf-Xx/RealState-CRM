import type React from "react"
// Import desired icons from react-icons
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';
import styles from "./Footer.module.css"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        {/* Copyright Section (Visually Right in RTL) */}
        <div className={styles.copyright}>
             عمار للعقارات  © {currentYear} - جميع الحقوق محفوظة
        </div>

        {/* Developer Credit Section (Visually Center) */}
        <div className={styles.developerCredit}>
          تم تصميم وتطوير هذه المنصة بواسطة{' '}
          {/* Add link if desired */}
          <a href="https://egypt-tech.com" target="_blank" rel="noopener noreferrer">
            Egypt-Tech
          </a>
        </div>

        {/* Social Media Icons Section (Visually Left in RTL) */}
        <div className={styles.socialIcons}>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebookF />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedinIn />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          {/* Add more icons as needed */}
        </div>

      </div>
    </footer>
  )
}

export default Footer