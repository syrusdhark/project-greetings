import { useEffect, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";

interface QueueItem {
  id: string;
  booking_code: string;
  amount: number;
  created_at: string;
}

const PaymentsVerify = () => {
  const { profile } = useAdminAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<{ id?: string; upi_vpa?: string; upi_qr_url?: string }>({});

  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('id, booking_code, amount, created_at')
        .eq('status', 'awaiting_verification')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setItems(data as any);

      const { data: ps } = await supabase.from('platform_settings').select('*').limit(1).maybeSingle();
      if (ps) setSettings(ps);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to load queue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirm = async (id: string) => {
    const { error } = await supabase.rpc('rpc_confirm_deposit', { p_booking_id: id });
    if (error) {
      toast({ title: 'Confirm failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deposit confirmed' });
      load();
    }
  };

  const reject = async (id: string) => {
    const { error } = await supabase.rpc('rpc_reject_deposit', { p_booking_id: id, p_note: 'Rejected by ops' });
    if (error) {
      toast({ title: 'Reject failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deposit rejected' });
      load();
    }
  };

  const saveSettings = async () => {
    try {
      if (settings.id) {
        const { error } = await supabase.from('platform_settings').update({
          upi_vpa: settings.upi_vpa,
          upi_qr_url: settings.upi_qr_url,
        }).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('platform_settings').insert({
          upi_vpa: settings.upi_vpa,
          upi_qr_url: settings.upi_qr_url,
        });
        if (error) throw error;
      }
      toast({ title: 'UPI settings saved' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    }
  };

  if (profile?.role !== 'passholder') {
    return <div className="p-6">Access denied</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UPI Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">VPA</label>
            <Input value={settings.upi_vpa || ''} onChange={(e) => setSettings({ ...settings, upi_vpa: e.target.value })} placeholder="vpa@bank" />
          </div>
          <div className="space-y-2">
            <label className="text-sm">QR Image URL</label>
            <Input value={settings.upi_qr_url || ''} onChange={(e) => setSettings({ ...settings, upi_qr_url: e.target.value })} placeholder="https://.../qr.png" />
          </div>
          <div className="flex items-end">
            <Button onClick={saveSettings} className="w-full">Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments to Verify</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground">No pending verifications</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => (
                <div key={it.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Booking</div>
                      <div className="font-semibold tracking-widest">{it.booking_code}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="font-semibold">₹{it.amount || 0}</div>
                    </div>
                  </div>
                  {/* Screenshot preview (signed URL fetch could be added) */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" /> Screenshot provided (if any)
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => confirm(it.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Deposit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => reject(it.id)}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsVerify;
