import { Camera, KeyRound, Trash2, UserRound, X } from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import Button from "../../ui/Button";
import { Input } from "../../ui/Input";

/* ── shared ───────────────────────────────────────────────────────────*/

function Card({ children, className = "" }) {
  return (
    <div className={`bg-(--light-bg-container) dark:bg-(--dark-bg-container) border border-(--light-border-color) dark:border-(--dark-border-color) rounded-xl p-5 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, iconColor = "bg-(--main-color)/10 text-(--main-color)", title, description }) {
  return (
    <div className="flex items-start gap-3 mb-5 shrink-0">
      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-(--dark-main-color) dark:text-(--light-color)">{title}</p>
        {description && <p className="text-xs text-(--dark-third-color) mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-(--light-bg-input) dark:bg-(--dark-bg-input) border border-(--light-border-color) dark:border-(--dark-border-color)">
      <span className="text-xs font-semibold uppercase tracking-wide text-(--dark-third-color)">{label}</span>
      <span className="text-sm text-(--dark-main-color) dark:text-(--light-color)">
        {value || <span className="text-(--dark-third-color) italic text-xs">Non specificato</span>}
      </span>
    </div>
  );
}

/* ── delete account modal ─────────────────────────────────────────────*/

function DeleteAccountModal({ onClose, onConfirm, deleting, error }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !deleting) onClose(); }}
    >
      <div className="w-full max-w-sm bg-(--light-bg-modal) dark:bg-(--dark-bg-modal) rounded-2xl border border-(--light-border-color) dark:border-(--dark-border-color) shadow-xl p-6">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) cursor-pointer disabled:cursor-not-allowed rounded-lg p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center gap-4 mt-1 mb-6">
          <div className="size-16 rounded-full bg-(--danger-color)/10 flex items-center justify-center">
            <Trash2 className="size-8 text-(--danger-color)" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-(--dark-main-color) dark:text-(--light-color)">
              Eliminare l'account?
            </h3>
            <p className="text-sm text-(--dark-second-color) dark:text-(--dark-third-color) mt-1.5">
              Questa azione è <span className="font-semibold text-(--danger-color)">irreversibile</span>. Tutti i tuoi dati — transazioni, categorie, obiettivi e abbonamenti — verranno eliminati definitivamente.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-(--danger-color) text-center mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="w-full bg-(--danger-color) hover:bg-(--danger-hover-color) disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors duration-150"
          >
            {deleting ? "Eliminazione in corso..." : "Elimina definitivamente"}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            className="w-full text-sm font-semibold text-(--dark-second-color) dark:text-(--dark-third-color) hover:text-(--dark-main-color) dark:hover:text-(--light-color) py-2 cursor-pointer disabled:cursor-not-allowed transition-colors duration-150"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── profile card ─────────────────────────────────────────────────────*/

function ProfileCard({ user, profile, onRefresh }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const initials = profile
    ? `${profile.name?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : (user?.email?.[0] ?? "?").toUpperCase();

  const displayName = profile?.name
    ? `${profile.name} ${profile.lastName ?? ""}`.trim()
    : user?.email ?? "";

  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError("Il file supera i 2MB."); return; }
    setUploadError(null);
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { console.error("Upload error:", error); setUploadError("Errore durante il caricamento."); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ profileImage: `${data.publicUrl}?t=${Date.now()}` }).eq("id", user.id);
    await onRefresh();
    setUploading(false);
  }

  return (
    <Card>
      <CardHeader icon={UserRound} title="Profilo" description="Le tue informazioni personali" />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3 py-5 border-y border-(--light-border-color) dark:border-(--dark-border-color) mb-5 shrink-0">
        <div className="relative group">
          <div className="size-24 rounded-full bg-(--third-color) flex items-center justify-center overflow-hidden ring-4 ring-(--light-border-color) dark:ring-(--dark-border-color)">
            {profile?.profileImage
              ? <img src={profile.profileImage} alt="avatar" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
              : <span className="text-3xl font-bold text-white">{initials}</span>
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            aria-label="Cambia foto"
          >
            <Camera className="size-5 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-(--dark-main-color) dark:text-(--light-color)">{displayName}</p>
          <p className="text-xs text-(--dark-third-color) mt-0.5">{user?.email}</p>
        </div>
        <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs px-3 py-1.5">
          {uploading ? "Caricamento..." : "Cambia foto"}
        </Button>
        {uploadError && <p className="text-xs text-(--danger-color)">{uploadError}</p>}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <InfoField label="Nome" value={profile?.name} />
          <InfoField label="Cognome" value={profile?.lastName} />
        </div>
        <InfoField label="Email" value={user?.email} />
        <div className="grid grid-cols-2 gap-2">
          <InfoField label="Data di nascita" value={formatDate(profile?.birthdate)} />
          <InfoField label="Sesso" value={profile?.gender} />
        </div>
      </div>
    </Card>
  );
}

/* ── security card ────────────────────────────────────────────────────*/

function SecurityCard({ onDeleteClick }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) { setError("Minimo 6 caratteri."); return; }
    if (form.password !== form.confirm) { setError("Le password non coincidono."); return; }
    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password: form.password });
    setSaving(false);
    if (err) { setError(err.message); return; }
    setForm({ password: "", confirm: "" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <Card>
      <CardHeader
        icon={KeyRound}
        iconColor="bg-orange-500/10 text-orange-500"
        title="Sicurezza"
        description="Aggiorna la password del tuo account"
      />

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <Input
          label="Nuova password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
        />
        <Input
          label="Conferma password"
          type="password"
          placeholder="••••••••"
          value={form.confirm}
          onChange={set("confirm")}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-(--danger-color)">{error}</p>}
        <div className="pt-3 border-t border-(--light-border-color) dark:border-(--dark-border-color) flex items-center gap-4">
          <Button type="submit" disabled={saving || !form.password || !form.confirm}>
            {saving ? "Salvataggio..." : "Cambia password"}
          </Button>
          {success && <p className="text-sm text-(--success-color) font-medium">Password aggiornata.</p>}
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-auto pt-4 border-t border-(--danger-color)/20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-(--danger-color)">Elimina account</p>
            <p className="text-xs text-(--dark-third-color) mt-0.5">
              Elimina permanentemente l'account e tutti i dati.
            </p>
          </div>
          <button
            onClick={onDeleteClick}
            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-(--danger-color) border border-(--danger-color)/40 hover:bg-(--danger-color)/10 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150"
          >
            <Trash2 className="size-3.5" />
            Elimina account
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ── page ─────────────────────────────────────────────────────────────*/

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      console.error("delete_own_account error:", error);
      setDeleteError("Errore durante l'eliminazione. Riprova.");
      setDeleting(false);
      return;
    }
    await signOut();
  }

  return (
    <section className="h-screen flex flex-col px-5 pb-5 md:px-7 md:pb-7 pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <ProfileCard user={user} profile={profile} onRefresh={refreshProfile} />
        <SecurityCard onDeleteClick={() => { setDeleteError(null); setShowDeleteModal(true); }} />
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </section>
  );
}
