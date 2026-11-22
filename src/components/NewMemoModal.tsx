"use client";

import React, { useState } from "react";
import { ACTORS } from "@/data/seed";
import { Attachment, MemoCategory, UrgencyLevel } from "@/types/eoffice";
import { FilePlus2, Send, Upload, X } from "lucide-react";

interface NewMemoModalProps {
  onClose: () => void;
  onCreate: (input: {
    subject: string;
    category: MemoCategory;
    urgency: UrgencyLevel;
    to: string;
    content: string;
    attachment?: Attachment;
    budgetAmount?: number;
    submitImmediately: boolean;
  }) => void;
}

export function NewMemoModal({ onClose, onCreate }: NewMemoModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<MemoCategory>("ขออนุมัติโครงการ");
  const [urgency, setUrgency] = useState<UrgencyLevel>("ปกติ");
  const [to, setTo] = useState("ผู้อำนวยการฝ่ายพัฒนาระบบดิจิทัล");
  const [content, setContent] = useState("");
  const [attachmentName, setAttachmentName] = useState(
    "เอกสารประกอบการพิจารณา.pdf"
  );
  const [attachmentSize, setAttachmentSize] = useState("1.2 MB");
  const [budget, setBudget] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentName(file.name);
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    setAttachmentSize(
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`
    );
  };

  const handleSubmit = (submitImmediately: boolean) => {
    if (!subject.trim() || !content.trim()) return;
    onCreate({
      subject: subject.trim(),
      category,
      urgency,
      to,
      content: content.trim(),
      attachment: attachmentName.trim()
        ? { name: attachmentName.trim(), size: attachmentSize }
        : undefined,
      budgetAmount: budget ? Number(budget) : undefined,
      submitImmediately,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                สร้างบันทึกข้อความใหม่ (New Official Memo)
              </h3>
              <p className="text-xs text-slate-500">
                ผู้ยื่นเรื่อง: {ACTORS.requester.name} (
                {ACTORS.requester.department})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              หัวข้อเรื่อง (Subject) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="เช่น ขออนุมัติจัดซื้อเครื่องคอมพิวเตอร์พกพาสำหรับพนักงานใหม่"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                หมวดหมู่เอกสาร
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoCategory)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="ขออนุมัติโครงการ">ขออนุมัติโครงการ</option>
                <option value="จัดซื้อจัดจ้าง">จัดซื้อจัดจ้าง</option>
                <option value="ขอเบิกงบประมาณ">ขอเบิกงบประมาณ</option>
                <option value="บันทึกข้อความทั่วไป">บันทึกข้อความทั่วไป</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชั้นความเร็ว
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="ปกติ">ปกติ</option>
                <option value="ด่วน">ด่วน</option>
                <option value="ด่วนที่สุด">ด่วนที่สุด</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                งบประมาณ (บาท)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="เช่น 45000"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                เรียน (ผู้รับ/ผู้อนุมัติ)
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                แนบไฟล์ประกอบจากเครื่อง (PDF / รูปภาพ)
              </label>
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-xs text-indigo-700 font-medium cursor-pointer hover:bg-indigo-50 transition">
                <Upload className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {attachmentName} ({attachmentSize})
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              เนื้อหาบันทึกข้อความ (เหตุผลความจำเป็น และข้อเสนอเพื่อพิจารณา){" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ระบุเหตุผลความจำเป็นและรายละเอียดเพื่อเสนอให้ผู้บริหารพิจารณาอนุมัติ..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition"
            >
              บันทึกฉบับร่าง (Save Draft)
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งให้สารบรรณทันที (Submit to Clerk)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
