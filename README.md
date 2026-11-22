# ระบบสำนักงานอิเล็กทรอนิกส์ (E-Office Interactive Prototype)

โปรเจกต์ต้นแบบเชิงโต้ตอบ (Interactive Web Prototype) สำหรับศึกษาและนำเสนอ **Flow (Workflow & State Machine)** และ **Stack (Tech Stack Architecture)** ของระบบ E-Office

---

## 1. สิ่งที่ออกแบบไว้ในโปรเจกต์นี้

### A. FLOW (ลำดับการเดินงานและสถานะเอกสาร)
1. **ระบบสารบรรณและอนุมัติบันทึกข้อความ (`Memo` 3-Role Workflow):**
   - **ผู้ยื่นเรื่อง (`Requester`)** → ร่างบันทึกข้อความ (`Draft`) และส่งเรื่องเข้าห้องสารบรรณ (`Pending Clerk`)
   - **เจ้าหน้าที่สารบรรณ (`Clerk`)** → ตรวจสอบความถูกต้องและ **ออกเลขทะเบียนหนังสือราชการ (`Document Number` เช่น `บค 043/2569`)** เพื่อส่งต่อให้ผู้บริหาร (`Pending Approval`) หรือตีกลับให้แก้ไข (`Returned for Revision`)
   - **ผู้อนุมัติ (`Approver`)** → พิจารณาลงนาม **อนุมัติ (`Approved`)**, **ส่งกลับแก้ไข (`Returned for Revision`)**, หรือ **ไม่อนุมัติ (`Rejected`)** พร้อมบันทึกประวัติทุกขั้นตอนใน `Audit Trail`
2. **ระบบลางานออนไลน์ (`Leave Request` 2-Role Direct Workflow):**
   - วิ่งตรงจาก **`Requester` → `Approver`** โดยไม่ผ่านสารบรรณ
   - เมื่อ `Approver` กดอนุมัติ ระบบจะ **หักโควตาวันลาคงเหลือ (`Leave Balance`: ลาป่วย / ลากิจ / ลาพักร้อน)** โดยอัตโนมัติ

### B. STACK (ชุดเทคโนโลยีที่ใช้พัฒนา)
- **Frontend Framework:** Next.js (App Router) + React + TypeScript
- **UI & Styling:** Tailwind CSS + Lucide Icons + ฟอนต์ภาษาไทย `Prompt`
- **State & Persistence:** React Context State Machine + `localStorage` พร้อมปุ่ม **Role Switcher** (สลับมุมมอง 3 ตำแหน่งในคลิกเดียว) และปุ่ม **Reset ข้อมูลสาธิต**

---

## 2. วิธีเปิดใช้งาน

### วิธีที่ 1: รันผ่าน Next.js Development Server
```bash
npm install
npm run dev
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### วิธีที่ 2: เปิดไฟล์ Standalone HTML ทันที (ไม่ต้องรัน Server)
สามารถดับเบิลคลิกเปิดไฟล์ [`mockup-preview.html`](./mockup-preview.html) บนเบราว์เซอร์ได้ทันที (เหมาะสำหรับพกใส่ Flash Drive ไปเปิดนำเสนอบนเครื่องคอมพิวเตอร์ในห้องเรียนที่ไม่มี Node.js)

---

## 3. เอกสารประกอบการออกแบบ (Domain Docs & ADR)
- [`GLOSSARY.md`](./GLOSSARY.md) — นิยามคำศัพท์หลักในโดเมน E-Office (`Requester`, `Clerk`, `Approver`, `Memo`, `Document Number`, `Leave Request`, `Leave Balance`, `Inbox`, `Returned for Revision`, `Audit Trail`)
- [`docs/adr/0001-in-browser-stateful-prototype-with-role-switcher.md`](./docs/adr/0001-in-browser-stateful-prototype-with-role-switcher.md) — บันทึกการตัดสินใจทางสถาปัตยกรรมในการใช้ In-Browser State ร่วมกับ Role Switcher เพื่อใช้สาธิต Multi-Role Workflow
