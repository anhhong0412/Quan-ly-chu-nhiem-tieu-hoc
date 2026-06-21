/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Student, Assignment } from "../types";
import { BookOpen, Calendar, HelpCircle, CheckCircle, XCircle, Plus, X, ListTodo, FileSpreadsheet } from "lucide-react";

interface AssignmentsTabProps {
  students: Student[];
  assignments: Assignment[];
  hasPermission: (perm: string) => boolean;
  onAddAssignment: (assignment: Assignment) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: number) => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({
  students,
  assignments,
  hasPermission,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onShowToast,
}) => {
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>("Tất cả");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    subject: "Toán" as "Toán" | "Tiếng Việt" | "Tiếng Anh" | "Khác",
    dueDate: "",
    content: "",
  });

  const filteredAssignments = activeSubjectFilter === "Tất cả"
    ? assignments
    : assignments.filter((a) => a.mon_hoc === activeSubjectFilter);

  const handleToggleStudentSubmission = (asgId: number, studentId: string) => {
    if (!hasPermission("assignments_manage")) {
      onShowToast("Bạn cần có quyền Quản lý bài tập để đánh giá nộp bài!", "error");
      return;
    }
    const currentAsg = assignments.find((a) => a.id === asgId);
    if (!currentAsg) return;

    const currentStatus = !!currentAsg.submissions[studentId];
    const updatedSubmissions = {
      ...currentAsg.submissions,
      [studentId]: !currentStatus,
    };

    const updatedAsg: Assignment = {
      ...currentAsg,
      submissions: updatedSubmissions,
    };

    onUpdateAssignment(updatedAsg);
    onShowToast(`Đã thay đổi trạng thái nộp bài của HS ${studentId}!`, "success");
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("assignments_manage")) {
      onShowToast("Bạn không có quyền giao bài tập. Vui lòng liên hệ Admin!", "error");
      return;
    }

    if (!newAssignment.title.trim() || !newAssignment.content.trim()) {
      onShowToast("Vui lòng điền đủ Tiêu đề và Nội dung bài tập!", "error");
      return;
    }

    // Initialize all student submissions to false
    const studentsSubMap: Record<string, boolean> = {};
    students.forEach((s) => {
      studentsSubMap[s.id] = false;
    });

    const assignment: Assignment = {
      id: Date.now(),
      ten_bai_tap: newAssignment.title.trim(),
      mon_hoc: newAssignment.subject,
      noi_dung: newAssignment.content.trim(),
      han_nop: newAssignment.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      submissions: studentsSubMap,
    };

    onAddAssignment(assignment);
    setShowAddModal(false);
    setNewAssignment({ title: "", subject: "Toán", dueDate: "", content: "" });
    onShowToast("Giao phiếu ôn tập/bài tập mới thành công!", "success");
  };

  const handleDeleteAssignment = (id: number, title: string) => {
    if (!hasPermission("assignments_manage")) {
      onShowToast("Bạn không có quyền xóa bài tập này!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có đồng ý xóa bài tập '${title}' không?`);
    if (isConfirmed) {
      onDeleteAssignment(id);
      onShowToast("Đã xóa bài tập khỏi hệ thống!", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-800 font-display">Sổ giao bài tập & Tiến trình nộp bài</h3>
          <p className="text-xs text-slate-400">Xem tiến độ hoàn thành, chấm bài tập và giao phản hồi cho học sinh</p>
        </div>
        
        <button
          onClick={() => {
            if (!hasPermission("assignments_manage")) {
              onShowToast("Bạn không có quyền giao bài tập!", "error");
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-semibold text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Giao bài tập mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto select-none">
        {["Tất cả", "Toán", "Tiếng Việt", "Tiếng Anh", "Khác"].map((subject) => {
          const isActive = activeSubjectFilter === subject;
          return (
            <button
              key={subject}
              onClick={() => setActiveSubjectFilter(subject)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-indigo-55 bg-indigo-50 text-indigo-700 font-bold"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {subject === "Tất cả" ? "Tất cả bài tập" : `Môn ${subject}`}
            </button>
          );
        })}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-2 bg-white py-12 px-6 rounded-2xl text-center text-slate-400 italic border border-slate-200 shadow-sm font-display">
            Chưa có bài tập nào được giao phù hợp với bộ lọc bên trên.
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const totalClass = students.length;
            const submittedCount = Object.keys(asg.submissions).filter((sid) => !!asg.submissions[sid]).length;
            const pct = totalClass > 0 ? Math.round((submittedCount / totalClass) * 100) : 0;

            let badgeColor = "bg-slate-100 text-slate-700";
            if (asg.mon_hoc === "Toán") badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
            else if (asg.mon_hoc === "Tiếng Việt") badgeColor = "bg-indigo-50 text-indigo-700 border border-indigo-100";
            else if (asg.mon_hoc === "Tiếng Anh") badgeColor = "bg-amber-50 text-amber-700 border border-amber-100";

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Upper Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold uppercase tracking-wider ${badgeColor} font-display`}>
                      {asg.mon_hoc}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 font-display">
                      <Calendar className="w-3.5 h-3.5" /> Hạn nộp: {asg.han_nop ? asg.han_nop.split("-").reverse().join("/") : "-"}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-slate-800 mb-2 leading-snug font-display">{asg.ten_bai_tap}</h4>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-150">
                    {asg.noi_dung}
                  </p>

                  {/* Submission Statistics UI */}
                  <div className="space-y-1.5 mb-1 bg-slate-10/50">
                    <div className="flex justify-between text-xs font-bold text-slate-550">
                      <span className="flex items-center gap-1"><ListTodo className="w-3.5 h-3.5 text-indigo-500" /> Tiến độ nộp của lớp:</span>
                      <span className="text-indigo-600 font-display font-extrabold">{submittedCount}/{totalClass} HS ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-150 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Lower Students Checklist */}
                <div className="border-t border-slate-150 bg-slate-50/70 p-4">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-display">
                      Danh sách chấm vở bài tập
                    </span>
                    {hasPermission("assignments_manage") && (
                      <button
                        onClick={() => handleDeleteAssignment(asg.id, asg.ten_bai_tap)}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold transition flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" /> Gỡ bài tập
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 max-h-40 overflow-y-auto pr-1">
                    {students.map((std) => {
                      const isSubmitted = !!asg.submissions[std.id];
                      return (
                        <div key={std.id} className="flex items-center justify-between py-1.5 border-b border-slate-100/50 hover:bg-slate-100/30 rounded px-1 transition text-xs">
                          <span className="font-semibold text-slate-700 font-display">{std.ho_ten}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleStudentSubmission(asg.id, std.id)}
                            className={`px-2 py-0.5 rounded-full font-bold transition text-[10px] cursor-pointer inline-flex items-center gap-0.5 shadow-sm ${
                              isSubmitted
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100/85"
                            }`}
                          >
                            {isSubmitted ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> Đã nộp
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Chưa nộp
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD ASSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 font-display">Giao bài tập chủ nhiệm</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tên phiếu / Tên bài tập</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phiếu ôn tập Toán tuần 32"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Môn học</label>
                  <select
                    value={newAssignment.subject}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        subject: e.target.value as "Toán" | "Tiếng Việt" | "Tiếng Anh" | "Khác",
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Toán">Toán học</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Khác">Môn học khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Hạn hoàn thành</label>
                  <input
                    type="date"
                    required
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Nội dung yêu cầu chi tiết</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ghi chú yêu cầu nộp bài, các bài toán cần giải quyết, nộp qua kênh nào..."
                  value={newAssignment.content}
                  onChange={(e) => setNewAssignment({ ...newAssignment, content: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Giao bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
