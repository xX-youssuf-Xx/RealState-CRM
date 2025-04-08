"use client"

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[] // Optional: specify which roles are allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { employee } = useAuth()
  const location = useLocation()

  // If not logged in, redirect to login
  if (!employee) {
    // Save the location they were trying to access for a redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && employee.role && !allowedRoles.includes(employee.role)) {
    // User doesn't have the required role, redirect to dashboard or another authorized page
    return <Navigate to="/dashboard" replace />
  }

  // User is authenticated and authorized
  return <>{children}</>
}

export default ProtectedRoute