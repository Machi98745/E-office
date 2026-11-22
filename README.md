# ระบบสำนักงานอิเล็กทรอนิกส์ (E-Office Enterprise Suite v2.0)

ระบบสำนักงานอิเล็กทรอนิกส์แบบ Full-Stack สำหรับศึกษาและนำเสนอ **Flow (Workflow & State Machine)** และ **Stack (Full-Stack Architecture)** ครบทั้ง 6 โมดูลหลักขององค์กร

---

## 1. โมดูลและ FLOW การทำงานในระบบ

1. **แดชบอร์ดผู้บริหารและกล่องงาน (`Dashboard & Inbox`):**
   - แสดงเฉพาะรายการงานที่รอดำเนินการโดยบทบาทปัจจุบัน (`Inbox`) พร้อมสรุป KPI แบบ Real-time
2. **ระบบสารบรรณและอนุมัติบันทึกข้อความ (`Memo` 3-Role Workflow):**
   - **ผู้ยื่นเรื่อง (`Requester`)** → ร่างบันทึกข้อความ (`Draft`) แนบไฟล์จากเครื่อง และส่งเรื่องเข้าห้องสารบรรณ (`Pending Clerk`)
   - **เจ้าหน้าที่สารบรรณ (`Clerk`)** → ตรวจสอบความถูกต้องและ **ออกเลขทะเบียนหนังสือราชการ (`Document Number` เช่น `บค 043/2569`)** เพื่อส่งต่อให้ผู้บริหาร (`Pending Approval`) หรือตีกลับให้แก้ไข (`Returned for Revision`)
   - **ผู้อนุมัติ (`Approver`)** → พิจารณาลงนามด้วย **ลายมือชื่ออิเล็กทรอนิกส์ (`Electronic Signature` / `Approved`)**, **ส่งกลับแก้ไข (`Returned for Revision`)**, หรือ **ไม่อนุมัติ (`Rejected`)** พร้อมพิมพ์เป็น **กระดาษบันทึกข้อความราชการ (PDF Print)** และบันทึก `Audit Trail` ทุกขั้นตอน
3. **ระบบลางานออนไลน์ (`Leave Request` 2-Role Direct Workflow):**
   - วิ่งตรงจาก **`Requester` → `Approver`** โดยไม่ผ่านสารบรรณ
   - ตรวจสอบความถูกต้องของช่วงวันที่ลาและสิทธิ์วันลาคงเหลือ (`Leave Balance`) ก่อนอนุมัติ และหักยอดวันลาคงเหลืออัตโนมัติเมื่อ `Approver` กดอนุมัติ
4. **ระบบจองห้องประชุม (`Room Booking`):**
   - จองห้องประชุมตามความจุและช่วงเวลา พร้อมยกเลิกการจองและป้องกันรหัสการจองซ้ำ
5. **ประกาศองค์กรและทำเนียบบุคลากร (`Announcement & Directory`):**
   - แสดงผังสายบังคับบัญชา 3 ระดับใน Flow และกระดานข่าวสารภายในองค์กร
6. **สไลด์สรุป Flow & Stack (`Architecture Presentation Mode`):**
   - แผนภาพสรุป State Machine และตารางเปรียบเทียบ Full-Stack Architecture สำหรับเปิดนำเสนออาจารย์บนหน้าเว็บ

---

## 2. STACK (ชุดเทคโนโลยีที่ใช้พัฒนา)

- **Frontend Layer:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS + Lucide Icons + ฟอนต์ `Prompt`
- **Backend API Layer:** Next.js REST API Route Handler (`GET / POST /api/eoffice` ใน [`src/app/api/eoffice/route.ts`](./src/app/api/eoffice/route.ts))
- **Database & Persistence Layer:** Server-Side Persistent JSON Database (`data/eoffice-db.json`) พร้อม `localStorage` Fallback และปุ่ม `Reset DB`
- **Authentication & Demo Control:** หน้า Login เต็มรูปแบบ (1-Click Role Login + Credentials) และแถบสลับบทบาท (`Role Switcher`) ด้านบนสุด

---

## 3. วิธีเปิดใช้งาน

### วิธีที่ 1: รันผ่าน Next.js Full-Stack Server
```bash
npm install
npm run dev
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### วิธีที่ 2: เปิดไฟล์ Standalone HTML ทันที (ไม่ต้องรัน Server)
ดับเบิลคลิกเปิดไฟล์ [`mockup-preview.html`](./mockup-preview.html) บนเบราว์เซอร์ได้ทันที

---

## 4. เอกสารประกอบการออกแบบ (Domain Docs & ADRs)
- [`GLOSSARY.md`](./GLOSSARY.md) — นิยามคำศัพท์หลักในโดเมน E-Office
- [`docs/adr/0001-in-browser-stateful-prototype-with-role-switcher.md`](./docs/adr/0001-in-browser-stateful-prototype-with-role-switcher.md) — การใช้ Role Switcher และ 1-Click Role Login สำหรับสาธิต Multi-Role Workflow
- [`docs/adr/0002-hybrid-api-and-browser-state-persistence.md`](./docs/adr/0002-hybrid-api-and-browser-state-persistence.md) — สถาปัตยกรรมการเก็บข้อมูลแบบ Hybrid (Server REST API Database + Browser Fallback)
