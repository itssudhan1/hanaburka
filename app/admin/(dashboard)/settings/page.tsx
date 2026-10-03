import SettingsForm from "@/components/admin/SettingsForm";
import CustomerCareLinksManager from "@/components/admin/CustomerCareLinksManager";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessInfo, getCustomerCareLinks } from "@/lib/config";

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const [{ data: settings }, businessInfo, customerCareLinks] = await Promise.all([
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["checkout_mode", "whatsapp", "show_buy_now"]),
    getBusinessInfo(),
    getCustomerCareLinks(),
  ]);

  const map = Object.fromEntries((settings ?? []).map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-2xl text-espresso mb-6">Settings</h1>
      <SettingsForm
        checkoutMode={map.checkout_mode?.mode ?? "whatsapp"}
        whatsappNumber={map.whatsapp?.number ?? ""}
        businessInfo={businessInfo}
        showBuyNow={map.show_buy_now?.enabled ?? true}
      />

      <div className="mt-10 pt-10 border-t border-mocha/15 max-w-lg">
        <h2 className="text-lg text-espresso mb-3">Footer — Customer Care Links</h2>
        <CustomerCareLinksManager links={customerCareLinks} />
      </div>
    </div>
  );
}
