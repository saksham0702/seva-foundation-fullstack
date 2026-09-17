import { redirect } from "next/navigation";

export default function CertificatesRootPage() {
  redirect("/dashboard/certificates/dashboard");
}
