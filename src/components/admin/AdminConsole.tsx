"use client";

import { useCallback, useEffect, useState } from "react";

const ROLES = [
  "OrganizationAdmin", "CFO", "FPA", "Controller", "Leader", "ReadOnly",
] as const;

interface OrgUser {
  userId: string;
  email: string;
  role: string;
  status: string;
}
interface Org {
  id: string;
  name: string;
  tenantId: string;
  status: string;
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`);
  return body;
}

export default function AdminConsole({
  orgId,
  isSystemAdmin,
  isDemo,
}: {
  orgId: string;
  role: string;
  isSystemAdmin: boolean;
  isDemo: boolean;
}) {
  const [tab, setTab] = useState<"team" | "orgs">("team");
  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Demo mode — Clerk is not configured. Administration actions persist to the
          local control plane (org <code>{orgId}</code>) so you can exercise the full
          workflow; real email invitations require Clerk keys.
        </div>
      )}
      <div className="flex gap-2">
        <TabButton active={tab === "team"} onClick={() => setTab("team")}>Team &amp; Roles</TabButton>
        {isSystemAdmin && (
          <TabButton active={tab === "orgs"} onClick={() => setTab("orgs")}>Organizations &amp; Onboarding</TabButton>
        )}
      </div>
      {tab === "team" ? <TeamPanel orgId={orgId} /> : <OrgsPanel />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors ${
        active ? "bg-nexora-600 text-white border-nexora-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function TeamPanel({ orgId }: { orgId: string }) {
  const [users, setUsers] = useState<OrgUser[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("ReadOnly");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/admin/organizations/${encodeURIComponent(orgId)}/users`);
      setUsers(data.users ?? []);
      setErr(null);
    } catch (e) { setErr((e as Error).message); }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const invite = async () => {
    setMsg(null); setErr(null);
    try {
      await api(`/api/admin/organizations/${encodeURIComponent(orgId)}/users`, {
        method: "POST", body: JSON.stringify({ email, role }),
      });
      setMsg(`Invited ${email} as ${role}`); setEmail("");
      await load();
    } catch (e) { setErr((e as Error).message); }
  };

  const setUserRole = async (userId: string, newRole: string) => {
    try { await api(`/api/admin/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: JSON.stringify({ role: newRole }) }); await load(); }
    catch (e) { setErr((e as Error).message); }
  };
  const disable = async (userId: string) => {
    try { await api(`/api/admin/organizations/${encodeURIComponent(orgId)}/users/${encodeURIComponent(userId)}`, { method: "DELETE" }); await load(); }
    catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="space-y-4">
      <Card title="Invite user">
        <div className="flex flex-wrap gap-2 items-end">
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@client.com"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-64" />
          </Field>
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <button onClick={invite} disabled={!email}
            className="px-4 py-2 rounded-lg bg-nexora-600 text-white text-sm font-semibold disabled:opacity-40">Send invite</button>
        </div>
        {msg && <p className="text-emerald-600 text-[13px] mt-2">{msg}</p>}
        {err && <p className="text-red-600 text-[13px] mt-2">{err}</p>}
      </Card>

      <Card title={`Team (${users.length})`}>
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="py-2">Email</th><th>Role</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-b border-slate-50">
                <td className="py-2 text-slate-700">{u.email}</td>
                <td>
                  <select value={u.role} onChange={(e) => setUserRole(u.userId, e.target.value)}
                    className="border border-slate-200 rounded-md px-2 py-1 text-[12px]">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${u.status === "disabled" ? "bg-red-100 text-red-700" : u.status === "invited" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{u.status}</span></td>
                <td className="text-right">{u.status !== "disabled" && <button onClick={() => disable(u.userId)} className="text-red-600 text-[12px] font-semibold">Disable</button>}</td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">No users yet — invite one above.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function OrgsPanel() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { const data = await api(`/api/admin/organizations`); setOrgs(data.organizations ?? []); setErr(null); }
    catch (e) { setErr((e as Error).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const onboard = async () => {
    setErr(null); setMsg(null);
    try {
      const r = await api(`/api/admin/organizations`, { method: "POST", body: JSON.stringify({ name, adminEmail: adminEmail || undefined }) });
      setMsg(`Onboarded "${name}" (${r.organization?.id}) — status ${r.organization?.status}`);
      setName(""); setAdminEmail(""); await load();
    } catch (e) { setErr((e as Error).message); }
  };
  const enable = async (id: string) => {
    try { await api(`/api/admin/organizations/${encodeURIComponent(id)}/enable`, { method: "POST" }); await load(); }
    catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="space-y-4">
      <Card title="Onboard a new organization">
        <div className="flex flex-wrap gap-2 items-end">
          <Field label="Organization name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-56" />
          </Field>
          <Field label="Admin email (optional)">
            <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="cfo@acme.com"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-56" />
          </Field>
          <button onClick={onboard} disabled={!name}
            className="px-4 py-2 rounded-lg bg-nexora-600 text-white text-sm font-semibold disabled:opacity-40">Onboard</button>
        </div>
        {msg && <p className="text-emerald-600 text-[13px] mt-2">{msg}</p>}
        {err && <p className="text-red-600 text-[13px] mt-2">{err}</p>}
      </Card>

      <Card title={`Organizations (${orgs.length})`}>
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-slate-400 border-b border-slate-100">
            <th className="py-2">Name</th><th>Tenant ID</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {orgs.map((o) => (
              <tr key={o.id} className="border-b border-slate-50">
                <td className="py-2 text-slate-700">{o.name}</td>
                <td className="text-slate-500 font-mono text-[12px]">{o.tenantId}</td>
                <td><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${o.status === "active" ? "bg-emerald-100 text-emerald-700" : o.status === "onboarding" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{o.status}</span></td>
                <td className="text-right">{o.status === "onboarding" && <button onClick={() => enable(o.id)} className="text-nexora-600 text-[12px] font-semibold">Enable platform</button>}</td>
              </tr>
            ))}
            {orgs.length === 0 && <tr><td colSpan={4} className="py-4 text-slate-400">No organizations yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-[13px] font-bold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
