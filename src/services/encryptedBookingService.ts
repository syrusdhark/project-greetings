/**
 * Encrypted Booking Service
 * Handles secure booking operations with RSA encryption using key 1323
 */

import { encryptedApiService } from './encryptedApiService';
import { RSAEncryption } from '@/utils/rsaEncryption';

interface EncryptedBookingData {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  activity_booked: string;
  booking_date: string;
  time_slot: string;
  participants: number;
  special_requests?: string;
  school_id: string;
  sport_id?: string;
  time_slot_id?: string;
}

interface EncryptedPaymentData {
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payer_name?: string;
  utr?: string;
  screenshot_url?: string;
}

class EncryptedBookingService {
  /**
   * Create encrypted booking
   */
  async createBooking(bookingData: EncryptedBookingData) {
    try {
      // Encrypt sensitive booking data
      const encryptedData = RSAEncryption.encryptApiPayload(bookingData);

      const response = await encryptedApiService.post('/bookings', encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          booking: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Booking creation failed'
        };
      }
    } catch (error) {
      console.error('Encrypted booking creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking creation failed'
      };
    }
  }

  /**
   * Get encrypted bookings
   */
  async getBookings(userId?: string, schoolId?: string) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (schoolId) params.append('school_id', schoolId);

      const response = await encryptedApiService.get(`/bookings?${params.toString()}`, {
        headers: {
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          bookings: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch bookings'
        };
      }
    } catch (error) {
      console.error('Encrypted bookings fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings'
      };
    }
  }

  /**
   * Update encrypted booking
   */
  async updateBooking(bookingId: string, updateData: Partial<EncryptedBookingData>) {
    try {
      const encryptedData = RSAEncryption.encryptApiPayload(updateData);

      const response = await encryptedApiService.put(`/bookings/${bookingId}`, encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          booking: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Booking update failed'
        };
      }
    } catch (error) {
      console.error('Encrypted booking update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking update failed'
      };
    }
  }

  /**
   * Cancel encrypted booking
   */
  async cancelBooking(bookingId: string, reason?: string) {
    try {
      const encryptedData = RSAEncryption.encryptApiPayload({ reason });

      const response = await encryptedApiService.put(`/bookings/${bookingId}/cancel`, encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          booking: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Booking cancellation failed'
        };
      }
    } catch (error) {
      console.error('Encrypted booking cancellation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking cancellation failed'
      };
    }
  }

  /**
   * Process encrypted payment
   */
  async processPayment(paymentData: EncryptedPaymentData) {
    try {
      const encryptedData = RSAEncryption.encryptApiPayload(paymentData);

      const response = await encryptedApiService.post('/payments', encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          payment: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Payment processing failed'
        };
      }
    } catch (error) {
      console.error('Encrypted payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Verify encrypted payment
   */
  async verifyPayment(paymentId: string, verificationData: any) {
    try {
      const encryptedData = RSAEncryption.encryptApiPayload(verificationData);

      const response = await encryptedApiService.post(`/payments/${paymentId}/verify`, encryptedData, {
        encrypt: false, // Already encrypted
        headers: {
          'X-Encrypted': 'true',
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          payment: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Encrypted payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed'
      };
    }
  }

  /**
   * Get encrypted booking analytics
   */
  async getBookingAnalytics(schoolId?: string, dateRange?: { start: string; end: string }) {
    try {
      const params = new URLSearchParams();
      if (schoolId) params.append('school_id', schoolId);
      if (dateRange) {
        params.append('start_date', dateRange.start);
        params.append('end_date', dateRange.end);
      }

      const response = await encryptedApiService.get(`/bookings/analytics?${params.toString()}`, {
        headers: {
          'X-Encryption-Key': '1323'
        }
      });

      if (response.success) {
        return {
          success: true,
          analytics: response.data.encrypted ? 
            RSAEncryption.decryptApiResponse(response.data.data) : 
            response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch analytics'
        };
      }
    } catch (error) {
      console.error('Encrypted analytics fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      };
    }
  }

  /**
   * Encrypt booking form data
   */
  encryptBookingForm(formData: any): string {
    return RSAEncryption.encryptFormData(formData);
  }

  /**
   * Decrypt booking form data
   */
  decryptBookingForm(encryptedData: string): any {
    return RSAEncryption.decryptFormData(encryptedData);
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
export const encryptedBookingService = new EncryptedBookingService();
export default encryptedBookingService;
