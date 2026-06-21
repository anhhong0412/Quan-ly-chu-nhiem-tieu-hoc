/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from "react";
import { Document } from "../types";
import { FileText, Video, Download, Play, Plus, X, Trash2, ExternalLink } from "lucide-react";

interface DocumentsTabProps {
  documents: Document[];
  hasPermission: (perm: string) => boolean;
  onAddDocument: (doc: Document) => void;
  onViewDocument: (id: number) => void;
  onDeleteDocument: (id: number) => void;
  onShowToast: (msg: string, type?: "success" | "error") => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documents,
  hasPermission,
  onAddDocument,
  onViewDocument,
  onDeleteDocument,
  onShowToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    type: "Bài giảng (PDF/PPT)" as "Bài giảng (PDF/PPT)" | "Video",
    url: "",
  });

  const lectures = documents.filter((d) => d.loai_tai_lieu.includes("Bài giảng"));
  const videos = documents.filter((d) => d.loai_tai_lieu === "Video");

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission("documents_manage")) {
      onShowToast("Bạn không có quyền đăng tải học liệu!", "error");
      return;
    }
    if (!newDoc.title.trim() || !newDoc.url.trim()) {
      onShowToast("Vui lòng điền đủ Tiêu đề và liên kết liên kết!", "error");
      return;
    }

    const document: Document = {
      id: Date.now(),
      tieu_de: newDoc.title.trim(),
      loai_tai_lieu: newDoc.type,
      duong_dan_file: newDoc.url.trim(),
      download_count: 0,
    };

    onAddDocument(document);
    setShowAddModal(false);
    setNewDoc({ title: "", type: "Bài giảng (PDF/PPT)", url: "" });
    onShowToast("Đã tải lên học liệu mới thành công!", "success");
  };

  const handleDeleteWithCheck = (id: number, title: string) => {
    if (!hasPermission("documents_manage")) {
      onShowToast("Bạn không có quyền xóa học liệu này!", "error");
      return;
    }

    const isConfirmed = window.confirm(`Bạn có đồng ý xóa học liệu '${title}' không?`);
    if (isConfirmed) {
      onDeleteDocument(id);
      onShowToast("Đã loại bỏ học liệu thành công!", "success");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-bold text-base text-slate-800 font-display">Kho học liệu bồi dưỡng học tập</h3>
          <p className="text-xs text-slate-400">Lưu hành tài liệu ôn tập nâng cao, slide bài giảng lớp 5 và video bài giảng</p>
        </div>

        <button
          onClick={() => {
            if (!hasPermission("documents_manage")) {
              onShowToast("Bạn cần có quyền quản lý học liệu để tải lên tài liệu!", "error");
              return;
            }
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-semibold text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Đăng học liệu mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lectures Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-red-500" /> Bài giảng, Đề luyện & Sổ tay ôn tập
          </h4>

          <div className="space-y-3">
            {lectures.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">Chưa có bài giảng nào được tải lên.</p>
            ) : (
              lectures.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-150 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-500 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-750 line-clamp-1 font-display" title={doc.tieu_de}>
                        {doc.tieu_de}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-400" /> {doc.download_count} lượt tải xuống
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <a
                      href={doc.duong_dan_file}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onViewDocument(doc.id)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-650 hover:border-indigo-2 w-8 h-8 flex items-center justify-center rounded-lg transition shadow-sm"
                      title="Mở liên kết"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {hasPermission("documents_manage") && (
                      <button
                        onClick={() => handleDeleteWithCheck(doc.id, doc.tieu_de)}
                        className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 w-8 h-8 flex items-center justify-center rounded-lg transition shadow-sm cursor-pointer"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Video Resources Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2 font-display">
            <Video className="w-5 h-5 text-indigo-500" /> Video hướng dẫn, Clip thực tế bài giải
          </h4>

          <div className="space-y-3">
            {videos.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">Chưa có video hướng dẫn bài học nào.</p>
            ) : (
              videos.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-150 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-750 line-clamp-1 font-display" title={doc.tieu_de}>
                        {doc.tieu_de}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Play className="w-3 h-3 text-slate-400" /> {doc.download_count} lượt xem video
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <a
                      href={doc.duong_dan_file}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => onViewDocument(doc.id)}
                      className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-650 hover:border-indigo-2 w-8 h-8 flex items-center justify-center rounded-lg transition shadow-sm"
                      title="Xem video"
                    >
                      <Play className="w-4 h-4" />
                    </a>
                    {hasPermission("documents_manage") && (
                      <button
                        onClick={() => handleDeleteWithCheck(doc.id, doc.tieu_de)}
                        className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 w-8 h-8 flex items-center justify-center rounded-lg transition shadow-sm cursor-pointer"
                        title="Xóa video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD RESOURCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-md w-full animate-fade-in border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800 font-display">Tải lên học liệu tài liệu</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Tên tài liệu / Tiêu đề học tập</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đề cương luyện giải toán tư duy tuần 33"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Phân loại tệp tin</label>
                <select
                  value={newDoc.type}
                  onChange={(e) =>
                    setNewDoc({
                      ...newDoc,
                      type: e.target.value as "Bài giảng (PDF/PPT)" | "Video",
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Bài giảng (PDF/PPT)">Bài giảng, Đề luyện (PDF/PPT/Word)</option>
                  <option value="Video">Video hỗ trợ học (Youtube/Drive)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-display">Đường dẫn tệp tin (URL)</label>
                <input
                  type="url"
                  required
                  placeholder="Ví dụ: https://drive.google.com/file/... hoặc link YouTube"
                  value={newDoc.url}
                  onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
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
                  Tải lên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
