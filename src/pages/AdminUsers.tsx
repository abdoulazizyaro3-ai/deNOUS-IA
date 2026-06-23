import React, { useState, useEffect } from "react";
import { User, Shield, ShieldCheck, Loader2 } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users/");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users/${userId}/role/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, profile: { ...u.profile, role: newRole } } : u));
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-[#C1561F]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#EADBC8] shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-[#334034] flex items-center gap-2">
            <User className="text-[#C1561F]" size={22} />
            Gestion des Utilisateurs
          </h2>
          <p className="text-xs text-[#2B1810]/60 mt-1">
            Modifiez les rôles et permissions des inscrits.
          </p>
        </div>
        <div className="text-sm font-bold text-[#C1561F] bg-[#FAF6F0] px-3 py-1.5 rounded-lg border border-[#EADBC8]">
          {users.length} comptes
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EADBC8] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF6F0] border-b border-[#EADBC8] text-[#2B1810]/70 text-xs uppercase font-black tracking-wider">
            <tr>
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rôle actuel</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBC8]">
            {users.map((u) => {
              const currentRole = u.profile?.role || "user";
              const isSuperAdmin = u.is_superuser;
              
              return (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#2B1810] flex items-center gap-2">
                      {isSuperAdmin && <ShieldCheck size={14} className="text-[#3D6B35]" />}
                      {u.profile?.full_name || u.username}
                    </div>
                    <div className="text-xs text-[#2B1810]/60">@{u.username}</div>
                  </td>
                  <td className="px-6 py-4 text-[#2B1810]/70">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentRole === "admin" || currentRole === "moderator" || isSuperAdmin
                        ? "bg-green-100 text-green-800"
                        : currentRole === "visitor" 
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                    }`}>
                      {isSuperAdmin ? "Super Admin" : currentRole === "admin" ? "Administrateur" : currentRole === "visitor" ? "Visiteur" : "Utilisateur"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      disabled={updating === u.id || isSuperAdmin}
                      value={currentRole}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-[#FAF6F0] border border-[#EADBC8] text-[#2B1810] text-xs rounded-lg focus:ring-[#C1561F] focus:border-[#C1561F] block w-full p-2"
                    >
                      <option value="visitor">Visiteur</option>
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
