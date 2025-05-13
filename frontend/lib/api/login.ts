import { API_BASE } from "@/lib/api/utils"
export async function login(email: string, password: string) {
    console.log(API_BASE)
    const response = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }
  
    return response.json()
  }
export function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user_cache")
    
  }