"use client";

import React, { useMemo, useState } from "react";
import { useEOffice } from "@/context/EOfficeContext";
import { ACTORS } from "@/data/seed";
import {
  AnnouncementCategory,
  LeaveType,
  Memo,
  MemoStatus,
  Role,
  UrgencyLevel,
} from "@/types/eoffice";
import { OfficialPrintModal } from "@/components/OfficialPrintModal";
import { NewMemoModal } from "@/components/NewMemoModal";
import { ArchitectureView } from "@/components/ArchitectureView";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  DoorOpen,
  FilePlus2,
  FileText,
  GitBranch,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Paperclip,
  PenTool,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Stamp,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

type ActiveTab =
  | "dashboard"
  | "memos"
  | "leaves"
  | "bookings"
  | "announcements"
  | "architecture";

interface ActionToast {
  message: string;
  nextRole?: Role;
  nextRoleLabel?: string;
}

function getStatusBadge(status: MemoStatus | string) {
  switch (status) {
    case "Draft":
      return {
        label: "ฉบับร่าง (Draft)",
        dot: "bg-slate-400",
        className: "bg-slate-100 text-slate-700 border-slate-300",
      };
    case "Pending Clerk":
      return {
        label: "รอสารบรรณออกเลข",
        dot: "bg-amber-500",
        className: "bg-amber-50 text-amber-800 border-amber-300",
      };
    case "Pending Approval":
      return {
        label: "รอผู้บริหารอนุมัติ",
        dot: "bg-blue-500",
        className: "bg-blue-50 text-blue-800 border-blue-300",
      };
    case "Returned for Revision":
      return {
        label: "ส่งกลับแก้ไข",
        dot: "bg-orange-500",
        className: "bg-orange-50 text-orange-800 border-orange-300",
      };
    case "Approved":
      return {
        label: "อนุมัติแล้ว",
        dot: "bg-emerald-500",
        className: "bg-emerald-50 text-emerald-800 border-emerald-300",
      };
    case "Rejected":
      return {
        label: "ไม่อนุมัติ",
        dot: "bg-rose-500",
        className: "bg-rose-50 text-rose-800 border-rose-300",
      };
    default:
      return {
        label: status,
        dot: "bg-slate-400",
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNewMemoModal, setShowNewMemoModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [toast, setToast] = useState<ActionToast | null>(null);

  // Login screen state
  const [loginUsername, setLoginUsername] = useState("tanapat.s");
  const [loginPassword, setLoginPassword] = useState("••••••••");

  // Action input states for selected Memo
  const [customDocumentNumber, setCustomDocumentNumber] = useState("");
  const [actionComment, setActionComment] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEditingMemo, setIsEditingMemo] = useState(false);

  // Create Leave form state
  const [leaveType, setLeaveType] = useState<LeaveType>("vacation");
  const [leaveStart, setLeaveStart] = useState("2026-12-01");
  const [leaveEnd, setLeaveEnd] = useState("2026-12-02");
  const [leaveDays, setLeaveDays] = useState(2);
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveError, setLeaveError] = useState<string | null>(null);
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
  const [annCategory, setAnnCategory] =
    useState<AnnouncementCategory>("ประกาศสำคัญ");
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
    return [];
  }, [leaves, currentRole]);

  const filteredMemos = useMemo(() => {
    return memos.filter((m) => {
      const matchStatus =
        statusFilter === "ALL" || m.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        m.subject.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m.documentNumber && m.documentNumber.toLowerCase().includes(q)) ||
        m.category.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [memos, statusFilter, searchQuery]);

  const triggerToast = (
    message: string,
    nextRole?: Role,
    nextRoleLabel?: string
  ) => {
    setToast({ message, nextRole, nextRoleLabel });
  };

  const handleOpenMemoDetail = (memo: Memo) => {
    setSelectedMemoId(memo.id);
    setEditSubject(memo.subject);
    setEditContent(memo.content);
    setIsEditingMemo(false);
    setActionComment("");
    setCustomDocumentNumber("");
    setActiveTab("memos");
  };

  const handleCreateLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim() || leaveDays <= 0) return;
    setLeaveError(null);
    const result = createLeaveRequest({
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      days: Number(leaveDays),
      reason: leaveReason.trim(),
    });
    if (!result.ok) {
      setLeaveError(result.error || "ไม่สามารถยื่นใบลาได้");
      return;
    }
    setLeaveReason("");
    triggerToast(
      `ยื่นใบลาจำนวน ${leaveDays} วันสำเร็จ! ส่งตรงถึงผู้อำนวยการฝ่ายแล้ว`,
      "approver",
      "สลับเป็น ผู้อำนวยการ (Approver) เพื่อกดอนุมัติใบลา"
    );
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
    triggerToast(`จอง ${room.name} วันที่ ${bookingDate} สำเร็จ!`);
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
    triggerToast("เผยแพร่ประกาศข่าวสารองค์กรเรียบร้อยแล้ว!");
  };

  // =====================================================================
  // FULL ENTERPRISE LOGIN SCREEN
  // =====================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-600 to-blue-800 p-8 text-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold leading-snug">
                E-Office Enterprise Suite
              </h1>
              <p className="text-xs text-indigo-100 leading-relaxed">
                ระบบสำนักงานอิเล็กทรอนิกส์แบบไร้กระดาษ (Paperless Office)
                รองรับงานสารบรรณดิจิทัล การออกเลขหนังสือราชการ
                ลายมือชื่ออิเล็กทรอนิกส์ (e-Signature) ระบบลางาน
                และระบบจองห้องประชุม
              </p>
            </div>

            <div className="space-y-2 pt-6 border-t border-white/20 text-xs text-indigo-100">
              <div className="font-bold text-white">Full-Stack Architecture</div>
              <div>• Next.js 15 + React 19 + TypeScript + Tailwind</div>
              <div>• REST API (/api/eoffice) + Persistent DB</div>
            </div>
          </div>

          <div className="md:col-span-7 p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                เข้าสู่ระบบสำนักงานอิเล็กทรอนิกส์
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                คลิกเลือกบทบาทด้านล่างเพื่อเข้าสู่ระบบและทดสอบ Flow ได้ในคลิกเดียว
              </p>
            </div>

            <div className="space-y-2.5">
              {(["requester", "clerk", "approver"] as Role[]).map((r, idx) => {
                const act = ACTORS[r];
                return (
                  <button
                    key={r}
                    onClick={() => loginAsRole(r)}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl ${act.badgeColor} text-white flex items-center justify-center font-bold text-base shadow-sm`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                          {act.name}
                        </div>
                        <div className="text-xs font-medium text-indigo-600">
                          {act.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {act.department} • งานรอดำเนินการ:{" "}
                          <strong className="text-rose-600">
                            {roleInboxCounts[r]} รายการ
                          </strong>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </button>
                );
              })}
            </div>

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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow"
              >
                เข้าสู่ระบบด้วยรหัสพนักงาน
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const navItems: {
    id: ActiveTab;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: number;
    badgeHighlight?: boolean;
  }[] = [
    {
      id: "dashboard",
      label: "แดชบอร์ด & กล่องงาน",
      sublabel: "ภาพรวมและงานด่วน",
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: roleInboxCounts[currentRole],
      badgeHighlight: roleInboxCounts[currentRole] > 0,
    },
    {
      id: "memos",
      label: "สารบรรณ & บันทึกข้อความ",
      sublabel: "ออกเลข • อนุมัติ • พิมพ์ PDF",
      icon: <FileText className="w-5 h-5" />,
      badge: memos.length,
    },
    {
      id: "leaves",
      label: "ระบบลางานออนไลน์",
      sublabel: "ยื่นใบลา • เช็คสิทธิ์คงเหลือ",
      icon: <Calendar className="w-5 h-5" />,
      badge: leaves.length,
    },
    {
      id: "bookings",
      label: "จองห้องประชุม",
      sublabel: "ตารางห้องประชุมองค์กร",
      icon: <DoorOpen className="w-5 h-5" />,
      badge: bookings.length,
    },
    {
      id: "announcements",
      label: "ประกาศ & บุคลากร",
      sublabel: "ข่าวสารและสายบังคับบัญชา",
      icon: <Megaphone className="w-5 h-5" />,
    },
    {
      id: "architecture",
      label: "สรุป Flow & Stack",
      sublabel: "สไลด์สำหรับนำเสนออาจารย์",
      icon: <Layers className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100/80 text-slate-900">
      {/* =============================================================== */}
      {/* LEFT SIDEBAR NAVIGATION (Modern SaaS Dashboard Layout)          */}
      {/* =============================================================== */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto print:hidden shadow-xl">
        <div className="p-5 space-y-6">
          {/* App Brand */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">
                  E-Office
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                ระบบสำนักงานอิเล็กทรอนิกส์
              </p>
            </div>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={() => {
              setCurrentRole("requester");
              setShowNewMemoModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-indigo-950/50 transition"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>+ สร้างบันทึกข้อความใหม่</span>
          </button>

          {/* Menu Links */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              เมนูหลักของระบบ (Modules)
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isActive ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.badgeHighlight
                          ? "bg-rose-500 text-white"
                          : isActive
                          ? "bg-indigo-800 text-indigo-100"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Active User Card & Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${activeActor.badgeColor} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow`}
            >
              {activeActor.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {activeActor.name}
              </div>
              <div className="text-[11px] text-indigo-300 truncate">
                {activeActor.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {activeActor.department}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={resetDemoData}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/50 text-[11px] font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตข้อมูล</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>หน้า Login</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =============================================================== */}
      {/* RIGHT MAIN WORKSPACE                                            */}
      {/* =============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP GUIDED 1-2-3 WORKFLOW ROLE SWITCHER BAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm print:hidden">
          <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5" />
                สลับมุมมองตามลำดับ Flow (1 → 2 → 3)
              </span>
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                  dbSynced
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Database className="w-3 h-3" />
                {dbSynced ? "Server DB ซิงก์แล้ว" : "Browser Storage"}
              </span>
            </div>

            {/* Visual 1 -> 2 -> 3 Step Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  {
                    role: "requester" as Role,
                    step: "1",
                    label: "พนักงานยื่นเรื่อง",
                    activeCls:
                      "bg-blue-600 text-white ring-2 ring-blue-300 shadow-sm",
                  },
                  {
                    role: "clerk" as Role,
                    step: "2",
                    label: "สารบรรณออกเลข",
                    activeCls:
                      "bg-amber-600 text-white ring-2 ring-amber-300 shadow-sm",
                  },
                  {
                    role: "approver" as Role,
                    step: "3",
                    label: "ผู้อำนวยการอนุมัติ",
                    activeCls:
                      "bg-emerald-600 text-white ring-2 ring-emerald-300 shadow-sm",
                  },
                ] as const
              ).map((item, idx) => {
                const isSelected = currentRole === item.role;
                const count = roleInboxCounts[item.role];
                return (
                  <React.Fragment key={item.role}>
                    <button
                      onClick={() => setCurrentRole(item.role)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? item.activeCls
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                          isSelected
                            ? "bg-white/25 text-white"
                            : "bg-white text-slate-700"
                        }`}
                      >
                        {item.step}
                      </span>
                      <span>{item.label}</span>
                      {count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSelected
                              ? "bg-white text-slate-900"
                              : "bg-rose-500 text-white"
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                    {idx < 2 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* FLOATING ACTION TOAST BANNER WITH 1-CLICK NEXT ROLE SWITCH */}
          {toast && (
            <div className="bg-emerald-900 text-white px-6 py-2.5 border-t border-emerald-700 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{toast.message}</span>
              </div>
              <div className="flex items-center gap-2">
                {toast.nextRole && (
                  <button
                    onClick={() => {
                      setCurrentRole(toast.nextRole!);
                      setToast(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-50 transition shadow-sm"
                  >
                    <span>{toast.nextRoleLabel || "ไปขั้นตอนถัดไป"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setToast(null)}
                  className="p-1 text-emerald-200 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* PAGE BODY */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6">
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD & INBOX                                   */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Role Welcome Banner */}
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-3xl p-7 text-white shadow-md flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>มุมมองปัจจุบัน: {activeActor.title}</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    สวัสดีคุณ{activeActor.name}
                  </h2>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    {activeActor.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentRole("requester");
                      setShowNewMemoModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-bold text-xs shadow-md hover:bg-indigo-50 transition"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>สร้างบันทึกข้อความใหม่</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("architecture")}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 text-white border border-white/25 font-semibold text-xs hover:bg-white/25 transition"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>เปิดสไลด์ Flow & Stack</span>
                  </button>
                </div>
              </div>

              {/* 4 Clean KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      งานในกล่องงานของคุณ
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Inbox className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {roleInboxCounts[currentRole]}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      รายการ
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    รอดำเนินการโดย {activeActor.name}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      รอสารบรรณออกเลข
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Stamp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {memos.filter((m) => m.status === "Pending Clerk").length}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      เรื่อง
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    เลขถัดไป: บค {String(docRunningNumber).padStart(3, "0")}
                    /2569
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      รอผู้บริหารอนุมัติ
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {memos.filter((m) => m.status === "Pending Approval")
                      .length +
                      leaves.filter((l) => l.status === "Pending Approval")
                        .length}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      รายการ
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    บันทึกข้อความและใบลาพนักงาน
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      อนุมัติเสร็จสมบูรณ์
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {memos.filter((m) => m.status === "Approved").length +
                      leaves.filter((l) => l.status === "Approved").length}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      รายการ
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ลงนาม e-Signature เรียบร้อย
                  </p>
                </div>
              </div>

              {/* Actionable Inbox Queue + Step-by-Step Guide */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          งานที่รอคุณดำเนินการตอนนี้ (Active Role Inbox)
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          แสดงเฉพาะรายการที่อยู่ในขั้นตอนของ {activeActor.title}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                      {roleInboxMemos.length + roleInboxLeaves.length} งาน
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {roleInboxMemos.length === 0 &&
                      roleInboxLeaves.length === 0 && (
                        <div className="p-10 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-800">
                              ไม่มีงานค้างในบทบาท {activeActor.title}
                            </p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                              คุณสามารถคลิกปุ่มสลับมุมมอง{" "}
                              <strong>1 → 2 → 3</strong> ด้านบนขวา
                              เพื่อไปตรวจหรืออนุมัติงานในขั้นตอนถัดไปได้ทันที
                            </p>
                          </div>
                        </div>
                      )}

                    {roleInboxMemos.map((memo) => {
                      const badge = getStatusBadge(memo.status);
                      return (
                        <div
                          key={memo.id}
                          className="p-5 hover:bg-slate-50/80 transition flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                {memo.documentNumber || memo.id}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.className}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                                />
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
                            <p className="font-bold text-sm text-slate-900">
                              {memo.subject}
                            </p>
                            <p className="text-xs text-slate-500">
                              ผู้ยื่น: {memo.requesterName} ({memo.department})
                              • อัปเดต {memo.updatedAt}
                            </p>
                            {memo.revisionNote && (
                              <div className="text-xs text-orange-800 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 mt-1">
                                <strong>สิ่งที่ต้องแก้ไข:</strong>{" "}
                                {memo.revisionNote}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenMemoDetail(memo)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                          >
                            <span>
                              {currentRole === "clerk"
                                ? "ออกเลขทะเบียนหนังสือ"
                                : currentRole === "approver"
                                ? "พิจารณาลงนามอนุมัติ"
                                : "แก้ไข & ส่งเรื่องใหม่"}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {roleInboxLeaves.map((leave) => {
                      const badge = getStatusBadge(leave.status);
                      return (
                        <div
                          key={leave.id}
                          className="p-5 hover:bg-slate-50/80 transition flex flex-wrap items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                {leave.id}
                              </span>
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                                ใบลาออนไลน์ ({leave.days} วัน)
                              </span>
                            </div>
                            <p className="font-bold text-sm text-slate-900">
                              {leaveBalance[leave.leaveType].label} (
                              {leave.startDate} ถึง {leave.endDate})
                            </p>
                            <p className="text-xs text-slate-500">
                              ผู้ยื่น: {leave.requesterName} • เหตุผล:{" "}
                              {leave.reason}
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveTab("leaves")}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                          >
                            <span>อนุมัติใบลา</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Guided 3-Step Demo Cheat Sheet */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                      💡
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        วิธีสาธิต Flow ง่ายๆ ใน 3 คลิก
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        ทำตามลำดับ 1 → 2 → 3 ด้านบนได้เลย
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div
                      onClick={() => setCurrentRole("requester")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        currentRole === "requester"
                          ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold text-blue-900">
                        1. พนักงานยื่นเรื่อง (Requester)
                      </div>
                      <p className="text-slate-600 mt-1">
                        กดสร้างบันทึกข้อความใหม่ หรือส่งงานที่แก้ไขแล้วเข้าห้องสารบรรณ
                      </p>
                    </div>

                    <div
                      onClick={() => setCurrentRole("clerk")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        currentRole === "clerk"
                          ? "bg-amber-50 border-amber-300 ring-2 ring-amber-100"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold text-amber-900">
                        2. สารบรรณออกเลข (Clerk)
                      </div>
                      <p className="text-slate-600 mt-1">
                        ตรวจรูปแบบและกดออกเลขทะเบียนหนังสือราชการ{" "}
                        <code>บค xxx/2569</code>
                      </p>
                    </div>

                    <div
                      onClick={() => setCurrentRole("approver")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                        currentRole === "approver"
                          ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="font-bold text-emerald-900">
                        3. ผู้อำนวยการอนุมัติ (Approver)
                      </div>
                      <p className="text-slate-600 mt-1">
                        กดลงนาม <code>e-Signature</code> แล้วกดปุ่ม{" "}
                        <strong>พิมพ์หนังสือราชการ / PDF</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: E-DOCUMENT / MEMO WORKFLOW                          */}
          {/* ========================================================= */}
          {activeTab === "memos" && (
            <div className="space-y-5">
              {/* Search & Status Filter Bar */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: "ALL", label: "ทั้งหมด" },
                    { key: "Pending Clerk", label: "รอสารบรรณออกเลข" },
                    { key: "Pending Approval", label: "รอผู้บริหารอนุมัติ" },
                    { key: "Returned for Revision", label: "ส่งกลับแก้ไข" },
                    { key: "Approved", label: "อนุมัติแล้ว" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        statusFilter === f.key
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 flex-1 sm:flex-initial justify-end">
                  <div className="relative min-w-[210px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาเลขที่หนังสือ / ชื่อเรื่อง..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowNewMemoModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm shrink-0"
                  >
                    <FilePlus2 className="w-4 h-4" />
                    <span>สร้างบันทึกใหม่</span>
                  </button>
                </div>
              </div>

              {/* Master-Detail Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Master List */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      รายการหนังสือบันทึกข้อความ ({filteredMemos.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      คลิกเพื่อเปิดดูรายละเอียด
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
                    {filteredMemos.map((m) => {
                      const badge = getStatusBadge(m.status);
                      const isSelected = selectedMemo?.id === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleOpenMemoDetail(m)}
                          className={`w-full text-left p-4 transition-all block ${
                            isSelected
                              ? "bg-indigo-50/80 border-l-4 border-l-indigo-600"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700">
                              {m.documentNumber || m.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${badge.className}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                              />
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">
                            {m.subject}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                            <span>
                              {m.category} • {m.requesterName}
                            </span>
                            <span>{m.updatedAt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Detail Panel */}
                {selectedMemo && (
                  <div className="lg:col-span-7 space-y-4">
                    {/* 4-Step Visual Progress Tracker */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            สถานะการเดินเอกสาร (Workflow Progress)
                          </span>
                          <p className="text-[11px] text-slate-500">
                            รหัสอ้างอิง: {selectedMemo.id}{" "}
                            {selectedMemo.documentNumber &&
                              `• เลขทะเบียน: ${selectedMemo.documentNumber}`}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowPrintModal(true)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>พิมพ์หนังสือราชการ / PDF</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          {
                            step: 1,
                            title: "1. ยื่นเรื่อง",
                            desc: "พนักงาน (Requester)",
                            active:
                              selectedMemo.status === "Draft" ||
                              selectedMemo.status === "Returned for Revision",
                            done:
                              selectedMemo.status !== "Draft" &&
                              selectedMemo.status !== "Returned for Revision",
                          },
                          {
                            step: 2,
                            title: "2. ออกเลขหนังสือ",
                            desc:
                              selectedMemo.documentNumber ||
                              "สารบรรณ (Clerk)",
                            active: selectedMemo.status === "Pending Clerk",
                            done:
                              selectedMemo.status === "Pending Approval" ||
                              selectedMemo.status === "Approved" ||
                              selectedMemo.status === "Rejected",
                          },
                          {
                            step: 3,
                            title: "3. พิจารณาลงนาม",
                            desc: "ผู้อำนวยการ (Approver)",
                            active: selectedMemo.status === "Pending Approval",
                            done:
                              selectedMemo.status === "Approved" ||
                              selectedMemo.status === "Rejected",
                          },
                          {
                            step: 4,
                            title: "4. เสร็จสมบูรณ์",
                            desc:
                              selectedMemo.status === "Rejected"
                                ? "ไม่อนุมัติ"
                                : "e-Signature",
                            active: false,
                            done:
                              selectedMemo.status === "Approved" ||
                              selectedMemo.status === "Rejected",
                          },
                        ].map((s) => (
                          <div
                            key={s.step}
                            className={`p-3 rounded-2xl border text-xs transition ${
                              s.active
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                : s.done
                                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                            }`}
                          >
                            <div className="font-bold">{s.title}</div>
                            <div
                              className={`text-[11px] mt-0.5 truncate ${
                                s.active ? "text-indigo-100" : "opacity-80"
                              }`}
                            >
                              {s.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Smart Role Action Box */}
                    <div className="bg-white rounded-3xl border-2 border-indigo-200 shadow-sm p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-sm text-slate-900">
                            การดำเนินการในขั้นตอนนี้ ({activeActor.title})
                          </h4>
                        </div>
                      </div>

                      {/* Clerk Actions */}
                      {currentRole === "clerk" &&
                        selectedMemo.status === "Pending Clerk" && (
                          <div className="space-y-3 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  เลขทะเบียนหนังสือราชการ (เว้นว่างเพื่อรันอัตโนมัติ)
                                </label>
                                <input
                                  type="text"
                                  value={customDocumentNumber}
                                  onChange={(e) =>
                                    setCustomDocumentNumber(e.target.value)
                                  }
                                  placeholder={`ค่าอัตโนมัติ: บค ${String(
                                    docRunningNumber
                                  ).padStart(3, "0")}/2569`}
                                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                  บันทึกความเห็นสารบรรณ / เหตุผลที่ตีกลับ
                                </label>
                                <input
                                  type="text"
                                  value={actionComment}
                                  onChange={(e) =>
                                    setActionComment(e.target.value)
                                  }
                                  placeholder="เช่น เอกสารครบถ้วนถูกต้องตามระเบียบ"
                                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() => {
                                  const assigned =
                                    customDocumentNumber.trim() ||
                                    `บค ${String(docRunningNumber).padStart(
                                      3,
                                      "0"
                                    )}/2569`;
                                  registerDocumentNumber(
                                    selectedMemo.id,
                                    customDocumentNumber,
                                    actionComment
                                  );
                                  setCustomDocumentNumber("");
                                  setActionComment("");
                                  triggerToast(
                                    `ออกเลขทะเบียน ${assigned} สำเร็จ! ส่งเรื่องต่อให้ผู้อำนวยการฝ่ายแล้ว`,
                                    "approver",
                                    "คลิกเพื่อสลับเป็น 3. ผู้อำนวยการ (Approver) ทันที"
                                  );
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow-sm"
                              >
                                <Stamp className="w-4 h-4" />
                                <span>
                                  ออกเลขทะเบียนหนังสือ & ส่งต่อผู้อำนวยการ
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
                                  triggerToast(
                                    "ตีกลับเอกสารให้พนักงานผู้ยื่นแก้ไขแล้ว",
                                    "requester",
                                    "สลับไปมุมมอง 1. พนักงานผู้ยื่นเรื่อง"
                                  );
                                }}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-orange-100 text-orange-800 border border-orange-300 text-xs font-bold hover:bg-orange-200 transition"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>ส่งกลับให้แก้ไข (Return)</span>
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Approver Actions */}
                      {currentRole === "approver" &&
                        selectedMemo.status === "Pending Approval" && (
                          <div className="space-y-3 pt-1">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                คำสั่งการผู้บริหารท้ายบันทึกข้อความ (พร้อมประทับ
                                e-Signature)
                              </label>
                              <input
                                type="text"
                                value={actionComment}
                                onChange={(e) =>
                                  setActionComment(e.target.value)
                                }
                                placeholder="เช่น อนุมัติให้ดำเนินการตามเสนอ"
                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() => {
                                  approveMemo(selectedMemo.id, actionComment);
                                  setActionComment("");
                                  triggerToast(
                                    "ลงนามอนุมัติด้วยลายมือชื่ออิเล็กทรอนิกส์ (e-Signature) เสร็จสมบูรณ์! สามารถกดพิมพ์หนังสือราชการ PDF ได้เลย"
                                  );
                                }}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
                              >
                                <PenTool className="w-4 h-4" />
                                <span>
                                  ลงนามอนุมัติ (e-Signature Approve)
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
                                  triggerToast(
                                    "ส่งกลับให้พนักงานแก้ไขเรียบร้อยแล้ว",
                                    "requester",
                                    "สลับเป็น 1. พนักงานผู้ยื่นเรื่อง"
                                  );
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-orange-100 text-orange-800 border border-orange-300 text-xs font-bold hover:bg-orange-200 transition"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>ส่งกลับแก้ไข</span>
                              </button>

                              <button
                                onClick={() => {
                                  rejectMemo(
                                    selectedMemo.id,
                                    actionComment ||
                                      "ไม่อนุมัติเนื่องจากเกินกรอบงบประมาณ"
                                  );
                                  setActionComment("");
                                  triggerToast("บันทึกผลการไม่อนุมัติเรียบร้อยแล้ว");
                                }}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold hover:bg-rose-200 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>ไม่อนุมัติ (Reject)</span>
                              </button>
                            </div>
                          </div>
                        )}

                      {/* Requester Actions */}
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
                                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition"
                                >
                                  แก้ไขข้อความในเอกสาร
                                </button>
                                <button
                                  onClick={() => {
                                    updateAndResubmitMemo(
                                      selectedMemo.id,
                                      selectedMemo.subject,
                                      selectedMemo.content,
                                      "ส่งเรื่องให้สารบรรณตรวจสอบ"
                                    );
                                    triggerToast(
                                      "ส่งบันทึกข้อความเข้าห้องสารบรรณแล้ว!",
                                      "clerk",
                                      "คลิกเพื่อสลับเป็น 2. สารบรรณ (Clerk) ทันที"
                                    );
                                  }}
                                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>ส่งเรื่องให้สารบรรณตรวจสอบทันที</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    หัวข้อเรื่อง
                                  </label>
                                  <input
                                    type="text"
                                    value={editSubject}
                                    onChange={(e) =>
                                      setEditSubject(e.target.value)
                                    }
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-700 mb-1">
                                    เนื้อหาบันทึกข้อความ
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={editContent}
                                    onChange={(e) =>
                                      setEditContent(e.target.value)
                                    }
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
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
                                      triggerToast(
                                        "บันทึกการแก้ไขและส่งให้สารบรรณแล้ว!",
                                        "clerk",
                                        "คลิกเพื่อสลับเป็น 2. สารบรรณ (Clerk) ทันที"
                                      );
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>บันทึก & ส่งให้สารบรรณ</span>
                                  </button>
                                  <button
                                    onClick={() => setIsEditingMemo(false)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold"
                                  >
                                    ยกเลิก
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      {/* Prompt when waiting on another role */}
                      {((selectedMemo.status === "Pending Clerk" &&
                        currentRole !== "clerk") ||
                        (selectedMemo.status === "Pending Approval" &&
                          currentRole !== "approver") ||
                        ((selectedMemo.status === "Draft" ||
                          selectedMemo.status === "Returned for Revision") &&
                          currentRole !== "requester")) && (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 text-xs text-indigo-950">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>
                              เอกสารนี้อยู่ระหว่างรอ{" "}
                              <strong>
                                {getStatusBadge(selectedMemo.status).label}
                              </strong>{" "}
                              — กดปุ่มด้านขวาเพื่อสลับบทบาทไปดำเนินการต่อได้ทันที:
                            </span>
                          </div>
                          {selectedMemo.status === "Pending Clerk" && (
                            <button
                              onClick={() => setCurrentRole("clerk")}
                              className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition shadow-sm"
                            >
                              สลับเป็น 2. สารบรรณ (Clerk) ➔
                            </button>
                          )}
                          {selectedMemo.status === "Pending Approval" && (
                            <button
                              onClick={() => setCurrentRole("approver")}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-sm"
                            >
                              สลับเป็น 3. ผู้อำนวยการ (Approver) ➔
                            </button>
                          )}
                          {(selectedMemo.status === "Draft" ||
                            selectedMemo.status ===
                              "Returned for Revision") && (
                            <button
                              onClick={() => setCurrentRole("requester")}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-sm"
                            >
                              สลับเป็น 1. พนักงานผู้ยื่น (Requester) ➔
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Official Document Sheet Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                              บันทึกข้อความ (OFFICIAL MEMORANDUM)
                            </span>
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold ${getUrgencyBadge(
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

                        <div className="text-right text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-2xl border border-slate-200">
                          <div>
                            <strong>เลขทะเบียนหนังสือ:</strong>{" "}
                            <span className="font-mono font-bold text-indigo-700">
                              {selectedMemo.documentNumber ||
                                "รอสารบรรณออกเลข"}
                            </span>
                          </div>
                          <div>
                            <strong>รหัสอ้างอิง:</strong> {selectedMemo.id}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <strong>ส่วนงาน/แผนก:</strong>{" "}
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
                            <strong>งบประมาณ:</strong>{" "}
                            <span className="font-bold text-emerald-700">
                              {selectedMemo.budgetAmount.toLocaleString()} บาท
                            </span>
                          </div>
                        )}
                      </div>

                      {selectedMemo.revisionNote && (
                        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-900">
                          <strong>ความเห็นให้แก้ไข (Revision Note):</strong>{" "}
                          {selectedMemo.revisionNote}
                        </div>
                      )}

                      <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-5 rounded-2xl border border-slate-200">
                        {selectedMemo.content}
                      </div>

                      {selectedMemo.attachment && (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <Paperclip className="w-4 h-4 text-indigo-600" />
                            <span>
                              ไฟล์แนบ: {selectedMemo.attachment.name}{" "}
                              {selectedMemo.attachment.size &&
                                `(${selectedMemo.attachment.size})`}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-bold">
                            ✓ ตรวจสอบไฟล์แนบแล้ว
                          </span>
                        </div>
                      )}

                      {selectedMemo.status === "Approved" && (
                        <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1 text-xs">
                            <div className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>
                                ลงนามอนุมัติด้วยลายมือชื่ออิเล็กทรอนิกส์
                                (Verified Digital e-Signature)
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
                              {selectedMemo.signedBy || ACTORS.approver.name} •
                              เวลา:{" "}
                              {selectedMemo.signedAt || selectedMemo.updatedAt}
                            </div>
                          </div>
                          <div className="px-4 py-2 rounded-xl border-2 border-emerald-600 text-emerald-700 font-bold text-xs uppercase tracking-widest rotate-[-2deg] bg-white shadow-sm">
                            APPROVED • อนุมัติแล้ว
                          </div>
                        </div>
                      )}

                      {/* Audit Trail */}
                      <div className="pt-4 border-t border-slate-200">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                          ประวัติการเดินเอกสาร (Audit Trail)
                        </h4>
                        <div className="space-y-2.5">
                          {selectedMemo.auditTrail.map((entry, idx) => (
                            <div
                              key={entry.id}
                              className="flex items-start gap-3 text-xs"
                            >
                              <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </div>
                              <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
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
                                  <p className="text-slate-600 italic mt-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
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
              {/* Leave Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(leaveBalance) as LeaveType[]).map((key) => {
                  const balanceItem = leaveBalance[key];
                  const remaining = Math.max(
                    0,
                    balanceItem.total - balanceItem.used
                  );
                  const percentUsed = Math.min(
                    100,
                    Math.round((balanceItem.used / balanceItem.total) * 100)
                  );
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          {balanceItem.label}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                          คงเหลือ {remaining} วัน
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        ใช้ไป {balanceItem.used}{" "}
                        <span className="text-sm font-normal text-slate-500">
                          / {balanceItem.total} วัน
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {leaveError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center justify-between">
                  <span>⚠️ {leaveError}</span>
                  <button
                    onClick={() => setLeaveError(null)}
                    className="text-rose-600 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Submit Leave Request Form */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      ยื่นใบลาออนไลน์ใหม่ (Direct Approval Flow)
                    </h4>
                    <p className="text-xs text-slate-500">
                      ส่งตรงจากพนักงาน ({ACTORS.requester.name}) → ผู้อำนวยการฝ่าย
                    </p>
                  </div>

                  <form
                    onSubmit={handleCreateLeaveSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ประเภทการลา
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) =>
                          setLeaveType(e.target.value as LeaveType)
                        }
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ตั้งแต่วันที่
                        </label>
                        <input
                          type="date"
                          value={leaveStart}
                          onChange={(e) => setLeaveStart(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          ถึงวันที่
                        </label>
                        <input
                          type="date"
                          value={leaveEnd}
                          onChange={(e) => setLeaveEnd(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          จำนวน (วัน)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={leaveDays}
                          onChange={(e) => setLeaveDays(Number(e.target.value))}
                          className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        เหตุผลการลาและการมอบหมายงานระหว่างลา
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="ระบุเหตุผลการลาและผู้รับผิดชอบงานแทน..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>ส่งใบลาให้หัวหน้าพิจารณาอนุมัติ</span>
                    </button>
                  </form>
                </div>

                {/* Right: Leave Requests List */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
                    <h4 className="font-bold text-sm text-slate-900">
                      รายการใบลาทั้งหมด ({leaves.length})
                    </h4>
                    {currentRole !== "approver" && (
                      <button
                        onClick={() => setCurrentRole("approver")}
                        className="text-xs px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
                      >
                        สลับเป็น 3. ผู้อำนวยการ (Approver) เพื่อกดอนุมัติใบลา ➔
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
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                {lv.id}
                              </span>
                              <span className="text-sm font-bold text-slate-900">
                                {leaveBalance[lv.leaveType].label}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                                {lv.days} วัน
                              </span>
                            </div>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <div>
                              <strong>ผู้ยื่นลา:</strong> {lv.requesterName} (
                              {lv.department}) • <strong>วันที่ลา:</strong>{" "}
                              {lv.startDate} ถึง {lv.endDate}
                            </div>
                            <div>
                              <strong>เหตุผล:</strong> {lv.reason}
                            </div>
                            {lv.approverComment && (
                              <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mt-1">
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
                                  className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-xl border border-slate-300"
                                />
                                <button
                                  onClick={() => {
                                    setLeaveError(null);
                                    const res = approveLeaveRequest(
                                      lv.id,
                                      leaveCommentMap[lv.id]
                                    );
                                    if (!res.ok) {
                                      setLeaveError(
                                        res.error || "ไม่สามารถอนุมัติใบลาได้"
                                      );
                                      return;
                                    }
                                    triggerToast(
                                      `อนุมัติใบลา ${lv.id} และหักวันลาคงเหลือ ${lv.days} วันอัตโนมัติแล้ว!`
                                    );
                                  }}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>
                                    อนุมัติ & หักวันลา ({lv.days} วัน)
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    rejectLeaveRequest(
                                      lv.id,
                                      leaveCommentMap[lv.id] ||
                                        "ไม่อนุมัติเนื่องจากติดภารกิจสำคัญของแผนก"
                                    );
                                    triggerToast(`ไม่อนุมัติใบลา ${lv.id}`);
                                  }}
                                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold hover:bg-rose-200 transition"
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
                    className={`bg-white rounded-3xl border-2 p-5 shadow-sm space-y-2.5 transition ${
                      selectedRoomIdx === idx
                        ? "border-indigo-500 ring-2 ring-indigo-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        ● พร้อมใช้งาน
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        ความจุ {room.capacity} ที่นั่ง
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {room.name}
                    </h4>
                    <p className="text-xs text-slate-500">{room.floor}</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <strong>อุปกรณ์:</strong> {room.equipment}
                    </p>
                    <button
                      onClick={() => setSelectedRoomIdx(idx)}
                      className="w-full py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition"
                    >
                      เลือกห้องประชุมนี้
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">
                    จองห้องประชุมออนไลน์ (New Room Booking)
                  </h4>
                  <form
                    onSubmit={handleCreateBookingSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ห้องประชุม
                      </label>
                      <select
                        value={selectedRoomIdx}
                        onChange={(e) =>
                          setSelectedRoomIdx(Number(e.target.value))
                        }
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        {MEETING_ROOMS.map((r, i) => (
                          <option key={r.name} value={i}>
                            {r.name} (ความจุ {r.capacity} คน)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        หัวข้อการประชุม *
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingTitle}
                        onChange={(e) => setBookingTitle(e.target.value)}
                        placeholder="เช่น ประชุมติดตามความคืบหน้าโครงการ E-Office"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          วันที่
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          เริ่ม
                        </label>
                        <input
                          type="time"
                          value={bookingStart}
                          onChange={(e) => setBookingStart(e.target.value)}
                          className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          สิ้นสุด
                        </label>
                        <input
                          type="time"
                          value={bookingEnd}
                          onChange={(e) => setBookingEnd(e.target.value)}
                          className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
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
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                      ยืนยันการจองห้องประชุม
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
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
                            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                              {b.id}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                              ยืนยันแล้ว
                            </span>
                            <span className="text-slate-500">
                              วันที่ {b.date} ({b.startTime} - {b.endTime} น.)
                            </span>
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {b.title}
                          </div>
                          <div className="text-slate-600">
                            <strong>ห้อง:</strong> {b.roomName} ({b.floor}) •{" "}
                            <strong>ผู้จอง:</strong> {b.bookedBy} ({b.attendees}{" "}
                            คน)
                          </div>
                        </div>
                        <button
                          onClick={() => deleteRoomBooking(b.id)}
                          className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition"
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
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">
                    ทำเนียบบุคลากรและสายบังคับบัญชาในระบบ (Approval Hierarchy)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["requester", "clerk", "approver"] as Role[]).map(
                    (r, index) => {
                      const act = ACTORS[r];
                      return (
                        <div
                          key={r}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-0.5 rounded-full text-white font-bold ${act.badgeColor}`}
                            >
                              ลำดับ Flow ที่ {index + 1}
                            </span>
                            <span className="font-mono text-slate-500">
                              {act.empId}
                            </span>
                          </div>
                          <div className="text-base font-bold text-slate-900 pt-1">
                            {act.name}
                          </div>
                          <div className="font-bold text-indigo-700">
                            {act.title}
                          </div>
                          <div className="text-slate-600">
                            สังกัด: {act.department}
                          </div>
                          <div className="text-slate-500">
                            อีเมล: {act.email} • โทร: {act.phone}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">
                    สร้างประกาศข่าวสารองค์กรใหม่
                  </h4>
                  <form
                    onSubmit={handleCreateAnnouncementSubmit}
                    className="space-y-3.5"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        หัวข้อประกาศ *
                      </label>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="เช่น แจ้งปิดปรับปรุงระบบเครือข่ายประจำเดือน"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        หมวดหมู่
                      </label>
                      <select
                        value={annCategory}
                        onChange={(e) =>
                          setAnnCategory(e.target.value as AnnouncementCategory)
                        }
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="ประกาศสำคัญ">ประกาศสำคัญ</option>
                        <option value="นโยบายไอที">นโยบายไอที</option>
                        <option value="กิจกรรมองค์กร">กิจกรรมองค์กร</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        รายละเอียดประกาศ *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={annContent}
                        onChange={(e) => setAnnContent(e.target.value)}
                        placeholder="ระบุรายละเอียดประชาสัมพันธ์..."
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      เผยแพร่ประกาศองค์กร
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
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
          {/* TAB 6: FLOW & STACK ARCHITECTURE                           */}
          {/* ========================================================= */}
          {activeTab === "architecture" && <ArchitectureView />}
        </main>
      </div>

      {/* MODALS */}
      {showPrintModal && selectedMemo && (
        <OfficialPrintModal
          memo={selectedMemo}
          statusLabel={getStatusBadge(selectedMemo.status).label}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showNewMemoModal && (
        <NewMemoModal
          onClose={() => setShowNewMemoModal(false)}
          onCreate={(input) => {
            const created = createMemo(input);
            setShowNewMemoModal(false);
            setSelectedMemoId(created.id);
            setActiveTab("memos");
            if (input.submitImmediately) {
              triggerToast(
                `สร้างและส่งบันทึกข้อความ "${created.subject}" เข้าห้องสารบรรณแล้ว!`,
                "clerk",
                "คลิกเพื่อสลับเป็น 2. สารบรรณ (Clerk) ทันที"
              );
            } else {
              triggerToast(`บันทึกฉบับร่าง "${created.subject}" เรียบร้อยแล้ว`);
            }
          }}
        />
      )}
    </div>
  );
}
