/**
 * Encryption Demo Component
 * Demonstrates RSA encryption usage with key 1323
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEncryptedData, useEncryptionSupport } from '@/hooks/useEncryptedData';
import { encryptedAuthService } from '@/services/encryptedAuthService';
import { encryptedBookingService } from '@/services/encryptedBookingService';

const EncryptionDemo: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { encrypt, decrypt, isEncrypting, error } = useEncryptedData();
  const { isSupported, method, isRSA, isXOR } = useEncryptionSupport();

  const handleEncrypt = async () => {
    if (!inputData.trim()) return;
    
    setIsProcessing(true);
    try {
      const encrypted = await encrypt(inputData);
      if (encrypted) {
        setEncryptedData(encrypted);
      }
    } catch (err) {
      console.error('Encryption failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!encryptedData.trim()) return;
    
    setIsProcessing(true);
    try {
      const decrypted = await decrypt(encryptedData);
      if (decrypted) {
        setDecryptedData(decrypted);
      }
    } catch (err) {
      console.error('Decryption failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const testBookingEncryption = async () => {
    const bookingData = {
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_phone: "+1234567890",
      activity_booked: "Surfing Lesson",
      booking_date: "2024-01-15",
      time_slot: "10:00 AM",
      participants: 2,
      school_id: "school-123"
    };

    try {
      const encrypted = encryptedBookingService.encryptBookingForm(bookingData);
      console.log('Encrypted booking data:', encrypted);
      
      const decrypted = encryptedBookingService.decryptBookingForm(encrypted);
      console.log('Decrypted booking data:', decrypted);
    } catch (err) {
      console.error('Booking encryption test failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RSA Encryption Demo (Key: 1323)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Input Data</label>
              <Input
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter data to encrypt"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Encrypted Data</label>
              <Input
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
                placeholder="Encrypted data will appear here"
                readOnly
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleEncrypt} 
              disabled={!inputData.trim() || isProcessing}
            >
              {isEncrypting ? 'Encrypting...' : 'Encrypt'}
            </Button>
            <Button 
              onClick={handleDecrypt} 
              disabled={!encryptedData.trim() || isProcessing}
              variant="outline"
            >
              {isEncrypting ? 'Decrypting...' : 'Decrypt'}
            </Button>
          </div>

          {decryptedData && (
            <div>
              <label className="block text-sm font-medium mb-2">Decrypted Data</label>
              <Input
                value={decryptedData}
                readOnly
                className="bg-green-50"
              />
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encryption Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Web Crypto Support:</strong> {isSupported ? 'Yes' : 'No'}</p>
            <p><strong>Encryption Method:</strong> {method.toUpperCase()}</p>
            <p><strong>Encryption Key:</strong> 1323</p>
            <p><strong>RSA Available:</strong> {isRSA ? 'Yes' : 'No'}</p>
            <p><strong>XOR Fallback:</strong> {isXOR ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testBookingEncryption}>
            Test Booking Encryption
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionDemo;
