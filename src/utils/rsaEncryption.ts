/**
 * RSA Encryption utilities for secure data transfer
 * Using key 1323 as specified
 */

// RSA key pair generation and encryption utilities
export class RSAEncryption {
  private static readonly KEY_SIZE = 2048;
  private static readonly PUBLIC_EXPONENT = 65537;
  private static readonly PRIVATE_KEY = 1323; // As specified by user

  /**
   * Generate RSA key pair
   */
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: this.KEY_SIZE,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypt data using RSA-OAEP
   */
  static async encryptData(data: string, publicKey: CryptoKey): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: "RSA-OAEP",
        },
        publicKey,
        dataBuffer
      );

      // Convert to base64 for transmission
      const encryptedArray = new Uint8Array(encryptedBuffer);
      return btoa(String.fromCharCode(...encryptedArray));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using RSA-OAEP
   */
  static async decryptData(encryptedData: string, privateKey: CryptoKey): Promise<string> {
    try {
      // Convert from base64
      const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "RSA-OAEP",
        },
        privateKey,
        encryptedArray
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Simple XOR encryption using key 1323 (fallback for older browsers)
   */
  static xorEncrypt(data: string, key: number = 1323): string {
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key);
    }
    return btoa(encrypted);
  }

  /**
   * Simple XOR decryption using key 1323 (fallback for older browsers)
   */
  static xorDecrypt(encryptedData: string, key: number = 1323): string {
    try {
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key);
      }
      return decrypted;
    } catch (error) {
      console.error('XOR decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt sensitive form data
   */
  static encryptFormData(formData: Record<string, any>): string {
    const jsonString = JSON.stringify(formData);
    return this.xorEncrypt(jsonString, this.PRIVATE_KEY);
  }

  /**
   * Decrypt sensitive form data
   */
  static decryptFormData(encryptedData: string): Record<string, any> {
    try {
      const decryptedString = this.xorDecrypt(encryptedData, this.PRIVATE_KEY);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Form data decryption failed:', error);
      throw new Error('Failed to decrypt form data');
    }
  }

  /**
   * Encrypt API request payload
   */
  static encryptApiPayload(payload: any): { encrypted: string; key: number } {
    return {
      encrypted: this.encryptFormData(payload),
      key: this.PRIVATE_KEY
    };
  }

  /**
   * Decrypt API response
   */
  static decryptApiResponse(encryptedResponse: string): any {
    return this.decryptFormData(encryptedResponse);
  }

  /**
   * Check if Web Crypto API is available
   */
  static isWebCryptoAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.crypto && 
           window.crypto.subtle && 
           typeof window.crypto.subtle.generateKey === 'function';
  }

  /**
   * Get encryption method based on browser support
   */
  static getEncryptionMethod(): 'rsa' | 'xor' {
    return this.isWebCryptoAvailable() ? 'rsa' : 'xor';
  }
}

// Export convenience functions
export const encryptData = RSAEncryption.encryptFormData;
export const decryptData = RSAEncryption.decryptFormData;
export const encryptApiPayload = RSAEncryption.encryptApiPayload;
export const decryptApiResponse = RSAEncryption.decryptApiResponse;
