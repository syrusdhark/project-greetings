import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Waves, Mail, Lock, User, Building2, Phone, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Unified roles (passholder is never exposed here)
type AccountType = "regular_user" | "school_partner";

type SelectedSportConfig = {
  sport_id: string;
  name: string;
  price_per_person: number | "";
  languages: string; // comma-separated
  eligibility?: string;
  // Schedule per sport
  weekdays: number[]; // 0-6 (Sun-Sat)
  slots: { start: string; end: string; capacity: number | "" }[];
  blackoutDates: string; // comma-separated YYYY-MM-DD
};

const todayISO = () => new Date().toISOString().split("T")[0];
const plusDaysISO = (days: number) => new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

const LOCAL_KEYS = {
  role: "signup.role",
  user: "signup.user",
  partner: "signup.partner",
};

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signInWithOAuth } = useAuth();

  // SEO basics
  useEffect(() => {
    document.title = "Sign up – User or School Partner | Pelagos"; // <60 chars
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Create your Pelagos account as a user or school partner. Book water sports or onboard your school in minutes.");
    const linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      l.setAttribute("href", window.location.origin + "/signup");
      document.head.appendChild(l);
    }
  }, []);

  const [accountType, setAccountType] = useState<AccountType>(() => (localStorage.getItem(LOCAL_KEYS.role) as AccountType) || "regular_user");

  // Common state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);

  // User minimal form
  const [userForm, setUserForm] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEYS.user);
    return saved ? JSON.parse(saved) : { fullName: "", email: "", phone: "", password: "", confirmPassword: "" };
  });

  // Partner stepper
  const [step, setStep] = useState(1);
  const [partnerForm, setPartnerForm] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEYS.partner);
    return saved ? JSON.parse(saved) : {
      owner: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
      school: { legalName: "", displayName: "", bio: "", address: "", city: "", pincode: "", lat: "", lng: "", beach: "", website: "", instagram: "", logoUrl: "", coverUrl: "", photosCsv: "" },
      sports: [] as SelectedSportConfig[],
      payouts: { upi_vpa: "", gstin: "", pan: "", invoice_name: "", invoice_phone: "", invoice_email: "" },
    };
  });

  const [sportsCatalog, setSportsCatalog] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.role, accountType);
  }, [accountType]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.user, JSON.stringify(userForm));
  }, [userForm]);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEYS.partner, JSON.stringify(partnerForm));
  }, [partnerForm]);

  useEffect(() => {
    // Load sports list for partner flow
    supabase.from("sports").select("id,name").order("name", { ascending: true }).then(({ data, error }) => {
      if (!error && data) setSportsCatalog(data);
    });
  }, []);

  const splitName = (full: string) => {
    const parts = full.trim().split(" ");
    const first = parts.shift() || "";
    const last = parts.join(" ") || "";
    return { first, last };
  };

  const isUserValid = useMemo(() => {
    return (
      !!userForm.fullName && !!userForm.email && !!userForm.phone && !!userForm.password &&
      userForm.password.length >= 8 && userForm.password === userForm.confirmPassword && agreeToTerms
    );
  }, [userForm, agreeToTerms]);

  const isPartnerOwnerValid = useMemo(() => {
    const o = partnerForm.owner;
    return !!o.fullName && !!o.email && !!o.phone && !!o.password && o.password.length >= 8 && o.password === o.confirmPassword;
  }, [partnerForm.owner]);

  const isPartnerSchoolValid = useMemo(() => {
    const s = partnerForm.school;
    return !!s.legalName && !!s.displayName && !!s.city;
  }, [partnerForm.school]);

  const isPartnerSportsValid = useMemo(() => {
    if (!partnerForm.sports.length) return false;
    for (const sp of partnerForm.sports) {
      if (!sp.price_per_person || Number(sp.price_per_person) <= 0) return false;
      if (!sp.weekdays.length) return false;
      if (!sp.slots.length) return false;
      for (const sl of sp.slots) {
        if (!sl.start || !sl.end || !sl.capacity || Number(sl.capacity) <= 0) return false;
      }
    }
    return true;
  }, [partnerForm.sports]);

  

  const resetStorage = () => {
    localStorage.removeItem(LOCAL_KEYS.user);
    localStorage.removeItem(LOCAL_KEYS.partner);
  };

  // Submit handlers
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserValid) return;

    setIsLoading(true);
    try {
      const { first, last } = splitName(userForm.fullName);
      const { error } = await signUp(userForm.email, userForm.password, first, last, undefined, "regular_user");
      if (error) throw error;

      // Try to get session immediately (auto-approve path)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        // Update profile phone
        await supabase.from("user_profiles").update({ phone: userForm.phone }).eq("user_id", sessionData.session.user.id);
        toast({ title: "Welcome!", description: "Signed in successfully." });
        resetStorage();
        navigate("/");
      } else {
        toast({ title: "Confirm your email", description: "Check your inbox to complete sign up. We saved your progress." });
        navigate("/");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign up failed", description: err.message || "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const finalizePartnerSetup = async (userId: string) => {
    // 1) Fetch profile to get school_id
    const { data: myProfile } = await supabase.from("user_profiles").select("school_id").eq("user_id", userId).maybeSingle();
    const schoolId = myProfile?.school_id as string | undefined;
    if (!schoolId) throw new Error("School not created. Please contact support.");

    // 2) Update profile phone
    await supabase.from("user_profiles").update({ phone: partnerForm.owner.phone }).eq("user_id", userId);

    // 3) Update school details
    const s = partnerForm.school;
    await supabase.from("schools").update({
      name: s.legalName,
      display_name: s.displayName,
      description: s.bio || null,
      address: s.address || null,
      city: s.city,
      pincode: s.pincode || null,
      primary_beach: s.beach || null,
    }).eq("id", schoolId);

    // 4) Insert school_sports
    for (const sp of partnerForm.sports) {
      await supabase.from("school_sports").upsert({
        school_id: schoolId,
        sport_id: sp.sport_id,
        price_per_person: Number(sp.price_per_person),
        active: true,
        languages: sp.languages ? sp.languages.split(",").map(t => t.trim()).filter(Boolean) : [],
        eligibility: sp.eligibility || null,
      }, { onConflict: "school_id,sport_id" });

      // 5) Optional blackout dates
      const blackout = sp.blackoutDates ? sp.blackoutDates.split(",").map(d => d.trim()).filter(Boolean) : [];
      for (const d of blackout) {
        await supabase.from("blackout_dates").insert({ school_id: schoolId, date: d });
      }

      // 6) Generate fixed slots for next 30 days using RPC for each slot pattern
      const startDate = todayISO();
      const endDate = plusDaysISO(30);
      const weekdays = sp.weekdays; // integers 0-6

      for (const slot of sp.slots) {
        const { error: rpcError } = await supabase.rpc("rpc_generate_time_slots", {
          p_school_id: schoolId,
          p_sport_id: sp.sport_id,
          p_start_date: startDate,
          p_end_date: endDate,
          p_weekdays: weekdays,
          p_start_time: slot.start,
          p_end_time: slot.end,
          p_capacity: Number(slot.capacity),
        });
        if (rpcError) throw rpcError;
      }
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(isPartnerOwnerValid && isPartnerSchoolValid && isPartnerSportsValid)) return;

    setIsLoading(true);
    try {
      // 1) Create auth user; trigger will create user_profile + minimal school with school_name
      const { first, last } = splitName(partnerForm.owner.fullName);
      const { error } = await signUp(
        partnerForm.owner.email,
        partnerForm.owner.password,
        first,
        last,
        partnerForm.school.legalName, // school_name for trigger
        "school_partner"
      );
      if (error) throw error;

      // 2) If session exists -> proceed now, else show confirm email message
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        await finalizePartnerSetup(sessionData.session.user.id);
        toast({ title: "You're in!", description: "School partner onboarding complete." });
        resetStorage();
        navigate("/school-partner");
      } else {
        toast({ title: "Confirm your email", description: "We saved your progress. Finish setup after verification." });
        navigate("/");
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Signup failed", description: err.message || "Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'facebook') => {
    setOAuthLoading(provider);
    
    try {
      const { error } = await signInWithOAuth(provider);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "OAuth sign up failed",
          description: error.message || "Something went wrong. Please try again.",
        });
      }
      // Success will be handled by auth state change
    } catch (error) {
      toast({
        variant: "destructive",
        title: "OAuth sign up failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setOAuthLoading(null);
    }
  };

  // Helpers for sports selection
  const toggleSport = (sport: { id: string; name: string }) => {
    setPartnerForm(prev => {
      const exists = prev.sports.find(s => s.sport_id === sport.id);
      if (exists) {
        return { ...prev, sports: prev.sports.filter(s => s.sport_id !== sport.id) };
      }
      const next: SelectedSportConfig = { sport_id: sport.id, name: sport.name, price_per_person: "", languages: "", eligibility: "", weekdays: [1,2,3,4,5], slots: [], blackoutDates: "" };
      return { ...prev, sports: [...prev.sports, next] };
    });
  };

  const updateSport = (sportId: string, patch: Partial<SelectedSportConfig>) => {
    setPartnerForm(prev => ({
      ...prev,
      sports: prev.sports.map(s => (s.sport_id === sportId ? { ...s, ...patch } : s)),
    }));
  };

  const addSlot = (sportId: string) => {
    setPartnerForm(prev => ({
      ...prev,
      sports: prev.sports.map(s => (
        s.sport_id === sportId ? { ...s, slots: [...s.slots, { start: "06:00:00", end: "07:00:00", capacity: 10 }] } : s
      )),
    }));
  };

  const removeSlot = (sportId: string, idx: number) => {
    setPartnerForm(prev => ({
      ...prev,
      sports: prev.sports.map(s => (
        s.sport_id === sportId ? { ...s, slots: s.slots.filter((_, i) => i !== idx) } : s
      )),
    }));
  };

  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 text-sm mb-2">
      {[1,2,3].map(i => (
        <div key={i} className={`flex items-center gap-2 ${step===i?"text-primary":"text-muted-foreground"}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${step===i?"border-primary":"border-border"}`}>
            {step>i? <CheckCircle2 className="h-4 w-4"/> : i}
          </div>
          <span className="hidden sm:inline">{i===1?"Account owner":i===2?"School details":"Sports & schedule"}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-ocean flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
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
            <h1 className="text-2xl font-bold text-center text-foreground">Create your account</h1>
            <p className="text-center text-muted-foreground">I’m a User or I’m a School Partner</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role toggle */}
            <div className="space-y-3">
              <Label>Choose role</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setAccountType("regular_user"); setStep(1); }}
                  className={`p-4 rounded-lg border-2 transition-all ${accountType === "regular_user" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">I’m a User</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("school_partner")}
                  className={`p-4 rounded-lg border-2 transition-all ${accountType === "school_partner" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">I’m a School Partner</div>
                </button>
              </div>
            </div>

            {accountType === "regular_user" && (
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="u-full">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="u-full" value={userForm.fullName} onChange={(e)=>setUserForm((p:any)=>({...p,fullName:e.target.value}))} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="u-email" type="email" value={userForm.email} onChange={(e)=>setUserForm((p:any)=>({...p,email:e.target.value}))} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="u-phone" value={userForm.phone} onChange={(e)=>setUserForm((p:any)=>({...p,phone:e.target.value}))} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-pass">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="u-pass" type={showPassword?"text":"password"} value={userForm.password} onChange={(e)=>setUserForm((p:any)=>({...p,password:e.target.value}))} className="pl-10 pr-10" required />
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                  </div>
                  <p className="text-xs text-muted-foreground">Min 8 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-pass2">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="u-pass2" type={showConfirmPassword?"text":"password"} value={userForm.confirmPassword} onChange={(e)=>setUserForm((p:any)=>({...p,confirmPassword:e.target.value}))} className="pl-10 pr-10" required />
                    <button type="button" onClick={()=>setShowConfirmPassword(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox id="terms-user" checked={agreeToTerms} onCheckedChange={(c)=>setAgreeToTerms(c===true)} />
                  <label htmlFor="terms-user" className="text-sm">
                    I agree to the <Link to="/terms" className="text-primary underline">Terms</Link> and <Link to="/privacy" className="text-primary underline">Privacy</Link>
                  </label>
                </div>
                <Button type="submit" variant="ocean" size="lg" className="w-full" disabled={!isUserValid || isLoading}>
                  {isLoading?"Creating...":"Create account"}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    type="button"
                    onClick={() => handleOAuthSignUp('google')}
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
                    onClick={() => handleOAuthSignUp('facebook')}
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
              </form>
            )}

            {accountType === "school_partner" && (
              <form onSubmit={handlePartnerSubmit} className="space-y-6">
                <StepIndicator />

                {step === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Account owner full name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={partnerForm.owner.fullName} onChange={(e)=>setPartnerForm(p=>({...p, owner:{...p.owner, fullName:e.target.value}}))} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" value={partnerForm.owner.email} onChange={(e)=>setPartnerForm(p=>({...p, owner:{...p.owner, email:e.target.value}}))} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={partnerForm.owner.phone} onChange={(e)=>setPartnerForm(p=>({...p, owner:{...p.owner, phone:e.target.value}}))} className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showPassword?"text":"password"} value={partnerForm.owner.password} onChange={(e)=>setPartnerForm(p=>({...p, owner:{...p.owner, password:e.target.value}}))} className="pl-10 pr-10" required />
                        <button type="button" onClick={()=>setShowPassword(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type={showConfirmPassword?"text":"password"} value={partnerForm.owner.confirmPassword} onChange={(e)=>setPartnerForm(p=>({...p, owner:{...p.owner, confirmPassword:e.target.value}}))} className="pl-10 pr-10" required />
                        <button type="button" onClick={()=>setShowConfirmPassword(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-between">
                      <Button type="button" variant="outline" onClick={()=>navigate("/")}>Cancel</Button>
                      <Button type="button" onClick={()=>setStep(2)} disabled={!isPartnerOwnerValid}>Next</Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>School legal name</Label>
                      <Input value={partnerForm.school.legalName} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, legalName:e.target.value}}))} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Display name</Label>
                      <Input value={partnerForm.school.displayName} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, displayName:e.target.value}}))} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Short bio</Label>
                      <Input value={partnerForm.school.bio} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, bio:e.target.value}}))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input value={partnerForm.school.address} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, address:e.target.value}}))} />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={partnerForm.school.city} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, city:e.target.value}}))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode</Label>
                      <Input value={partnerForm.school.pincode} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, pincode:e.target.value}}))} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Primary beach/location</Label>
                      <Input value={partnerForm.school.beach} onChange={(e)=>setPartnerForm(p=>({...p, school:{...p.school, beach:e.target.value}}))} />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between">
                      <Button type="button" variant="outline" onClick={()=>setStep(1)}>Back</Button>
                      <Button type="button" onClick={()=>setStep(3)} disabled={!isPartnerSchoolValid}>Next</Button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label>Select sports</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {sportsCatalog.map(s => {
                          const selected = !!partnerForm.sports.find(sp => sp.sport_id === s.id);
                          return (
                            <button key={s.id} type="button" onClick={()=>toggleSport(s)} className={`px-3 py-2 rounded-md border text-sm ${selected?"border-primary bg-primary/5":"border-border"}`}>
                              {s.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {partnerForm.sports.map(sp => (
                      <div key={sp.sport_id} className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold">{sp.name}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Price per person (₹)</Label>
                            <Input type="number" min={1} value={sp.price_per_person} onChange={(e)=>updateSport(sp.sport_id,{ price_per_person: e.target.value === ""? "" : Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Languages (comma-separated)</Label>
                            <Input value={sp.languages} onChange={(e)=>updateSport(sp.sport_id,{ languages: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Eligibility (optional)</Label>
                            <Input value={sp.eligibility || ""} onChange={(e)=>updateSport(sp.sport_id,{ eligibility: e.target.value })} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Operating days</Label>
                          <div className="flex flex-wrap gap-2">
                            {days.map((d, idx)=>{
                              const active = sp.weekdays.includes(idx);
                              return (
                                <button key={d} type="button" onClick={()=>{
                                  const next = active? sp.weekdays.filter(w=>w!==idx) : [...sp.weekdays, idx];
                                  updateSport(sp.sport_id,{ weekdays: next.sort() });
                                }} className={`px-2 py-1 rounded border text-xs ${active?"border-primary bg-primary/5":"border-border"}`}>{d}</button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Time slots per day</Label>
                          <div className="space-y-3">
                            {sp.slots.map((sl, i)=>(
                              <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                                <div>
                                  <Label className="text-xs">Start (HH:MM:SS)</Label>
                                  <Input value={sl.start} onChange={(e)=>{
                                    const slots=[...sp.slots]; slots[i]={...sl,start:e.target.value};
                                    updateSport(sp.sport_id,{ slots });
                                  }} />
                                </div>
                                <div>
                                  <Label className="text-xs">End (HH:MM:SS)</Label>
                                  <Input value={sl.end} onChange={(e)=>{
                                    const slots=[...sp.slots]; slots[i]={...sl,end:e.target.value};
                                    updateSport(sp.sport_id,{ slots });
                                  }} />
                                </div>
                                <div>
                                  <Label className="text-xs">Capacity</Label>
                                  <Input type="number" min={1} value={sl.capacity} onChange={(e)=>{
                                    const slots=[...sp.slots]; slots[i]={...sl,capacity: e.target.value === ""? "" : Number(e.target.value)};
                                    updateSport(sp.sport_id,{ slots });
                                  }} />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="button" variant="outline" onClick={()=>removeSlot(sp.sport_id,i)}>Remove</Button>
                                </div>
                              </div>
                            ))}
                            <Button type="button" variant="secondary" onClick={()=>addSlot(sp.sport_id)}>Add slot</Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Optional blackout dates (YYYY-MM-DD, comma-separated)</Label>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input value={sp.blackoutDates} onChange={(e)=>updateSport(sp.sport_id,{ blackoutDates: e.target.value })} className="pl-10" />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <Button type="button" variant="outline" onClick={()=>setStep(2)}>Back</Button>
                      <Button type="submit" disabled={isLoading || !isPartnerSportsValid}>
                        {isLoading?"Submitting...":"Finish & Create Partner Account"}
                      </Button>
                    </div>
                  </div>
                )}

              </form>
            )}

            {/* Sign In Link & Legal */}
            <div className="space-y-3">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/signin" className="text-primary hover:underline font-medium">Sign in here</Link>
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
          <Link to="/" className="text-white/80 hover:text-white text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;