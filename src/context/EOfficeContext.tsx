"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ACTORS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BOOKINGS,
  INITIAL_LEAVE_BALANCE,
  INITIAL_LEAVES,
  INITIAL_MEMOS,
} from "@/data/seed";
import {
  Announcement,
  AnnouncementCategory,
  Attachment,
  EOfficeDatabase,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  Memo,
  MemoCategory,
  MemoStatus,
  Role,
  RoomBooking,
  UrgencyLevel,
} from "@/types/eoffice";

interface CreateMemoInput {
  subject: string;
  category: MemoCategory;
  urgency: UrgencyLevel;
  to: string;
  content: string;
  attachment?: Attachment;
  budgetAmount?: number;
  submitImmediately: boolean;
}

interface CreateLeaveInput {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
}

interface CreateBookingInput {
  roomName: string;
  floor: string;
  capacity: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: string;
}

interface CreateAnnouncementInput {
  title: string;
  category: AnnouncementCategory;
  content: string;
  pinned?: boolean;
}

interface EOfficeContextType {
  isAuthenticated: boolean;
  loginAsRole: (role: Role) => void;
  logout: () => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  memos: Memo[];
  leaves: LeaveRequest[];
  leaveBalance: LeaveBalance;
  bookings: RoomBooking[];
  announcements: Announcement[];
  docRunningNumber: number;
  dbSynced: boolean;
  createMemo: (input: CreateMemoInput) => Memo;
  updateAndResubmitMemo: (
    memoId: string,
    subject: string,
    content: string,
    comment?: string
  ) => void;
  registerDocumentNumber: (
    memoId: string,
    customDocumentNumber?: string,
    comment?: string
  ) => void;
  returnMemoForRevision: (memoId: string, reason: string) => void;
  approveMemo: (memoId: string, comment?: string) => void;
  rejectMemo: (memoId: string, reason: string) => void;
  createLeaveRequest: (
    input: CreateLeaveInput
  ) => { ok: boolean; error?: string };
  approveLeaveRequest: (
    leaveId: string,
    comment?: string
  ) => { ok: boolean; error?: string };
  rejectLeaveRequest: (leaveId: string, reason: string) => void;
  createRoomBooking: (input: CreateBookingInput) => void;
  deleteRoomBooking: (bookingId: string) => void;
  createAnnouncement: (input: CreateAnnouncementInput) => void;
  resetDemoData: () => Promise<void>;
}

const STORAGE_KEY = "e_office_fullstack_state_v3";

const EOfficeContext = createContext<EOfficeContextType | undefined>(undefined);

function formatThaiTimestamp(): string {
  const now = new Date();
  const thaiMonths = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const day = now.getDate();
  const month = thaiMonths[now.getMonth()];
  const year = 2569;
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hours}:${mins}`;
}

function nextId(items: { id: string }[], prefix: string): string {
  const maxNum = items.reduce((max, item) => {
    const match = item.id.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return num > max ? num : max;
  }, 0);
  return `${prefix}-${String(maxNum + 1).padStart(3, "0")}`;
}

export function EOfficeProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<Role>("requester");
  const [memos, setMemos] = useState<Memo[]>(INITIAL_MEMOS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(
    INITIAL_LEAVE_BALANCE
  );
  const [bookings, setBookings] = useState<RoomBooking[]>(INITIAL_BOOKINGS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    INITIAL_ANNOUNCEMENTS
  );
  const [docRunningNumber, setDocRunningNumber] = useState<number>(43);
  const [hydrated, setHydrated] = useState(false);
  const [dbSynced, setDbSynced] = useState(false);

  useEffect(() => {
    async function loadFromBackend() {
      try {
        const res = await fetch("/api/eoffice", { cache: "no-store" });
        if (res.ok) {
          const data: EOfficeDatabase = await res.json();
          if (data.memos) setMemos(data.memos);
          if (data.leaves) setLeaves(data.leaves);
          if (data.leaveBalance) setLeaveBalance(data.leaveBalance);
          if (data.bookings) setBookings(data.bookings);
          if (data.announcements) setAnnouncements(data.announcements);
          if (data.docRunningNumber)
            setDocRunningNumber(data.docRunningNumber);
          setDbSynced(true);
          setHydrated(true);
          return;
        }
      } catch {
        // Fallback to localStorage if offline
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.memos) setMemos(parsed.memos);
          if (parsed.leaves) setLeaves(parsed.leaves);
          if (parsed.leaveBalance) setLeaveBalance(parsed.leaveBalance);
          if (parsed.bookings) setBookings(parsed.bookings);
          if (parsed.announcements) setAnnouncements(parsed.announcements);
          if (parsed.docRunningNumber)
            setDocRunningNumber(parsed.docRunningNumber);
        }
      } catch {
        // ignore
      }
      setHydrated(true);
    }

    loadFromBackend();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: EOfficeDatabase = {
      docRunningNumber,
      memos,
      leaves,
      leaveBalance,
      bookings,
      announcements,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }

    fetch("/api/eoffice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ db: payload }),
    })
      .then((r) => {
        if (r.ok) setDbSynced(true);
      })
      .catch(() => {
        setDbSynced(false);
      });
  }, [
    memos,
    leaves,
    leaveBalance,
    bookings,
    announcements,
    docRunningNumber,
    hydrated,
  ]);

  const loginAsRole = (role: Role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  // Shared helper to transition a Memo and append to its Audit Trail without code duplication
  const transitionMemo = (
    memoId: string,
    patch: Partial<Memo>,
    actorRole: Role,
    action: string,
    statusAfter: MemoStatus,
    comment?: string
  ) => {
    const actor = ACTORS[actorRole];
    const ts = formatThaiTimestamp();

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          ...patch,
          status: statusAfter,
          updatedAt: ts,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole,
              action,
              statusAfter,
              comment,
            },
          ],
        };
      })
    );
  };

  const createMemo = (input: CreateMemoInput): Memo => {
    const actor = ACTORS.requester;
    const ts = formatThaiTimestamp();
    const newId = nextId(memos, "MEMO");
    const initialStatus: MemoStatus = input.submitImmediately
      ? "Pending Clerk"
      : "Draft";

    const newMemo: Memo = {
      id: newId,
      subject: input.subject,
      category: input.category,
      urgency: input.urgency,
      to: input.to,
      requesterName: actor.name,
      department: actor.department,
      createdAt: ts,
      updatedAt: ts,
      content: input.content,
      attachment: input.attachment,
      budgetAmount: input.budgetAmount,
      status: initialStatus,
      auditTrail: [
        {
          id: `AUD-${Date.now()}`,
          timestamp: ts,
          actorName: actor.name,
          actorRole: "requester",
          action: input.submitImmediately
            ? "สร้างและส่งเรื่องเข้าสู่ห้องสารบรรณ (Pending Clerk)"
            : "บันทึกเป็นฉบับร่าง (Draft)",
          statusAfter: initialStatus,
        },
      ],
    };

    setMemos((prev) => [newMemo, ...prev]);
    return newMemo;
  };

  const updateAndResubmitMemo = (
    memoId: string,
    subject: string,
    content: string,
    comment?: string
  ) => {
    transitionMemo(
      memoId,
      { subject, content, revisionNote: undefined },
      "requester",
      "แก้ไขเอกสารและส่งเรื่องให้สารบรรณตรวจสอบอีกครั้ง",
      "Pending Clerk",
      comment || "แก้ไขข้อมูลตามที่แจ้งเรียบร้อยแล้วครับ"
    );
  };

  const registerDocumentNumber = (
    memoId: string,
    customDocumentNumber?: string,
    comment?: string
  ) => {
    const target = memos.find((m) => m.id === memoId);
    if (!target) return;

    const trimmedCustom = customDocumentNumber?.trim();
    const assignedNumber =
      trimmedCustom ||
      `บค ${String(docRunningNumber).padStart(3, "0")}/2569`;

    if (!trimmedCustom) {
      setDocRunningNumber((n) => n + 1);
    }

    transitionMemo(
      memoId,
      { documentNumber: assignedNumber, revisionNote: undefined },
      "clerk",
      `ตรวจสอบรูปแบบผ่าน ออกเลขทะเบียน ${assignedNumber} และส่งต่อผู้อนุมัติ`,
      "Pending Approval",
      comment || "รูปแบบเอกสารและไฟล์แนบถูกต้องครบถ้วน"
    );
  };

  const returnMemoForRevision = (memoId: string, reason: string) => {
    transitionMemo(
      memoId,
      { revisionNote: reason },
      currentRole,
      "ส่งกลับให้ผู้ยื่นเรื่องแก้ไข (Returned for Revision)",
      "Returned for Revision",
      reason
    );
  };

  const approveMemo = (memoId: string, comment?: string) => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();
    const cmd = comment || "อนุมัติให้ดำเนินการตามเสนอ";

    transitionMemo(
      memoId,
      {
        revisionNote: undefined,
        signedBy: actor.name,
        signedAt: ts,
        approverCommand: cmd,
      },
      "approver",
      "ลงนามอนุมัติบันทึกข้อความด้วยลายมือชื่ออิเล็กทรอนิกส์ (e-Signature Approved)",
      "Approved",
      cmd
    );
  };

  const rejectMemo = (memoId: string, reason: string) => {
    transitionMemo(
      memoId,
      { approverCommand: reason },
      "approver",
      "ไม่อนุมัติบันทึกข้อความ (Rejected - ปิดเรื่อง)",
      "Rejected",
      reason
    );
  };

  const createLeaveRequest = (
    input: CreateLeaveInput
  ): { ok: boolean; error?: string } => {
    if (input.days <= 0) {
      return { ok: false, error: "จำนวนวันลาต้องมากกว่า 0 วัน" };
    }
    if (input.endDate < input.startDate) {
      return {
        ok: false,
        error: "วันที่สิ้นสุดการลาต้องไม่น้อยกว่าวันที่เริ่มต้นการลา",
      };
    }

    const balanceItem = leaveBalance[input.leaveType];
    const remaining = balanceItem.total - balanceItem.used;
    if (input.days > remaining) {
      return {
        ok: false,
        error: `สิทธิ์วันลาคงเหลือไม่เพียงพอ (${balanceItem.label} คงเหลือ ${remaining} วัน แต่ขอลา ${input.days} วัน)`,
      };
    }

    const actor = ACTORS.requester;
    const ts = formatThaiTimestamp();
    const newId = nextId(leaves, "LEAVE");

    const newLeave: LeaveRequest = {
      id: newId,
      requesterName: actor.name,
      department: actor.department,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      days: input.days,
      reason: input.reason,
      status: "Pending Approval",
      createdAt: ts,
      auditTrail: [
        {
          id: `LAUD-${Date.now()}`,
          timestamp: ts,
          actorName: actor.name,
          actorRole: "requester",
          action: `ยื่นใบลา (${input.days} วัน) ส่งตรงถึงหัวหน้างาน`,
          statusAfter: "Pending Approval",
        },
      ],
    };

    setLeaves((prev) => [newLeave, ...prev]);
    return { ok: true };
  };

  const approveLeaveRequest = (
    leaveId: string,
    comment?: string
  ): { ok: boolean; error?: string } => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();
    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (!targetLeave || targetLeave.status === "Approved") {
      return { ok: false, error: "ไม่พบรายการใบลาที่รออนุมัติ" };
    }

    const balanceItem = leaveBalance[targetLeave.leaveType];
    const remaining = balanceItem.total - balanceItem.used;
    if (targetLeave.days > remaining) {
      return {
        ok: false,
        error: `ไม่สามารถอนุมัติได้เนื่องจากวันลาคงเหลือไม่พอ (คงเหลือ ${remaining} วัน)`,
      };
    }

    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: "Approved",
          approverComment: comment || "อนุมัติการลา",
          auditTrail: [
            ...l.auditTrail,
            {
              id: `LAUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "approver",
              action: `อนุมัติใบลาและหักโควตาวันลา ${l.days} วันอัตโนมัติ`,
              statusAfter: "Approved",
              comment: comment || "อนุมัติการลา",
            },
          ],
        };
      })
    );

    setLeaveBalance((prev) => ({
      ...prev,
      [targetLeave.leaveType]: {
        ...prev[targetLeave.leaveType],
        used: Math.min(
          prev[targetLeave.leaveType].total,
          prev[targetLeave.leaveType].used + targetLeave.days
        ),
      },
    }));

    return { ok: true };
  };

  const rejectLeaveRequest = (leaveId: string, reason: string) => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();

    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id !== leaveId) return l;
        return {
          ...l,
          status: "Rejected",
          approverComment: reason,
          auditTrail: [
            ...l.auditTrail,
            {
              id: `LAUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "approver",
              action: "ไม่อนุมัติใบลา (Rejected)",
              statusAfter: "Rejected",
              comment: reason,
            },
          ],
        };
      })
    );
  };

  const createRoomBooking = (input: CreateBookingInput) => {
    const actor = ACTORS[currentRole];
    const newId = nextId(bookings, "BOOK");
    const booking: RoomBooking = {
      id: newId,
      roomName: input.roomName,
      floor: input.floor,
      capacity: input.capacity,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      bookedBy: actor.name,
      department: actor.department,
      attendees: input.attendees,
      equipment: input.equipment,
      status: "Confirmed",
    };
    setBookings((prev) => [booking, ...prev]);
  };

  const deleteRoomBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const createAnnouncement = (input: CreateAnnouncementInput) => {
    const actor = ACTORS[currentRole];
    const newId = nextId(announcements, "ANN");
    const ann: Announcement = {
      id: newId,
      title: input.title,
      category: input.category,
      content: input.content,
      authorName: actor.name,
      department: actor.department,
      postedAt: formatThaiTimestamp(),
      pinned: input.pinned,
    };
    setAnnouncements((prev) => [ann, ...prev]);
  };

  const resetDemoData = async () => {
    localStorage.removeItem(STORAGE_KEY);
    try {
      const res = await fetch("/api/eoffice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      if (res.ok) {
        const fresh: EOfficeDatabase = await res.json();
        setMemos(fresh.memos);
        setLeaves(fresh.leaves);
        setLeaveBalance(fresh.leaveBalance);
        setBookings(fresh.bookings);
        setAnnouncements(fresh.announcements);
        setDocRunningNumber(fresh.docRunningNumber);
        setCurrentRole("requester");
        return;
      }
    } catch {
      // fallback
    }
    setMemos(INITIAL_MEMOS);
    setLeaves(INITIAL_LEAVES);
    setLeaveBalance(INITIAL_LEAVE_BALANCE);
    setBookings(INITIAL_BOOKINGS);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    setDocRunningNumber(43);
    setCurrentRole("requester");
  };

  return (
    <EOfficeContext.Provider
      value={{
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
      }}
    >
      {children}
    </EOfficeContext.Provider>
  );
}

export function useEOffice() {
  const ctx = useContext(EOfficeContext);
  if (!ctx) {
    throw new Error("useEOffice must be used within EOfficeProvider");
  }
  return ctx;
}
