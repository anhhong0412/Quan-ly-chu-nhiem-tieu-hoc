/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { supabase } from "./supabaseClient";
import { Student, Assignment, Document, Notice, Movement, UserAccount, AppState } from "../types";
import { initialStudents, initialAssignments, initialDocuments, initialNotices, initialMovements, defaultAccounts } from "../data/initialData";

export interface SupabaseConfigState {
  isConnected: boolean;
  isInitialized: boolean;
  errorMessage: string | null;
}

// Check if tables exist by doing a basic query across all 8 required tables.
// If any table returns a 42P01 error, then the database structure is incomplete.
export async function checkSupabaseStatus(): Promise<SupabaseConfigState> {
  const tables = ["students", "assignments", "documents", "notices", "movements", "user_accounts", "attendance", "settings"];
  try {
    for (const tbl of tables) {
      const { error } = await supabase.from(tbl).select("*").limit(1);
      if (error) {
        if (error.code === "42P01") {
          return {
            isConnected: true,
            isInitialized: false,
            errorMessage: `Thiếu cấu trúc bảng "${tbl}" trong hệ thống.`
          };
        }
        return {
          isConnected: false,
          isInitialized: false,
          errorMessage: `Không thể kết nối bảng "${tbl}": ${error.message}`
        };
      }
    }
    return { isConnected: true, isInitialized: true, errorMessage: null };
  } catch (err: any) {
    return {
      isConnected: false,
      isInitialized: false,
      errorMessage: err.message || "Lỗi mạng hoặc không thể kết nối đến máy chủ Supabase."
    };
  }
}

export interface TableDiagnostic {
  name: string;
  vnName: string;
  status: "OK" | "FAIL";
  count: number;
  error?: string;
}

// Exhaustive real-time cloud data check to return database data reports
export async function getSupabaseDiagnostics(): Promise<{
  isConnected: boolean;
  tables: TableDiagnostic[];
  totalRecords: number;
}> {
  const tableChecklist = [
    { name: "students", vnName: "Học sinh" },
    { name: "assignments", vnName: "Bài tập rèn luyện" },
    { name: "documents", vnName: "Kho Học liệu" },
    { name: "notices", vnName: "Thông báo & Bảng tin" },
    { name: "movements", vnName: "Phong trào thi đua" },
    { name: "user_accounts", vnName: "Tài khoản giáo viên (RBAC)" },
    { name: "attendance", vnName: "Dữ liệu điểm danh" },
    { name: "settings", vnName: "Cài đặt & Học kì" }
  ];

  const results: TableDiagnostic[] = [];
  let isConnected = true;
  let totalRecords = 0;

  for (const tbl of tableChecklist) {
    try {
      const { data, error } = await supabase.from(tbl.name).select("*");
      if (error) {
        results.push({
          name: tbl.name,
          vnName: tbl.vnName,
          status: "FAIL",
          count: 0,
          error: error.message
        });
        isConnected = false;
      } else {
        const rowCount = data ? data.length : 0;
        results.push({
          name: tbl.name,
          vnName: tbl.vnName,
          status: "OK",
          count: rowCount
        });
        totalRecords += rowCount;
      }
    } catch (e: any) {
      results.push({
        name: tbl.name,
        vnName: tbl.vnName,
        status: "FAIL",
        count: 0,
        error: e.message || "Unknown error occurred"
      });
      isConnected = false;
    }
  }

  return { isConnected, tables: results, totalRecords };
}

// ----------------- GENERIC TABLE SYNC / INITIALIZER -----------------
// If database is initialized but empty, we can seed the initial data!
export async function seedInitialDataIfNeeded() {
  try {
    // 1. Students
    const { data: stdData } = await supabase.from("students").select("id");
    if (stdData && stdData.length === 0) {
      await supabase.from("students").insert(
        initialStudents.map((s) => ({
          id: s.id,
          ho_ten: s.ho_ten,
          ngay_sinh: s.ngay_sinh,
          gioi_tinh: s.gioi_tinh,
          phu_huynh: s.phu_huynh,
          dia_chi: s.dia_chi,
          diem_ne_nep: s.diem_ne_nep,
          lich_su: s.lich_su,
          avatar_url: s.avatar_url || null
        }))
      );
    }

    // 2. Assignments
    const { data: asgData } = await supabase.from("assignments").select("id");
    if (asgData && asgData.length === 0) {
      await supabase.from("assignments").insert(
        initialAssignments.map((a) => ({
          id: a.id,
          ten_bai_tap: a.ten_bai_tap,
          mon_hoc: a.mon_hoc,
          noi_dung: a.noi_dung,
          han_nop: a.han_nop,
          submissions: a.submissions
        }))
      );
    }

    // 3. Documents
    const { data: docData } = await supabase.from("documents").select("id");
    if (docData && docData.length === 0) {
      await supabase.from("documents").insert(
        initialDocuments.map((d) => ({
          id: d.id,
          tieu_de: d.tieu_de,
          loai_tai_lieu: d.loai_tai_lieu,
          duong_dan_file: d.duong_dan_file,
          download_count: d.download_count
        }))
      );
    }

    // 4. Notices
    const { data: noticeData } = await supabase.from("notices").select("id");
    if (noticeData && noticeData.length === 0) {
      await supabase.from("notices").insert(
        initialNotices.map((n) => ({
          id: n.id,
          tieu_de: n.tieu_de,
          noi_dung: n.noi_dung,
          ngay_dang: n.ngay_dang
        }))
      );
    }

    // 5. Movements
    const { data: mvData } = await supabase.from("movements").select("id");
    if (mvData && mvData.length === 0) {
      await supabase.from("movements").insert(
        initialMovements.map((m) => ({
          id: m.id,
          ten_hoat_dong: m.ten_hoat_dong,
          loai: m.loai,
          danh_sach_dat_giai: m.danh_sach_dat_giai,
          ngay_to_chuc: m.ngay_to_chuc
        }))
      );
    }

    // 6. User Accounts
    const { data: userData } = await supabase.from("user_accounts").select("username");
    if (userData && userData.length === 0) {
      await supabase.from("user_accounts").insert(
        defaultAccounts.map((u) => ({
          username: u.username,
          fullname: u.fullname,
          role: u.role,
          password: u.password,
          permissions: u.permissions
        }))
      );
    }

    // 7. Attendance
    const { data: attData } = await supabase.from("attendance").select("date");
    if (attData && attData.length === 0) {
      const defaultAttendance = {
        "2026-06-08": {
          "HS001": "Có mặt",
          "HS002": "Vắng có phép",
          "HS003": "Có mặt",
          "HS004": "Có mặt"
        },
        "2026-06-11": {
          "HS001": "Có mặt",
          "HS002": "Có mặt",
          "HS003": "Có mặt",
          "HS004": "Có mặt"
        }
      };
      for (const [date, record] of Object.entries(defaultAttendance)) {
        await supabase.from("attendance").insert({ date, record });
      }
    }

    // 8. Settings
    const { data: setVal } = await supabase.from("settings").select("key").eq("key", "school_year").maybeSingle();
    if (!setVal) {
      await supabase.from("settings").insert({ key: "school_year", value: "2025-2026" });
    }
  } catch (err) {
    console.warn("Seeding initial Supabase data failed", err);
  }
}

// ----------------- LOAD ENTIRE APP STATE FROM SUPABASE -----------------
export async function loadStateFromSupabase(): Promise<Partial<AppState> | null> {
  try {
    const [
      stdResp,
      asgResp,
      docResp,
      noticeResp,
      mvResp,
      userResp,
      attResp,
      settingsResp
    ] = await Promise.all([
      supabase.from("students").select("*"),
      supabase.from("assignments").select("*"),
      supabase.from("documents").select("*"),
      supabase.from("notices").select("*"),
      supabase.from("movements").select("*"),
      supabase.from("user_accounts").select("*"),
      supabase.from("attendance").select("*"),
      supabase.from("settings").select("*").eq("key", "school_year").maybeSingle()
    ]);

    if (
      stdResp.error ||
      asgResp.error ||
      docResp.error ||
      noticeResp.error ||
      mvResp.error ||
      userResp.error ||
      attResp.error
    ) {
      console.warn("Could not retrieve all Supabase tables, some queries failed. Falling back to Local Storage.");
      return null;
    }

    // Process Attendance Row models to Record Format
    const attRecord: Record<string, Record<string, any>> = {};
    if (attResp.data) {
      attResp.data.forEach((row: any) => {
        attRecord[row.date] = row.record || {};
      });
    }

    // Process User accounts
    const formattedUsers: UserAccount[] = (userResp.data || []).map((u: any) => ({
      username: u.username,
      fullname: u.fullname,
      role: u.role,
      password: u.password,
      permissions: Array.isArray(u.permissions) ? u.permissions : []
    }));

    // Process Students
    const formattedStudents: Student[] = (stdResp.data || []).map((s: any) => ({
      id: s.id,
      ho_ten: s.ho_ten,
      ngay_sinh: s.ngay_sinh,
      gioi_tinh: s.gioi_tinh,
      phu_huynh: s.phu_huynh,
      dia_chi: s.dia_chi,
      diem_ne_nep: Number(s.diem_ne_nep || 0),
      lich_su: Array.isArray(s.lich_su) ? s.lich_su : [],
      avatar_url: s.avatar_url || undefined
    }));

    return {
      students: formattedStudents,
      assignments: (asgResp.data || []).map((a: any) => ({
        id: Number(a.id),
        ten_bai_tap: a.ten_bai_tap,
        mon_hoc: a.mon_hoc,
        noi_dung: a.noi_dung,
        han_nop: a.han_nop,
        submissions: a.submissions || {}
      })),
      documents: (docResp.data || []).map((d: any) => ({
        id: Number(d.id),
        tieu_de: d.tieu_de,
        loai_tai_lieu: d.loai_tai_lieu,
        duong_dan_file: d.duong_dan_file,
        download_count: Number(d.download_count || 0)
      })),
      notices: (noticeResp.data || []).map((n: any) => ({
        id: Number(n.id),
        tieu_de: n.tieu_de,
        noi_dung: n.noi_dung,
        ngay_dang: n.ngay_dang
      })),
      movements: (mvResp.data || []).map((m: any) => ({
        id: Number(m.id),
        ten_hoat_dong: m.ten_hoat_dong,
        loai: m.loai,
        danh_sach_dat_giai: m.danh_sach_dat_giai,
        ngay_to_chuc: m.ngay_to_chuc
      })),
      registeredUsers: formattedUsers,
      attendance: attRecord,
      schoolYear: settingsResp.data ? settingsResp.data.value : "2025-2026"
    };
  } catch (err) {
    console.error("Failed to load state from Supabase", err);
    return null;
  }
}

// ----------------- INDIVIDUAL WRITE SYNC OPERATORS -----------------

export async function dbSaveStudent(std: Student) {
  try {
    const payload: any = {
      id: std.id,
      ho_ten: std.ho_ten,
      ngay_sinh: std.ngay_sinh,
      gioi_tinh: std.gioi_tinh,
      phu_huynh: std.phu_huynh,
      dia_chi: std.dia_chi,
      diem_ne_nep: std.diem_ne_nep,
      lich_su: std.lich_su
    };
    if (std.avatar_url !== undefined) {
      payload.avatar_url = std.avatar_url || null;
    }

    const { error } = await supabase.from("students").upsert(payload);
    if (error) {
      // If error is about missing column (Database code or message), retry without avatar_url
      if (error.code === "42703" || error.message.toLowerCase().includes("avatar_url")) {
        console.warn("Supabase database is missing avatar_url column. Retrying without it.", error.message);
        const fallbackPayload = { ...payload };
        delete fallbackPayload.avatar_url;
        await supabase.from("students").upsert(fallbackPayload);
      } else {
        throw error;
      }
    }
  } catch (e) {
    console.error("dbSaveStudent error", e);
  }
}

export async function dbDeleteStudent(id: string) {
  try {
    await supabase.from("students").delete().eq("id", id);
  } catch (e) {
    console.error("dbDeleteStudent error", e);
  }
}

export async function dbSaveAssignment(asg: Assignment) {
  try {
    await supabase.from("assignments").upsert({
      id: asg.id,
      ten_bai_tap: asg.ten_bai_tap,
      mon_hoc: asg.mon_hoc,
      noi_dung: asg.noi_dung,
      han_nop: asg.han_nop,
      submissions: asg.submissions
    });
  } catch (e) {
    console.error("dbSaveAssignment error", e);
  }
}

export async function dbDeleteAssignment(id: number) {
  try {
    await supabase.from("assignments").delete().eq("id", id);
  } catch (e) {
    console.error("dbDeleteAssignment error", e);
  }
}

export async function dbSaveDocument(doc: Document) {
  try {
    await supabase.from("documents").upsert({
      id: doc.id,
      tieu_de: doc.tieu_de,
      loai_tai_lieu: doc.loai_tai_lieu,
      duong_dan_file: doc.duong_dan_file,
      download_count: doc.download_count
    });
  } catch (e) {
    console.error("dbSaveDocument error", e);
  }
}

export async function dbDeleteDocument(id: number) {
  try {
    await supabase.from("documents").delete().eq("id", id);
  } catch (e) {
    console.error("dbDeleteDocument error", e);
  }
}

export async function dbSaveNotice(notice: Notice) {
  try {
    await supabase.from("notices").upsert({
      id: notice.id,
      tieu_de: notice.tieu_de,
      noi_dung: notice.noi_dung,
      ngay_dang: notice.ngay_dang
    });
  } catch (e) {
    console.error("dbSaveNotice error", e);
  }
}

export async function dbDeleteNotice(id: number) {
  try {
    await supabase.from("notices").delete().eq("id", id);
  } catch (e) {
    console.error("dbDeleteNotice error", e);
  }
}

export async function dbSaveMovement(m: Movement) {
  try {
    await supabase.from("movements").upsert({
      id: m.id,
      ten_hoat_dong: m.ten_hoat_dong,
      loai: m.loai,
      danh_sach_dat_giai: m.danh_sach_dat_giai,
      ngay_to_chuc: m.ngay_to_chuc
    });
  } catch (e) {
    console.error("dbSaveMovement error", e);
  }
}

export async function dbDeleteMovement(id: number) {
  try {
    await supabase.from("movements").delete().eq("id", id);
  } catch (e) {
    console.error("dbDeleteMovement error", e);
  }
}

export async function dbSaveUserAccount(user: UserAccount) {
  try {
    await supabase.from("user_accounts").upsert({
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      password: user.password,
      permissions: user.permissions
    });
  } catch (e) {
    console.error("dbSaveUserAccount error", e);
  }
}

export async function dbDeleteUserAccount(username: string) {
  try {
    await supabase.from("user_accounts").delete().eq("username", username);
  } catch (e) {
    console.error("dbDeleteUserAccount error", e);
  }
}

export async function dbSaveAttendance(date: string, record: Record<string, string>) {
  try {
    await supabase.from("attendance").upsert({
      date,
      record
    });
  } catch (e) {
    console.error("dbSaveAttendance error", e);
  }
}

export async function dbSaveSchoolYear(schoolYear: string) {
  try {
    await supabase.from("settings").upsert({
      key: "school_year",
      value: schoolYear
    });
  } catch (e) {
    console.error("dbSaveSchoolYear error", e);
  }
}
