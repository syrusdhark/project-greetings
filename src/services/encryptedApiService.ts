/**
 * Encrypted API Service for secure data transfer
 * All sensitive data is encrypted using RSA/XOR encryption with key 1323
 */

import { RSAEncryption } from '@/utils/rsaEncryption';

interface EncryptedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  encrypted?: boolean;
}

interface ApiRequestOptions {
  encrypt?: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

class EncryptedApiService {
  private baseUrl: string;
  private defaultTimeout: number = 10000;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make encrypted POST request
   */
  async post<T = any>(
    endpoint: string, 
    data: any, 
    options: ApiRequestOptions = {}
  ): Promise<EncryptedApiResponse<T>> {
    const { encrypt = true, headers = {}, timeout = this.defaultTimeout } = options;
    
    try {
      let requestData = data;
      let requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Encrypt sensitive data if requested
      if (encrypt && this.shouldEncrypt(data)) {
        const encryptedPayload = RSAEncryption.encryptApiPayload(data);
        requestData = encryptedPayload;
        requestHeaders['X-Encrypted'] = 'true';
        requestHeaders['X-Encryption-Key'] = '1323';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Decrypt response if it's encrypted
      if (responseData.encrypted) {
        const decryptedData = RSAEncryption.decryptApiResponse(responseData.data);
        return {
          success: true,
          data: decryptedData,
          encrypted: true
        };
      }

      return {
        success: true,
        data: responseData,
        encrypted: false
      };

    } catch (error) {
      console.error('Encrypted API POST error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Make encrypted GET request
   */
  async get<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<EncryptedApiResponse<T>> {
    const { headers = {}, timeout = this.defaultTimeout } = options;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Decrypt response if it's encrypted
      if (responseData.encrypted) {
        const decryptedData = RSAEncryption.decryptApiResponse(responseData.data);
        return {
          success: true,
          data: decryptedData,
          encrypted: true
        };
      }

      return {
        success: true,
        data: responseData,
        encrypted: false
      };

    } catch (error) {
      console.error('Encrypted API GET error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Make encrypted PUT request
   */
  async put<T = any>(
    endpoint: string, 
    data: any, 
    options: ApiRequestOptions = {}
  ): Promise<EncryptedApiResponse<T>> {
    const { encrypt = true, headers = {}, timeout = this.defaultTimeout } = options;
    
    try {
      let requestData = data;
      let requestHeaders = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Encrypt sensitive data if requested
      if (encrypt && this.shouldEncrypt(data)) {
        const encryptedPayload = RSAEncryption.encryptApiPayload(data);
        requestData = encryptedPayload;
        requestHeaders['X-Encrypted'] = 'true';
        requestHeaders['X-Encryption-Key'] = '1323';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Decrypt response if it's encrypted
      if (responseData.encrypted) {
        const decryptedData = RSAEncryption.decryptApiResponse(responseData.data);
        return {
          success: true,
          data: decryptedData,
          encrypted: true
        };
      }

      return {
        success: true,
        data: responseData,
        encrypted: false
      };

    } catch (error) {
      console.error('Encrypted API PUT error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Make encrypted DELETE request
   */
  async delete<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<EncryptedApiResponse<T>> {
    const { headers = {}, timeout = this.defaultTimeout } = options;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Decrypt response if it's encrypted
      if (responseData.encrypted) {
        const decryptedData = RSAEncryption.decryptApiResponse(responseData.data);
        return {
          success: true,
          data: decryptedData,
          encrypted: true
        };
      }

      return {
        success: true,
        data: responseData,
        encrypted: false
      };

    } catch (error) {
      console.error('Encrypted API DELETE error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Determine if data should be encrypted based on content
   */
  private shouldEncrypt(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // List of sensitive fields that should always be encrypted
    const sensitiveFields = [
      'password', 'email', 'phone', 'address', 'creditCard', 
      'ssn', 'personalInfo', 'customerDetails', 'paymentInfo',
      'bookingDetails', 'userData', 'profile'
    ];

    const dataString = JSON.stringify(data).toLowerCase();
    return sensitiveFields.some(field => dataString.includes(field));
  }

  /**
   * Encrypt file upload data
   */
  async uploadEncryptedFile(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    options: ApiRequestOptions = {}
  ): Promise<EncryptedApiResponse> {
    try {
      const formData = new FormData();
      
      // Encrypt additional data
      if (Object.keys(additionalData).length > 0) {
        const encryptedData = RSAEncryption.encryptApiPayload(additionalData);
        formData.append('encryptedData', JSON.stringify(encryptedData));
        formData.append('encryptionKey', '1323');
      }
      
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      console.error('Encrypted file upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed'
      };
    }
  }
}

// Create default instance
export const encryptedApiService = new EncryptedApiService();

// Export the class for custom instances
export default EncryptedApiService;
