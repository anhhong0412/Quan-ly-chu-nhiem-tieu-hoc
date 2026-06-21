/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

export type UserRole = "admin" | "teacher" | "guest";

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface UserAccount {
  username: string;
  fullname: string;
  role: UserRole;
  password?: string; // Optional for security or simple demo storage
  permissions: string[]; // List of permission IDs
}

export interface Student {
  id: string;
  ho_ten: string;
  ngay_sinh: string;
  gioi_tinh: "Nam" | "Nữ";
  phu_huynh: string;
  dia_chi: string;
  diem_ne_nep: number;
  lich_su: string[]; // e.g. ["+10 điểm: Tuyên dương phát biểu bài xây dựng lớp sôi nổi (28/05/2026)"]
  avatar_url?: string; // URL link or Base64 encoded data string
}

export interface Assignment {
  id: number;
  ten_bai_tap: string;
  mon_hoc: "Toán" | "Tiếng Việt" | "Tiếng Anh" | "Khác";
  noi_dung: string;
  han_nop: string;
  submissions: Record<string, boolean>; // studentId -> true (submitted) / false (not submitted)
}

export interface Document {
  id: number;
  tieu_de: string;
  loai_tai_lieu: "Bài giảng (PDF/PPT)" | "Video";
  duong_dan_file: string;
  download_count: number;
}

export interface Notice {
  id: number;
  tieu_de: string;
  noi_dung: string;
  ngay_dang: string;
}

export interface Movement {
  id: number;
  ten_hoat_dong: string;
  loai: "Hội thi" | "Phong trào";
  danh_sach_dat_giai: string;
  ngay_to_chuc: string;
}

export interface AppState {
  currentRole: UserRole;
  currentUser: UserAccount | null;
  registeredUsers: UserAccount[];
  schoolYear: string;
  students: Student[];
  attendance: Record<string, Record<string, "Có mặt" | "Vắng có phép" | "Vắng không phép">>; // date (YYYY-MM-DD) -> studentId -> status
  assignments: Assignment[];
  documents: Document[];
  notices: Notice[];
  movements: Movement[];
}

export const ALL_PERMISSIONS: Permission[] = [
  { id: "students_manage", name: "Quản lý Học sinh", description: "Thêm, sửa, xóa thông tin học sinh lớp chủ nhiệm." },
  { id: "behavior_adjust", name: "Cập nhật Nề nếp", description: "Cộng/trừ điểm thi đua nề nếp và lưu nhận xét học sinh." },
  { id: "attendance_manage", name: "Điểm danh Lớp học", description: "Điểm danh hàng ngày và điều chỉnh chuyên cần học sinh." },
  { id: "assignments_manage", name: "Quản lý Bài tập", description: "Giao bài tập mới, chấm bài, cập nhật tiến độ nộp bài." },
  { id: "documents_manage", name: "Quản lý Học liệu", description: "Tải lên tài liệu, slide bài học, video và xóa học liệu." },
  { id: "notices_manage", name: "Đăng tải Bảng tin", description: "Tạo và xóa các thông báo liên hệ phụ huynh và nhà trường." },
  { id: "movements_manage", name: "Khen thưởng Thi đua", description: "Ghi nhận phong trào, hội thi, điều chỉnh vinh danh bảng vàng." },
  { id: "users_manage", name: "Phân quyền Hệ thống", description: "Tạo tài khoản phụ, thay đổi quyền hạn chi tiết của người dùng." }
];
