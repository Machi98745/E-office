"use client";

import React from "react";
import { ACTORS } from "@/data/seed";
import { Memo } from "@/types/eoffice";
import { Building2, Printer, ShieldCheck, X } from "lucide-react";

interface OfficialPrintModalProps {
  memo: Memo;
  statusLabel: string;
  onClose: () => void;
}

export function OfficialPrintModal({
  memo,
  statusLabel,
  onClose,
}: OfficialPrintModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Top Action Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>
              ตัวอย่างหนังสือราชการ / บันทึกข้อความ (พร้อมสั่งพิมพ์หรือ Save as
              PDF)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>สั่งพิมพ์ / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              title="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4-style Official Memo Sheet */}
        <div className="p-10 md:p-12 space-y-6 text-slate-900 bg-white">
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <Building2 className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  บันทึกข้อความ
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  ระบบสารบรรณอิเล็กทรอนิกส์ (E-Office Official Memorandum)
                </p>
              </div>
            </div>
            <div className="border-2 border-slate-300 rounded-xl px-4 py-2.5 text-xs text-right bg-slate-50">
              <div className="text-slate-500 font-medium">
                เลขทะเบียนรับสารบรรณ
              </div>
              <div className="text-sm font-mono font-bold text-indigo-700 mt-0.5">
                {memo.documentNumber || "รอสารบรรณออกเลข"}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                ชั้นความเร็ว: <strong>{memo.urgency}</strong>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <strong>ส่วนงาน / แผนก:</strong> {memo.department} (โทร.{" "}
              {ACTORS.requester.phone})
            </div>
            <div className="flex justify-between">
              <span>
                <strong>ที่:</strong> {memo.documentNumber || memo.id}
              </span>
              <span>
                <strong>วันที่:</strong> {memo.createdAt}
              </span>
            </div>
            <div>
              <strong>เรื่อง:</strong>{" "}
              <span className="font-semibold">{memo.subject}</span>
            </div>
            <div>
              <strong>เรียน:</strong> {memo.to}
            </div>
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-line pt-3 min-h-[140px] border-t border-slate-100">
            {memo.content}
          </div>

          {memo.budgetAmount !== undefined && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold flex items-center justify-between">
              <span>วงเงินงบประมาณที่ขออนุมัติ:</span>
              <span className="text-emerald-700 font-bold text-base">
                {memo.budgetAmount.toLocaleString()} บาท
              </span>
            </div>
          )}

          {/* Signatures & Official Stamp Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-slate-300 text-xs">
            <div className="text-center space-y-2 p-5 border border-slate-200 rounded-2xl bg-slate-50/40">
              <div className="font-bold text-slate-700">ผู้เสนอเรื่อง</div>
              <div className="italic font-semibold text-base text-indigo-900 py-2">
                {memo.requesterName}
              </div>
              <div className="font-medium text-slate-800">
                ({memo.requesterName})
              </div>
              <div className="text-slate-500">{ACTORS.requester.title}</div>
            </div>

            <div className="text-center space-y-2 p-5 border border-slate-200 rounded-2xl bg-slate-50/40">
              <div className="font-bold text-slate-700">
                คำสั่งการ / ผลการพิจารณาของผู้บริหาร
              </div>
              {memo.status === "Approved" ? (
                <>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full border-2 border-emerald-700 text-emerald-800 font-bold bg-emerald-50">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>อนุมัติแล้ว (APPROVED)</span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    “{memo.approverCommand || "อนุมัติให้ดำเนินการตามเสนอ"}”
                  </div>
                  <div className="italic font-semibold text-base text-emerald-900">
                    {memo.signedBy || ACTORS.approver.name}
                  </div>
                  <div className="font-medium text-slate-800">
                    ({memo.signedBy || ACTORS.approver.name})
                  </div>
                  <div className="text-slate-500">
                    {ACTORS.approver.title} • {memo.signedAt}
                  </div>
                </>
              ) : (
                <div className="py-6 text-slate-400">
                  (อยู่ระหว่างขั้นตอน: {statusLabel})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
