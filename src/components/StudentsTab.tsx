/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Student } from "../types";
import { Search, UserPlus, CalendarCheck, ShieldAlert, Award, AlertCircle, Plus, Minus, FileText, Trash2, X, Milestone, Camera, Link, Upload, Copy, Check } from "lucide-react";

// Helper function to render a student avatar or a beautiful gender emoji circle
const renderAvatar = (std: Student, sizeClass = "w-10 h-10 text-base") => {
  if (std.avatar_url) {
    return (
      <img
        src={std.avatar_url}
        alt={std.ho_ten}
        className={`${sizeClass} rounded-full border border-slate-200 object-cover shrink-0`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If custom URL fails to load, gracefully fall back to a styled dicebear avatar
          (e.currentTarget as HTMLImageElement).src = std.gioi_tinh === "Nữ" 
            ? "https://api.dicebear.com/7.x/adventurer/svg?seed=Alice" 
            : "https://api.dicebear.com/7.x/adventurer/svg?seed=Bob";
        }}
      />
    );
  }
  
  if (std.gioi_tinh === "Nữ") {
    return (
      <span className={`${sizeClass} rounded-full border border-rose-200 bg-rose-50 text-rose-500 shrink-0 flex items-center justify-center font-bold`}>
        👧
      </span>
    );
  }
  return (
    <span className={`${sizeClass} rounded-full border border-sky-200 bg-sky-50 text-sky-505 shrink-0 flex items-center justify-center font-bold`}>
      👦
    </span>
  );
};

interface StudentsTabProps {
  students: Student[];
  attendanceToday: Record<string, string>;
  hasPermission: (perm: string) => boolean;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenQuickAttendance: () => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  students,
  attendanceToday,
  hasPermission,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onOpenQuickAttendance,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [behaviorComment, setBehaviorComment] = useState("");
  
  // Custom states for Student Avatar picker
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarInputType, setAvatarInputType] = useState<"file" | "url">("file");
  const [pastedAvatarUrl, setPastedAvatarUrl] = useState("");
  const [copiedSqlText, setCopiedSqlText] = useState(false);

  // Modals inside StudentsTab
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    id: "",
    ho_ten: "",
    ngay_sinh: "",
    gioi_tinh: "Nam" as "Nam" | "Nữ",
    phu_huynh: "",
    dia_chi: "",
  });

  const filteredStudents = students.filter(
    (s) =>
      s.ho_ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent({ ...student });
    setBehaviorComment("");
    setIsEditingAvatar(false);
    setPastedAvatarUrl(student.avatar_url || "");
  };

  // Process uploaded image file into Base64 optimize
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast("Tập tin quá lớn! Vui lòng chọn ảnh dưới 2MB để đảm bảo lưu trữ mượt mà.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPastedAvatarUrl(event.target.result as string);
        onShowToast("Đã nhập ảnh thành công! Hãy nhấn 'Lưu ảnh mới' để hoàn thành.", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAvatarChange = () => {
    if (!selectedStudent) return;
    if (!hasPermission("students_manage")) {
      onShowToast("Bạn không có quyền sửa ảnh chân dung. Vui lòng liên hệ Admin!", "error");
      return;
    }

    const url = pastedAvatarUrl.trim();
    if (!url) {
      onShowToast("Vui lòng tải ảnh lên từ máy hoặc dán địa chỉ đường dẫn ảnh hợp lệ!", "error");
      return;
    }

    const updatedStudent: Student = {
      ...selectedStudent,
      avatar_url: url
    };

    setSelectedStudent(updatedStudent);
    onUpdateStudent(updatedStudent);
    setIsEditingAvatar(false);
    onShowToast(`Đã thay đổi ảnh đại diện của ${selectedStudent.ho_ten} thành công!`, "success");
  };

  const handleRemoveAvatar = () => {
    if (!selectedStudent) return;
    if (!hasPermission("students_manage")) {
      onShowToast("Bạn không có quyền gỡ ảnh chân dung. Vui lòng liên hệ Admin!", "error");
      return;
    }

    const updatedStudent: Student = {
      ...selectedStudent,
      avatar_url: undefined
    };

    setSelectedStudent(updatedStudent);
    onUpdateStudent(updatedStudent);
    setPastedAvatarUrl("");
    setIsEditingAvatar(false);
    onShowToast(`Đã gỡ ảnh đại diện của ${selectedStudent.ho_ten} về dạng nhãn mặc định!`, "success");
  };

  const handleCopySql = () => {
    const sql = `ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;`;
    navigator.clipboard.writeText(sql).then(() => {
      setCopiedSqlText(true);
      setTimeout(() => setCopiedSqlText(false), 2000);
    });
  };

  const handleAdjustPoints = (dir: 1 | -1) => {
    if (!hasPermission("behavior_adjust")) {
      onShowToast("Bạn không có quyền cộng/trừ điểm thi đua. Vui lòng liên hệ Admin!", "error");
      return;
    }
    const label = dir === 1 ? "Thưởng khen ngợi phát biểu/nội quy" : "Phạt đi muộn/vi phạm quy chế";
    setBehaviorComment(label);
  };

  const handleSaveBehavior = () => {
    if (!selectedStudent) return;
    if (!hasPermission("behavior_adjust")) {
      onShowToast("Bạn không có quyền cập nhật nề nếp. Vui lòng liên hệ Admin!", "error");
      return;
    }
    if (!behaviorComment.trim()) {
      onShowToast("Vui lòng điền lý do ghi nhận!", "error");
      return;
    }

    let delta = 0;
    if (behaviorComment.includes("Thưởng") || behaviorComment.includes("khen ngợi") || behaviorComment.includes("+")) {
      delta = 5;
    } else if (behaviorComment.includes("Phạt") || behaviorComment.includes("muộn") || behaviorComment.includes("-")) {
      delta = -2;
    } else {
      // Custom guess, or default
      delta = 1;
    }

    const todayStr = new Date().toLocaleDateString("vi-VN");
    const logItem = `${delta >= 0 ? "+" : ""}${delta} điểm: ${behaviorComment} (${todayStr})`;
    
    const updatedStudent: Student = {
      ...selectedStudent,
      diem_ne_nep: selectedStudent.diem_ne_nep + delta,
      lich_su: [logItem, ...selectedStudent.lich_su],
    };

    setSelectedStudent(updatedStudent);
    onUpdateStudent(updatedStudent);
    setBehaviorComment("");
    onShowToast("Đã cập nhật điểm nề nếp thi đua thành công!", "success");
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("students_manage")) {
      onShowToast("Bạn không có quyền thêm học sinh mới. Vui lòng liên hệ admin!", "error");
      return;
    }
    if (!newStudentData.id.trim() || !newStudentData.ho_ten.trim()) {
      onShowToast("Vui lòng điền đầy đủ Mã HS và Họ tên!", "error");
      return;
    }
    if (students.some((s) => s.id === newStudentData.id.trim())) {
      onShowToast("Mã học sinh đã tồn tại trong sơ học bạ!", "error");
      return;
    }

    const student: Student = {
      id: newStudentData.id.trim().toUpperCase(),
      ho_ten: newStudentData.ho_ten.trim(),
      ngay_sinh: newStudentData.ngay_sinh || new Date().toISOString().split("T")[0],
      gioi_tinh: newStudentData.gioi_tinh,
      phu_huynh: newStudentData.phu_huynh.trim() || "Chưa cập nhật",
      dia_chi: newStudentData.dia_chi.trim() || "Chưa cập nhật",
      diem_ne_nep: 0,
      lich_su: [],
    };

    onAddStudent(student);
    setShowAddModal(false);
    setNewStudentData({ id: "", ho_ten: "", ngay_sinh: "", gioi_tinh: "Nam", phu_huynh: "", dia_chi: "" });
    onShowToast("Đã thêm thành viên học sinh mới thành công!", "success");
  };

  const handleDeleteWithCheck = () => {
    if (!selectedStudent) return;
    if (!hasPermission("students_manage")) {
      onShowToast("Bạn không có quyền xóa học sinh. Vui lòng liên hệ admin!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có chắc chắn muốn xóa học sinh ${selectedStudent.ho_ten} vĩnh viễn? Hành động này sẽ xóa toàn bộ chấm điểm và lịch sử nộp bài.`);
    if (isConfirmed) {
      onDeleteStudent(selectedStudent.id);
      setSelectedStudent(null);
      onShowToast("Đã xóa học sinh khỏi cơ sở dữ liệu!", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm mã hoặc tên học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (!hasPermission("students_manage")) {
                onShowToast("Bạn cần quyền 'students_manage' để thêm học sinh!", "error");
                return;
              }
              const defaultId = "HS" + String(students.length + 1).padStart(3, "0");
              setNewStudentData({ ...newStudentData, id: defaultId });
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Thêm học sinh
          </button>
          
          <button
            onClick={() => {
              if (!hasPermission("attendance_manage")) {
                onShowToast("Bạn cần quyền 'attendance_manage' để điểm danh!", "error");
                return;
              }
              onOpenQuickAttendance();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <CalendarCheck className="w-4 h-4" /> Điểm danh nhanh
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-6">Mã HS</th>
                <th className="py-4 px-6">Họ và tên</th>
                <th className="py-4 px-6">Ngày sinh</th>
                <th className="py-4 px-6">Giới tính</th>
                <th className="py-4 px-6">Nề nếp thi đua</th>
                <th className="py-4 px-6">Tình trạng hôm nay</th>
                <th className="py-4 px-6 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const todayAtt = attendanceToday[std.id] || "Chưa điểm danh";
                  
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 font-semibold text-slate-500 font-display">{std.id}</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          {renderAvatar(std, "w-9 h-9 text-sm shadow-sm")}
                          <div>
                            <p className="font-bold text-slate-850 font-display leading-snug">{std.ho_ten}</p>
                            <p className="text-[10px] text-slate-450 font-mono">MSHS: {std.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {std.ngay_sinh ? std.ngay_sinh.split("-").reverse().join("/") : "-"}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{std.gioi_tinh}</td>
                      <td className="py-4 px-6">
                        {std.diem_ne_nep > 0 ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-100 text-xs">
                            +{std.diem_ne_nep}
                          </span>
                        ) : std.diem_ne_nep < 0 ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded border border-rose-100 text-xs">
                            {std.diem_ne_nep}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold rounded border border-slate-200 text-xs">
                            0
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {todayAtt === "Có mặt" ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold text-xs border border-emerald-100 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Có mặt
                          </span>
                        ) : todayAtt.includes("Vắng") ? (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full font-semibold text-xs border border-rose-100 flex items-center gap-1 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> {todayAtt}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-50 text-slate-405 border border-slate-200 rounded-full text-xs font-semibold">
                            Chưa ghi nhận
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenDetail(std)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl transition text-xs font-bold cursor-pointer"
                        >
                          Hồ sơ 360°
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° MODAL DETAIL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-fade-in border border-slate-100">
            <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100 relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-0 top-0 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Interactive Circle Avatar */}
              <div 
                className="relative group cursor-pointer mb-2.5" 
                onClick={() => {
                  if (hasPermission("students_manage")) {
                    setIsEditingAvatar(!isEditingAvatar);
                  } else {
                    onShowToast("Bạn cần có quyền Quản lý học sinh để sửa ảnh chân dung!", "error");
                  }
                }}
                title={hasPermission("students_manage") ? "Nhấp để thay đổi ảnh chân dung học sinh" : "Cần quyền Quản lý học sinh để sửa ảnh"}
              >
                {renderAvatar(selectedStudent, "w-24 h-24 text-4xl shadow-md border-2 border-slate-200 object-cover")}
                {hasPermission("students_manage") && (
                  <>
                    <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 text-white">
                      <Camera className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-emerald-600 border-2 border-white p-1.5 rounded-full text-white shadow shadow-emerald-600/35">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </>
                )}
              </div>

              <span className="text-[10px] font-extrabold text-slate-450 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider font-display mb-1.5 select-none">
                Học bạ {selectedStudent.id}
              </span>
              <h3 className="font-bold text-lg text-slate-800 font-display leading-tight">{selectedStudent.ho_ten}</h3>
              {hasPermission("students_manage") && (
                <button
                  onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-bold mt-1 inline-flex items-center gap-1 cursor-pointer transition font-display"
                >
                  {isEditingAvatar ? "Đóng trình sửa ảnh" : "Sửa ảnh chân dung"}
                </button>
              )}
            </div>

            {/* EXPANDABLE AVATAR EDITOR FORM */}
            {isEditingAvatar && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 text-xs space-y-3 mt-3 animate-fade-in relative">
                <span className="font-bold text-slate-700 block">Chọn ảnh chân dung cho học sinh:</span>
                
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAvatarInputType("file")}
                    className={`flex-1 pb-2 font-bold border-b-2 text-center transition cursor-pointer ${avatarInputType === "file" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    <span className="inline-flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Thiết bị (Local File)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarInputType("url")}
                    className={`flex-1 pb-2 font-bold border-b-2 text-center transition cursor-pointer ${avatarInputType === "url" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    <span className="inline-flex items-center gap-1"><Link className="w-3.5 h-3.5" /> Thêm link (URL)</span>
                  </button>
                </div>

                {avatarInputType === "file" ? (
                  <div className="space-y-1.5">
                    <p className="text-slate-450 leading-normal">
                      Hệ thống tự nén ảnh thành mã Base64 tối ưu để đồng bộ lên Supabase:
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalFileChange}
                      className="w-full text-slate-600 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-slate-455 leading-normal">Dán địa chỉ URL của ảnh chân dung học sinh:</p>
                    <input
                      type="text"
                      placeholder="Nhập đường dẫn liên kết ảnh..."
                      value={pastedAvatarUrl}
                      onChange={(e) => setPastedAvatarUrl(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-1 lg:pt-2">
                  <button
                    type="button"
                    onClick={handleApplyAvatarChange}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Lưu ảnh mới
                  </button>
                  {selectedStudent.avatar_url && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="py-1.5 px-3 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Gỡ ảnh
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsEditingAvatar(false)}
                    className="py-1.5 px-3 border border-slate-205 hover:bg-slate-100 text-slate-600 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                {/* SQL Instructions box inside */}
                <div className="p-3 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 mt-2 select-none selection:bg-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono">SUPABASE CONFIG SQL:</span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="text-slate-400 hover:text-slate-200 py-0.5 px-2 bg-slate-800 rounded font-black text-[9px] transition cursor-pointer flex items-center gap-1"
                    >
                      {copiedSqlText ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      {copiedSqlText ? "Đã chép!" : "Sao chép SQL"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal mb-1">
                    Nếu chưa cập nhật cấu trúc cơ sở dữ liệu Supabase, vui lòng chạy lệnh dưới trong thẻ <strong>SQL Editor</strong> ở Supabase Dashboard để tạo cột lưu trữ:
                  </p>
                  <pre className="p-2 bg-slate-950 text-emerald-400/90 rounded text-[10px] font-mono leading-tight block overflow-x-auto whitespace-pre border border-slate-900 select-all font-semibold">
{`ALTER TABLE students 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;`}
                  </pre>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Profile Contacts */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Ngày sinh</span>
                  <span className="font-bold text-slate-700">{selectedStudent.ngay_sinh ? selectedStudent.ngay_sinh.split("-").reverse().join("/") : "-"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Giới tính</span>
                  <span className="font-bold text-slate-700">{selectedStudent.gioi_tinh}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block mb-0.5">Phụ huynh đại diện</span>
                  <span className="font-bold text-slate-700">{selectedStudent.phu_huynh}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block mb-0.5">Địa chỉ hộ khẩu</span>
                  <span className="font-bold text-slate-700">{selectedStudent.dia_chi}</span>
                </div>
              </div>

              {/* Behavior & Rewards */}
              <div>
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2 font-display">
                  Điểm thi đua & Lịch sử rèn luyện
                </h4>
                
                <div className="flex items-center justify-between p-4 bg-slate-50/70 border border-slate-150 rounded-xl mb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Điểm thi đua hiện tại</span>
                    <p className={`text-2xl font-black mt-0.5 ${
                      selectedStudent.diem_ne_nep > 0 ? "text-emerald-600" : selectedStudent.diem_ne_nep < 0 ? "text-rose-600" : "text-slate-600"
                    }`}>
                      {selectedStudent.diem_ne_nep > 0 ? "+" : ""}{selectedStudent.diem_ne_nep} điểm
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdjustPoints(1)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Thưởng (+5)
                    </button>
                    <button
                      onClick={() => handleAdjustPoints(-1)}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" /> Phạt (-2)
                    </button>
                  </div>
                </div>

                {/* Comment Logger */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Điền ghi nhận lý do cụ thể khen ngợi hoặc vi phạm nề nếp..."
                    value={behaviorComment}
                    onChange={(e) => setBehaviorComment(e.target.value)}
                    className="flex-grow border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveBehavior}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Ghi nhận
                  </button>
                </div>

                {/* History list Logs */}
                <div className="border border-slate-150 rounded-xl overflow-hidden text-xs max-h-48 flex flex-col">
                  <div className="bg-slate-50 p-2.5 font-bold text-slate-500 border-b border-slate-150">Báo cáo kỷ luật thi đua học sinh</div>
                  <div className="divide-y divide-slate-100 overflow-y-auto">
                    {selectedStudent.lich_su.length === 0 ? (
                      <p className="p-4 text-center text-slate-400 italic">Chưa có bản ghi nề nếp nào trong sổ sình lười.</p>
                    ) : (
                      selectedStudent.lich_su.map((log, i) => {
                        const isPlus = log.includes("+");
                        return (
                          <div
                            key={i}
                            className={`p-2.5 font-medium flex items-start gap-1.5 ${
                              isPlus ? "text-emerald-700 bg-emerald-50/20" : "text-rose-700 bg-rose-50/20"
                            }`}
                          >
                            <Milestone className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                            <span>{log}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Delete profile actions */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  onClick={handleDeleteWithCheck}
                  className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Gỡ sỹ số học sinh
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer font-display"
                >
                  Hoàn tất hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 font-display">Thêm sỹ số học sinh</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-105 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveNewStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-505 mb-1 select-none font-display">Mã Học sinh</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: HS005"
                  value={newStudentData.id}
                  onChange={(e) => setNewStudentData({ ...newStudentData, id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-505 mb-1 font-display">Họ và tên học sinh</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Hoàng"
                  value={newStudentData.ho_ten}
                  onChange={(e) => setNewStudentData({ ...newStudentData, ho_ten: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-1 font-display">Ngày sinh</label>
                  <input
                    type="date"
                    required
                    value={newStudentData.ngay_sinh}
                    onChange={(e) => setNewStudentData({ ...newStudentData, ngay_sinh: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-550 mb-1 font-display">Giới tính</label>
                  <select
                    value={newStudentData.gioi_tinh}
                    onChange={(e) => setNewStudentData({ ...newStudentData, gioi_tinh: e.target.value as "Nam" | "Nữ" })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1 font-display">Địa chỉ liên hệ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 78 Võ Văn Tần, Q.3, TP.HCM"
                  value={newStudentData.dia_chi}
                  onChange={(e) => setNewStudentData({ ...newStudentData, dia_chi: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 mb-1 font-display">Liên hệ Phụ Huynh & SĐT</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trần Minh Hữu (0982736452)"
                  value={newStudentData.phu_huynh}
                  onChange={(e) => setNewStudentData({ ...newStudentData, phu_huynh: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-605 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
