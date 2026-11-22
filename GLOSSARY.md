# E-Office

An internal electronic office system for submitting, routing, and approving organizational documents, employee leave requests, meeting room reservations, and internal announcements.

## Language

### Actors & Roles

**Requester**:
An employee who drafts and submits a Memo or Leave Request into an approval workflow, or reserves a meeting room.
_Avoid_: User, staff, sender

**Approver**:
A supervisor or director authorized to review, approve with an Electronic Signature, reject, or return a pending submission in the approval chain.
_Avoid_: Boss, admin, reviewer

**Clerk**:
A document controller (เจ้าหน้าที่สารบรรณ) who registers official document numbers, verifies formatting, and routes incoming or outgoing organizational documents.
_Avoid_: Secretary, operator

### Core Domain Objects

**Memo**:
An internal official document (บันทึกข้อความ) created by a Requester to seek approval, report information, or propose an action.
_Avoid_: Document, letter, form, ticket

**Document Number**:
An official registration code (เลขทะเบียนหนังสือ, e.g., `บค 042/2569`) assigned by a Clerk when a Memo passes initial verification.
_Avoid_: ID, reference code, serial number, docNo

**Electronic Signature**:
A verified digital sign-off (ลายมือชื่ออิเล็กทรอนิกส์ / e-Signature) applied by an Approver when approving a Memo, recording the signer's identity, command, and timestamp for official PDF printing.
_Avoid_: Stamp, autograph

**Leave Request**:
A formal submission by a Requester to take time off (e.g., sick leave, vacation, personal leave) requiring direct Approver sign-off without Clerk registration.
_Avoid_: Absence form, time-off ticket

**Leave Balance**:
The remaining number of allowed days per leave category (Sick, Personal, Vacation) for a Requester, validated on submission and automatically deducted when a Leave Request is approved.
_Avoid_: Quota, allowance, days left

**Room Booking**:
A scheduled reservation of an organizational meeting room by an actor for a specific date, time window, and attendee count.
_Avoid_: Event, calendar slot

**Announcement**:
An official organization-wide notice or policy update published to the E-Office board.
_Avoid_: News post, blog, message

### Workflow & Tracking

**Inbox**:
A role-specific queue displaying only the Memos and Leave Requests that currently await action from the active actor.
_Avoid_: Todo list, notification feed, task board

**Returned for Revision**:
A workflow state where a Clerk or Approver sends a Memo back to the Requester with comments for correction before it can proceed.
_Avoid_: Rejected, bounced, paused

**Audit Trail**:
A chronological log of every state transition, actor action, timestamp, and comment on a Memo or Leave Request.
_Avoid_: History, activity log, changelog
