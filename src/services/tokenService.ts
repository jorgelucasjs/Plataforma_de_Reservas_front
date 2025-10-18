// Token service for JWT management

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export class TokenService {
  // Save token to localStorage
  saveToken(token: string, expiresIn?: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      
      if (expiresIn) {
        // Calculate expiry timestamp
        const expiryTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  // Get token from localStorage
  getToken(): string | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired()) {
        this.clearToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    try {
      const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!expiryTime) {
        return false; // No expiry set, assume valid
      }

      return Date.now() > parseInt(expiryTime);
    } catch (error) {
      console.error('Failed to check token expiry:', error);
      return true; // Assume expired on error
    }
  }

  // Clear token from localStorage
  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  // Get time until token expires (in milliseconds)
  getTimeUntilExpiry(): number | null {
    try {
      const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!expiryTime) {
        return null;
      }

      const timeLeft = parseInt(expiryTime) - Date.now();
      return timeLeft > 0 ? timeLeft : 0;
    } catch (error) {
      console.error('Failed to get time until expiry:', error);
      return null;
    }
  }

  // Check if token exists and is valid
  hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }
}

// Create and export singleton instance
export const tokenService = new TokenService();