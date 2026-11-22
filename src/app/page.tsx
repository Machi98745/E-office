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
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  DoorOpen,
  FilePlus2,
  FileText,
  GitBranch,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Paperclip,
  PenTool,
  Printer,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Stamp,
  Trash2,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "memos"
  | "leaves"
  | "bookings"
  | "announcements"
  | "architecture";

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

const MEETING_ROOMS = [
  {
    name: "ห้องประชุมใหญ่ Smart Auditorium",
    floor: "ชั้น 3 อาคารสำนักงานใหญ่",
    capacity: 80,
    equipment: "จอ LED Wall, ระบบประชุมทางไกล Zoom, ไมโครโฟนไร้สาย 4 ตัว",
  },
  {
    name: "ห้องประชุม Digital War Room",
    floor: "ชั้น 4 ฝ่ายพัฒนาระบบดิจิทัล",
    capacity: 16,
    equipment: "กระดานอัจฉริยะ Smart Board, โปรเจกเตอร์ 4K",
  },
  {
    name: "ห้องประชุมย่อย Executive Pod A",
    floor: "ชั้น 5 สำนักผู้บริหาร",
    capacity: 8,
    equipment: "จอ Smart TV 75 นิ้ว, ระบบ Video Conference",
  },
];

export default function EOfficePage() {
  const {
    isAuthenticated,
    loginAsRole,
    logout,
    currentRole,
    setCurrentRole,
    memos,
    leaves,
    leaveBalance,
    bookings,
    announcements,
    docRunningNumber,
    dbSynced,
    createMemo,
    updateAndResubmitMemo,
    registerDocumentNumber,
    returnMemoForRevision,
    approveMemo,
    rejectMemo,
    createLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    createRoomBooking,
    deleteRoomBooking,
    createAnnouncement,
    resetDemoData,
  } = useEOffice();

  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [selectedMemoId, setSelectedMemoId] = useState<string>(
    memos[0]?.id || "MEMO-001"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showNewMemoModal, setShowNewMemoModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Login screen state
  const [loginUsername, setLoginUsername] = useState("tanapat.s");
  const [loginPassword, setLoginPassword] = useState("••••••••");

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
  const [newAttachmentSize, setNewAttachmentSize] = useState("1.2 MB");
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

  // Create Room Booking form state
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-11-25");
  const [bookingStart, setBookingStart] = useState("10:00");
  const [bookingEnd, setBookingEnd] = useState("12:00");
  const [bookingAttendees, setBookingAttendees] = useState(12);

  // Create Announcement form state
  const [annTitle, setAnnTitle] = useState("");
  const [annCategory, setAnnCategory] = useState<
    "ประกาศสำคัญ" | "นโยบายไอที" | "กิจกรรมองค์กร"
  >("ประกาศสำคัญ");
  const [annContent, setAnnContent] = useState("");

  const activeActor = ACTORS[currentRole];

  const selectedMemo = useMemo(
    () => memos.find((m) => m.id === selectedMemoId) || memos[0],
    [memos, selectedMemoId]
  );

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

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAttachment(file.name);
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    setNewAttachmentSize(
      sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`
    );
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
      attachmentSize: newAttachmentSize,
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

  const handleCreateBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTitle.trim()) return;
    const room = MEETING_ROOMS[selectedRoomIdx];
    createRoomBooking({
      roomName: room.name,
      floor: room.floor,
      capacity: room.capacity,
      title: bookingTitle.trim(),
      date: bookingDate,
      startTime: bookingStart,
      endTime: bookingEnd,
      attendees: Number(bookingAttendees),
      equipment: room.equipment,
    });
    setBookingTitle("");
  };

  const handleCreateAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    createAnnouncement({
      title: annTitle.trim(),
      category: annCategory,
      content: annContent.trim(),
      pinned: annCategory === "ประกาศสำคัญ",
    });
    setAnnTitle("");
    setAnnContent("");
  };

  // =====================================================================
  // FULL ENTERPRISE LOGIN SCREEN (When user clicks Logout / Demo Login)
  // =====================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Branding Panel */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-600 to-blue-800 p-8 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold leading-snug">
                E-Office Enterprise Platform
              </h1>
              <p className="text-xs text-indigo-100 leading-relaxed">
                ระบบสำนักงานอิเล็กทรอนิกส์แบบครบวงจร รองรับงานสารบรรณดิจิทัล
                การออกเลขหนังสือราชการ ลายมือชื่ออิเล็กทรอนิกส์ (e-Signature)
                ระบบลางาน และระบบจองห้องประชุม
              </p>
            </div>

            <div className="space-y-2 pt-6 border-t border-white/20 text-xs text-indigo-100">
              <div className="font-bold text-white">
                Full-Stack Architecture:
              </div>
              <div>• Frontend: Next.js 15 + React + TypeScript + Tailwind</div>
              <div>• Backend API: Next.js REST Route (/api/eoffice)</div>
              <div>• Database: Persistent Server JSON DB + Audit Trail</div>
            </div>
          </div>

          {/* Right Login & 1-Click Role Selection */}
          <div className="md:col-span-7 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                เข้าสู่ระบบสำนักงานอิเล็กทรอนิกส์ (Sign In)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                คลิกเลือกบัญชีด้านล่างเพื่อเข้าสู่ระบบตามบทบาทใน Flow ได้ทันที
              </p>
            </div>

            {/* 1-Click Demo Role Cards */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700">
                คลิกเลือกบทบาทเพื่อเข้าสู่ระบบทันที (1-Click Role Login):
              </div>
              {(["requester", "clerk", "approver"] as Role[]).map((r, idx) => {
                const act = ACTORS[r];
                return (
                  <button
                    key={r}
                    onClick={() => loginAsRole(r)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${act.badgeColor} text-white flex items-center justify-center font-bold text-sm`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                          {act.name} — {act.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          รหัสพนักงาน: {act.empId} • {act.department} (งานค้าง:{" "}
                          {roleInboxCounts[r]} รายการ)
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </button>
                );
              })}
            </div>

            {/* Standard Username / Password Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (loginUsername.includes("pimchanok")) loginAsRole("clerk");
                else if (loginUsername.includes("kittipong"))
                  loginAsRole("approver");
                else loginAsRole("requester");
              }}
              className="pt-4 border-t border-slate-200 space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow"
              >
                เข้าสู่ระบบ (Sign In with Credentials)
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* TOP DEMO CONTROL BAR (Role Switcher for Academic Presentation) */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Cpu className="w-3.5 h-3.5" />
              แถบสลับบทบาทสาธิตอาจารย์ (Role Switcher)
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                dbSynced
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              <Database className="w-3 h-3" />
              {dbSynced
                ? "Backend API & DB: เชื่อมต่อแล้ว (/api/eoffice)"
                : "Local Browser DB Mode"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["requester", "clerk", "approver"] as Role[]).map((roleKey) => {
              const isSelected = currentRole === roleKey;
              const count = roleInboxCounts[roleKey];
              return (
                <button
                  key={roleKey}
                  onClick={() => setCurrentRole(roleKey)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-sm ring-2 ring-indigo-400 font-bold"
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
              title="รีเซ็ตฐานข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-950/70 text-rose-200 border border-rose-800/60 hover:bg-rose-900/80 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset DB</span>
            </button>

            <button
              onClick={logout}
              title="ไปที่หน้า Login เต็มรูปแบบ"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>หน้า Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* HEADER & ACTIVE ACTOR BAR */}
      <header className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  E-Office Enterprise Suite
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  Full-Stack Edition v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ระบบสำนักงานอิเล็กทรอนิกส์ครบวงจร (สารบรรณ e-Saraban • อนุมัติ
                e-Signature • ลางาน e-Leave • จองห้องประชุม e-Booking)
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
                  ผู้ใช้งาน: {activeActor.name} ({activeActor.empId})
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                  {activeActor.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {activeActor.department} • {activeActor.email}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS (6 MODULES) */}
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. แดชบอร์ด & กล่องงาน</span>
            {roleInboxCounts[currentRole] > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-100 text-rose-700 font-bold">
                {roleInboxCounts[currentRole]}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("memos")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "memos"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. สารบรรณ & บันทึกข้อความ (e-Document)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
              {memos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "leaves"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. ระบบลางาน (e-Leave)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
              {leaves.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "bookings"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>4. จองห้องประชุม (e-Booking)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "announcements"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>5. ประกาศ & โครงสร้างองค์กร</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === "architecture"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6. สไลด์สรุป Flow & Stack (นำเสนออาจารย์)</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 print:hidden">
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
                  <span>กล่องงานประจำตำแหน่ง: {activeActor.title}</span>
                </div>
                <h2 className="text-xl font-bold">
                  สวัสดีคุณ{activeActor.name} ({activeActor.department})
                </h2>
                <p className="text-sm text-indigo-100">
                  {activeActor.description}
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
                  <span>เปิดสไลด์ Flow & Stack</span>
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
                  {memos.filter((m) => m.status === "Pending Clerk").length}{" "}
                  เรื่อง
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  เลขทะเบียนถัดไป: บค{" "}
                  {String(docRunningNumber).padStart(3, "0")}/2569
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    รอผู้บริหารลงนามอนุมัติ
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
                    การจองห้องประชุมวันนี้
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {bookings.length} รายการ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ห้องประชุมพร้อมใช้งาน 3 ห้อง
                </p>
              </div>
            </div>

            {/* Active Role Inbox + Announcements */}
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
                          กดสลับบทบาท (Role Switcher) ด้านบนสุดเพื่อดูงานที่รออยู่ในขั้นตอนถัดไปได้ทันที
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
                            {leaveBalance[leave.leaveType].label} (
                            {leave.startDate} ถึง {leave.endDate})
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

              {/* Latest Announcements & Quick Presentation Guide */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        ประกาศองค์กรล่าสุด
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("announcements")}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      ดูทั้งหมด
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {announcements.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                      >
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                          {a.category}
                        </span>
                        <div className="font-bold text-slate-900">
                          {a.title}
                        </div>
                        <p className="text-slate-600 line-clamp-2">
                          {a.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      จุดเด่นตัวเต็มที่ใช้โชว์อาจารย์ได้
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li>
                      • <strong>พิมพ์หนังสือราชการ (PDF):</strong> ในหน้าบันทึกข้อความมีปุ่มออกรายงานกระดาษบันทึกข้อความพร้อมตราประทับดิจิทัล
                    </li>
                    <li>
                      • <strong>อัปโหลดไฟล์แนบจริง:</strong> เลือกไฟล์จากเครื่องเพื่อแนบไปกับบันทึกข้อความได้
                    </li>
                    <li>
                      • <strong>เชื่อม Backend API & DB:</strong> บันทึกข้อมูลผ่าน{" "}
                      <code>/api/eoffice</code> ลงไฟล์ฐานข้อมูลบน Server จริง
                    </li>
                  </ul>
                </div>
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

            {/* Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left List */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    รายการบันทึกข้อความ ({filteredMemos.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    คลิกเลือกเพื่อดู Flow & พิมพ์เอกสาร
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-[720px] overflow-y-auto">
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
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        เส้นทางการเดินเอกสาร (Memo Workflow State Machine)
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${
                            getStatusBadge(selectedMemo.status).className
                          }`}
                        >
                          {getStatusBadge(selectedMemo.status).label}
                        </span>
                        <button
                          onClick={() => setShowPrintModal(true)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>พิมพ์หนังสือราชการ / PDF</span>
                        </button>
                      </div>
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
                          desc: "ลงนาม e-Signature",
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
                              ความเห็นผู้บริหาร / คำสั่งการท้ายบันทึกข้อความ (พร้อมประทับลายมือชื่อ e-Signature)
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
                              <PenTool className="w-4 h-4" />
                              <span>
                                ลงนามอนุมัติอิเล็กทรอนิกส์ (e-Signature Approve)
                              </span>
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
                                  actionComment ||
                                    "ไม่อนุมัติเนื่องจากเกินกรอบงบประมาณ"
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

                    {/* Quick Role Switch Prompt */}
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
                            — คลิกสลับบทบาทเพื่อดำเนินการต่อได้เลย:
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
                  </div>

                  {/* Official Memo Paper Preview with Digital Signature Stamp */}
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
                          <span>
                            ไฟล์แนบ: {selectedMemo.attachmentName}{" "}
                            {selectedMemo.attachmentSize &&
                              `(${selectedMemo.attachmentSize})`}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          ✓ ตรวจสอบไฟล์แนบแล้ว
                        </span>
                      </div>
                    )}

                    {/* Digital e-Signature Stamp Box when Approved */}
                    {selectedMemo.status === "Approved" && (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1 text-xs">
                          <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>
                              ลงนามอนุมัติด้วยลายมือชื่ออิเล็กทรอนิกส์ (Verified Digital
                              e-Signature)
                            </span>
                          </div>
                          <div className="text-slate-700">
                            <strong>คำสั่งการ:</strong> “
                            {selectedMemo.approverCommand ||
                              "อนุมัติให้ดำเนินการตามเสนอ"}
                            ”
                          </div>
                          <div className="text-slate-500">
                            ผู้ลงนาม:{" "}
                            {selectedMemo.signedBy || ACTORS.approver.name} (
                            {ACTORS.approver.title}) • เวลา:{" "}
                            {selectedMemo.signedAt || selectedMemo.updatedAt}
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-xl border-2 border-emerald-600 text-emerald-700 font-bold text-xs uppercase tracking-widest rotate-[-3deg] bg-white shadow-sm">
                          APPROVED • อนุมัติแล้ว
                        </div>
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
                                  {entry.actorName} (
                                  {ACTORS[entry.actorRole].title})
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
                    ใบลาเป็นงานบริหารบุคคล (HR) จึงวิ่งตรงจาก{" "}
                    <strong>พนักงาน (Requester) → หัวหน้างาน (Approver)</strong>{" "}
                    โดยไม่ผ่านสารบรรณ และตัดโควตาวันลาคงเหลืออัตโนมัติในฐานข้อมูลเมื่ออนุมัติ
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
                    <div className="text-2xl font-bold text-slate-900">
                      ใช้ไป {quota.used}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        / {quota.total} วัน
                      </span>
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

              {/* Right: Leave Requests List */}
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
        {/* TAB 4: E-BOOKING (MEETING ROOM RESERVATION)                */}
        {/* ========================================================= */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MEETING_ROOMS.map((room, idx) => (
                <div
                  key={room.name}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      พร้อมใช้งาน (Available)
                    </span>
                    <span className="text-xs text-slate-500">
                      ความจุ {room.capacity} ที่นั่ง
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {room.name}
                  </h4>
                  <p className="text-xs text-slate-500">{room.floor}</p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong>อุปกรณ์ประจำห้อง:</strong> {room.equipment}
                  </p>
                  <button
                    onClick={() => setSelectedRoomIdx(idx)}
                    className="w-full py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
                  >
                    เลือกจองห้องนี้
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Booking Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  จองห้องประชุมออนไลน์ (New Room Reservation)
                </h4>
                <form
                  onSubmit={handleCreateBookingSubmit}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      เลือกห้องประชุม
                    </label>
                    <select
                      value={selectedRoomIdx}
                      onChange={(e) =>
                        setSelectedRoomIdx(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      {MEETING_ROOMS.map((r, i) => (
                        <option key={r.name} value={i}>
                          {r.name} (ความจุ {r.capacity} คน)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หัวข้อการประชุม *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingTitle}
                      onChange={(e) => setBookingTitle(e.target.value)}
                      placeholder="เช่น ประชุมติดตามความคืบหน้าโครงการ E-Office"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        วันที่ใช้ห้อง
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        เวลาเริ่ม
                      </label>
                      <input
                        type="time"
                        value={bookingStart}
                        onChange={(e) => setBookingStart(e.target.value)}
                        className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        เวลาสิ้นสุด
                      </label>
                      <input
                        type="time"
                        value={bookingEnd}
                        onChange={(e) => setBookingEnd(e.target.value)}
                        className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      จำนวนผู้เข้าร่วมประชุม (คน)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={bookingAttendees}
                      onChange={(e) =>
                        setBookingAttendees(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                  >
                    ยืนยันการจองห้องประชุม (Confirm Booking)
                  </button>
                </form>
              </div>

              {/* Right Bookings Schedule */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    ตารางการจองห้องประชุมทั้งหมด ({bookings.length})
                  </h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600">
                            {b.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            ยืนยันแล้ว ({b.status})
                          </span>
                          <span className="text-slate-500">
                            วันที่ {b.date} เวลา {b.startTime} - {b.endTime} น.
                          </span>
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {b.title}
                        </div>
                        <div className="text-slate-600">
                          <strong>สถานที่:</strong> {b.roomName} ({b.floor}) •{" "}
                          <strong>ผู้จอง:</strong> {b.bookedBy} ({b.attendees}{" "}
                          คน)
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRoomBooking(b.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                        title="ยกเลิกการจอง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ANNOUNCEMENTS & ORGANIZATION DIRECTORY              */}
        {/* ========================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            {/* Organization Personnel & Hierarchy Directory */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  ทำเนียบบุคลากรและสายบังคับบัญชาในระบบ (Organization Approval
                  Hierarchy)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["requester", "clerk", "approver"] as Role[]).map(
                  (r, index) => {
                    const act = ACTORS[r];
                    return (
                      <div
                        key={r}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-white font-semibold ${act.badgeColor}`}
                          >
                            ลำดับ Flow ที่ {index + 1}
                          </span>
                          <span className="font-mono text-slate-500">
                            {act.empId}
                          </span>
                        </div>
                        <div className="text-base font-bold text-slate-900">
                          {act.name}
                        </div>
                        <div className="font-semibold text-indigo-700">
                          {act.title}
                        </div>
                        <div className="text-slate-600">
                          สังกัด: {act.department}
                        </div>
                        <div className="text-slate-500">
                          อีเมล: {act.email} • โทร: {act.phone}
                        </div>
                        <p className="text-slate-600 pt-1 border-t border-slate-200">
                          {act.description}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Announcements Feed & Post Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  สร้างประกาศข่าวสารองค์กรใหม่ (Post Announcement)
                </h4>
                <form
                  onSubmit={handleCreateAnnouncementSubmit}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หัวข้อประกาศ *
                    </label>
                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="เช่น แจ้งปิดปรับปรุงระบบเครือข่ายประจำเดือน"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      หมวดหมู่ประกาศ
                    </label>
                    <select
                      value={annCategory}
                      onChange={(e) =>
                        setAnnCategory(
                          e.target.value as
                            | "ประกาศสำคัญ"
                            | "นโยบายไอที"
                            | "กิจกรรมองค์กร"
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    >
                      <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                      <option value="นโยบายไอที">นโยบายไอที</option>
                      <option value="กิจกรรมองค์กร">กิจกรรมองค์กร</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รายละเอียดประกาศ *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="ระบุรายละเอียดประชาสัมพันธ์..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    เผยแพร่ประกาศองค์กร
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <h4 className="font-bold text-sm text-slate-900">
                  กระดานข่าวสารและประกาศทั้งหมด ({announcements.length})
                </h4>
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                          {a.category}
                        </span>
                        <span className="text-slate-500">
                          โดย {a.authorName} • {a.postedAt}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {a.title}
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {a.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: FLOW & STACK ARCHITECTURE (PRESENTATION SLIDES)     */}
        {/* ========================================================= */}
        {activeTab === "architecture" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    สไลด์สรุปสถาปัตยกรรม Flow & Stack ของระบบ E-Office (สำหรับนำเสนออาจารย์)
                  </h2>
                  <p className="text-xs text-slate-500">
                    เปิดหน้านี้ขึ้นจอโปรเจกเตอร์เพื่ออธิบายอาจารย์ได้เลย ครอบคลุมทั้ง Business Workflow State Machine และ Full-Stack Architecture
                  </p>
                </div>
              </div>

              {/* PART 1: FLOW */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-600" />
                  <span>
                    1. การออกแบบ FLOW (Workflow Routing & State Machine)
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-indigo-700 uppercase">
                      Flow ที่ 1: ระบบสารบรรณและบันทึกข้อความ (3-Role Sequential
                      Routing)
                    </div>
                    <p className="text-xs text-slate-600">
                      เอกสารทางการต้องผ่านการตรวจสอบรูปแบบและออกเลขทะเบียนหนังสือราชการก่อนเสนอผู้บริหารลงนาม:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>ขั้นที่ 1 (Draft → Pending Clerk):</strong>{" "}
                        พนักงาน (<code>Requester</code>) ร่างบันทึกข้อความ
                        แนบไฟล์ และกดส่งเข้าห้องสารบรรณ
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>
                          ขั้นที่ 2 (Pending Clerk → Pending Approval):
                        </strong>{" "}
                        เจ้าหน้าที่สารบรรณ (<code>Clerk</code>) ตรวจรูปแบบและออก{" "}
                        <code>Document Number (บค xxx/2569)</code>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>
                          ขั้นที่ 3 (Returned for Revision Loop):
                        </strong>{" "}
                        หากเอกสารไม่สมบูรณ์ สารบรรณหรือผู้บริหารตีกลับให้แก้ไขในเรื่องเดิมได้
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>ขั้นที่ 4 (Approved + e-Signature):</strong>{" "}
                        ผู้อำนวยการฝ่าย (<code>Approver</code>) ลงนามอนุมัติพร้อมตราประทับดิจิทัลและพิมพ์เป็น PDF
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-emerald-700 uppercase">
                      Flow ที่ 2: ระบบลางาน e-Leave & ระบบจองห้องประชุม e-Booking
                    </div>
                    <p className="text-xs text-slate-600">
                      แยกเส้นทางเดินงานตามธรรมชาติของธุรกรรมในองค์กร:
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>e-Leave (2-Role Direct Flow):</strong> วิ่งตรงจาก{" "}
                        <code>Requester → Approver</code> โดยข้ามสารบรรณ
                        เมื่ออนุมัติแล้วระบบหักโควตา <code>Leave Balance</code>{" "}
                        อัตโนมัติ
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>e-Booking (Resource Allocation Flow):</strong>{" "}
                        ตรวจสอบความจุและช่วงเวลาห้องประชุม พร้อมยืนยันตารางใช้งานทันที
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <strong>Audit Trail (Immutable Log):</strong>{" "}
                        ทุกการกระทำในทุก Flow จะบันทึกชื่อผู้กระทำ ตำแหน่ง เวลา
                        และหมายเหตุไว้ตรวจสอบย้อนหลังเสมอ
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
                    2. การออกแบบ STACK (สถาปัตยกรรมเทคโนโลยีที่ใช้ในระบบนี้)
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="p-3 font-bold">Layer (ชั้นของระบบ)</th>
                        <th className="p-3 font-bold text-indigo-700">
                          เทคโนโลยีที่ใช้จริงในโปรเจกต์นี้
                        </th>
                        <th className="p-3 font-bold text-emerald-700">
                          เมื่อขยายสเกลสู่ระดับ Enterprise Cloud
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3 font-semibold">
                          Presentation Layer (Frontend)
                        </td>
                        <td className="p-3">
                          Next.js 15 (App Router) + React 19 + TypeScript +
                          Tailwind CSS + Lucide Icons
                        </td>
                        <td className="p-3">
                          Next.js + Tailwind CSS + shadcn/ui
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Application & API Layer (Backend)
                        </td>
                        <td className="p-3">
                          Next.js REST API Route Handler (
                          <code>GET / POST /api/eoffice</code>) + State Machine
                          Context
                        </td>
                        <td className="p-3">
                          Node.js / NestJS หรือ Next.js Server Actions +
                          Workflow Engine
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Data & Persistence Layer (Database)
                        </td>
                        <td className="p-3">
                          Server-Side JSON File DB (
                          <code>data/eoffice-db.json</code>) +{" "}
                          <code>localStorage</code> Fallback
                        </td>
                        <td className="p-3">
                          PostgreSQL (Prisma ORM) + AWS S3 / MinIO (เก็บไฟล์ PDF)
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">
                          Security & Role Management
                        </td>
                        <td className="p-3">
                          Role-Based Access Control (RBAC) + หน้า Login + Instant
                          Role Switcher
                        </td>
                        <td className="p-3">
                          Keycloak / Azure AD (SSO) + PKI Digital Signature
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
      {/* MODAL: OFFICIAL THAI GOVERNMENT/ENTERPRISE MEMO PRINT PDF  */}
      {/* ========================================================= */}
      {showPrintModal && selectedMemo && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>
                  ตัวอย่างเอกสารหนังสือราชการ/บันทึกข้อความสำหรับพิมพ์หรือบันทึกเป็น PDF
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
                >
                  สั่งพิมพ์ / Save as PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>

            {/* Printable A4-style Official Memo Sheet */}
            <div className="p-10 space-y-6 text-slate-900 bg-white">
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-slate-900 flex items-center justify-center font-bold text-lg">
                    ตราสัญลักษณ์
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      บันทึกข้อความ
                    </h2>
                    <p className="text-xs text-slate-600">
                      ระบบสารบรรณอิเล็กทรอนิกส์ (E-Office Official Memorandum)
                    </p>
                  </div>
                </div>
                <div className="border border-slate-400 rounded-lg px-3 py-2 text-xs text-right">
                  <div>
                    <strong>เลขทะเบียนรับสารบรรณ:</strong>{" "}
                    {selectedMemo.documentNumber || "อยู่ระหว่างรอออกเลข"}
                  </div>
                  <div>
                    <strong>ชั้นความเร็ว:</strong> {selectedMemo.urgency}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div>
                  <strong>ส่วนงาน / แผนก:</strong> {selectedMemo.department} (โทร.{" "}
                  {ACTORS.requester.phone})
                </div>
                <div className="flex justify-between">
                  <span>
                    <strong>ที่:</strong>{" "}
                    {selectedMemo.documentNumber || selectedMemo.id}
                  </span>
                  <span>
                    <strong>วันที่:</strong> {selectedMemo.createdAt}
                  </span>
                </div>
                <div>
                  <strong>เรื่อง:</strong> {selectedMemo.subject}
                </div>
                <div>
                  <strong>เรียน:</strong> {selectedMemo.to}
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-line pt-2 min-h-[140px]">
                {selectedMemo.content}
              </div>

              {selectedMemo.budgetAmount !== undefined && (
                <div className="text-sm font-semibold">
                  วงเงินงบประมาณที่ขออนุมัติ:{" "}
                  {selectedMemo.budgetAmount.toLocaleString()} บาท
                </div>
              )}

              {/* Signatures & Official Stamp Grid */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-300 text-xs">
                <div className="text-center space-y-2 p-4 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-700">ผู้เสนอเรื่อง</div>
                  <div className="italic font-semibold text-base text-indigo-900 py-1">
                    {selectedMemo.requesterName}
                  </div>
                  <div>({selectedMemo.requesterName})</div>
                  <div className="text-slate-500">{ACTORS.requester.title}</div>
                </div>

                <div className="text-center space-y-2 p-4 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-700">
                    คำสั่งการ / ผลการพิจารณาของผู้บริหาร
                  </div>
                  {selectedMemo.status === "Approved" ? (
                    <>
                      <div className="inline-block px-3 py-1 rounded border-2 border-emerald-700 text-emerald-800 font-bold">
                        ✓ อนุมัติ (APPROVED)
                      </div>
                      <div className="text-slate-700">
                        “
                        {selectedMemo.approverCommand ||
                          "อนุมัติให้ดำเนินการตามเสนอ"}
                        ”
                      </div>
                      <div className="italic font-semibold text-base text-emerald-900">
                        {selectedMemo.signedBy || ACTORS.approver.name}
                      </div>
                      <div>
                        ({selectedMemo.signedBy || ACTORS.approver.name})
                      </div>
                      <div className="text-slate-500">
                        {ACTORS.approver.title} • {selectedMemo.signedAt}
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-slate-400">
                      (อยู่ระหว่างขั้นตอน:{" "}
                      {getStatusBadge(selectedMemo.status).label})
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW MEMO WITH REAL FILE ATTACHMENT PICKER   */}
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
                  ผู้ยื่นเรื่อง: {ACTORS.requester.name} (
                  {ACTORS.requester.department})
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
                    อัปโหลดไฟล์แนบจากเครื่อง (PDF / รูปภาพ)
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 text-xs text-indigo-700 cursor-pointer hover:bg-indigo-50">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {newAttachment} ({newAttachmentSize})
                    </span>
                    <input
                      type="file"
                      onChange={handleFileUploadChange}
                      className="hidden"
                    />
                  </label>
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
