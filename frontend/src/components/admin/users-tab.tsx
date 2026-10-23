'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Trash2,
  X,
  Shield,
  Users,
} from 'lucide-react';
import { AdminUserAccount } from './types';

interface UsersTabProps {
  teamUsers: AdminUserAccount[];
  onAddUser: (user: {
    name: string;
    email: string;
    role: AdminUserAccount['role'];
    department: string;
  }) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  externalOpenModal?: boolean;
  onClearExternalOpenModal?: () => void;
}

export function UsersTab({
  teamUsers,
  onAddUser,
  onDeleteUser,
  externalOpenModal,
  onClearExternalOpenModal,
}: UsersTabProps) {
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN' as AdminUserAccount['role'],
    department: 'Operations & Support',
  });

  useEffect(() => {
    if (externalOpenModal) {
      setShowModal(true);
      if (onClearExternalOpenModal) onClearExternalOpenModal();
    }
  }, [externalOpenModal, onClearExternalOpenModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddUser({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      department: form.department.trim(),
    });

    setShowModal(false);
    setForm({
      name: '',
      email: '',
      role: 'ADMIN',
      department: 'Operations & Support',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Administrator &amp; Staff Team
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Personnel authorized to manage products, enquiries, and orders
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {teamUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-zinc-900 block">{user.name}</span>
                    <span className="text-[11px] text-zinc-400 font-mono">{user.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.role === 'SUPER_ADMIN'
                          ? 'bg-red-50 text-[#E50914] border border-red-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-600">{user.department}</td>
                  <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{user.lastLogin}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {user.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        aria-label="Remove user"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= MODAL: ADD USER ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">Add Team Member</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Create an administrative user account with role-based dashboard access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senthil Nathan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="senthil@butterflytv.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as AdminUserAccount['role'] })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="OPERATOR">OPERATOR</option>
                    <option value="CATALOG_MANAGER">CATALOG MANAGER</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inventory Ops"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
