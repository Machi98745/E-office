"use client";

import React, { useMemo, useState } from "react";
import { useEOffice } from "@/context/EOfficeContext";
import { ACTORS } from "@/data/seed";
import {
  LeaveType,
  Memo,
  MemoCategory,
  MemoStatus,
  Role,
  UrgencyLevel,
} from "@/types/eoffice";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  FileCheck2,
  FilePlus2,
  FileText,
  GitBranch,
  Inbox,
  Layers,
  LayoutDashboard,
  Paperclip,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Stamp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

type ActiveTab = "dashboard" | "memos" | "leaves" | "architecture";

function getStatusBadge(status: MemoStatus | string) {
  switch (status) {
    case "Draft":
      return {
        label: "ฉบับร่าง (Draft)",
        className: "bg-slate-100 text-slate-700 border-slate-300",
      };
    case "Pending Clerk":
      return {
        label: "รอสารบรรณออกเลข (Pending Clerk)",
        className: "bg-amber-50 text-amber-800 border-amber-300",
      };
    case "Pending Approval":
      return {
        label: "รอหัวหน้าอนุมัติ (Pending Approval)",
        className: "bg-blue-50 text-blue-800 border-blue-300",
      };
    case "Returned for Revision":
      return {
        label: "ส่งกลับแก้ไข (Returned for Revision)",
        className: "bg-orange-50 text-orange-800 border-orange-300",
      };
    case "Approved":
      return {
        label: "อนุมัติแล้ว (Approved)",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300",
      };
    case "Rejected":
      return {
        label: "ไม่อนุมัติ (Rejected)",
        className: "bg-rose-50 text-rose-800 border-rose-300",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700 border-slate-300",
      };
  }
}

function getUrgencyBadge(urgency: UrgencyLevel) {
  switch (urgency) {
    case "ด่วนที่สุด":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "ด่วน":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function EOfficePage() {
  const {
    currentRole,
    setCurrentRole,
    memos,
    leaves,
    leaveBalance,
    docRunningNumber,
    createMemo,
    updateAndResubmitMemo,
    registerDocumentNumber,
    returnMemoForRevision,
    approveMemo,
    rejectMemo,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    resetDemoData,
  } = useEOffice();

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedMemoId, setSelectedMemoId] = useState<string>(
    memos[0]?.id || "MEMO-001"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showNewMemoModal, setShowNewMemoModal] = useState(false);

  // Action input states for selected Memo
  const [customDocNo, setCustomDocNo] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  // Create Memo form state
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] =
    useState<MemoCategory>("ขออนุมัติโครงการ");
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>("ปกติ");
  const [newTo, setNewTo] = useState("ผู้อำนวยการฝ่ายพัฒนาระบบดิจิทัล");
  const [newContent, setNewContent] = useState("");
  const [newAttachment, setNewAttachment] = useState(
    "เอกสารประกอบการพิจารณา.pdf"
  );
  const [newBudget, setNewBudget] = useState("");

  // Create Leave form state
  const [leaveType, setLeaveType] = useState<LeaveType>("vacation");
  const [leaveStart, setLeaveStart] = useState("2026-12-01");
  const [leaveEnd, setLeaveEnd] = useState("2026-12-02");
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveCommentMap, setLeaveCommentMap] = useState<
    Record<string, string>
  >({});

  const activeActor = ACTORS[currentRole];

  const selectedMemo = useMemo(
    () => memos.find((m) => m.id === selectedMemoId) || memos[0],
    [memos, selectedMemoId]
  );

  // Compute Inbox counts per role so badges on Role Switcher show real-time numbers
  const roleInboxCounts = useMemo(() => {
    const requesterCount = memos.filter(
      (m) => m.status === "Draft" || m.status === "Returned for Revision"
    ).length;
    const clerkCount = memos.filter((m) => m.status === "Pending Clerk").length;
    const approverCount =
      memos.filter((m) => m.status === "Pending Approval").length +
      leaves.filter((l) => l.status === "Pending Approval").length;

    return {
      requester: requesterCount,
      clerk: clerkCount,
      approver: approverCount,
    };
  }, [memos, leaves]);

  const roleInboxMemos = useMemo(() => {
    if (currentRole === "requester") {
      return memos.filter(
        (m) => m.status === "Returned for Revision" || m.status === "Draft"
      );
    }
    if (currentRole === "clerk") {
      return memos.filter((m) => m.status === "Pending Clerk");
    }
    return memos.filter((m) => m.status === "Pending Approval");
  }, [memos, currentRole]);

  const roleInboxLeaves = useMemo(() => {
    if (currentRole === "approver") {
      return leaves.filter((l) => l.status === "Pending Approval");
    }
    if (currentRole === "requester") {
      return leaves.filter((l) => l.status === "Pending Approval");
    }
    return [];
  }, [leaves, currentRole]);

  const filteredMemos = useMemo(() => {
    if (statusFilter === "ALL") return memos;
    return memos.filter((m) => m.status === statusFilter);
  }, [memos, statusFilter]);

  const handleOpenMemoDetail = (memo: Memo) => {
    setSelectedMemoId(memo.id);
    setEditSubject(memo.subject);
    setEditContent(memo.content);
    setIsEditingMemo(false);
    setActionComment("");
    setCustomDocNo("");
    setActiveTab("memos");
  };

  const handleCreateMemoSubmit = (submitImmediately: boolean) => {
    if (!newSubject.trim() || !newContent.trim()) return;
    const created = createMemo({
      subject: newSubject.trim(),
      category: newCategory,
      urgency: newUrgency,
      to: newTo,
      content: newContent.trim(),
      attachmentName: newAttachment.trim() || undefined,
      budgetAmount: newBudget ? Number(newBudget) : undefined,
      submitImmediately,
    });
    setNewSubject("");
    setNewContent("");
    setNewBudget("");
    setShowNewMemoModal(false);
    setSelectedMemoId(created.id);
    setActiveTab("memos");
  };

  const handleCreateLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim() || leaveDays <= 0) return;
    createLeaveRequest({
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      days: Number(leaveDays),
      reason: leaveReason.trim(),
    });
    setLeaveReason("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* TOP DEMO CONTROL BAR (Role Switcher for Academic Presentation) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Cpu className="w-3.5 h-3.5" />
              โหมดสาธิตอาจารย์ (Role Switcher)
            </span>
            <span className="text-xs text-slate-300 hidden md:inline">
              คลิกสลับบทบาทด้านขวาเพื่อจำลองการส่งต่อและอนุมัติเอกสารในหน้าจอเดียว
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["requester", "clerk", "approver"] as Role[]).map((roleKey) => {
              const actor = ACTORS[roleKey];
              const isSelected = currentRole === roleKey;
              const count = roleInboxCounts[roleKey];
              return (
                <button
                  key={roleKey}
                  onClick={() => setCurrentRole(roleKey)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-sm ring-2 ring-indigo-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      roleKey === "requester"
                        ? "bg-blue-500"
                        : roleKey === "clerk"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span>
                    {roleKey === "requester"
                      ? "1. พนักงาน (Requester)"
                      : roleKey === "clerk"
                      ? "2. สารบรรณ (Clerk)"
                      : "3. ผู้อนุมัติ (Approver)"}
                  </span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-rose-600 text-white"
                          : "bg-slate-700 text-amber-300"
                      }`}
                    >
                      {count} งานรอ
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={resetDemoData}
              title="รีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/70 text-rose-200 border border-rose-800/60 hover:bg-rose-900/80 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* HEADER & ACTIVE ACTOR BAR */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  E-Office Smart Workflow
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  Interactive Prototype
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ระบบสำนักงานอิเล็กทรอนิกส์ (สารบรรณดิจิทัล • อนุมัติบันทึกข้อความ • ระบบลางานออนไลน์)
              </p>
            </div>
          </div>

          {/* Current Actor Profile Card */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
            <div
              className={`w-9 h-9 rounded-lg ${activeActor.badgeColor} text-white flex items-center justify-center font-bold text-sm`}
            >
              {activeActor.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  มุมมองปัจจุบัน: {activeActor.name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                  {activeActor.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {activeActor.description}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. แดชบอร์ด & กล่องงาน (Inbox)</span>
            {roleInboxCounts[currentRole] > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-rose-100 text-rose-700 font-bold">
                {roleInboxCounts[currentRole]}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("memos")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "memos"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. ระบบสารบรรณ & บันทึกข้อความ (e-Document)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
              {memos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "leaves"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. ระบบลางานออนไลน์ (e-Leave)</span>
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">
              {leaves.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === "architecture"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4. สรุป Flow & Stack (คู่มือนำเสนออาจารย์)</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD & INBOX                                   */}
        {/* ========================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Role-Aware Welcome & Next Step Guide */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-xs font-medium">
                  <Inbox className="w-3.5 h-3.5" />
                  <span>
                    กล่องงานประจำตำแหน่ง: {activeActor.title}
                  </span>
                </div>
                <h2 className="text-xl font-bold">
                  สวัสดีคุณ{activeActor.name} ({activeActor.department})
                </h2>
                <p className="text-sm text-indigo-100">
                  {currentRole === "requester" &&
                    "คุณสามารถสร้างบันทึกข้อความใหม่ แก้ไขเอกสารที่ถูกสารบรรณ/หัวหน้าส่งกลับมา หรือยื่นใบลาออนไลน์ได้จากหน้านี้"}
                  {currentRole === "clerk" &&
                    "หน้าที่ของคุณใน Flow คือตรวจสอบรูปแบบบันทึกข้อความที่พนักงานส่งเข้ามา ออกเลขทะเบียนหนังสือ (เช่น บค 043/2569) หรือส่งกลับให้แก้ไข"}
                  {currentRole === "approver" &&
                    "หน้าที่ของคุณใน Flow คือพิจารณาอนุมัติหรือไม่อนุมัติบันทึกข้อความที่ผ่านสารบรรณแล้ว รวมถึงอนุมัติใบลาของพนักงานในสังกัด"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setCurrentRole("requester");
                    setShowNewMemoModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-semibold text-sm shadow hover:bg-indigo-50 transition"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>สร้างบันทึกข้อความใหม่</span>
                </button>
                <button
                  onClick={() => setActiveTab("architecture")}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/40 text-white border border-white/25 font-medium text-sm hover:bg-indigo-500/60 transition"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>ดูแผนภาพ Flow & Stack</span>
                </button>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    งานรอดำเนินการของคุณ (Inbox)
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Inbox className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {roleInboxCounts[currentRole]} รายการ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ตามสิทธิ์ของ {activeActor.title}
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    รอสารบรรณออกเลขทะเบียน
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Stamp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {memos.filter((m) => m.status === "Pending Clerk").length} เรื่อง
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  เลขทะเบียนถัดไป: บค {String(docRunningNumber).padStart(3, "0")}/2569
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    รอผู้บริหารพิจารณาอนุมัติ
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {memos.filter((m) => m.status === "Pending Approval").length +
                    leaves.filter((l) => l.status === "Pending Approval")
                      .length}{" "}
                  รายการ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  บันทึกข้อความและใบลาที่รออนุมัติ
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    อนุมัติเสร็จสมบูรณ์แล้ว
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {memos.filter((m) => m.status === "Approved").length +
                    leaves.filter((l) => l.status === "Approved").length}{" "}
                  รายการ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  พร้อมบันทึก Audit Trail ครบทุกขั้นตอน
                </p>
              </div>
            </div>

            {/* Active Role Inbox Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900">
                      กล่องงานรอดำเนินการของคุณ ({activeActor.title})
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {roleInboxMemos.length + roleInboxLeaves.length} รายการ
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {roleInboxMemos.length === 0 &&
                    roleInboxLeaves.length === 0 && (
                      <div className="p-8 text-center space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                        <p className="text-sm font-semibold text-slate-800">
                          ไม่มีงานค้างในกล่องงานของบทบาทนี้
                        </p>
                        <p className="text-xs text-slate-500">
                          คุณสามารถกดสลับบทบาท (Role Switcher) ด้านบนสุดเพื่อดูงานที่รออยู่ในขั้นตอนถัดไปได้ทันที
                        </p>
                      </div>
                    )}

                  {roleInboxMemos.map((memo) => {
                    const badge = getStatusBadge(memo.status);
                    return (
                      <div
                        key={memo.id}
                        className="p-4 hover:bg-slate-50 transition flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-600">
                              {memo.documentNumber || memo.id}
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${getUrgencyBadge(
                                memo.urgency
                              )}`}
                            >
                              {memo.urgency}
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-slate-900">
                            {memo.subject}
                          </p>
                          <p className="text-xs text-slate-500">
                            ผู้ยื่น: {memo.requesterName} ({memo.department}) •
                            อัปเดตล่าสุด {memo.updatedAt}
                          </p>
                          {memo.revisionNote && (
                            <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1.5 mt-1">
                              <strong>หมายเหตุที่ต้องแก้ไข:</strong>{" "}
                              {memo.revisionNote}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenMemoDetail(memo)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                        >
                          <span>
                            {currentRole === "clerk"
                              ? "ตรวจ & ออกเลขหนังสือ"
                              : currentRole === "approver"
                              ? "เปิดพิจารณาอนุมัติ"
                              : "แก้ไข & ส่งเรื่องใหม่"}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {roleInboxLeaves.map((leave) => {
                    const badge = getStatusBadge(leave.status);
                    return (
                      <div
                        key={leave.id}
                        className="p-4 hover:bg-slate-50 transition flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-emerald-700">
                              {leave.id}
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                              ใบลาออนไลน์ ({leave.days} วัน)
                            </span>
                          </div>
                          <p className="font-semibold text-sm text-slate-900">
                            {leaveBalance[leave.leaveType].label} ({leave.startDate}{" "}
                            ถึง {leave.endDate})
                          </p>
                          <p className="text-xs text-slate-500">
                            เหตุผล: {leave.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveTab("leaves")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                        >
                          <span>ไปที่หน้าอนุมัติใบลา</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* How to Demo Flow Step-by-Step Guide Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    โพยสาธิต Flow ให้อาจารย์ดู (3 นาทีจบ)
                  </h3>
                </div>

                <ol className="space-y-3 text-xs text-slate-600">
                  <li className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                    <div className="font-bold text-blue-900">
                      ขั้นที่ 1: บทบาท พนักงาน (Requester)
                    </div>
                    <p>
                      กดปุ่ม <strong>สร้างบันทึกข้อความใหม่</strong> หรือดูเรื่อง{" "}
                      <code>MEMO-003</code> ที่ถูกตีกลับ แล้วกดส่งเข้าห้องสารบรรณ
                    </p>
                  </li>

                  <li className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                    <div className="font-bold text-amber-900">
                      ขั้นที่ 2: สลับเป็น สารบรรณ (Clerk)
                    </div>
                    <p>
                      คลิกปุ่ม <strong>2. สารบรรณ (Clerk)</strong> บนแถบสีดำด้านบน
                      แล้วเปิดเรื่องที่รอตรวจ กด{" "}
                      <strong>ออกเลขทะเบียนหนังสือ (บค xxx/2569)</strong>{" "}
                      เพื่อส่งต่อให้หัวหน้า
                    </p>
                  </li>

                  <li className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                    <div className="font-bold text-emerald-900">
                      ขั้นที่ 3: สลับเป็น ผู้อนุมัติ (Approver)
                    </div>
                    <p>
                      คลิกปุ่ม <strong>3. ผู้อนุมัติ (Approver)</strong> ด้านบน
                      แล้วกด <strong>อนุมัติ (Approve)</strong> ทั้งบันทึกข้อความและใบลา
                      สังเกตโควตาวันลาที่ตัดยอดอัตโนมัติ!
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: E-DOCUMENT / MEMO WORKFLOW                          */}
        {/* ========================================================= */}
        {activeTab === "memos" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "ALL", label: "ทั้งหมด" },
                  { key: "Pending Clerk", label: "รอสารบรรณออกเลข" },
                  { key: "Pending Approval", label: "รอหัวหน้าอนุมัติ" },
                  { key: "Returned for Revision", label: "ส่งกลับแก้ไข" },
                  { key: "Approved", label: "อนุมัติแล้ว" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      statusFilter === f.key
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowNewMemoModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <FilePlus2 className="w-4 h-4" />
                <span>สร้างบันทึกข้อความใหม่ (New Memo)</span>
              </button>
            </div>

            {/* Split View: Memo List (Left) & Memo Detail + Workflow State Machine (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left List */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    รายการบันทึกข้อความ ({filteredMemos.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    คลิกเลือกเพื่อดู Flow & ดำเนินการ
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                  {filteredMemos.map((m) => {
                    const badge = getStatusBadge(m.status);
                    const isSelected = selectedMemo?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => handleOpenMemoDetail(m)}
                        className={`w-full text-left p-4 transition block ${
                          isSelected
                            ? "bg-indigo-50/70 border-l-4 border-l-indigo-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-indigo-600">
                            {m.documentNumber
                              ? `${m.documentNumber} (${m.id})`
                              : m.id}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {m.subject}
                        </p>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                          <span>{m.category}</span>
                          <span>{m.updatedAt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Detail & Workflow Panel */}
              {selectedMemo && (
                <div className="lg:col-span-7 space-y-4">
                  {/* Visual 4-Step Workflow Stepper */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        เส้นทางการเดินเอกสาร (Memo Workflow State Machine)
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                          getStatusBadge(selectedMemo.status).className
                        }`}
                      >
                        {getStatusBadge(selectedMemo.status).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        {
                          step: 1,
                          title: "1. ผู้ยื่นเรื่อง (Requester)",
                          desc: "ร่าง/ส่งบันทึกข้อความ",
                          active:
                            selectedMemo.status === "Draft" ||
                            selectedMemo.status === "Returned for Revision",
                          done:
                            selectedMemo.status !== "Draft" &&
                            selectedMemo.status !== "Returned for Revision",
                        },
                        {
                          step: 2,
                          title: "2. สารบรรณ (Clerk)",
                          desc: selectedMemo.documentNumber
                            ? `ออกเลข: ${selectedMemo.documentNumber}`
                            : "ตรวจรูปแบบ & ออกเลข",
                          active: selectedMemo.status === "Pending Clerk",
                          done:
                            selectedMemo.status === "Pending Approval" ||
                            selectedMemo.status === "Approved" ||
                            selectedMemo.status === "Rejected",
                        },
                        {
                          step: 3,
                          title: "3. หัวหน้า (Approver)",
                          desc: "พิจารณาอนุมัติ/ตีกลับ",
                          active: selectedMemo.status === "Pending Approval",
                          done:
                            selectedMemo.status === "Approved" ||
                            selectedMemo.status === "Rejected",
                        },
                        {
                          step: 4,
                          title: "4. เสร็จสิ้น (Final)",
                          desc:
                            selectedMemo.status === "Rejected"
                              ? "ไม่อนุมัติ (ปิดเรื่อง)"
                              : "อนุมัติ & เก็บเข้าคลัง",
                          active: false,
                          done:
                            selectedMemo.status === "Approved" ||
                            selectedMemo.status === "Rejected",
                        },
                      ].map((s) => (
                        <div
                          key={s.step}
                          className={`p-2.5 rounded-xl border text-xs transition ${
                            s.active
                              ? "bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-200"
                              : s.done
                              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                              : "bg-slate-50 border-slate-200 text-slate-400"
                          }`}
                        >
                          <div className="font-bold">{s.title}</div>
                          <div className="text-[11px] mt-0.5 opacity-85">
                            {s.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Role-Based Action Panel */}
                  <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-sm text-slate-900">
                          แผงควบคุมการอนุมัติ/ดำเนินการ (สิทธิ์ปัจจุบัน:{" "}
                          {activeActor.title})
                        </h4>
                      </div>
                    </div>

                    {/* CASE 1: Clerk acting on Pending Clerk */}
                    {currentRole === "clerk" &&
                      selectedMemo.status === "Pending Clerk" && (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                เลขทะเบียนหนังสือราชการ (Document Number)
                              </label>
                              <input
                                type="text"
                                value={customDocNo}
                                onChange={(e) => setCustomDocNo(e.target.value)}
                                placeholder={`ค่าอัตโนมัติ: บค ${String(
                                  docRunningNumber
                                ).padStart(3, "0")}/2569`}
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">
                                ความเห็นเจ้าหน้าที่สารบรรณ / เหตุผลที่ตีกลับ
                              </label>
                              <input
                                type="text"
                                value={actionComment}
                                onChange={(e) =>
                                  setActionComment(e.target.value)
                                }
                                placeholder="เช่น เอกสารครบถ้วน หรือ ระบุสิ่งที่ต้องแก้ไข"
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              onClick={() => {
                                registerDocumentNumber(
                                  selectedMemo.id,
                                  customDocNo,
                                  actionComment
                                );
                                setCustomDocNo("");
                                setActionComment("");
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition shadow-sm"
                            >
                              <Stamp className="w-4 h-4" />
                              <span>
                                ลงทะเบียนออกเลขหนังสือ & ส่งต่อผู้อนุมัติ
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                returnMemoForRevision(
                                  selectedMemo.id,
                                  actionComment ||
                                    "กรุณาตรวจสอบรูปแบบเอกสารและแนบข้อมูลเพิ่มเติม"
                                );
                                setActionComment("");
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 text-xs font-semibold hover:bg-orange-200 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>ส่งกลับให้ผู้ยื่นแก้ไข (Return)</span>
                            </button>
                          </div>
                        </div>
                      )}

                    {/* CASE 2: Approver acting on Pending Approval */}
                    {currentRole === "approver" &&
                      selectedMemo.status === "Pending Approval" && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              ความเห็นผู้บริหาร / คำสั่งการท้ายบันทึกข้อความ
                            </label>
                            <input
                              type="text"
                              value={actionComment}
                              onChange={(e) => setActionComment(e.target.value)}
                              placeholder="เช่น อนุมัติให้ดำเนินการตามเสนอ หรือ ระบุเหตุผลที่ตีกลับ/ไม่อนุมัติ"
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              onClick={() => {
                                approveMemo(selectedMemo.id, actionComment);
                                setActionComment("");
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>ลงนามอนุมัติ (Approve)</span>
                            </button>

                            <button
                              onClick={() => {
                                returnMemoForRevision(
                                  selectedMemo.id,
                                  actionComment ||
                                    "ให้ทบทวนรายละเอียดงบประมาณและส่งเข้ามาใหม่"
                                );
                                setActionComment("");
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-100 text-orange-800 border border-orange-300 text-xs font-semibold hover:bg-orange-200 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>ส่งกลับแก้ไข (Return for Revision)</span>
                            </button>

                            <button
                              onClick={() => {
                                rejectMemo(
                                  selectedMemo.id,
                                  actionComment || "ไม่อนุมัติเนื่องจากเกินกรอบงบประมาณ"
                                );
                                setActionComment("");
                              }}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-200 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ไม่อนุมัติ (Reject)</span>
                            </button>
                          </div>
                        </div>
                      )}

                    {/* CASE 3: Requester acting on Draft or Returned for Revision */}
                    {currentRole === "requester" &&
                      (selectedMemo.status === "Draft" ||
                        selectedMemo.status === "Returned for Revision") && (
                        <div className="space-y-3 pt-1">
                          {!isEditingMemo ? (
                            <div className="flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() => {
                                  setEditSubject(selectedMemo.subject);
                                  setEditContent(selectedMemo.content);
                                  setIsEditingMemo(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition"
                              >
                                แก้ไขเนื้อหาเอกสาร
                              </button>
                              <button
                                onClick={() =>
                                  updateAndResubmitMemo(
                                    selectedMemo.id,
                                    selectedMemo.subject,
                                    selectedMemo.content,
                                    "ส่งเรื่องให้สารบรรณตรวจสอบ"
                                  )
                                }
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ส่งเรื่องให้สารบรรณตรวจสอบทันที</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                  หัวข้อเรื่อง
                                </label>
                                <input
                                  type="text"
                                  value={editSubject}
                                  onChange={(e) =>
                                    setEditSubject(e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">
                                  เนื้อหาบันทึกข้อความ
                                </label>
                                <textarea
                                  rows={3}
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    updateAndResubmitMemo(
                                      selectedMemo.id,
                                      editSubject,
                                      editContent,
                                      "แก้ไขเนื้อหาตามคำแนะนำและส่งตรวจใหม่"
                                    );
                                    setIsEditingMemo(false);
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>บันทึกการแก้ไข & ส่งให้สารบรรณ</span>
                                </button>
                                <button
                                  onClick={() => setIsEditingMemo(false)}
                                  className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-medium"
                                >
                                  ยกเลิก
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Helpful prompt when waiting on a different role */}
                    {((selectedMemo.status === "Pending Clerk" &&
                      currentRole !== "clerk") ||
                      (selectedMemo.status === "Pending Approval" &&
                        currentRole !== "approver") ||
                      ((selectedMemo.status === "Draft" ||
                        selectedMemo.status === "Returned for Revision") &&
                        currentRole !== "requester")) && (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>
                            ขณะนี้เอกสารอยู่ที่ขั้นตอน{" "}
                            <strong>
                              {getStatusBadge(selectedMemo.status).label}
                            </strong>{" "}
                            — กดปุ่มสลับบทบาทเป็นผู้อนุมัติของขั้นตอนนี้ได้เลย:
                          </span>
                        </div>
                        {selectedMemo.status === "Pending Clerk" && (
                          <button
                            onClick={() => setCurrentRole("clerk")}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition"
                          >
                            สลับเป็น สารบรรณ (Clerk) ทันที
                          </button>
                        )}
                        {selectedMemo.status === "Pending Approval" && (
                          <button
                            onClick={() => setCurrentRole("approver")}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                          >
                            สลับเป็น ผู้อนุมัติ (Approver) ทันที
                          </button>
                        )}
                        {(selectedMemo.status === "Draft" ||
                          selectedMemo.status === "Returned for Revision") && (
                          <button
                            onClick={() => setCurrentRole("requester")}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                          >
                            สลับเป็น พนักงานผู้ยื่น (Requester) ทันที
                          </button>
                        )}
                      </div>
                    )}

                    {(selectedMemo.status === "Approved" ||
                      selectedMemo.status === "Rejected") && (
                      <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200">
                        เอกสารนี้ดำเนินการเสร็จสิ้นแล้ว (สถานะ:{" "}
                        <strong>
                          {getStatusBadge(selectedMemo.status).label}
                        </strong>
                        ) สามารถตรวจสอบประวัติการลงนามใน Audit Trail ด้านล่าง
                      </div>
                    )}
                  </div>

                  {/* Official Memo Paper Preview */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            บันทึกข้อความภายในองค์กร (OFFICIAL MEMO)
                          </span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${getUrgencyBadge(
                              selectedMemo.urgency
                            )}`}
                          >
                            ชั้นความเร็ว: {selectedMemo.urgency}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">
                          {selectedMemo.subject}
                        </h3>
                      </div>

                      <div className="text-right text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <div>
                          <strong>เลขทะเบียนหนังสือ:</strong>{" "}
                          <span className="font-mono font-bold text-indigo-700">
                            {selectedMemo.documentNumber ||
                              "ยังไม่ออกเลข (รอสารบรรณ)"}
                          </span>
                        </div>
                        <div>
                          <strong>รหัสอ้างอิงระบบ:</strong> {selectedMemo.id}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <strong>ส่วนราชการ/แผนก:</strong>{" "}
                        {selectedMemo.department}
                      </div>
                      <div>
                        <strong>วันที่สร้างเอกสาร:</strong>{" "}
                        {selectedMemo.createdAt}
                      </div>
                      <div>
                        <strong>เรียน:</strong> {selectedMemo.to}
                      </div>
                      <div>
                        <strong>ผู้ยื่นเรื่อง:</strong>{" "}
                        {selectedMemo.requesterName}
                      </div>
                      <div>
                        <strong>หมวดหมู่:</strong> {selectedMemo.category}
                      </div>
                      {selectedMemo.budgetAmount !== undefined && (
                        <div>
                          <strong>วงเงินงบประมาณ:</strong>{" "}
                          <span className="font-bold text-emerald-700">
                            {selectedMemo.budgetAmount.toLocaleString()} บาท
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedMemo.revisionNote && (
                      <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-900">
                        <strong>ความเห็นให้แก้ไข (Revision Note):</strong>{" "}
                        {selectedMemo.revisionNote}
                      </div>
                    )}

                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-200">
                      {selectedMemo.content}
                    </div>

                    {selectedMemo.attachmentName && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Paperclip className="w-4 h-4 text-indigo-600" />
                          <span>ไฟล์แนบ: {selectedMemo.attachmentName}</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ✓ ตรวจสอบไฟล์แนบแล้ว
                        </span>
                      </div>
                    )}

                    {/* Audit Trail Timeline */}
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                        ประวัติการเดินเอกสาร (Audit Trail)
                      </h4>
                      <div className="space-y-3">
                        {selectedMemo.auditTrail.map((entry, idx) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 text-xs"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-slate-900">
                                  {entry.actorName} ({ACTORS[entry.actorRole].title})
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  {entry.timestamp}
                                </span>
                              </div>
                              <p className="text-slate-700 mt-0.5">
                                {entry.action}
                              </p>
                              {entry.comment && (
                                <p className="text-slate-600 italic mt-1 bg-white px-2.5 py-1 rounded border border-slate-200">
                                  “{entry.comment}”
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: E-LEAVE WORKFLOW & LEAVE BALANCE                    */}
        {/* ========================================================= */}
        {activeTab === "leaves" && (
          <div className="space-y-6">
            {/* Explanation Banner comparing Leave Flow vs Memo Flow */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ระบบลางานออนไลน์ (e-Leave Direct Approval Flow)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ข้อแตกต่างทางสถาปัตยกรรม Flow: ใบลาเป็นงานบริหารบุคคล (HR) จึงวิ่งตรงจาก{" "}
                    <strong>พนักงาน (Requester) → หัวหน้างาน (Approver)</strong>{" "}
                    โดยไม่ต้องผ่านสารบรรณออกเลขหนังสือราชการ และตัดโควตาวันลาอัตโนมัติเมื่ออนุมัติ
                  </p>
                </div>
              </div>
            </div>

            {/* Leave Balance Quota Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(leaveBalance) as LeaveType[]).map((key) => {
                const quota = leaveBalance[key];
                const remaining = Math.max(0, quota.total - quota.used);
                const percentUsed = Math.min(
                  100,
                  Math.round((quota.used / quota.total) * 100)
                );
                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {quota.label}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                        คงเหลือ {remaining} วัน
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-slate-900">
                        ใช้ไป {quota.used}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          / {quota.total} วัน
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{ width: `${percentUsed}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Submit Leave Request Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    ยื่นใบลาออนไลน์ใหม่ (สำหรับพนักงาน)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    ผู้ยื่น: {ACTORS.requester.name}
                  </span>
                </div>

                <form onSubmit={handleCreateLeaveSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ประเภทการลา
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) =>
                        setLeaveType(e.target.value as LeaveType)
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      <option value="vacation">
                        ลาพักผ่อนประจำปี (Vacation Leave)
                      </option>
                      <option value="sick">ลาป่วย (Sick Leave)</option>
                      <option value="personal">
                        ลากิจธุระจำเป็น (Personal Leave)
                      </option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        ตั้งแต่วันที่
                      </label>
                      <input
                        type="date"
                        value={leaveStart}
                        onChange={(e) => setLeaveStart(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        ถึงวันที่
                      </label>
                      <input
                        type="date"
                        value={leaveEnd}
                        onChange={(e) => setLeaveEnd(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        จำนวน (วัน)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={leaveDays}
                        onChange={(e) => setLeaveDays(Number(e.target.value))}
                        className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เหตุผลการลาและการส่งมอบงานระหว่างลา
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="ระบุเหตุผลการลาและผู้รับผิดชอบงานแทน..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งใบลาให้หัวหน้าพิจารณา (Pending Approval)</span>
                  </button>
                </form>
              </div>

              {/* Right: Leave Requests List & Approval Action */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900">
                    รายการใบลาทั้งหมด & การอนุมัติ ({leaves.length})
                  </h4>
                  {currentRole !== "approver" && (
                    <button
                      onClick={() => setCurrentRole("approver")}
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                    >
                      สลับเป็น ผู้อนุมัติ (Approver) เพื่อกดอนุมัติใบลา
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-100">
                  {leaves.map((lv) => {
                    const badge = getStatusBadge(lv.status);
                    return (
                      <div key={lv.id} className="p-5 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-600">
                              {lv.id}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {leaveBalance[lv.leaveType].label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                              {lv.days} วัน
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div>
                            <strong>ผู้ยื่นลา:</strong> {lv.requesterName} (
                            {lv.department}) • <strong>ช่วงวันที่ลา:</strong>{" "}
                            {lv.startDate} ถึง {lv.endDate}
                          </div>
                          <div>
                            <strong>เหตุผลการลา:</strong> {lv.reason}
                          </div>
                          {lv.approverComment && (
                            <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 mt-1">
                              <strong>ความเห็นผู้อนุมัติ:</strong>{" "}
                              {lv.approverComment}
                            </div>
                          )}
                        </div>

                        {lv.status === "Pending Approval" &&
                          currentRole === "approver" && (
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                placeholder="ความเห็นผู้อนุมัติ (เช่น อนุมัติการลา)"
                                value={leaveCommentMap[lv.id] || ""}
                                onChange={(e) =>
                                  setLeaveCommentMap((prev) => ({
                                    ...prev,
                                    [lv.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                              />
                              <button
                                onClick={() =>
                                  approveLeaveRequest(
                                    lv.id,
                                    leaveCommentMap[lv.id]
                                  )
                                }
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>อนุมัติ & หักวันลา ({lv.days} วัน)</span>
                              </button>
                              <button
                                onClick={() =>
                                  rejectLeaveRequest(
                                    lv.id,
                                    leaveCommentMap[lv.id] ||
                                      "ไม่อนุมัติเนื่องจากติดภารกิจสำคัญของแผนก"
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-semibold hover:bg-rose-200 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>ไม่อนุมัติ</span>
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: FLOW & STACK ARCHITECTURE (PRESENTATION CHEAT-SHEET) */}
        {/* ========================================================= */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    สรุปสถาปัตยกรรม Flow & Stack ของระบบ E-Office (สำหรับนำเสนออาจารย์)
                  </h2>
                  <p className="text-xs text-slate-500">
                    เปิดหน้านี้ประกอบการอธิบายให้อาจารย์ฟังได้เลย สรุปครบทั้ง Workflow State Machine, Tech Stack, และคำศัพท์โดเมน (Glossary)
                  </p>
                </div>
              </div>

              {/* PART 1: FLOW */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-600" />
                  <span>ส่วนที่ 1: การออกแบบ FLOW (Workflow & State Machine)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-indigo-700 uppercase">
                      Flow A: ระบบสารบรรณ & บันทึกข้อความ (3-Role Routing)
                    </div>
                    <p className="text-xs text-slate-600">
                      ใช้สำหรับเอกสารทางการที่ต้องมีการตรวจสอบรูปแบบและออกเลขทะเบียนหนังสือราชการก่อนเสนอผู้บริหาร:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>1. Draft → Pending Clerk:</strong> พนักงาน (
                        <code>Requester</code>) ร่างบันทึกข้อความและส่งเข้าห้องสารบรรณ
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>2. Pending Clerk → Pending Approval:</strong>{" "}
                        เจ้าหน้าที่สารบรรณ (<code>Clerk</code>) ตรวจรูปแบบและออก{" "}
                        <code>Document Number (บค xxx/2569)</code>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>3. Returned for Revision (Loop):</strong> หากข้อมูลไม่ครบ
                        ทั้งสารบรรณและหัวหน้าสามารถตีกลับให้ผู้ยื่นแก้ไขในเลขเรื่องเดิมได้
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>4. Approved / Rejected:</strong> ผู้อำนวยการฝ่าย (
                        <code>Approver</code>) ลงนามอนุมัติหรือไม่อนุมัติ พร้อมเก็บ{" "}
                        <code>Audit Trail</code>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-emerald-700 uppercase">
                      Flow B: ระบบลางานออนไลน์ e-Leave (2-Role Direct Routing)
                    </div>
                    <p className="text-xs text-slate-600">
                      ใช้สำหรับงานบริหารบุคคล (HR) ที่ต้องการความรวดเร็วและผูกกับโควตาวันลาพนักงานโดยตรง:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>1. Direct Submission:</strong> พนักงาน (
                        <code>Requester</code>) ยื่นใบลา วิ่งตรงเข้ากล่องงานหัวหน้า (
                        <code>Approver</code>) โดยไม่ผ่านสารบรรณ
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <strong>2. Automatic Quota Deduction:</strong> เมื่อ{" "}
                        <code>Approver</code> กดอนุมัติ ระบบจะหักจำนวนวันลาออกจาก{" "}
                        <code>Leave Balance</code> (ลาป่วย / ลากิจ / ลาพักร้อน) ทันที
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PART 2: STACK */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>
                    ส่วนที่ 2: การออกแบบ STACK (เปรียบเทียบ Prototype Stack vs Enterprise Production Stack)
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-3 font-bold">Layer (ชั้นสถาปัตยกรรม)</th>
                        <th className="p-3 font-bold text-indigo-700">
                          Interactive Prototype Stack (ที่ใช้ในโปรเจกต์นี้)
                        </th>
                        <th className="p-3 font-bold text-emerald-700">
                          Production Stack (เมื่อขยายขึ้นระบบจริงในองค์กร)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold">Frontend & UI</td>
                        <td className="p-3">
                          Next.js (App Router) + React + TypeScript + Tailwind CSS + Lucide Icons
                        </td>
                        <td className="p-3">
                          Next.js + TypeScript + Tailwind CSS / shadcn/ui
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Workflow & State Engine
                        </td>
                        <td className="p-3">
                          React Context State Machine +{" "}
                          <code>localStorage</code> Persistence
                        </td>
                        <td className="p-3">
                          Next.js Server Actions / Node.js API + Temporal หรือ State Machine Table
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Database & File Storage
                        </td>
                        <td className="p-3">
                          In-Browser JSON Store + Seed Data & One-Click Reset
                        </td>
                        <td className="p-3">
                          PostgreSQL (Prisma/Drizzle ORM) + AWS S3 / MinIO (เก็บไฟล์ PDF แนบ)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Authentication & RBAC
                        </td>
                        <td className="p-3">
                          Instant Role Switcher (สลับมุมมอง Requester / Clerk / Approver ทันที)
                        </td>
                        <td className="p-3">
                          Auth.js / Keycloak SSO + Role-Based Access Control (RBAC) & Digital Signature
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW MEMO                                    */}
      {/* ========================================================= */}
      {showNewMemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  สร้างบันทึกข้อความใหม่ (New Official Memo)
                </h3>
                <p className="text-xs text-slate-500">
                  ผู้ยื่นเรื่อง: {ACTORS.requester.name} ({ACTORS.requester.department})
                </p>
              </div>
              <button
                onClick={() => setShowNewMemoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เรื่อง (Subject) *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="เช่น ขออนุมัติจัดซื้อเครื่องคอมพิวเตอร์พกพาสำหรับพนักงานใหม่"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    หมวดหมู่เอกสาร
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as MemoCategory)
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="ขออนุมัติโครงการ">ขออนุมัติโครงการ</option>
                    <option value="จัดซื้อจัดจ้าง">จัดซื้อจัดจ้าง</option>
                    <option value="ขอเบิกงบประมาณ">ขอเบิกงบประมาณ</option>
                    <option value="บันทึกข้อความทั่วไป">
                      บันทึกข้อความทั่วไป
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชั้นความเร็ว
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) =>
                      setNewUrgency(e.target.value as UrgencyLevel)
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  >
                    <option value="ปกติ">ปกติ</option>
                    <option value="ด่วน">ด่วน</option>
                    <option value="ด่วนที่สุด">ด่วนที่สุด</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    งบประมาณ (บาท - ถ้ามี)
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="เช่น 45000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เรียน (ผู้รับ/ผู้อนุมัติ)
                  </label>
                  <input
                    type="text"
                    value={newTo}
                    onChange={(e) => setNewTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อไฟล์แนบ (จำลอง)
                  </label>
                  <input
                    type="text"
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เนื้อหาบันทึกข้อความ (ต้นเรื่อง / เหตุผลความจำเป็น / ข้อเสนอเพื่อพิจารณา) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="ระบุเหตุผลความจำเป็นและรายละเอียดเพื่อเสนอให้ผู้บริหารพิจารณาอนุมัติ..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewMemoModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateMemoSubmit(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
                >
                  บันทึกเป็นฉบับร่าง (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateMemoSubmit(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งเรื่องให้สารบรรณทันที (Submit to Clerk)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
