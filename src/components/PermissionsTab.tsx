/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { UserAccount, ALL_PERMISSIONS } from "../types";
import { Shield, Key, CheckSquare, Square, Trash2, Edit2, ShieldAlert, BadgeCheck, X, ToggleLeft, ToggleRight, Info } from "lucide-react";

interface PermissionsTabProps {
  users: UserAccount[];
  currentUser: UserAccount | null;
  onUpdateUserPermissions: (username: string, role: "admin" | "teacher" | "guest", permissions: string[]) => void;
  onDeleteUser: (username: string) => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const PermissionsTab: React.FC<PermissionsTabProps> = ({
  users,
  currentUser,
  onUpdateUserPermissions,
  onDeleteUser,
  onShowToast,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [tempRole, setTempRole] = useState<"admin" | "teacher" | "guest">("guest");
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user);
    setTempRole(user.role);
    setTempPermissions([...user.permissions]);
  };

  const handleTogglePermission = (id: string) => {
    if (tempPermissions.includes(id)) {
      setTempPermissions(tempPermissions.filter((p) => p !== id));
    } else {
      setTempPermissions([...tempPermissions, id]);
    }
  };

  const handleApplyPermissions = () => {
    if (!selectedUser) return;
    if (selectedUser.username === "admin" && tempRole !== "admin") {
      onShowToast("Tài khoản quản trị 'admin' hệ thống bắt buộc phải giữ ID role Admin!", "error");
      return;
    }

    onUpdateUserPermissions(selectedUser.username, tempRole, tempPermissions);
    setSelectedUser(null);
    onShowToast(`Đã điều chỉnh phân quyền tài khoản '${selectedUser.username}' thành công!`, "success");
  };

  const handleDeleteUserClick = (username: string) => {
    if (username === "admin") {
      onShowToast("Không thể xóa tài khoản Quản trị hệ thống gốc!", "error");
      return;
    }
    if (currentUser && currentUser.username === username) {
      onShowToast("Bạn không thể tự xóa tài khoản của chính mình khi đang đăng nhập!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có đồng ý xóa vĩnh viễn tài khoản '${username}' này khỏi danh sách phân quyền?`);
    if (isConfirmed) {
      onDeleteUser(username);
      onShowToast(`Đã bãi bỏ tài khoản '${username}' khỏi hệ thống!`, "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-150">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
          <Shield className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="font-bold text-base text-slate-800 font-display">Phân hệ quản trị phân quyền (RBAC Center)</h3>
            <p className="text-xs text-slate-400">Xem và sửa đổi các quyền thao tác ghi, đọc dữ liệu của mọi tài khoản trong trường</p>
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl text-xs text-amber-850 border border-amber-100 mb-6 flex items-start gap-2.5 leading-relaxed font-semibold select-none">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            Hệ thống áp dụng cơ chế Bảo mật Phân quyền chi tiết (Granular Permission Mapping). 
            Chỉ những tài khoản có quyền cụ thể mới được thực hiện cập nhật tương ứng. 
            Mã hoặc tài khoản quản trị <strong className="text-slate-850">admin/admin</strong> có đặc nhiệm can thiệp tất cả hoạt động.
          </div>
        </div>

        {/* User Account Registry Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-150 text-slate-450 font-bold text-xs uppercase tracking-wider font-display">
                <th className="py-4 px-6">Tài khoản</th>
                <th className="py-4 px-6">Họ tên đại diện</th>
                <th className="py-4 px-6">Loại Vai trò (Role)</th>
                <th className="py-4 px-6">Quyền hoạt động</th>
                <th className="py-4 px-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map((acc) => (
                <tr key={acc.username} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-bold text-slate-800 font-display">{acc.username}</td>
                  <td className="py-4 px-6 font-semibold text-slate-500 font-display">{acc.fullname}</td>
                  <td className="py-4 px-6 select-none font-display text-xs">
                    {acc.role === "admin" ? (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-black rounded-lg border border-indigo-100">
                        ADMIN
                      </span>
                    ) : acc.role === "teacher" ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-lg border border-emerald-100">
                        GIÁO VIÊN
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-bold rounded-lg border border-slate-200">
                        PHỤ HUYNH
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    <div className="flex flex-wrap gap-1 max-w-sm">
                      {acc.role === "admin" ? (
                        <span className="text-[10px] bg-indigo-50/70 text-indigo-600 px-1.5 py-0.5 rounded font-bold">
                          Toàn quyền Admin hệ thống
                        </span>
                      ) : acc.permissions.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Chỉ được xem (View-only)</span>
                      ) : (
                        acc.permissions.map((pid) => {
                          const pObj = ALL_PERMISSIONS.find((p) => p.id === pid);
                          return (
                            <span
                              key={pid}
                              className="text-[10px] bg-slate-150 text-slate-650 px-1.5 py-0.5 rounded font-bold border border-slate-200"
                            >
                              {pObj ? pObj.name : pid}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right flex items-center justify-end gap-1.5 h-full">
                    <button
                      onClick={() => handleEditUser(acc)}
                      className="p-1.5 bg-slate-150 text-indigo-650 hover:bg-slate-200 hover:text-indigo-800 rounded-lg transition cursor-pointer"
                      title="Sửa phân quyền"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {acc.username !== "admin" && (
                      <button
                        onClick={() => handleDeleteUserClick(acc.username)}
                        className="p-1.5 bg-slate-150 text-rose-500 hover:bg-slate-200 hover:text-rose-700 rounded-lg transition cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST PERMISSIONS OVERLAY MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full animate-fade-in border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 select-none">
              <h3 className="font-bold text-lg text-slate-805 font-display flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-indigo-500" /> Cấu hình phân quyền ({selectedUser.username})
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Role select */}
              <div>
                <label className="block text-xs font-extrabold text-slate-450 uppercase mb-1 font-display tracking-wider">
                  Chỉ định Vai trò chung (Role)
                </label>
                <select
                  value={tempRole}
                  onChange={(e) => {
                    const r = e.target.value as "admin" | "teacher" | "guest";
                    setTempRole(r);
                    if (r === "admin") {
                      // Grant all permissions
                      setTempPermissions(ALL_PERMISSIONS.map((p) => p.id));
                    } else if (r === "guest") {
                      setTempPermissions([]);
                    } else if (r === "teacher") {
                      // default teacher permissions
                      setTempPermissions([
                        "students_manage",
                        "behavior_adjust",
                        "attendance_manage",
                        "assignments_manage",
                        "documents_manage",
                        "notices_manage",
                        "movements_manage",
                      ]);
                    }
                  }}
                  className="w-full border border-slate-205 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="guest">Khách / Học sinh / Phụ huynh (Chỉ đọc nội bộ)</option>
                  <option value="teacher">Giáo viên chủ nhiệm (Có quyền quản lý lớp)</option>
                  <option value="admin">Quản trị viên Hệ thống (Toàn quyền tối cao)</option>
                </select>
              </div>

              {/* Granular Checkboxes */}
              <div>
                <label className="block text-xs font-extrabold text-slate-450 uppercase mb-2 font-display tracking-wider">
                  Quyền năng chi tiết (Granular Permission Mapping)
                </label>

                {tempRole === "admin" ? (
                  <p className="text-xs text-indigo-650 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-semibold italic text-center">
                    Vai trò ADMIN tự động được cấp toàn quyền, không cần cấu hình thêm.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-1">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = tempPermissions.includes(perm.id);
                      return (
                        <div
                          key={perm.id}
                          onClick={() => handleTogglePermission(perm.id)}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 transition select-none ${
                            isChecked ? "bg-indigo-50/40 border-indigo-150" : "bg-white border-slate-202"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 text-indigo-600">
                            {isChecked ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 font-display block leading-tight">{perm.name}</span>
                            <p className="text-[10px] text-slate-405 leading-snug font-medium mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 border border-slate-105 rounded-xl text-slate-650 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Huỷ lệnh
                </button>
                <button
                  onClick={handleApplyPermissions}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Xác nhận lưu quyền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
