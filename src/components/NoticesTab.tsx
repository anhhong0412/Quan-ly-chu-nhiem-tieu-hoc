/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Notice } from "../types";
import { Megaphone, Calendar, Plus, X, Trash2, MessageSquareQuote } from "lucide-react";

interface NoticesTabProps {
  notices: Notice[];
  hasPermission: (perm: string) => boolean;
  onAddNotice: (notice: Notice) => void;
  onDeleteNotice: (id: number) => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const NoticesTab: React.FC<NoticesTabProps> = ({
  notices,
  hasPermission,
  onAddNotice,
  onDeleteNotice,
  onShowToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
  });

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("notices_manage")) {
      onShowToast("Bạn không có quyền đăng thông báo liên lạc!", "error");
      return;
    }
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      onShowToast("Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!", "error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const notice: Notice = {
      id: Date.now(),
      tieu_de: newNotice.title.trim(),
      noi_dung: newNotice.content.trim(),
      ngay_dang: todayStr,
    };

    onAddNotice(notice);
    setShowAddModal(false);
    setNewNotice({ title: "", content: "" });
    onShowToast("Đã đăng thông báo mới lên bảng tin phụ huynh!", "success");
  };

  const handleDeleteWithCheck = (id: number, title: string) => {
    if (!hasPermission("notices_manage")) {
      onShowToast("Bạn không có quyền xóa thông báo này!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có đồng ý xóa bản tin thông báo '${title}' không?`);
    if (isConfirmed) {
      onDeleteNotice(id);
      onShowToast("Đã gỡ bỏ bản tin thông báo thành công!", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-800 font-display">Bảng tin truyền thông liên lạc phụ huynh</h3>
          <p className="text-xs text-slate-400">Đăng tải thông cáo họp lớp, dã ngoại, nhắc nhở đóng góp và ôn tập</p>
        </div>

        <button
          onClick={() => {
            if (!hasPermission("notices_manage")) {
              onShowToast("Bạn cần có quyền để đăng tải thông báo lên bảng tin!", "error");
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-semibold text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Đăng thông báo mới
        </button>
      </div>

      <div className="space-y-6">
        {notices.length === 0 ? (
          <div className="bg-white py-12 px-6 rounded-2xl text-center text-slate-400 italic border border-slate-100 shadow-sm font-display">
            Chưa có thông báo nào được đăng tải trên Bảng tin.
          </div>
        ) : (
          notices.map((not) => (
            <div
              key={not.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-205 relative overflow-hidden group hover:shadow-md transition duration-200"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>

              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[10px] rounded uppercase tracking-wider font-display">
                    Liên lạc lớp
                  </span>
                  <span className="text-xs text-slate-405 font-medium flex items-center gap-0.5 font-display">
                    <Calendar className="w-3.5 h-3.5" /> {not.ngay_dang ? not.ngay_dang.split("-").reverse().join("/") : "-"}
                  </span>
                </div>

                {hasPermission("notices_manage") && (
                  <button
                    onClick={() => handleDeleteWithCheck(not.id, not.tieu_de)}
                    className="text-slate-400 hover:text-rose-600 transition p-1 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <h4 className="font-bold text-base text-slate-800 mb-2 leading-tight flex items-center gap-1.5 font-display">
                <Megaphone className="w-4.5 h-4.5 text-rose-500 shrink-0" /> {not.tieu_de}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                {not.noi_dung}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ADD NOTICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 font-display">Tạo thông báo mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tiêu đề thông cáo</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lịch tập kết Kế hoạch nhỏ đợt 2"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Nội dung chi tiết nhắn gửi phụ huynh</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Điền thông báo chi tiết: chủ trương, thời gian, quy chuẩn, lưu ý dành cho gia đình học sinh..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-605 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Đăng thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
