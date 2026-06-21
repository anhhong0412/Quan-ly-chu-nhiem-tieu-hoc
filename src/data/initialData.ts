/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { AppState, Student, Assignment, Document, Notice, Movement, UserAccount, ALL_PERMISSIONS } from "../types";

export const initialStudents: Student[] = [
  {
    id: "HS001",
    ho_ten: "Nguyễn Văn An",
    ngay_sinh: "2015-05-15",
    gioi_tinh: "Nam",
    phu_huynh: "Nguyễn Văn Hùng (0901234567)",
    dia_chi: "123 Lê Lợi, Q.1, TP. HCM",
    diem_ne_nep: 10,
    lich_su: [
      "+10 điểm: Tuyên dương phát biểu xây dựng bài sôi nổi môn Tiếng Việt (28/05/2026)",
      "+5 điểm: Đạt điểm tốt môn Toán và giúp bạn giải bài khó (25/05/2026)"
    ]
  },
  {
    id: "HS002",
    ho_ten: "Trần Thị Bình",
    ngay_sinh: "2015-08-20",
    gioi_tinh: "Nữ",
    phu_huynh: "Trần Thị Mai (0907654321)",
    dia_chi: "456 Nguyễn Huệ, Q.1, TP. HCM",
    diem_ne_nep: -2,
    lich_su: [
      "-2 điểm: Đi học muộn quá 15 phút không phép (28/05/2026)",
      "+5 điểm: Tích cực dọn vệ sinh phòng học cùng các bạn (22/05/2026)"
    ]
  },
  {
    id: "HS003",
    ho_ten: "Lê Hoàng Cường",
    ngay_sinh: "2015-01-02",
    gioi_tinh: "Nam",
    phu_huynh: "Lê Văn Tiến (0909876543)",
    dia_chi: "789 Cách Mạng Tháng Tám, Q.3, TP. HCM",
    diem_ne_nep: 5,
    lich_su: [
      "+5 điểm: Giúp bạn dọn dẹp vệ sinh phòng học chuẩn bị đại hội (02/06/2026)"
    ]
  },
  {
    id: "HS004",
    ho_ten: "Phạm Minh Đức",
    ngay_sinh: "2015-11-12",
    gioi_tinh: "Nam",
    phu_huynh: "Phạm Văn Bắc (0903334445)",
    dia_chi: "12 Lý Tự Trọng, Q.1, TP. HCM",
    diem_ne_nep: 0,
    lich_su: []
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: 1,
    ten_bai_tap: "Phiếu ôn tập Toán tuần 32 - Phân số & Thập phân",
    mon_hoc: "Toán",
    noi_dung: "Hoàn thiện các bài toán nhân chia phân số nâng cao và giải toán có lời văn từ câu 1 đến câu 5.",
    han_nop: "2026-06-18",
    submissions: {
      "HS001": true,
      "HS002": false,
      "HS003": true,
      "HS004": false
    }
  },
  {
    id: 2,
    ten_bai_tap: "Tập làm văn: Viết đoạn văn miêu tả người thân yêu",
    mon_hoc: "Tiếng Việt",
    noi_dung: "Viết đoạn văn ngắn (7-10 câu) tả ngoại hình và tính cách của mẹ hoặc bố em, chú ý sử dụng từ gợi tả gợi cảm.",
    han_nop: "2026-06-20",
    submissions: {
      "HS001": true,
      "HS002": true,
      "HS003": false,
      "HS004": false
    }
  }
];

export const initialDocuments: Document[] = [
  {
    id: 1,
    tieu_de: "Slide bài giảng ôn tập Phân Số Toán lớp 5 chuyên sâu",
    loai_tai_lieu: "Bài giảng (PDF/PPT)",
    duong_dan_file: "https://drive.google.com/file/d/sample1",
    download_count: 145
  },
  {
    id: 2,
    tieu_de: "Tài liệu chuyên đề Toán Chuyển Động Đều cực hay",
    loai_tai_lieu: "Bài giảng (PDF/PPT)",
    duong_dan_file: "https://drive.google.com/file/d/sample2",
    download_count: 120
  },
  {
    id: 3,
    tieu_de: "Sổ tay tuyển tập Từ Vựng Tiếng Việt 5 học kì II",
    loai_tai_lieu: "Bài giảng (PDF/PPT)",
    duong_dan_file: "https://drive.google.com/file/d/sample3",
    download_count: 98
  },
  {
    id: 4,
    tieu_de: "Tuyển tập Đề khảo sát Tiếng Anh chuẩn Châu Âu Lớp 5",
    loai_tai_lieu: "Bài giảng (PDF/PPT)",
    duong_dan_file: "https://drive.google.com/file/d/sample4",
    download_count: 85
  },
  {
    id: 5,
    tieu_de: "Video bài giảng hướng dẫn Tập làm văn tả cảnh sinh hoạt",
    loai_tai_lieu: "Video",
    duong_dan_file: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    download_count: 76
  }
];

export const initialNotices: Notice[] = [
  {
    id: 1,
    tieu_de: "Thông báo họp phụ huynh cuối học kì II lớp 5A",
    noi_dung: "Trân trọng kính mời quý phụ huynh học sinh tham gia buổi họp đánh giá tổng kết cuối học kỳ II vào lúc 8h00 ngày Chủ nhật 21/06 tới đây tại phòng học lớp 5A nhằm tổng kết chặng đường tiểu học của các con.",
    ngay_dang: "2026-06-08"
  },
  {
    id: 2,
    tieu_de: "Phát động phong trào Kế hoạch nhỏ đợt II",
    noi_dung: "Nhà trường chính thức phát động phong trào Kế hoạch nhỏ quyên góp giấy vụn và lon nhôm đợt 2. Kính mong phụ huynh nhắc nhở con em chuẩn bị đóng góp vào ngày Thứ Sáu 19/06 tới đây.",
    ngay_dang: "2026-06-05"
  }
];

export const initialMovements: Movement[] = [
  {
    id: 1,
    ten_hoat_dong: "Hội khỏe Phù Đổng cấp Trường năm 2026",
    loai: "Hội thi",
    danh_sach_dat_giai: "Học sinh Nguyễn Văn An đạt Giải Nhất môn chạy cự ly ngắn 100m nam.\nHọc sinh Lê Hoàng Cường đạt Huy chương Đồng môn Cờ vua.",
    ngay_to_chuc: "2026-05-20"
  },
  {
    id: 2,
    ten_hoat_dong: "Phong trào thi đua tuần lễ 'Hoa Điểm 10 dâng tặng Thầy Cô'",
    loai: "Phong trào",
    danh_sach_dat_giai: "Tập thể Chi đội lớp 5A xuất sắc đạt Giải Nhì thi đua nề nếp và học tập toàn khối 5.",
    ngay_to_chuc: "2026-04-30"
  }
];

export const defaultAccounts: UserAccount[] = [
  {
    username: "admin",
    fullname: "Quản trị viên Hệ thống",
    role: "admin",
    password: "admin", // As requested by user "admin/admin"
    permissions: ALL_PERMISSIONS.map(p => p.id) // All permissions
  },
  {
    username: "co_hong",
    fullname: "Cô Đỗ Thị Ánh Hồng",
    role: "teacher",
    password: "123",
    permissions: [
      "students_manage",
      "behavior_adjust",
      "attendance_manage",
      "assignments_manage",
      "documents_manage",
      "notices_manage",
      "movements_manage"
    ] // All classroom management permissions, but no "users_manage" system configuration permissions
  }
];

export const loadInitialState = (): AppState => {
  const cached = localStorage.getItem("class_master_state_hong_react");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Ensure we fill any missing pieces fallback
      return {
        currentRole: parsed.currentRole || "guest",
        currentUser: parsed.currentUser || null,
        registeredUsers: parsed.registeredUsers || defaultAccounts,
        schoolYear: parsed.schoolYear || "2025-2026",
        students: parsed.students || initialStudents,
        attendance: parsed.attendance || {
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
        },
        assignments: parsed.assignments || initialAssignments,
        documents: parsed.documents || initialDocuments,
        notices: parsed.notices || initialNotices,
        movements: parsed.movements || initialMovements
      };
    } catch (e) {
      console.error("Error reading cached local storage state", e);
    }
  }

  // Build a default starting attendance registry for previous dates if fresh
  const attendanceData: Record<string, Record<string, "Có mặt" | "Vắng có phép" | "Vắng không phép">> = {
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

  return {
    currentRole: "guest",
    currentUser: null,
    registeredUsers: defaultAccounts,
    schoolYear: "2025-2026",
    students: initialStudents,
    attendance: attendanceData,
    assignments: initialAssignments,
    documents: initialDocuments,
    notices: initialNotices,
    movements: initialMovements
  };
};

export const saveAppState = (state: AppState) => {
  localStorage.setItem("class_master_state_hong_react", JSON.stringify(state));
};
