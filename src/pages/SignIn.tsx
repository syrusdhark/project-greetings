
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Waves, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEncryptedData } from "@/hooks/useEncryptedData";
import { encryptedAuthService } from "@/services/encryptedAuthService";
import SEOHead from "@/components/SEOHead";

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithOAuth, isAuthenticated } = useAuth();
  const { profile, isLoading: adminLoading } = useAdminAuth();
  const { encrypt, isEncrypting } = useEncryptedData();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);
  const [encryptedData, setEncryptedData] = useState<string | null>(null);

  // Handle redirect for authenticated users
  useEffect(() => {
    if (isAuthenticated && !adminLoading) {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo');
      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true });
        return;
      }

      if (profile) {
        console.log('SignIn: User is authenticated, redirecting based on role:', profile.role);
        switch (profile.role) {
          case 'passholder':
            navigate('/admin/passholder', { replace: true });
            break;
          case 'school_partner':
            navigate('/school-partner', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
            break;
        }
      } else {
        // User is authenticated but no profile found - redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, adminLoading, profile, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);

    try {
      // Encrypt credentials before sending
      console.log('🔐 Encrypting credentials with key 1323...');
      const encrypted = await encrypt(formData);
      
      if (encrypted) {
        setEncryptedData(encrypted);
        console.log('✅ Credentials encrypted:', encrypted);
        
        // Use encrypted auth service
        const result = await encryptedAuthService.signIn(formData.email, formData.password);
        
        if (!result.success) {
          setIsLoading(false);
          if (result.error?.includes('Invalid login credentials')) {
            toast({
              variant: "destructive",
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
            });
          } else if (result.error?.includes('Email not confirmed')) {
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please check your email and click the verification link before signing in.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign in failed",
              description: result.error || "Something went wrong. Please try again.",
            });
          }
          return;
        }
      } else {
        // Fallback to regular sign in if encryption fails
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          setIsLoading(false);
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: "destructive",
              title: "Invalid credentials",
              description: "Please check your email and password and try again.",
            });
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              variant: "destructive",
              title: "Email not verified",
              description: "Please check your email and click the verification link before signing in.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign in failed",
              description: error.message || "Something went wrong. Please try again.",
            });
          }
          return;
        }
      }

      // Success - auth contexts will handle the session updates and redirect
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });

      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setOAuthLoading(provider);
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "OAuth sign in failed",
          description: error.message || "Something went wrong. Please try again.",
        });
      }
      // Success will be handled by auth state change
    } catch (error) {
      toast({
        variant: "destructive",
        title: "OAuth sign in failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setOAuthLoading(null);
    }
  };

  const isFormValid = formData.email && formData.password;

  // Don't render the form if user is authenticated - just show loading
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
      <SEOHead 
        title="Sign In to Pelagos - Water Sports Platform"
        description="Sign in to your Pelagos account to book water sports activities, view personalized beach conditions, and manage your bookings."
        keywords="sign in Pelagos, water sports login, surf booking account, beach conditions dashboard"
        canonical="https://pelagos.lovable.app/signin"
        noindex={true}
      />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-white hover:text-white/90">
            <Waves className="h-8 w-8" />
            <span className="text-2xl font-bold">Pelagos</span>
          </Link>
          <p className="text-white/80 mt-2">Know the water before you go</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <h1 className="text-2xl font-bold text-center text-foreground">Welcome Back</h1>
            <p className="text-center text-muted-foreground">
              Sign in to your Pelagos account
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                variant="ocean" 
                size="lg" 
                className="w-full"
                disabled={!isFormValid || isLoading || isEncrypting}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing In...
                  </>
                ) : isEncrypting ? (
                  <>
                    <Shield className="mr-2 h-4 w-4 animate-pulse" />
                    Encrypting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Encryption Status */}
              {encryptedData && (
                <div className="flex items-center justify-center space-x-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                  <Shield className="h-3 w-3" />
                  <span>Data encrypted with key 1323</span>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oAuthLoading === 'google'}
              >
                {oAuthLoading === 'google' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                type="button"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={oAuthLoading === 'facebook'}
              >
                {oAuthLoading === 'facebook' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                Continue with Facebook
              </Button>
            </div>

            {/* Sign Up Links & Legal */}
            <div className="space-y-3">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
              
              <div className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-white/80 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
