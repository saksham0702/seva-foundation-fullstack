import PageHeader from "@/components/dashboard/certificates/PageHeader";

export default function CertificateSettingsPage() {
  return (
    <div>
      <PageHeader title="Certificate Settings" subtitle="Module-wide preferences and defaults" />

      <div className="grid grid-cols-2 gap-6">
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">General</p>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <label className="text-faint block mb-1.5 text-xs">Organization Name</label>
              <input defaultValue="Seva India Foundation" className="w-full bg-bg border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Certificate ID Prefix</label>
              <input defaultValue="CERT-2026-" className="w-full bg-bg border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Default Template</label>
              <select className="w-full bg-bg border border-border rounded-lg px-3 py-2">
                <option>Volunteer Appreciation</option>
                <option>Internship Completion</option>
                <option>Donation Acknowledgement</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Verification & Security</p>
          <div className="flex flex-col gap-4 text-sm">
            <ToggleRow label="Require digital signature before issuance" checked />
            <ToggleRow label="Enable QR code verification" checked />
            <ToggleRow label="Allow public verification lookup" checked />
            <ToggleRow label="Auto-revoke on beneficiary status change" />
            <div>
              <label className="text-faint block mb-1.5 text-xs">Certificate Validity Period</label>
              <select className="w-full bg-bg border border-border rounded-lg px-3 py-2">
                <option>Lifetime</option>
                <option>5 Years</option>
                <option>2 Years</option>
                <option>1 Year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button className="bg-blueaccent text-white text-sm font-semibold px-5 py-2.5 rounded-lg">Save Changes</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <div className={`w-10 h-5.5 rounded-full p-0.5 flex ${checked ? "bg-blueaccent justify-end" : "bg-border justify-start"}`}>
        <span className="w-4.5 h-4.5 rounded-full bg-white block" />
      </div>
    </div>
  );
}
