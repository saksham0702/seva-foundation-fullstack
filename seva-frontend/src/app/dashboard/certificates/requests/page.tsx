import PageHeader from "@/components/dashboard/certificates/PageHeader";

const requests = [
  { id: "REQ-3312", name: "Meera Joshi", program: "Volunteer Training", requested: "2 hours ago", status: "Pending" },
  { id: "REQ-3311", name: "Arjun Kapoor", program: "Internship Completion", requested: "5 hours ago", status: "Pending" },
  { id: "REQ-3310", name: "Divya Rao", program: "Event Participation", requested: "Yesterday", status: "Approved" },
  { id: "REQ-3309", name: "Sameer Khan", program: "Donation Acknowledgement", requested: "Yesterday", status: "Rejected" },
];

const statusStyle: Record<string, string> = {
  Pending: "text-gold bg-gold/10",
  Approved: "text-green-400 bg-green-400/10",
  Rejected: "text-red-400 bg-red-400/10",
};

export default function CertificateRequestsPage() {
  return (
    <div>
      <PageHeader title="Certificate Requests" subtitle="Review and approve incoming issuance requests" />

      <div className="panel overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="label-eyebrow font-normal px-5 py-3">Request ID</th>
              <th className="label-eyebrow font-normal px-5 py-3">Recipient</th>
              <th className="label-eyebrow font-normal px-5 py-3">Program</th>
              <th className="label-eyebrow font-normal px-5 py-3">Requested</th>
              <th className="label-eyebrow font-normal px-5 py-3">Status</th>
              <th className="label-eyebrow font-normal px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3.5 font-mono text-xs text-muted">{r.id}</td>
                <td className="px-5 py-3.5 font-medium">{r.name}</td>
                <td className="px-5 py-3.5 text-muted">{r.program}</td>
                <td className="px-5 py-3.5 text-muted">{r.requested}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusStyle[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-5 py-3.5">
                  {r.status === "Pending" ? (
                    <div className="flex gap-2">
                      <button className="text-xs bg-blueaccent text-white px-3 py-1.5 rounded-md">Approve</button>
                      <button className="text-xs border border-border text-muted px-3 py-1.5 rounded-md">Reject</button>
                    </div>
                  ) : (
                    <span className="text-xs text-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
