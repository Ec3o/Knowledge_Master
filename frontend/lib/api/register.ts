import { API_BASE } from "@/lib/api/utils"
export async function register(username: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    })
  
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }
  
    return response.json()
  }