/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { AppState, Student, Assignment, Document, Notice, Movement, UserAccount, ALL_PERMISSIONS } from "./types";
import { loadInitialState, saveAppState, defaultAccounts } from "./data/initialData";

// Supabase services
import {
  checkSupabaseStatus,
  loadStateFromSupabase,
  seedInitialDataIfNeeded,
  dbSaveStudent,
  dbDeleteStudent,
  dbSaveAssignment,
  dbDeleteAssignment,
  dbSaveDocument,
  dbDeleteDocument,
  dbSaveNotice,
  dbDeleteNotice,
  dbSaveMovement,
  dbDeleteMovement,
  dbSaveUserAccount,
  dbDeleteUserAccount,
  dbSaveAttendance,
  dbSaveSchoolYear,
  getSupabaseDiagnostics,
  TableDiagnostic
} from "./lib/supabaseService";

// Tap Components
import { DashboardTab } from "./components/DashboardTab";
import { StudentsTab } from "./components/StudentsTab";
import { AssignmentsTab } from "./components/AssignmentsTab";
import { DocumentsTab } from "./components/DocumentsTab";
import { NoticesTab } from "./components/NoticesTab";
import { RewardsTab } from "./components/RewardsTab";
import { PermissionsTab } from "./components/PermissionsTab";
import { AuthModals } from "./components/AuthModals";

// Icons
import {
  GraduationCap,
  PieChart,
  Users,
  BookOpen,
  FolderOpen,
  Megaphone,
  Award,
  Shield,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  X,
  Bell,
  Sparkles,
  ChevronDown,
  Lock,
  Compass,
  Database,
  CloudLightning,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showQuickAttendance, setShowQuickAttendance] = useState(false);
  
  // Supabase Syncing and Status States
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConnected: boolean;
    isInitialized: boolean;
    loading: boolean;
    errorMessage: string | null;
  }>({
    isConnected: false,
    isInitialized: false,
    loading: true,
    errorMessage: null
  });
  const [showSqlHelpModal, setShowSqlHelpModal] = useState(false);
  const [showDbDiagnosticsModal, setShowDbDiagnosticsModal] = useState(false);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [dbDiagnostics, setDbDiagnostics] = useState<{
    isConnected: boolean;
    tables: TableDiagnostic[];
    totalRecords: number;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Quick Attendance change log cache
  const [attendanceCache, setAttendanceCache] = useState<Record<string, "Có mặt" | "Vắng có phép" | "Vắng không phép">>({});

  // Dynamic Toast Alerts
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Guest Bypass Identification State (which student profile is the parent viewing?)
  const [parentChosenStudentId, setParentChosenStudentId] = useState<string>("");

  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Real-time Supabase Diagnostics fetcher
  const handleRunDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const reports = await getSupabaseDiagnostics();
      setDbDiagnostics(reports);
      if (reports.isConnected) {
        showToast("Đã chẩn đoán cấu trúc & kết nối thành công, tải chính xác dữ liệu gốc!", "success");
      } else {
        showToast("Phát hiện lỗi cấu trúc/kết nối trong các bảng dữ liệu!", "error");
      }
    } catch (e) {
      showToast("Chẩn đoán thất bại do lỗi kết nối mạng!", "error");
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  useEffect(() => {
    if (showDbDiagnosticsModal) {
      handleRunDiagnostics();
    }
  }, [showDbDiagnosticsModal]);

  // Utility toast dispatcher
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const hTimer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(hTimer);
    }
  }, [toast]);

  // ---------------- SUPABASE CLOUD INITIALIZATION EFFECT ----------------
  useEffect(() => {
    async function initSupabase() {
      const status = await checkSupabaseStatus();
      if (status.isConnected && status.isInitialized) {
        // Clear empty DB seeds with starting entries if needed
        await seedInitialDataIfNeeded();
        
        // Retrieve fresh cloud state
        const cloudState = await loadStateFromSupabase();
        if (cloudState) {
          setAppState((prev) => ({
            ...prev,
            ...cloudState,
            // Keep critical user permissions active
            currentRole: prev.currentRole,
            currentUser: prev.currentUser
          }));
          showToast("Đã kết nối thành công và tải dữ liệu từ Supabase!", "success");
        }
        setSupabaseStatus({
          isConnected: true,
          isInitialized: true,
          loading: false,
          errorMessage: null
        });
      } else {
        setSupabaseStatus({
          isConnected: status.isConnected,
          isInitialized: status.isInitialized,
          loading: false,
          errorMessage: status.errorMessage
        });
        if (status.isConnected && !status.isInitialized) {
          showToast("Kết nối Supabase OK nhưng chưa tạo bảng dữ liệu. Hãy nhấp nút màu vàng để lấy mã SQL tạo bảng!", "error");
        }
      }
    }
    initSupabase();
  }, []);

  const handleManualSyncSupabase = async () => {
    setSupabaseStatus((prev) => ({ ...prev, loading: true }));
    const status = await checkSupabaseStatus();
    if (status.isConnected && status.isInitialized) {
      await seedInitialDataIfNeeded();
      const cloudState = await loadStateFromSupabase();
      if (cloudState) {
        setAppState((prev) => ({
          ...prev,
          ...cloudState
        }));
        showToast("Đồng bộ liên kết dữ liệu với đám mây Supabase thành công!", "success");
      }
      setSupabaseStatus({
        isConnected: true,
        isInitialized: true,
        loading: false,
        errorMessage: null
      });
      setShowSqlHelpModal(false);
    } else {
      setSupabaseStatus({
        isConnected: status.isConnected,
        isInitialized: status.isInitialized,
        loading: false,
        errorMessage: status.errorMessage
      });
      showToast("Vẫn chưa thể tìm thấy các bảng trong Supabase! Hãy đọc hướng dẫn và thực thi mã SQL thiết lập.", "error");
    }
  };

  // RBAC permissions decider
  const hasPermission = (permissionId: string): boolean => {
    if (appState.currentRole === "admin") return true;
    if (!appState.currentUser) return false;
    return appState.currentUser.permissions.includes(permissionId);
  };

  // ---------------- AUTH HANDLERS ----------------
  const handleLogin = (user: string, pass: string): boolean => {
    const found = appState.registeredUsers.find(
      (u) => u.username.toLowerCase() === user.toLowerCase() && u.password === pass
    );

    if (found) {
      setAppState((prev) => ({
        ...prev,
        currentRole: found.role,
        currentUser: found,
      }));
      showToast(`Chào mừng ${found.fullname} đăng nhập thành công!`, "success");
      // If logging in as admin and currently in restricted tabs, switch to dashboard
      if (found.role === "admin") {
        setActiveTab("permissions");
      } else {
        setActiveTab("dashboard");
      }
      return true;
    } else {
      showToast("Tài khoản hoặc mật khẩu xác minh không chính xác!", "error");
      return false;
    }
  };

  const handleRegister = (fullname: string, user: string, pass: string): boolean => {
    if (appState.registeredUsers.some((u) => u.username.toLowerCase() === user.toLowerCase())) {
      showToast("Tên tài khoản này đã được sử dụng!", "error");
      return false;
    }

    const newUser: UserAccount = {
      username: user.toLowerCase(),
      fullname: fullname,
      role: "teacher", // default to teacher
      password: pass,
      permissions: [
        "students_manage",
        "behavior_adjust",
        "attendance_manage",
        "assignments_manage",
        "documents_manage",
        "notices_manage",
        "movements_manage"
      ], // Teacher default classroom permissions
    };

    setAppState((prev) => ({
      ...prev,
      registeredUsers: [...prev.registeredUsers, newUser],
    }));

    dbSaveUserAccount(newUser);

    showToast("Đăng ký thành viên Giáo viên thành công! Hãy đăng nhập.", "success");
    return true;
  };

  const handleLogout = () => {
    setAppState((prev) => ({
      ...prev,
      currentRole: "guest",
      currentUser: null,
    }));
    setActiveTab("dashboard");
    setParentChosenStudentId("");
    showToast("Đã đăng xuất tài khoản quản lý, chuyển về Chế độ Phụ huynh/Học sinh xem tin.", "success");
  };

  // ---------------- DATA STRATEGY EDITORS ----------------

  // Student CRUD operations
  const handleAddStudent = (std: Student) => {
    dbSaveStudent(std);
    setAppState((prev) => {
      // Add attendance record today
      const todayISO = new Date().toISOString().split("T")[0];
      const updatedAttendance = { ...prev.attendance };
      if (updatedAttendance[todayISO]) {
        updatedAttendance[todayISO] = {
          ...updatedAttendance[todayISO],
          [std.id]: "Có mặt",
        };
        dbSaveAttendance(todayISO, updatedAttendance[todayISO]);
      }

      return {
        ...prev,
        students: [...prev.students, std],
        attendance: updatedAttendance,
      };
    });
  };

  const handleUpdateStudent = (std: Student) => {
    dbSaveStudent(std);
    setAppState((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === std.id ? std : s)),
    }));
  };

  const handleDeleteStudent = (id: string) => {
    dbDeleteStudent(id);
    setAppState((prev) => {
      // Remove attendance reference and homework records reference
      const cleanAssignments = prev.assignments.map((asg) => {
        const nextSubs = { ...asg.submissions };
        delete nextSubs[id];
        dbSaveAssignment({ ...asg, submissions: nextSubs });
        return { ...asg, submissions: nextSubs };
      });

      return {
        ...prev,
        students: prev.students.filter((s) => s.id !== id),
        assignments: cleanAssignments,
      };
    });
  };

  // Homework CRUD operations
  const handleAddAssignment = (asg: Assignment) => {
    dbSaveAssignment(asg);
    setAppState((prev) => ({
      ...prev,
      assignments: [...prev.assignments, asg],
    }));
  };

  const handleUpdateAssignment = (asg: Assignment) => {
    dbSaveAssignment(asg);
    setAppState((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) => (a.id === asg.id ? asg : a)),
    }));
  };

  const handleDeleteAssignment = (id: number) => {
    dbDeleteAssignment(id);
    setAppState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.id !== id),
    }));
  };

  // Learning Materials upload and counter
  const handleAddDocument = (doc: Document) => {
    dbSaveDocument(doc);
    setAppState((prev) => ({
      ...prev,
      documents: [...prev.documents, doc],
    }));
  };

  const handleViewDocument = (id: number) => {
    setAppState((prev) => {
      const updatedDocs = prev.documents.map((d) => {
        if (d.id === id) {
          const nextD = { ...d, download_count: d.download_count + 1 };
          dbSaveDocument(nextD);
          return nextD;
        }
        return d;
      });
      return {
        ...prev,
        documents: updatedDocs,
      };
    });
  };

  const handleDeleteDocument = (id: number) => {
    dbDeleteDocument(id);
    setAppState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
  };

  // Bulletin communications announcements
  const handleAddNotice = (notice: Notice) => {
    dbSaveNotice(notice);
    setAppState((prev) => ({
      ...prev,
      notices: [notice, ...prev.notices], // prepend
    }));
  };

  const handleDeleteNotice = (id: number) => {
    dbDeleteNotice(id);
    setAppState((prev) => ({
      ...prev,
      notices: prev.notices.filter((n) => n.id !== id),
    }));
  };

  // Extracurricular movements
  const handleAddMovement = (m: Movement) => {
    dbSaveMovement(m);
    setAppState((prev) => ({
      ...prev,
      movements: [m, ...prev.movements],
    }));
  };

  const handleDeleteMovement = (id: number) => {
    dbDeleteMovement(id);
    setAppState((prev) => ({
      ...prev,
      movements: prev.movements.filter((m) => m.id !== id),
    }));
  };

  // Grant role and check permission edits
  const handleUpdateUserPermissions = (
    username: string,
    role: "admin" | "teacher" | "guest",
    permissions: string[]
  ) => {
    setAppState((prev) => {
      const nextUsers = prev.registeredUsers.map((u) => {
        if (u.username === username) {
          const updatedU = { ...u, role, permissions };
          dbSaveUserAccount(updatedU);
          return updatedU;
        }
        return u;
      });

      // Synchronize currently logged-in account permissions immediately!
      const isLoggingUser = prev.currentUser && prev.currentUser.username === username;
      const nextLoggingUser = isLoggingUser
        ? { ...prev.currentUser!, role, permissions }
        : prev.currentUser;

      return {
        ...prev,
        registeredUsers: nextUsers,
        currentUser: nextLoggingUser,
        currentRole: isLoggingUser ? role : prev.currentRole,
      };
    });
  };

  const handleDeleteUser = (username: string) => {
    dbDeleteUserAccount(username);
    setAppState((prev) => ({
      ...prev,
      registeredUsers: prev.registeredUsers.filter((u) => u.username !== username),
    }));
  };

  // ---------------- QUICK ATTENDANCE ENGINE ----------------
  const handleOpenQuickAttendance = () => {
    const todayISO = new Date().toISOString().split("T")[0];
    const savedTodayAtt = appState.attendance[todayISO] || {};
    
    // Populate default cache
    const initialCache: Record<string, "Có mặt" | "Vắng có phép" | "Vắng không phép"> = {};
    appState.students.forEach((s) => {
      initialCache[s.id] = (savedTodayAtt[s.id] as "Có mặt" | "Vắng có phép" | "Vắng không phép") || "Có mặt";
    });

    setAttendanceCache(initialCache);
    setShowQuickAttendance(true);
  };

  const handleUpdateCacheAttendance = (studentId: string, status: "Có mặt" | "Vắng có phép" | "Vắng không phép") => {
    setAttendanceCache((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    const todayISO = new Date().toISOString().split("T")[0];
    setAppState((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [todayISO]: {
          ...attendanceCache,
        },
      },
    }));

    dbSaveAttendance(todayISO, attendanceCache);

    setShowQuickAttendance(false);
    showToast("Đã lưu điểm danh hôm nay thành công!", "success");
  };

  // ---------------- GENERAL METRIC COMPUTERS ----------------
  const todayISO = new Date().toISOString().split("T")[0];
  const attendanceToday = appState.attendance[todayISO] || {};
  const totalClassMembers = appState.students.length;

  
  const presentStudentsCount = appState.students.filter(
    (s) => attendanceToday[s.id] === "Có mặt" || !attendanceToday[s.id] // default count present
  ).length;

  const attendanceTodayPct = totalClassMembers > 0
    ? Math.round((presentStudentsCount / totalClassMembers) * 100)
    : 100;

  // Render parent perspective specifics
  const selectedParentStudent = appState.students.find((s) => s.id === parentChosenStudentId);

  // Self assessment submission trigger on Parent Bypass Mode
  const handleParentToggleHomework = (asgId: number) => {
    if (!parentChosenStudentId) return;
    const currentAsg = appState.assignments.find((a) => a.id === asgId);
    if (!currentAsg) return;

    const currentStatus = !!currentAsg.submissions[parentChosenStudentId];
    const nextSubmissions = {
      ...currentAsg.submissions,
      [parentChosenStudentId]: !currentStatus,
    };

    const updatedAsg: Assignment = {
      ...currentAsg,
      submissions: nextSubmissions,
    };

    handleUpdateAssignment(updatedAsg);
    showToast(`Phụ huynh em ${selectedParentStudent?.ho_ten} đã cập nhật nộp bài!`, "success");
  };

  return (
    <div className="text-slate-800 flex flex-col min-h-screen bg-slate-50 antialiased font-sans">
      
      {/* 1. HERO HOME BANNER - CUTE PRIMARY SCHOOL EDITION */}
      <div className="relative w-full bg-gradient-to-r from-[#bae6fd] via-[#ccfbf1] to-[#fef08a] text-slate-800 h-52 md:h-56 flex items-center overflow-hidden border-b-4 border-emerald-400 select-none shadow-sm">
        {/* Playful primary school background photo with cheerful layout and toys */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-normal opacity-70"></div>
        
        {/* Floating background decorative bubbles for primary school vibe */}
        <div className="absolute top-4 left-1/4 w-8 h-8 rounded-full bg-pink-400/20 blur-sm animate-bounce duration-[4000ms]"></div>
        <div className="absolute bottom-6 right-1/3 w-12 h-12 rounded-full bg-sky-400/20 blur-sm animate-pulse"></div>
        <div className="absolute top-10 right-12 w-16 h-16 rounded-full bg-yellow-400/25 blur-sm animate-bounce duration-[6000ms]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100/90 via-sky-50/70 to-transparent z-[1]"></div>
        
        <div className="relative z-10 p-6 md:p-10 max-w-4xl text-left">
          {/* Transparent high-contrast backing card for text premium legibility */}
          <div className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-lg shadow-sky-950/5 max-w-2xl relative">
            <div className="absolute -top-3 right-4 bg-rose-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md transform rotate-2 animate-pulse select-none">
              🎈 TIỂU HỌC 5A THÂN YÊU
            </div>

            <div className="relative mb-2.5 inline-block">
              <select
                value={appState.schoolYear}
                onChange={(e) => {
                  const sy = e.target.value;
                  setAppState((prev) => ({ ...prev, schoolYear: sy }));
                  dbSaveSchoolYear(sy);
                  showToast(`Đã đồng bộ dữ liệu trực tuyến sang học kì Năm học ${sy}!`, "success");
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold text-[10.5px] py-1.5 pl-3.5 pr-8 rounded-full uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer appearance-none border-none shadow-sm transition duration-150 font-display"
              >
                <option value="2024-2025">🏫 Năm học 2024 - 2025</option>
                <option value="2025-2026">🌸 Năm học 2025 - 2026</option>
                <option value="2026-2027">🌿 Năm học 2026 - 2027</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-900">
                <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
              </div>
            </div>
            
            <h2 className="text-xl md:text-3.5xl font-black mb-1.5 tracking-tight text-red-600 font-display leading-tight">
              🌞 Mỗi ngày đến trường là một ngày vui!
            </h2>
            <p className="text-slate-705 text-xs md:text-sm font-bold leading-relaxed font-display">
              Hệ thống quản lý tiện ích <span className="text-emerald-700 font-extrabold">ClassMaster 5A</span> đồng hành cùng Cô giáo Đỗ Thị Ánh Hồng và các em học sinh tiểu học rèn luyện nề nếp thi đua từng ngày.
            </p>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className="w-full bg-slate-900 border-b border-slate-800 text-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-30 shadow-md">
        {/* Logo and Class Title heading */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 rounded-2xl text-slate-900 flex items-center justify-center shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-base md:text-lg leading-none tracking-tight text-emerald-400 font-display">
              ClassMaster Lớp 5A
            </h1>
            <span className="text-[10px] md:text-xs text-slate-450 font-bold uppercase tracking-widest block mt-0.5">
              Học đường Số hóa nội bộ
            </span>
          </div>
        </div>

        {/* Calendar check, Supabase Status details and Auth Modules */}
        <div className="flex flex-wrap items-center gap-3 md:gap-3.5">
          {/* Supabase status display */}
          {supabaseStatus.loading ? (
            <span className="px-3.5 py-1.5 bg-slate-850 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-2 select-none animate-pulse font-display">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              <span>Đang kết nối Supabase...</span>
            </span>
          ) : supabaseStatus.isConnected && supabaseStatus.isInitialized ? (
            <button
              onClick={() => setShowDbDiagnosticsModal(true)}
              className="px-3.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 hover:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-900/60 flex items-center gap-1.5 transition cursor-pointer select-none font-display-medium"
              title="Nhấp để xem chẩn đoán liên kết & số lượng dữ liệu Supabase"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Đồng bộ Supabase</span>
            </button>
          ) : supabaseStatus.isConnected && !supabaseStatus.isInitialized ? (
            <button
              onClick={() => setShowSqlHelpModal(true)}
              className="px-3.5 py-1.5 bg-amber-950/70 text-amber-450 hover:bg-amber-900 font-extrabold text-xs rounded-xl border border-amber-800/80 flex items-center gap-1.5 transition duration-150 cursor-pointer animate-pulse select-none font-display"
              title="Nhấp xem hướng dẫn dán SQL cài đặt Supabase"
            >
              <Database className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-bounce" />
              <span>Cài đặt CSDL Supabase ⚠️</span>
            </button>
          ) : (
            <span className="px-3.5 py-1.5 bg-slate-850 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 select-none font-display" title="Supabase offline. Sử dụng LocalStorage cục bộ an toàn.">
              <CloudLightning className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Chế độ Cục bộ</span>
            </span>
          )}

          <span className="px-3.5 py-1.5 bg-slate-850 text-emerald-400 rounded-xl font-bold text-xs border border-slate-700/80 flex items-center gap-1.5 select-none font-display">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />{" "}
            <span>{new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
          </span>

          {/* Core Sign-In Dropper controller */}
          <AuthModals
            currentUser={appState.currentUser}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
            showLoginModal={showLoginModal}
            onCloseLoginModal={() => setShowLoginModal(false)}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onShowToast={showToast}
          />
        </div>
      </nav>

      {/* 3. WORKING PORTAL & BODY SECTION */}
      <div className="flex-grow flex flex-col md:flex-row w-full max-w-full">
        
        {/* Left Vertical Sidebar Aside Navigation Menu */}
        <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col z-20 shrink-0 border-r border-slate-850">
          
          {/* Identity Widget Card inside Sidebar */}
          <div className="p-4 mx-4 my-4 bg-slate-850/60 rounded-2xl border border-slate-800/80 flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-650 from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-extrabold text-sm shadow-sm font-display">
              H
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200 font-display">Cô Đỗ Thị Ánh Hồng</p>
              <p className="text-[10px] text-slate-450 font-semibold uppercase tracking-wider block mt-0.5">Giáo viên chủ nhiệm</p>
            </div>
          </div>

          {/* Interactive Student Parent chosen Identity Dropdown for view-only guests */}
          {appState.currentRole === "guest" && (
            <div className="mx-4 mb-4 p-3.5 bg-indigo-950/45 border border-indigo-900/60 rounded-2xl space-y-1.5 select-none">
              <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Compass className="w-3 h-3 text-indigo-400" /> Danh nghĩa truy cập (Phụ huynh)
              </span>
              <select
                value={parentChosenStudentId}
                onChange={(e) => {
                  const val = e.target.value;
                  setParentChosenStudentId(val);
                  if (val) {
                    showToast(`Đã nhận diện Phụ huynh xem sổ hộc sinh em ${appState.students.find(s=>s.id === val)?.ho_ten}!`, "success");
                  }
                }}
                className="w-full bg-slate-850 hover:bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-750 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer transition"
              >
                <option value="">Xem chung toàn lớp</option>
                {appState.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    Con em: {s.ho_ten}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Vertical Menu Links list */}
          <nav className="flex-grow px-3 pb-6 space-y-1 select-none">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <PieChart className="w-4 h-4 shrink-0" /> Bảng điều khiển
            </button>

            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "students"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Quản lý Sỹ số Học sinh
            </button>

            <button
              onClick={() => setActiveTab("assignments")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "assignments"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" /> Giao & Quản lý Bài tập
            </button>

            <button
              onClick={() => setActiveTab("documents")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "documents"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <FolderOpen className="w-4 h-4 shrink-0" /> Kho Học liệu Hỗ trợ
            </button>

            <button
              onClick={() => setActiveTab("notices")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "notices"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Megaphone className="w-4 h-4 shrink-0" /> Bảng tin Truyền thông
            </button>

            <button
              onClick={() => setActiveTab("rewards")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                activeTab === "rewards"
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4 shrink-0" /> Khen thưởng & Phong trào
            </button>

            {/* Admin only Permissions Management tab */}
            {hasPermission("users_manage") && (
              <button
                onClick={() => setActiveTab("permissions")}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition duration-150 text-left cursor-pointer ${
                  activeTab === "permissions"
                    ? "bg-indigo-600 text-white font-extrabold"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent hover:border-indigo-900/30"
                }`}
              >
                <Shield className="w-4 h-4 shrink-0 text-indigo-400" /> Quyền & Tài khoản admin
              </button>
            )}
          </nav>

          <div className="p-4 border-t border-slate-850 text-[10px] text-center text-slate-500 font-display font-medium select-none">
            Học đường Số hóa v2.0 &copy; 2026
          </div>
        </aside>

        {/* Central main display content panel workspace */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-full bg-slate-50">
          <header className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4 select-none">
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold tracking-wider uppercase mb-0.5 font-display">
                Học sỹ số dữ liệu Lớp 5A &bull; {appState.schoolYear}
              </p>
              <h2 className="text-xl font-bold text-slate-850 font-display">
                {activeTab === "dashboard" && "Bảng điều khiển tổng quan ClassMaster"}
                {activeTab === "students" && "Sổ Danh bạ Sỹ số học sinh"}
                {activeTab === "assignments" && "Vở Bài tập rèn luyện học tập"}
                {activeTab === "documents" && "Kho học học liệu bồi dưỡng hỗ trợ bài giáo án"}
                {activeTab === "notices" && "Bảng thông tin truyền thông liên lạc gia đình"}
                {activeTab === "rewards" && "Bảng vàng thành tích thi đua nề nếp"}
                {activeTab === "permissions" && "Phân quyền quản trị tài khoản giáo án (RBAC Center)"}
              </h2>
            </div>
            
            {/* Display active privilege state icon indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {appState.currentRole === "admin" ? (
                <span className="px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider font-display flex items-center gap-1 leading-none">
                  <Shield className="w-3.5 h-3.5 shrink-0 text-indigo-500 animate-pulse" /> TOÀN QUYỀN ADMIN
                </span>
              ) : appState.currentRole === "teacher" ? (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-display flex items-center gap-1 leading-none">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" /> GIÁO VIÊN CHỦ NHIỆM
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-655 rounded-full text-[10px] font-bold uppercase tracking-wider font-display flex items-center gap-1 leading-none">
                  <Compass className="w-3.5 h-3.5 text-slate-450" /> PHỤ HUYNH XEM TIN
                </span>
              )}
            </div>
          </header>

          {/* PARENT SPECIFIC PORTAL HIGHLIGHT BANNER FOR CHOSEN BYPASS CHILDS */}
          {appState.currentRole === "guest" && selectedParentStudent && (
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-indigo-100/30 border border-indigo-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in select-none">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-bold font-display uppercase tracking-widest animate-pulse">
                  Gia đình kết nối
                </span>
                <h4 className="font-extrabold text-[15px] text-slate-800 font-display">
                  Sổ hộc tập học sinh: <span className="text-indigo-700 font-semibold">{selectedParentStudent.ho_ten}</span> ({selectedParentStudent.id})
                </h4>
                <div className="text-xs text-slate-600 font-medium space-x-4">
                  <span>Nề nếp thi đua: <strong className="text-emerald-600 font-bold">{selectedParentStudent.diem_ne_nep > 0 ? "+" : ""}{selectedParentStudent.diem_ne_nep} điểm</strong></span>
                  <span>&bull;</span>
                  <span>Hiện diện hôm nay: <strong className="text-indigo-600 font-bold">{attendanceToday[selectedParentStudent.id] || "Mặc định có mặt"}</strong></span>
                </div>
              </div>

              {/* Action shortcuts parent box */}
              <div className="bg-white p-3.5 rounded-xl shadow-sm border border-indigo-150 text-xs w-full md:w-auto">
                <h5 className="font-bold text-slate-700 mb-2 font-display flex items-center gap-1">📌 Bài tập con em cần nộp:</h5>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {appState.assignments.map((asg) => {
                    const isSubmitted = !!asg.submissions[selectedParentStudent.id];
                    return (
                      <div key={asg.id} className="flex justify-between items-center gap-8 py-0.5 border-b border-dashed border-slate-100 pb-1 text-[11px]">
                        <span className="truncate max-w-44 font-semibold text-slate-600 font-display">{asg.ten_bai_tap}</span>
                        <button
                          onClick={() => handleParentToggleHomework(asg.id)}
                          className={`px-2.5 py-0.5 rounded-full font-bold transition text-[10px] cursor-pointer inline-flex items-center gap-0.5 shrink-0 ${
                            isSubmitted ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {isSubmitted ? "Con Đã nộp" : "Nhấp báo Nộp"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB SWAP ROUTER RENDER COREGON */}
          {activeTab === "dashboard" && (
            <DashboardTab
              students={appState.students}
              assignments={appState.assignments}
              documents={appState.documents}
              movements={appState.movements}
              attendanceTodayPct={attendanceTodayPct}
              onSwitchTab={setActiveTab}
              onOpenModal={(modal) => {
                if (modal === "add-student") {
                  const defaultId = "HS" + String(appState.students.length + 1).padStart(3, "0");
                  setAppState((prev) => ({ ...prev })); // trigger re-render if needed
                }
              }}
              onViewDocument={handleViewDocument}
            />
          )}

          {activeTab === "students" && (
            <StudentsTab
              students={appState.students}
              attendanceToday={attendanceToday}
              hasPermission={hasPermission}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onOpenQuickAttendance={handleOpenQuickAttendance}
              onShowToast={showToast}
            />
          )}

          {activeTab === "assignments" && (
            <AssignmentsTab
              students={appState.students}
              assignments={appState.assignments}
              hasPermission={hasPermission}
              onAddAssignment={handleAddAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onShowToast={showToast}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsTab
              documents={appState.documents}
              hasPermission={hasPermission}
              onAddDocument={handleAddDocument}
              onViewDocument={handleViewDocument}
              onDeleteDocument={handleDeleteDocument}
              onShowToast={showToast}
            />
          )}

          {activeTab === "notices" && (
            <NoticesTab
              notices={appState.notices}
              hasPermission={hasPermission}
              onAddNotice={handleAddNotice}
              onDeleteNotice={handleDeleteNotice}
              onShowToast={showToast}
            />
          )}

          {activeTab === "rewards" && (
            <RewardsTab
              students={appState.students}
              movements={appState.movements}
              hasPermission={hasPermission}
              onAddMovement={handleAddMovement}
              onDeleteMovement={handleDeleteMovement}
              onShowToast={showToast}
            />
          )}

          {activeTab === "permissions" && hasPermission("users_manage") && (
            <PermissionsTab
              users={appState.registeredUsers}
              currentUser={appState.currentUser}
              onUpdateUserPermissions={handleUpdateUserPermissions}
              onDeleteUser={handleDeleteUser}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* 4. CHỮA ĐIỂM DANH NHANH OVERLAY MODAL */}
      {showQuickAttendance && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 select-none">
              <div>
                <h3 className="font-extrabold text-lg text-slate-805 font-display flex items-center gap-1.5">
                  <CalendarCheck className="w-5 h-5 text-indigo-600 animate-pulse" /> Sổ điểm danh nhanh học đường
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cập nhật nhanh sĩ số chuyên cần rèn luyện ngày hôm nay</p>
              </div>
              <button
                onClick={() => setShowQuickAttendance(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 p-3.5 rounded-xl text-xs text-indigo-700 border border-indigo-100 flex items-start gap-2 select-none leading-relaxed font-semibold">
                <span>ℹ️</span>
                <p>Hệ thống mặc định sỹ số học sinh có mặt đầy đủ. Thầy cô chỉ cần nhấp điều chỉnh các em học sinh có phép hoặc nghỉ không phép.</p>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {appState.students.map((std) => {
                  const savedStatus = attendanceCache[std.id] || "Có mặt";
                  return (
                    <div key={std.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                      <span className="text-sm font-bold text-slate-805 font-display select-none">{std.ho_ten}</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateCacheAttendance(std.id, "Có mặt")}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition sm:w-20 cursor-pointer ${
                            savedStatus === "Có mặt" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCacheAttendance(std.id, "Vắng có phép")}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition sm:w-24 cursor-pointer ${
                            savedStatus === "Vắng có phép" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          Vắng phép
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateCacheAttendance(std.id, "Vắng không phép")}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition sm:w-28 cursor-pointer ${
                            savedStatus === "Vắng không phép" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          Nghỉ không phép
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickAttendance(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-655 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Đóng sổ
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="flex-1 py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Lưu điểm danh sỹ số
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SQL HELP MODAL OVERLAY FOR EASY SETUP */}
      {showSqlHelpModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-800 animate-fade-in font-sans">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800 select-none">
              <div>
                <h3 className="font-extrabold text-lg text-emerald-400 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" /> Cài đặt thiết lập Supabase SQL
                </h3>
                <p className="text-xs text-slate-450 mt-1">Khởi tạo nhanh cơ sở dữ liệu các bảng phục vụ cho học đường số hóa</p>
              </div>
              <button
                onClick={() => setShowSqlHelpModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Để ứng dụng đồng bộ đám mây và hoạt động ổn định trên môi trường deploy Vercel và máy cục bộ, bạn hãy sao chép mã SQL DDL bên dưới, dán vào phần <strong className="text-white">"SQL Editor"</strong> trong giao diện điều khiển Supabase của bạn và nhấn <strong className="text-white">Run</strong>:
              </p>

              <div className="relative group">
                <div className="absolute right-3 top-3 z-10 flex gap-2">
                  <button
                    onClick={() => {
                      const sqlCode = `CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  ho_ten TEXT NOT NULL,
  ngay_sinh TEXT,
  gioi_tinh TEXT,
  phu_huynh TEXT,
  dia_chi TEXT,
  diem_ne_nep INT DEFAULT 0,
  lich_su JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS assignments (
  id BIGINT PRIMARY KEY,
  ten_bai_tap TEXT NOT NULL,
  mon_hoc TEXT NOT NULL,
  noi_dung TEXT,
  han_nop TEXT,
  submissions JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY,
  tieu_de TEXT NOT NULL,
  loai_tai_lieu TEXT NOT NULL,
  duong_dan_file TEXT,
  download_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notices (
  id BIGINT PRIMARY KEY,
  tieu_de TEXT NOT NULL,
  noi_dung TEXT,
  ngay_dang TEXT
);

CREATE TABLE IF NOT EXISTS movements (
  id BIGINT PRIMARY KEY,
  ten_hoat_dong TEXT NOT NULL,
  loai TEXT NOT NULL,
  danh_sach_dat_giai TEXT,
  ngay_to_chuc TEXT
);

CREATE TABLE IF NOT EXISTS user_accounts (
  username TEXT PRIMARY KEY,
  fullname TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT,
  permissions JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS attendance (
  date TEXT PRIMARY KEY,
  record JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;`;
                      navigator.clipboard.writeText(sqlCode);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                      showToast("Đã sao chép mã SQL DDL vào Clipboard thành công!", "success");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-extrabold font-display text-[10px]">ĐÃ SAO CHÉP!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-display font-bold text-[10px]">SAO CHÉP MÃ SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-emerald-500 font-mono text-[10.5px] rounded-xl overflow-x-auto max-h-60 border border-slate-850 select-text leading-relaxed">
{`-- 1. Tạo bảng học sinh (students)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  ho_ten TEXT NOT NULL,
  ngay_sinh TEXT,
  gioi_tinh TEXT,
  phu_huynh TEXT,
  dia_chi TEXT,
  diem_ne_nep INT DEFAULT 0,
  lich_su JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT
);

-- 2. Tạo bảng bài tập (assignments)
CREATE TABLE IF NOT EXISTS assignments (
  id BIGINT PRIMARY KEY,
  ten_bai_tap TEXT NOT NULL,
  mon_hoc TEXT NOT NULL,
  noi_dung TEXT,
  han_nop TEXT,
  submissions JSONB DEFAULT '{}'::jsonb
);

-- 3. Tạo bảng học liệu (documents)
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY,
  tieu_de TEXT NOT NULL,
  loai_tai_lieu TEXT NOT NULL,
  duong_dan_file TEXT,
  download_count INT DEFAULT 0
);

-- 4. Tạo bảng bảng tin (notices)
CREATE TABLE IF NOT EXISTS notices (
  id BIGINT PRIMARY KEY,
  tieu_de TEXT NOT NULL,
  noi_dung TEXT,
  ngay_dang TEXT
);

-- 5. Tạo bảng phong trào (movements)
CREATE TABLE IF NOT EXISTS movements (
  id BIGINT PRIMARY KEY,
  ten_hoat_dong TEXT NOT NULL,
  loai TEXT NOT NULL,
  danh_sach_dat_giai TEXT,
  ngay_to_chuc TEXT
);

-- 6. Tạo bảng tài khoản người dùng (user_accounts)
CREATE TABLE IF NOT EXISTS user_accounts (
  username TEXT PRIMARY KEY,
  fullname TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT,
  permissions JSONB DEFAULT '[]'::jsonb
);

-- 7. Tạo bảng điểm danh (attendance)
CREATE TABLE IF NOT EXISTS attendance (
  date TEXT PRIMARY KEY,
  record JSONB DEFAULT '{}'::jsonb
);

-- 8. Tạo bảng cài đặt hệ thống (settings)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- 9. Tắt bảo mật RLS để Client-Side kết nối nhanh qua Anon key
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;`}
                </pre>
              </div>

              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <span className="font-extrabold text-white uppercase block tracking-wider font-display text-[10px]">💡 Hướng dẫn nhanh:</span>
                <ol className="list-decimal pl-4.5 space-y-1.5 text-slate-300">
                  <li>Mở bảng điều khiển Supabase và vào Project của bạn.</li>
                  <li>Nhấp chọn menu <strong className="text-emerald-400">SQL Editor</strong> ở thanh menu dọc bên trái.</li>
                  <li>Click <strong className="text-white">New Query</strong>, dán toàn bộ đoạn mã trên vào đó.</li>
                  <li>Nhấp <strong className="text-emerald-400 font-extrabold">RUN</strong> ở góc phải.</li>
                  <li>Quay lại giao diện ClassMaster và bấm nút kết nối để kiểm tra lại ngay dưới đây.</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSqlHelpModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Đóng hướng dẫn
                </button>
                <button
                  type="button"
                  onClick={handleManualSyncSupabase}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span className="font-display font-extrabold tracking-tight">Tôi đã chạy SQL, kết nối ngay!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.5. REAL-TIME DATABASE LINKAGE & STRUCTURE DIAGNOSTICS MODAL */}
      {showDbDiagnosticsModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-slate-800 animate-fade-in font-sans">
            
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800 select-none">
              <div>
                <h3 className="font-extrabold text-base md:text-lg text-emerald-400 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400 animate-pulse" /> Chẩn đoán Liên kết & Đồng bộ Supabase
                </h3>
                <p className="text-xs text-slate-450 mt-1">Kiểm tra tính chính xác của cấu trúc bảng và dữ liệu đám mây thực tế</p>
              </div>
              <button
                onClick={() => setShowDbDiagnosticsModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Ping and Connection Status banner */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Trạng thái API Endpoint</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-sm font-extrabold text-white font-display">Supabase Cloud Live</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Tổng số bản ghi đám mây</span>
                  <div className="text-sm font-black text-emerald-400 mt-1 font-mono">
                    {dbDiagnostics ? `${dbDiagnostics.totalRecords} Rows` : "Đang tính..."}
                  </div>
                </div>
              </div>

              {/* Table Diagnosis Checklist Checklist */}
              <div className="space-y-2.5">
                <span className="text-[11px] uppercase font-extrabold text-slate-400 tracking-widest block font-display">
                  Cấu trúc Bảng & Chỉ mục Dữ liệu gốc:
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {diagnosticsLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                      <span>Đang kết nối kiểm định từng bảng dữ liệu thực tế...</span>
                    </div>
                  ) : dbDiagnostics ? (
                    dbDiagnostics.tables.map((tbl) => (
                      <div
                        key={tbl.name}
                        className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between hover:bg-slate-800 transition duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${tbl.status === "OK" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-rose-950 text-rose-400 border border-rose-900"}`}>
                            {tbl.status === "OK" ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white leading-none">{tbl.vnName}</p>
                            <p className="text-[10px] font-mono text-slate-450 mt-1">table: "{tbl.name}"</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md ${tbl.status === "OK" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {tbl.status === "OK" ? `${tbl.count} bản ghi` : "Thiếu bảng / Chờ tạo"}
                          </span>
                          {tbl.error && (
                            <p className="text-[10px] text-rose-400 mt-1 max-w-[200px] truncate">{tbl.error}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-550 text-xs">
                      Không thể tải trạng thái chẩn đoán bảng.
                    </div>
                  )}
                </div>
              </div>

              {/* Instructive feedback */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs space-y-1">
                <span className="font-extrabold text-emerald-400 uppercase tracking-widest leading-none block font-display text-[10px]">✓ Khẳng định đồng bộ an toàn:</span>
                <p className="text-emerald-300/90 leading-relaxed font-semibold">
                  Tất cả các hành vi CRUD (Thêm, Sửa, Xoá, Điểm danh) của bạn trên trang web đều được phát ra và liên kết đồng bộ tức thời đến cơ sở dữ liệu Supabase, đảm bảo tính bền vững của dữ liệu học đường.
                </p>
              </div>

              {/* Diagnostics controls */}
              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDbDiagnosticsModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Đóng Chẩn đoán
                </button>
                <button
                  type="button"
                  disabled={diagnosticsLoading}
                  onClick={async () => {
                    setDiagnosticsLoading(true);
                    const status = await checkSupabaseStatus();
                    if (status.isConnected && status.isInitialized) {
                      await seedInitialDataIfNeeded();
                      const cloudState = await loadStateFromSupabase();
                      if (cloudState) {
                        setAppState((prev) => ({
                          ...prev,
                          ...cloudState,
                          currentRole: prev.currentRole,
                          currentUser: prev.currentUser
                        }));
                        showToast("Đã đồng bộ lại và làm mới toàn bộ dữ liệu từ Supabase!", "success");
                      }
                      setSupabaseStatus({
                        isConnected: true,
                        isInitialized: true,
                        loading: false,
                        errorMessage: null
                      });
                      const reports = await getSupabaseDiagnostics();
                      setDbDiagnostics(reports);
                    } else {
                      setSupabaseStatus({
                        isConnected: status.isConnected,
                        isInitialized: status.isInitialized,
                        loading: false,
                        errorMessage: status.errorMessage
                      });
                      showToast("Vẫn chưa thể tìm thấy cấu trúc bảng, vui lòng chạy SQL!", "error");
                    }
                    setDiagnosticsLoading(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-900 rounded-xl font-bold text-xs shadow-md shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-4 h-4 ${diagnosticsLoading ? "animate-spin" : ""}`} />
                  <span className="font-display font-extrabold tracking-tight">Tải lại & Làm mới đám mây</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. DYNAMIC CUSTOM TOAST NOTIFICATION WIDGET */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl z-50 flex items-center gap-3 animate-fade-in select-none">
          <div
            className={`p-1.5 rounded-lg flex items-center justify-center ${
              toast.type === "success" ? "bg-emerald-500 text-slate-900" : "bg-rose-500 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <p className="text-xs font-bold font-display leading-tight">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
