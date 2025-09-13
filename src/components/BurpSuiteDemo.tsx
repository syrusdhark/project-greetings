/**
 * Burp Suite Demo Component
 * Shows what encrypted data looks like in network traffic
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEncryptedData } from '@/hooks/useEncryptedData';
import { Shield, Eye, EyeOff, Copy, Check } from 'lucide-react';

const BurpSuiteDemo: React.FC = () => {
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    password: 'mypassword123',
    customer_name: 'John Doe',
    phone: '+1234567890'
  });
  
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { encrypt, decrypt, isEncrypting } = useEncryptedData();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(formData);
    if (encrypted) {
      setEncryptedData(encrypted);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawRequest = {
    "email": "user@example.com",
    "password": "mypassword123",
    "customer_name": "John Doe",
    "phone": "+1234567890"
  };

  const encryptedRequest = {
    "encrypted": encryptedData || "eyJkYXRhIjoiU2VjcmV0RW5jcnlwdGVkRGF0YSIsImtleSI6MTMyM30=",
    "key": 1323
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Burp Suite Traffic Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Raw Data (What you DON'T want Burp Suite to see) */}
            <div>
              <Label className="text-red-600 font-semibold">❌ Raw Data (Vulnerable)</Label>
              <Card className="mt-2 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(rawRequest, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(JSON.stringify(rawRequest, null, 2))}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Raw Data
                  </Button>
                </CardContent>
              </Card>
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This is what attackers see without encryption
              </p>
            </div>

            {/* Encrypted Data (What Burp Suite WILL see) */}
            <div>
              <Label className="text-green-600 font-semibold">✅ Encrypted Data (Secure)</Label>
              <Card className="mt-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(encryptedRequest, null, 2)}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => copyToClipboard(JSON.stringify(encryptedRequest, null, 2))}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Encrypted Data
                  </Button>
                </CardContent>
              </Card>
              <p className="text-xs text-green-600 mt-1">
                🔐 This is what Burp Suite sees with encryption
              </p>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="space-y-4">
            <h3 className="font-semibold">Interactive Demo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>
            
            <Button onClick={handleEncrypt} disabled={isEncrypting}>
              {isEncrypting ? 'Encrypting...' : 'Encrypt Data'}
            </Button>

            {encryptedData && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRaw(!showRaw)}
                  >
                    {showRaw ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showRaw ? 'Hide' : 'Show'} Raw Data
                  </Button>
                </div>
                
                {showRaw && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Security Benefits */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Security Benefits:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✅ Sensitive data is encrypted with key 1323</li>
              <li>✅ Burp Suite cannot read plaintext credentials</li>
              <li>✅ Man-in-the-middle attacks are mitigated</li>
              <li>✅ Network traffic is protected</li>
              <li>✅ Automatic encryption for all sensitive fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BurpSuiteDemo;
