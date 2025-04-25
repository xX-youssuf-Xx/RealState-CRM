"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/auth"
import styles from "./LoginPage.module.css"
import Loading from "../../components/Loading/Loading"

const LoginPage: React.FC = () => {
  const [number, setNumber] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null) // Reset previous errors
    
    try {
      // Call login from AuthContext
      await login(number, password)
      
      // If login is successful, navigate to the intended destination
      navigate(from, { replace: true })
    } catch (err: any) {
      console.error("Login failed:", err)
      setLoginError(err?.message || "حدث خطأ أثناء تسجيل الدخول")
    }
  }

  // Display either our local error state or the error from context
  const displayError = loginError || (error ? error.message : null)

  return (
    <div className={styles.loginPage}>
      <Loading isVisible={isLoading} />
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src="/1logo_no_bg.png?height=80&width=200" alt="شعار العقارات" className={styles.logo} />
        </div>
        <h1 className={styles.title}>تسجيل الدخول</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {displayError && <div className={styles.error}>{displayError}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="number" className={styles.label}>
              رقم الهاتف
            </label>
            <input
              id="number"
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className={styles.input}
              placeholder="أدخل رقم الهاتف"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {"تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage