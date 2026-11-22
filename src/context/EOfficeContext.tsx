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
  EOfficeDatabase,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  Memo,
  MemoCategory,
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
  attachmentName?: string;
  attachmentSize?: string;
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
  category: "ประกาศสำคัญ" | "นโยบายไอที" | "กิจกรรมองค์กร";
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
    customDocNo?: string,
    comment?: string
  ) => void;
  returnMemoForRevision: (memoId: string, reason: string) => void;
  approveMemo: (memoId: string, comment?: string) => void;
  rejectMemo: (memoId: string, reason: string) => void;
  createLeaveRequest: (input: CreateLeaveInput) => void;
  approveLeaveRequest: (leaveId: string, comment?: string) => void;
  rejectLeaveRequest: (leaveId: string, reason: string) => void;
  createRoomBooking: (input: CreateBookingInput) => void;
  deleteRoomBooking: (bookingId: string) => void;
  createAnnouncement: (input: CreateAnnouncementInput) => void;
  resetDemoData: () => Promise<void>;
}

const STORAGE_KEY = "e_office_fullstack_state_v2";

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

  // Load initial database from Backend API (/api/eoffice), falling back to localStorage
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

  // Persist changes to Backend API + localStorage
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

  const createMemo = (input: CreateMemoInput): Memo => {
    const actor = ACTORS.requester;
    const ts = formatThaiTimestamp();
    const newId = `MEMO-${String(memos.length + 1).padStart(3, "0")}`;
    const initialStatus = input.submitImmediately ? "Pending Clerk" : "Draft";

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
      attachmentName: input.attachmentName || undefined,
      attachmentSize: input.attachmentSize || undefined,
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
    const actor = ACTORS.requester;
    const ts = formatThaiTimestamp();

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          subject,
          content,
          updatedAt: ts,
          status: "Pending Clerk",
          revisionNote: undefined,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "requester",
              action: "แก้ไขเอกสารและส่งเรื่องให้สารบรรณตรวจสอบอีกครั้ง",
              statusAfter: "Pending Clerk",
              comment: comment || "แก้ไขข้อมูลตามที่แจ้งเรียบร้อยแล้วครับ",
            },
          ],
        };
      })
    );
  };

  const registerDocumentNumber = (
    memoId: string,
    customDocNo?: string,
    comment?: string
  ) => {
    const actor = ACTORS.clerk;
    const ts = formatThaiTimestamp();
    const assignedNumber =
      customDocNo?.trim() ||
      `บค ${String(docRunningNumber).padStart(3, "0")}/2569`;

    setDocRunningNumber((n) => n + 1);
    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          documentNumber: assignedNumber,
          updatedAt: ts,
          status: "Pending Approval",
          revisionNote: undefined,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "clerk",
              action: `ตรวจสอบรูปแบบผ่าน ออกเลขทะเบียน ${assignedNumber} และส่งต่อผู้อนุมัติ`,
              statusAfter: "Pending Approval",
              comment: comment || "รูปแบบเอกสารและไฟล์แนบถูกต้องครบถ้วน",
            },
          ],
        };
      })
    );
  };

  const returnMemoForRevision = (memoId: string, reason: string) => {
    const actor = ACTORS[currentRole];
    const ts = formatThaiTimestamp();

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          updatedAt: ts,
          status: "Returned for Revision",
          revisionNote: reason,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: currentRole,
              action: "ส่งกลับให้ผู้ยื่นเรื่องแก้ไข (Returned for Revision)",
              statusAfter: "Returned for Revision",
              comment: reason,
            },
          ],
        };
      })
    );
  };

  const approveMemo = (memoId: string, comment?: string) => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();
    const cmd = comment || "อนุมัติให้ดำเนินการตามเสนอ";

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          updatedAt: ts,
          status: "Approved",
          revisionNote: undefined,
          signedBy: actor.name,
          signedAt: ts,
          approverCommand: cmd,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "approver",
              action:
                "ลงนามอนุมัติบันทึกข้อความด้วยลายมือชื่ออิเล็กทรอนิกส์ (e-Signature Approved)",
              statusAfter: "Approved",
              comment: cmd,
            },
          ],
        };
      })
    );
  };

  const rejectMemo = (memoId: string, reason: string) => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          updatedAt: ts,
          status: "Rejected",
          approverCommand: reason,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "approver",
              action: "ไม่อนุมัติบันทึกข้อความ (Rejected - ปิดเรื่อง)",
              statusAfter: "Rejected",
              comment: reason,
            },
          ],
        };
      })
    );
  };

  const createLeaveRequest = (input: CreateLeaveInput) => {
    const actor = ACTORS.requester;
    const ts = formatThaiTimestamp();
    const newId = `LEAVE-${String(leaves.length + 1).padStart(3, "0")}`;

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
  };

  const approveLeaveRequest = (leaveId: string, comment?: string) => {
    const actor = ACTORS.approver;
    const ts = formatThaiTimestamp();
    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (!targetLeave || targetLeave.status === "Approved") return;

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
        used: prev[targetLeave.leaveType].used + targetLeave.days,
      },
    }));
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
    const newId = `BOOK-${String(bookings.length + 1).padStart(3, "0")}`;
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
    const newId = `ANN-${String(announcements.length + 1).padStart(3, "0")}`;
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
