import React from "react"
import ReactDOM from "react-dom/client"
import { AuthProvider } from "./contexts/auth"
import AppRouter from "./routes"
import { ToastContainer } from "react-toastify"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <AuthProvider>
        <AppRouter />
        <ToastContainer position="top-left" autoClose={3000} rtl={true} />
      </AuthProvider>
  </React.StrictMode>,
)

