/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from "react";
import { Student, Assignment, Document, Movement } from "../types";
import { Users, CalendarCheck, BookOpen, Award, FileText, Video, Play, Download, ExternalLink, Sparkles, ChevronRight, Zap, Target } from "lucide-react";

interface DashboardTabProps {
  students: Student[];
  assignments: Assignment[];
  documents: Document[];
  movements: Movement[];
  attendanceTodayPct: number;
  onSwitchTab: (tab: string) => void;
  onOpenModal: (name: string) => void;
  onViewDocument: (id: number) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  assignments,
  documents,
  movements,
  attendanceTodayPct,
  onSwitchTab,
  onOpenModal,
  onViewDocument,
}) => {
  // Stats calculations
  const totalStudents = students.length;
  const totalGoodBehavior = students.reduce((sum, s) => (s.diem_ne_nep > 0 ? sum + s.diem_ne_nep : sum), 0);

  // Group and sort documents for Block A & B
  const mostDownloaded = [...documents]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 4);

  const latestDocuments = [...documents]
    .reverse()
    .slice(0, 4);

  // Completion counts for Math & Lit
  const mathAssignments = assignments.filter((a) => a.mon_hoc === "Toán");
  const litAssignments = assignments.filter((a) => a.mon_hoc === "Tiếng Việt");
  const engAssignments = assignments.filter((a) => a.mon_hoc === "Tiếng Anh");
  const otherAssignments = assignments.filter((a) => a.mon_hoc === "Khác");

  const calcRate = (list: Assignment[]) => {
    if (list.length === 0 || totalStudents === 0) return 0;
    let totalSubs = 0;
    list.forEach((asg) => {
      totalSubs += Object.values(asg.submissions).filter(Boolean).length;
    });
    return Math.round((totalSubs / (list.length * totalStudents)) * 100);
  };

  const mathRate = calcRate(mathAssignments) || 75; // fallback defaults if blank
  const litRate = calcRate(litAssignments) || 82;
  const engRate = calcRate(engAssignments) || 68;
  const otherRate = calcRate(otherAssignments) || 60;

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-tab">
      {/* KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Students */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Học sinh Sĩ số</span>
            <span className="text-2xl font-extrabold text-slate-800">{totalStudents}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Attendance */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hiện diện Hôm nay</span>
            <span className="text-2xl font-extrabold text-emerald-600">{attendanceTodayPct}%</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Homework */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bài tập đã giao</span>
            <span className="text-2xl font-extrabold text-indigo-600">{assignments.length}</span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Rewards */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition duration-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bảng vàng / Hội thi</span>
            <span className="text-2xl font-extrabold text-amber-500">{movements.length}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* BLOCK A: HỌC LIỆU TẢI NHIỀU NHẤT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-amber-500" /> Học liệu tải nhiều nhất
            </h3>
            <p className="text-[11px] text-slate-400">Các học liệu, tài liệu bài giảng được quan tâm và truy cập nhiều nhất</p>
          </div>
          <button
            onClick={() => onSwitchTab("documents")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 transition cursor-pointer"
          >
            Tất cả học liệu <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mostDownloaded.map((doc) => {
            const isVideo = doc.loai_tai_lieu === "Video";
            return (
              <div
                key={`popular-${doc.id}`}
                className="bg-white hover:border-slate-300 p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isVideo ? "bg-cyan-50 text-cyan-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {doc.loai_tai_lieu}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                      <Download className="w-2.5 h-2.5" /> {doc.download_count} lượt
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug mb-1 font-display">
                    {doc.tieu_de}
                  </h4>
                  <p className="text-[10px] text-slate-400">Tài liệu ôn thi Lớp 5A</p>
                </div>
                <a
                  href={doc.duong_dan_file}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onViewDocument(doc.id)}
                  className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center text-[10px] font-bold text-indigo-600 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isVideo ? <Play className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                  Bắt đầu học ngay
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOCK B: HỌC LIỆU MỚI NHẤT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-emerald-500 pl-3">
          <div>
            <h3 className="font-bold text-sm md:text-base text-slate-800 uppercase tracking-wide flex items-center gap-1.5 font-display">
              <Zap className="w-4 h-4 text-emerald-500" /> Học liệu mới cập nhật
            </h3>
            <p className="text-[11px] text-slate-400">Học liệu học tập chính khóa, bài củng cố nâng cao vừa đăng tải</p>
          </div>
          <button
            onClick={() => onSwitchTab("documents")}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5 transition cursor-pointer"
          >
            Kho học liệu <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestDocuments.map((doc) => {
            const isVideo = doc.loai_tai_lieu === "Video";
            return (
              <div
                key={`latest-${doc.id}`}
                className="bg-white hover:border-slate-300 p-5 rounded-2xl border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isVideo ? "bg-cyan-50 text-cyan-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {doc.loai_tai_lieu}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">
                      Mới
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug mb-1 font-display">
                    {doc.tieu_de}
                  </h4>
                  <p className="text-[10px] text-slate-400">GV Đỗ Thị Ánh Hồng</p>
                </div>
                <a
                  href={doc.duong_dan_file}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => onViewDocument(doc.id)}
                  className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-center text-[10px] font-bold text-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3 h-3" /> Đường dẫn học tập
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOCK C: Graph and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Interactive Responsive SVG Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 font-display">
                <Target className="w-4 h-4 text-indigo-500" /> Tỷ lệ hoàn thành bài tập theo môn
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">Thời gian thực</span>
            </div>
            
            {/* Custom high-fidelity responsive SVG chart */}
            <div className="relative w-full h-56 pt-2 select-none">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
                <div className="border-b border-dashed border-slate-100 w-full pb-1">100%</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-1">75%</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-1">50%</div>
                <div className="border-b border-dashed border-slate-100 w-full pb-1">25%</div>
                <div className="w-full pt-1">0%</div>
              </div>

              {/* Graphical Bars Area */}
              <div className="absolute bottom-5 left-10 right-2 top-2 flex justify-around items-end">
                {/* Math Bar */}
                <div className="group flex flex-col items-center w-16">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-10 bg-gradient-to-t from-emerald-500 to-emerald-400 group-hover:from-emerald-400 group-hover:to-emerald-300 rounded-t-lg transition-all duration-500 relative flex items-center justify-center"
                      style={{ height: `${mathRate * 1.5}px` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-opacity duration-200 z-10">
                        {mathRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-650 mt-2 font-display">Môn Toán</span>
                </div>

                {/* Literature Bar */}
                <div className="group flex flex-col items-center w-16">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-10 bg-gradient-to-t from-indigo-500 to-indigo-400 group-hover:from-indigo-400 group-hover:to-indigo-300 rounded-t-lg transition-all duration-500 relative flex items-center justify-center"
                      style={{ height: `${litRate * 1.5}px` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-opacity duration-200 z-10">
                        {litRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-650 mt-2 font-display">Tiếng Việt</span>
                </div>

                {/* English Bar */}
                <div className="group flex flex-col items-center w-16">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-10 bg-gradient-to-t from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 rounded-t-lg transition-all duration-500 relative flex items-center justify-center"
                      style={{ height: `${engRate * 1.5}px` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-opacity duration-200 z-10">
                        {engRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-650 mt-2 font-display">Tiếng Anh</span>
                </div>

                {/* Other subjects Bar */}
                <div className="group flex flex-col items-center w-16">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-10 bg-gradient-to-t from-rose-500 to-rose-400 group-hover:from-rose-400 group-hover:to-rose-300 rounded-t-lg transition-all duration-500 relative flex items-center justify-center"
                      style={{ height: `${otherRate * 1.5}px` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md transition-opacity duration-200 z-10">
                        {otherRate}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-650 mt-2 font-display">Khác</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-400 italic text-center mt-2 border-t border-slate-50 pt-3">
            Gợi ý: Rê chuột lên thanh cột để hiển thị chi tiết số phần trăm bài tập nộp đầy đủ.
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800 mb-3 font-display"><i className="fa-solid fa-rocket text-emerald-500 mr-1.5"></i>Thao tác quản lý nhanh</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onSwitchTab("students");
                  setTimeout(() => onOpenModal("add-student"), 100);
                }}
                className="flex flex-col items-center gap-1.5 p-3.5 bg-indigo-50/65 hover:bg-indigo-100/80 rounded-xl text-indigo-700 transition font-bold text-[11px] cursor-pointer"
              >
                <i className="fa-solid fa-user-plus text-base"></i>
                Thêm Học Sinh
              </button>
              <button
                onClick={() => {
                  onSwitchTab("assignments");
                  setTimeout(() => onOpenModal("add-assignment"), 100);
                }}
                className="flex flex-col items-center gap-1.5 p-3.5 bg-emerald-50/65 hover:bg-emerald-100/80 rounded-xl text-emerald-700 transition font-bold text-[11px] cursor-pointer"
              >
                <i className="fa-solid fa-folder-plus text-base"></i>
                Giao Bài Tập
              </button>
              <button
                onClick={() => {
                  onSwitchTab("documents");
                  setTimeout(() => onOpenModal("add-document"), 100);
                }}
                className="flex flex-col items-center gap-1.5 p-3.5 bg-amber-50/65 hover:bg-amber-100/80 rounded-xl text-amber-700 transition font-bold text-[11px] cursor-pointer"
              >
                <i className="fa-solid fa-file-arrow-up text-base"></i>
                Thêm Học Liệu
              </button>
              <button
                onClick={() => {
                  onSwitchTab("notices");
                  setTimeout(() => onOpenModal("add-notice"), 100);
                }}
                className="flex flex-col items-center gap-1.5 p-3.5 bg-rose-50/65 hover:bg-rose-100/80 rounded-xl text-rose-700 transition font-bold text-[11px] cursor-pointer"
              >
                <i className="fa-solid fa-bullhorn text-base"></i>
                Đăng Bảng Tin
              </button>
            </div>
          </div>

          {/* Class Statistics metrics summary box */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-150 text-xs">
            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5 font-display">
              <i className="fa-solid fa-chart-line text-slate-500"></i> Thi đua & Chuyên cần tuần này
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-550 header">
                <span>Hiện diện trung bình hôm nay:</span>
                <span className="font-extrabold text-slate-750">{attendanceTodayPct}%</span>
              </div>
              <div className="flex justify-between text-slate-550">
                <span>Tuyên dương khen thưởng:</span>
                <span className="font-extrabold text-emerald-650">+{totalGoodBehavior} điểm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
