/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { UserAccount, UserRole } from "../types";
import { Shield, Key, LogOut, ChevronDown, UserCheck, X, UserX, UserPlus, Milestone } from "lucide-react";

interface AuthModalsProps {
  currentUser: UserAccount | null;
  onLogin: (user: string, pass: string) => boolean;
  onRegister: (fullname: string, user: string, pass: string) => boolean;
  onLogout: () => void;
  showLoginModal: boolean;
  onCloseLoginModal: () => void;
  onOpenLoginModal: () => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  showLoginModal,
  onCloseLoginModal,
  onOpenLoginModal,
  onShowToast,
}) => {
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [showDropdown, setShowDropdown] = useState(false);

  // Form Fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      onShowToast("Vui lòng nhập tài khoản và mật khẩu!", "error");
      return;
    }

    const success = onLogin(username.trim(), password.trim());
    if (success) {
      onCloseLoginModal();
      setUsername("");
      setPassword("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !username.trim() || !password.trim()) {
      onShowToast("Vui lòng điền đầy đủ thông tin đăng ký!", "error");
      return;
    }

    const success = onRegister(fullname.trim(), username.trim(), password.trim());
    if (success) {
      setAuthTab("login");
      setUsername(username.trim());
      setPassword("");
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClose = () => setShowDropdown(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  return (
    <>
      {/* Dynamic Dropdown / Button on Navigation bar */}
      <div className="relative inline-block text-left" id="user-auth-trigger">
        {currentUser ? (
          <div>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-emerald-400 rounded-xl hover:bg-slate-750 transition font-bold text-xs border border-slate-700 shadow-sm cursor-pointer select-none font-display"
            >
              <UserCheck className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
              <span className="max-w-28 truncate">{currentUser.fullname}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDropdown && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-105 py-1 z-50 text-slate-800"
              >
                <div className="px-4 py-2 border-b border-slate-100 select-none">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider font-display">Tài khoản quản lý</p>
                  <p className="text-xs font-bold text-slate-700 truncate font-display">
                    {currentUser.username} ({currentUser.role.toUpperCase()})
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    onLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-bold border-t border-slate-50 flex items-center gap-2 cursor-pointer transition"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" /> Đăng xuất tài khoản
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              setAuthTab("login");
              setUsername("");
              setPassword("");
              onOpenLoginModal();
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-display font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/10 rounded-xl cursor-pointer transition"
          >
            <Key className="w-3.5 h-3.5" /> Đăng nhập quản trị
          </button>
        )}
      </div>

      {/* DETAILED LOGIN / REGISTER FORM OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 select-none">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5 font-display">
                <Shield className="w-5 h-5 text-indigo-600" /> Hệ thống chủ nhiệm
              </h3>
              <button
                onClick={onCloseLoginModal}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form switcher tabs */}
            <div className="flex border-b border-slate-100 mb-4 select-none">
              <button
                onClick={() => setAuthTab("login")}
                className={`flex-1 pb-2 font-bold text-sm transition font-display ${
                  authTab === "login"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => setAuthTab("register")}
                className={`flex-1 pb-2 font-bold text-sm transition font-display ${
                  authTab === "register"
                    ? "text-emerald-600 border-b-2 border-emerald-600"
                    : "text-slate-400 hover:text-slate-650"
                }`}
              >
                Đăng ký thành viên
              </button>
            </div>

            {/* Login Form content */}
            {authTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tên tài khoản</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: admin hoặc co_hong"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-201 border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Mật khẩu xác minh</label>
                  <input
                    type="password"
                    required
                    placeholder="Ví dụ: admin hoặc 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-201 border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Demonstration Alert notes banner */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5 leading-relaxed font-semibold">
                  <span className="text-slate-500 mt-0.5 font-display">ℹ️</span>
                  <p>
                    Tài khoản admin kiểm thử: <strong className="text-slate-755 font-bold">admin</strong> / mật khẩu:{" "}
                    <strong className="text-slate-755 font-bold">admin</strong>.
                    Tài khoản giáo viên: <strong className="text-slate-755 font-bold">co_hong</strong> / mật khẩu:{" "}
                    <strong className="text-slate-755 font-bold">123</strong>.
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onCloseLoginModal}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer transition"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-sm font-display shadow-indigo-600/10"
                  >
                    Đăng nhập hệ thống
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Họ và tên người sử dụng</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thầy Trần Anh Quân"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full border border-slate-201 border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tên đăng nhập mới</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên viết liền không dấu..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-slate-201 border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Mật khẩu bảo vệ</label>
                  <input
                    type="password"
                    required
                    placeholder="Nhập tối thiểu 3 kí tự..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-201 border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onCloseLoginModal}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer transition"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-sm font-display shadow-emerald-500/10"
                  >
                    Hoàn tất Đăng ký
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
