"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ACTORS,
  INITIAL_LEAVE_BALANCE,
  INITIAL_LEAVES,
  INITIAL_MEMOS,
} from "@/data/seed";
import {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  Memo,
  MemoCategory,
  Role,
  UrgencyLevel,
} from "@/types/eoffice";

interface CreateMemoInput {
  subject: string;
  category: MemoCategory;
  urgency: UrgencyLevel;
  to: string;
  content: string;
  attachmentName?: string;
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

interface EOfficeContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  memos: Memo[];
  leaves: LeaveRequest[];
  leaveBalance: LeaveBalance;
  docRunningNumber: number;
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
  resetDemoData: () => void;
}

const STORAGE_KEY = "e_office_prototype_state_v1";

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
  const [currentRole, setCurrentRole] = useState<Role>("requester");
  const [memos, setMemos] = useState<Memo[]>(INITIAL_MEMOS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(
    INITIAL_LEAVE_BALANCE
  );
  const [docRunningNumber, setDocRunningNumber] = useState<number>(43);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.memos) setMemos(parsed.memos);
        if (parsed.leaves) setLeaves(parsed.leaves);
        if (parsed.leaveBalance) setLeaveBalance(parsed.leaveBalance);
        if (parsed.docRunningNumber)
          setDocRunningNumber(parsed.docRunningNumber);
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          memos,
          leaves,
          leaveBalance,
          docRunningNumber,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [memos, leaves, leaveBalance, docRunningNumber, hydrated]);

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

    setMemos((prev) =>
      prev.map((m) => {
        if (m.id !== memoId) return m;
        return {
          ...m,
          updatedAt: ts,
          status: "Approved",
          revisionNote: undefined,
          auditTrail: [
            ...m.auditTrail,
            {
              id: `AUD-${Date.now()}`,
              timestamp: ts,
              actorName: actor.name,
              actorRole: "approver",
              action: "ลงนามอนุมัติบันทึกข้อความ (Approved)",
              statusAfter: "Approved",
              comment: comment || "อนุมัติให้ดำเนินการตามเสนอ",
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

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMemos(INITIAL_MEMOS);
    setLeaves(INITIAL_LEAVES);
    setLeaveBalance(INITIAL_LEAVE_BALANCE);
    setDocRunningNumber(43);
    setCurrentRole("requester");
  };

  return (
    <EOfficeContext.Provider
      value={{
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
