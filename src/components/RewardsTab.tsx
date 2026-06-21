/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Student, Movement } from "../types";
import { Trophy, Medal, Plus, X, Trash2, Award, Users, Calendar, Crown } from "lucide-react";

interface RewardsTabProps {
  students: Student[];
  movements: Movement[];
  hasPermission: (perm: string) => boolean;
  onAddMovement: (m: Movement) => void;
  onDeleteMovement: (id: number) => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({
  students,
  movements,
  hasPermission,
  onAddMovement,
  onDeleteMovement,
  onShowToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMove, setNewMove] = useState({
    title: "",
    type: "Hội thi" as "Hội thi" | "Phong trào",
    date: "",
    result: "",
  });

  // Calculate top 5 students based on behavior points
  const topStudents = [...students]
    .sort((a, b) => b.diem_ne_nep - a.diem_ne_nep)
    .slice(0, 5);

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("movements_manage")) {
      onShowToast("Bạn không có quyền đăng tuyển tập thi đua khen thưởng!", "error");
      return;
    }
    if (!newMove.title.trim() || !newMove.result.trim()) {
      onShowToast("Vui lòng điền đủ Tên phong trào và thành tích!", "error");
      return;
    }

    const movement: Movement = {
      id: Date.now(),
      ten_hoat_dong: newMove.title.trim(),
      loai: newMove.type,
      danh_sach_dat_giai: newMove.result.trim(),
      ngay_to_chuc: newMove.date || new Date().toISOString().split("T")[0],
    };

    onAddMovement(movement);
    setShowAddModal(false);
    setNewMove({ title: "", type: "Hội thi", date: "", result: "" });
    onShowToast("Đã lập vinh danh phong trào mới lên bảng vàng Lớp 5A!", "success");
  };

  const handleDeleteWithCheck = (id: number, title: string) => {
    if (!hasPermission("movements_manage")) {
      onShowToast("Bạn không có quyền xóa phong trào này!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có đồng ý gỡ bỏ phong trào rèn luyện '${title}' khỏi bảng thi đua?`);
    if (isConfirmed) {
      onDeleteMovement(id);
      onShowToast("Đã gỡ phong trào thi đua!", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-800 font-display">Khen thưởng thi đua & Bảng vàng phong trào</h3>
          <p className="text-xs text-slate-400">Tôn vinh nỗ lực cá nhân xuất sắc và giải thưởng chung của chi đội lớp 5A</p>
        </div>

        <button
          onClick={() => {
            if (!hasPermission("movements_manage")) {
              onShowToast("Bạn cần có quyền quản lý thi đua để đăng vinh danh mới!", "error");
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-semibold text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Đăng tích cực & Hội thi mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trophies list */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-5 pb-2 border-b border-slate-150 flex items-center gap-2 font-display">
            <Trophy className="w-5 h-5 text-amber-500" /> Bảng vàng thành tích học sinh & Sổ lưu hội thi
          </h4>

          <div className="space-y-4">
            {movements.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-12">Chưa ghi nhận hoạt động thi đua nào.</p>
            ) : (
              movements.map((m) => {
                const isMatch = m.loai === "Hội thi";
                return (
                  <div
                    key={m.id}
                    className="p-5 bg-slate-50/70 border border-slate-150 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.02)] relative hover:bg-slate-50 transition"
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider font-display ${
                          isMatch
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {m.loai}
                      </span>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {m.ngay_to_chuc ? m.ngay_to_chuc.split("-").reverse().join("/") : "-"}
                        </span>
                        
                        {hasPermission("movements_manage") && (
                          <button
                            onClick={() => handleDeleteWithCheck(m.id, m.ten_hoat_dong)}
                            className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Gỡ phong trào"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-805 mb-2.5 font-display flex items-center gap-1">
                      <Award className="w-4 h-4 text-indigo-500 shrink-0" /> {m.ten_hoat_dong}
                    </h4>

                    <div className="p-3.5 bg-white border border-slate-150 rounded-xl flex items-start gap-2 text-xs text-slate-650 leading-relaxed font-semibold">
                      <span className="text-amber-500 shrink-0 mt-0.5 font-display">👑</span>
                      <p className="whitespace-pre-line text-slate-600 font-medium">{m.danh_sach_dat_giai}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-205">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-emerald-500" />
            <div>
              <h4 className="font-bold text-slate-850 text-sm font-display">Gương sáng tiêu biểu lớp 5A</h4>
              <p className="text-[10px] text-slate-400">Các học sinh xuất sắc tích cực rèn nề nếp thi đua</p>
            </div>
          </div>

          <div className="space-y-3 select-none">
            {topStudents.map((std, index) => {
              let posStyle = "bg-slate-100 text-slate-500";
              if (index === 0) posStyle = "bg-amber-400 text-slate-950 font-black scale-105 shadow-sm";
              else if (index === 1) posStyle = "bg-slate-350 bg-slate-200 text-slate-800 font-bold";
              else if (index === 2) posStyle = "bg-amber-600 text-white font-bold";

              return (
                <div
                  key={std.id}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 hover:bg-slate-100/40 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6.5 h-6.5 rounded-lg ${posStyle} font-display text-xs flex items-center justify-center shrink-0 shadow-inner`}>
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block font-display leading-tight">{std.ho_ten}</span>
                      <span className="text-[9px] text-slate-400">Mã: {std.id}</span>
                    </div>
                  </div>
                  
                  <span className={`text-xs font-extrabold font-display ${std.diem_ne_nep > 0 ? "text-emerald-600" : std.diem_ne_nep < 0 ? "text-rose-600" : "text-slate-500"}`}>
                    {std.diem_ne_nep > 0 ? "+" : ""}{std.diem_ne_nep} điểm
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD MOVEMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 font-display">Tạo vinh danh thi đua mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tên phong trào / Hoạt động thi đấu</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hội diễn văn nghệ kỷ niệm 26/03"
                  value={newMove.title}
                  onChange={(e) => setNewMove({ ...newMove, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Loại hình</label>
                  <select
                    value={newMove.type}
                    onChange={(e) =>
                      setNewMove({
                        ...newMove,
                        type: e.target.value as "Hội thi" | "Phong trào",
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Hội thi">Hội thi cấp Trường / Huyện</option>
                    <option value="Phong trào">Phong trào lớp / liên đội</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Thời gian diễn ra</label>
                  <input
                    type="date"
                    required
                    value={newMove.date}
                    onChange={(e) => setNewMove({ ...newMove, date: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Kết quả thành tích vinh danh</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ghi nhận thành tích của cá nhân xuất sắc hoặc tập thể lớp...&#10;Ví dụ: Lớp 5A xuất sắc đoạt Giải Nhất văn nghệ cấp trường. Học sinh Tống Mỹ Linh đạt danh hiệu Hoạt động tích cực."
                  value={newMove.result}
                  onChange={(e) => setNewMove({ ...newMove, result: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-650 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Báo cáo thành tích
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
