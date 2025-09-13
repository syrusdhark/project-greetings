/**
 * React hooks for encrypted data handling
 * Provides easy-to-use hooks for encrypting/decrypting data in components
 */

import { useState, useCallback, useEffect } from 'react';
import { RSAEncryption } from '@/utils/rsaEncryption';
import { encryptedApiService } from '@/services/encryptedApiService';

interface UseEncryptedDataOptions {
  autoEncrypt?: boolean;
  encryptionKey?: number;
}

interface UseEncryptedApiOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  encryptPayload?: boolean;
  timeout?: number;
}

/**
 * Hook for encrypting and decrypting data
 */
export const useEncryptedData = (options: UseEncryptedDataOptions = {}) => {
  const { autoEncrypt = true, encryptionKey = 1323 } = options;
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (data: any): Promise<string | null> => {
    if (!data) return null;
    
    setIsEncrypting(true);
    setError(null);

    try {
      const encrypted = RSAEncryption.encryptFormData(data);
      return encrypted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
      setError(errorMessage);
      console.error('Encryption error:', err);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const decrypt = useCallback(async (encryptedData: string): Promise<any> => {
    if (!encryptedData) return null;
    
    setIsEncrypting(true);
    setError(null);

    try {
      const decrypted = RSAEncryption.decryptFormData(encryptedData);
      return decrypted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Decryption failed';
      setError(errorMessage);
      console.error('Decryption error:', err);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  return {
    encrypt,
    decrypt,
    isEncrypting,
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook for encrypted API calls
 */
export const useEncryptedApi = (options: UseEncryptedApiOptions) => {
  const { endpoint, method = 'GET', encryptPayload = true, timeout } = options;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (payload?: any) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch (method) {
        case 'POST':
          response = await encryptedApiService.post(endpoint, payload, { 
            encrypt: encryptPayload, 
            timeout 
          });
          break;
        case 'PUT':
          response = await encryptedApiService.put(endpoint, payload, { 
            encrypt: encryptPayload, 
            timeout 
          });
          break;
        case 'DELETE':
          response = await encryptedApiService.delete(endpoint, { timeout });
          break;
        default:
          response = await encryptedApiService.get(endpoint, { timeout });
      }

      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.error || 'API call failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'API call failed';
      setError(errorMessage);
      console.error('Encrypted API error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method, encryptPayload, timeout]);

  return {
    data,
    loading,
    error,
    execute,
    clearError: () => setError(null)
  };
};

/**
 * Hook for encrypted form handling
 */
export const useEncryptedForm = (initialData: Record<string, any> = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const { encrypt, decrypt, isEncrypting, error } = useEncryptedData();

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const encryptForm = useCallback(async () => {
    const encrypted = await encrypt(formData);
    if (encrypted) {
      setEncryptedData(encrypted);
    }
    return encrypted;
  }, [formData, encrypt]);

  const decryptForm = useCallback(async (encrypted: string) => {
    const decrypted = await decrypt(encrypted);
    if (decrypted) {
      setFormData(decrypted);
    }
    return decrypted;
  }, [decrypt]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setEncryptedData(null);
  }, [initialData]);

  return {
    formData,
    encryptedData,
    updateField,
    encryptForm,
    decryptForm,
    resetForm,
    isEncrypting,
    error
  };
};

/**
 * Hook for encrypted local storage
 */
export const useEncryptedStorage = (key: string) => {
  const [storedData, setStoredData] = useState<any>(null);
  const { encrypt, decrypt, isEncrypting, error } = useEncryptedData();

  const saveToStorage = useCallback(async (data: any) => {
    const encrypted = await encrypt(data);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      setStoredData(data);
    }
  }, [key, encrypt]);

  const loadFromStorage = useCallback(async () => {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
      const decrypted = await decrypt(encrypted);
      if (decrypted) {
        setStoredData(decrypted);
        return decrypted;
      }
    }
    return null;
  }, [key, decrypt]);

  const clearStorage = useCallback(() => {
    localStorage.removeItem(key);
    setStoredData(null);
  }, [key]);

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    storedData,
    saveToStorage,
    loadFromStorage,
    clearStorage,
    isEncrypting,
    error
  };
};

/**
 * Hook for checking encryption support
 */
export const useEncryptionSupport = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [method, setMethod] = useState<'rsa' | 'xor'>('xor');

  useEffect(() => {
    const supported = RSAEncryption.isWebCryptoAvailable();
    const encryptionMethod = RSAEncryption.getEncryptionMethod();
    
    setIsSupported(supported);
    setMethod(encryptionMethod);
  }, []);

  return {
    isSupported,
    method,
    isRSA: method === 'rsa',
    isXOR: method === 'xor'
  };
};
