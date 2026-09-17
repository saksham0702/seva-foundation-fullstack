import { Mail, MessageCircle } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";

export default function EmailWhatsappPage() {
  return (
    <div>
      <PageHeader title="Email & WhatsApp" subtitle="Configure how certificates are delivered to recipients" />

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="panel p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <Mail size={16} className="text-blueaccent" />
            <p className="label-eyebrow">Email Delivery</p>
            <span className="ml-auto text-xs text-green-400">Connected</span>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <label className="text-faint block mb-1.5 text-xs">Sender Name</label>
              <input defaultValue="Seva India Foundation" className="w-full bg-bg border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Subject Line</label>
              <input defaultValue="Your certificate from Seva India Foundation" className="w-full bg-bg border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Message</label>
              <textarea
                rows={4}
                defaultValue="Dear {{name}}, congratulations! Your certificate for {{program}} is attached. Thank you for your contribution."
                className="w-full bg-bg border border-border rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <MessageCircle size={16} className="text-green-400" />
            <p className="label-eyebrow">WhatsApp Delivery</p>
            <span className="ml-auto text-xs text-green-400">Connected</span>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <label className="text-faint block mb-1.5 text-xs">Business Number</label>
              <input defaultValue="+91 98765 43210" className="w-full bg-bg border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Template Name</label>
              <select className="w-full bg-bg border border-border rounded-lg px-3 py-2">
                <option>certificate_ready_v1</option>
                <option>certificate_reminder_v1</option>
              </select>
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Preview</label>
              <div className="bg-bg border border-border rounded-lg px-3 py-3 text-xs text-muted">
                Hi {"{{name}}"}, your certificate for {"{{program}}"} is ready. Tap below to download.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-blueaccent text-white text-sm font-semibold px-5 py-2.5 rounded-lg">Save Settings</button>
      </div>
    </div>
  );
}
