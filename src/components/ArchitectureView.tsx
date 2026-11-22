"use client";

import React from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  FileText,
  GitBranch,
  Layers,
  ShieldCheck,
  Stamp,
  UserCheck,
} from "lucide-react";

export function ArchitectureView() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-7 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              สไลด์สรุปสำหรับเปิดนำเสนออาจารย์ (Presentation Mode)
            </span>
            <h2 className="text-2xl font-bold">
              สถาปัตยกรรมระบบ E-Office: การออกแบบ FLOW & STACK
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              หน้านี้สรุปโครงสร้างการเดินเอกสาร (Workflow State Machine)
              และชุดเทคโนโลยี (Full-Stack Architecture)
              เพื่อใช้อธิบายประกอบการสาธิตให้อาจารย์ฟังได้ทันที
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: VISUAL WORKFLOW DIAGRAM */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ส่วนที่ 1: การออกแบบ FLOW (Workflow Routing & State Machine)
            </h3>
            <p className="text-xs text-slate-500">
              เปรียบเทียบเส้นทางเดินงานระหว่าง “งานสารบรรณหนังสือราชการ (3
              บทบาท)” กับ “งานบริหารบุคคล/ลางาน (2 บทบาท)”
            </p>
          </div>
        </div>

        {/* Visual 3-Role Step Diagram */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
            Flow A: ระบบสารบรรณและอนุมัติบันทึกข้อความ (Memo 3-Role State
            Machine)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  บทบาทที่ 1: Requester
                </span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-bold text-sm text-slate-900">
                พนักงานผู้ยื่นเรื่อง
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                สร้างร่างบันทึกข้อความ (<code>Draft</code>) แนบไฟล์ PDF
                และกดส่งเข้าห้องสารบรรณ (<code>Pending Clerk</code>)
                หรือแก้ไขงานที่ถูกตีกลับ
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-amber-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-xs font-bold">
                  บทบาทที่ 2: Clerk
                </span>
                <Stamp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="font-bold text-sm text-slate-900">
                เจ้าหน้าที่สารบรรณกลาง
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                ตรวจความถูกต้องของเอกสาร ออกเลขทะเบียนหนังสือราชการ (
                <code>บค xxx/2569</code>) เพื่อส่งต่อผู้บริหาร (
                <code>Pending Approval</code>) หรือตีกลับ (
                <code>Returned for Revision</code>)
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  บทบาทที่ 3: Approver
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-bold text-sm text-slate-900">
                ผู้อำนวยการฝ่าย (ผู้อนุมัติ)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                พิจารณาลงนามด้วยลายมือชื่ออิเล็กทรอนิกส์ (
                <code>e-Signature Approved</code>) ตีกลับแก้ไข หรือไม่อนุมัติ (
                <code>Rejected</code>) พร้อมออกเอกสาร PDF
              </p>
            </div>
          </div>
        </div>

        {/* Flow B: Leave & Booking */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5 text-xs">
            <div className="font-bold text-emerald-900 text-sm">
              Flow B: ระบบลางานออนไลน์ (e-Leave 2-Role Direct Flow)
            </div>
            <p className="text-slate-700 leading-relaxed">
              วิ่งตรงจาก <strong>พนักงาน (Requester) → หัวหน้างาน (Approver)</strong>{" "}
              โดยไม่ต้องผ่านสารบรรณออกเลขหนังสือ ระบบตรวจสอบช่วงวันที่ลาและหักยอดวันลาคงเหลือ
              (<code>Leave Balance</code>) อัตโนมัติทันทีที่อนุมัติ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1.5 text-xs">
            <div className="font-bold text-indigo-900 text-sm">
              Flow C: ระบบตรวจสอบย้อนหลัง (Immutable Audit Trail)
            </div>
            <p className="text-slate-700 leading-relaxed">
              ทุกการเปลี่ยนสถานะในระบบจะถูกบันทึกเวลา ชื่อผู้กระทำ บทบาท
              และความเห็นลงใน <code>Audit Trail</code>{" "}
              เพื่อให้ตรวจสอบความโปร่งใสย้อนหลังได้ 100%
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TECH STACK TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              ส่วนที่ 2: การออกแบบ STACK (Full-Stack Architecture)
            </h3>
            <p className="text-xs text-slate-500">
              โครงสร้างเทคโนโลยีแต่ละชั้น (Layer) ที่ใช้ในโปรเจกต์นี้
              และการขยายผลสู่ระบบ Cloud ระดับองค์กร
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                <th className="p-3.5 font-bold">ชั้นสถาปัตยกรรม (Layer)</th>
                <th className="p-3.5 font-bold text-indigo-700">
                  Stack ที่ใช้งานจริงในโปรเจกต์นี้
                </th>
                <th className="p-3.5 font-bold text-emerald-700">
                  Stack เมื่อขยายขึ้นระบบจริงระดับ Enterprise
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">
                  1. Frontend & UI Layer
                </td>
                <td className="p-3.5">
                  Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS
                  + Lucide Icons
                </td>
                <td className="p-3.5">
                  Next.js + TypeScript + Tailwind CSS / shadcn/ui
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">
                  2. Backend & API Layer
                </td>
                <td className="p-3.5">
                  Next.js REST API Route (<code>GET / POST /api/eoffice</code>) +
                  State Machine Reducer
                </td>
                <td className="p-3.5">
                  Node.js / NestJS หรือ Next.js Server Actions + Workflow Engine
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">
                  3. Database & Storage
                </td>
                <td className="p-3.5">
                  Hybrid Persistence: Server JSON DB (
                  <code>data/eoffice-db.json</code>) +{" "}
                  <code>localStorage</code> Fallback
                </td>
                <td className="p-3.5">
                  PostgreSQL (Prisma ORM) + AWS S3 / MinIO (เก็บไฟล์แนบ PDF)
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-slate-900">
                  4. Auth & Access Control
                </td>
                <td className="p-3.5">
                  Role-Based Access Control (RBAC) + 1-Click Role Login &
                  Instant Role Switcher
                </td>
                <td className="p-3.5">
                  Keycloak / Azure AD (SSO) + PKI Digital Certificate
                  (e-Signature)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
