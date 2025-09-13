/**
 * Encrypted Authentication Service
 * Handles secure authentication with RSA encryption using key 1323
 */

import { supabase } from '@/integrations/supabase/client';
import { RSAEncryption } from '@/utils/rsaEncryption';
import { encryptedApiService } from './encryptedApiService';

interface EncryptedAuthResponse {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
}

interface EncryptedSignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  role?: string;
}

class EncryptedAuthService {
  /**
   * Encrypted sign in
   */
  async signIn(email: string, password: string): Promise<EncryptedAuthResponse> {
    try {
      // Encrypt credentials before sending
      const encryptedCredentials = RSAEncryption.encryptApiPayload({
        email,
        password
      });

      // Use encrypted API service for authentication
      const response = await encryptedApiService.post('/auth/signin', encryptedCredentials, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        // Decrypt user data if needed
        const userData = response.data.encrypted ? 
          RSAEncryption.decryptApiResponse(response.data.data) : 
          response.data;

        return {
          success: true,
          user: userData.user,
          session: userData.session
        };
      } else {
        return {
          success: false,
          error: response.error || 'Sign in failed'
        };
      }
    } catch (error) {
      console.error('Encrypted sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      };
    }
  }

  /**
   * Encrypted sign up
   */
  async signUp(data: EncryptedSignUpData): Promise<EncryptedAuthResponse> {
    try {
      // Encrypt sign up data
      const encryptedData = RSAEncryption.encryptApiPayload(data);

      const response = await encryptedApiService.post('/auth/signup', encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        const userData = response.data.encrypted ? 
          RSAEncryption.decryptApiResponse(response.data.data) : 
          response.data;

        return {
          success: true,
          user: userData.user,
          session: userData.session
        };
      } else {
        return {
          success: false,
          error: response.error || 'Sign up failed'
        };
      }
    } catch (error) {
      console.error('Encrypted sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      };
    }
  }

  /**
   * Encrypted OAuth sign in
   */
  async signInWithOAuth(provider: 'google' | 'facebook'): Promise<EncryptedAuthResponse> {
    try {
      const response = await encryptedApiService.post('/auth/oauth', {
        provider,
        encrypted: true
      }, {
        encrypt: true,
        headers: {
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          user: response.data.user,
          session: response.data.session
        };
      } else {
        return {
          success: false,
          error: response.error || 'OAuth sign in failed'
        };
      }
    } catch (error) {
      console.error('Encrypted OAuth sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'OAuth sign in failed'
      };
    }
  }

  /**
   * Encrypted sign out
   */
  async signOut(): Promise<EncryptedAuthResponse> {
    try {
      const response = await encryptedApiService.post('/auth/signout', {}, {
        encrypt: false,
        headers: {
          'X-Encryption-Key': '1323'
        }
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Encrypted sign out error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      };
    }
  }

  /**
   * Encrypt user profile data
   */
  encryptUserProfile(profile: any): string {
    return RSAEncryption.encryptFormData(profile);
  }

  /**
   * Decrypt user profile data
   */
  decryptUserProfile(encryptedProfile: string): any {
    return RSAEncryption.decryptFormData(encryptedProfile);
  }

  /**
   * Encrypt booking data
   */
  encryptBookingData(bookingData: any): string {
    return RSAEncryption.encryptFormData(bookingData);
  }

  /**
   * Decrypt booking data
   */
  decryptBookingData(encryptedBooking: string): any {
    return RSAEncryption.decryptFormData(encryptedBooking);
  }

  /**
   * Encrypt payment data
   */
  encryptPaymentData(paymentData: any): string {
    return RSAEncryption.encryptFormData(paymentData);
  }

  /**
   * Decrypt payment data
   */
  decryptPaymentData(encryptedPayment: string): any {
    return RSAEncryption.decryptFormData(encryptedPayment);
  }

  /**
   * Check if data is encrypted
   */
  isEncrypted(data: string): boolean {
    try {
      // Try to decrypt - if it works, it's encrypted
      RSAEncryption.decryptFormData(data);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get encryption status
   */
  getEncryptionStatus() {
    return {
      isSupported: RSAEncryption.isWebCryptoAvailable(),
      method: RSAEncryption.getEncryptionMethod(),
      key: 1323
    };
  }
}

// Create and export default instance
export const encryptedAuthService = new EncryptedAuthService();
export default encryptedAuthService;
