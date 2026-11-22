export type Role = "requester" | "clerk" | "approver";

export interface ActorProfile {
  role: Role;
  name: string;
  title: string;
  department: string;
  badgeColor: string;
  description: string;
}

export type MemoStatus =
  | "Draft"
  | "Pending Clerk"
  | "Pending Approval"
  | "Returned for Revision"
  | "Approved"
  | "Rejected";

export type MemoCategory =
  | "จัดซื้อจัดจ้าง"
  | "ขออนุมัติโครงการ"
  | "บันทึกข้อความทั่วไป"
  | "ขอเบิกงบประมาณ";

export type UrgencyLevel = "ปกติ" | "ด่วน" | "ด่วนที่สุด";

export interface AuditEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  statusAfter: string;
  comment?: string;
}

export interface Memo {
  id: string;
  documentNumber?: string;
  subject: string;
  category: MemoCategory;
  urgency: UrgencyLevel;
  to: string;
  requesterName: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  attachmentName?: string;
  budgetAmount?: number;
  status: MemoStatus;
  revisionNote?: string;
  auditTrail: AuditEntry[];
}

export type LeaveType = "sick" | "personal" | "vacation";

export type LeaveStatus = "Pending Approval" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: string;
  requesterName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  approverComment?: string;
  auditTrail: AuditEntry[];
}

export interface LeaveQuota {
  label: string;
  total: number;
  used: number;
  color: string;
}

export type LeaveBalance = Record<LeaveType, LeaveQuota>;
