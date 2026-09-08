# Ezpark: Smart Parking

สร้าง Web Application ชื่อ “Ezpark.com” ระบบค้นหาและจัดการพื้นที่จอดรถสำหรับนักศึกษาคณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่น

1. Concept

Ezpark.com มีเป้าหมายเพื่อช่วยให้นักศึกษาสามารถค้นหาที่จอดรถได้สะดวก รวดเร็ว และตรวจสอบจำนวนพื้นที่ว่างแบบ Real-time พร้อมช่วยบริหารจัดการพื้นที่จอดรถภายในคณะ

ปัญหาหลัก:

นักศึกษาไม่สามารถรู้ได้ว่ามีที่จอดรถว่างตรงไหน

เสียเวลาในการวนหาที่จอด

ไม่สามารถดูจำนวนที่จอดว่างของแต่ละ Zone ได้

ไม่มีข้อมูลสถิติช่วงเวลาที่มีรถเข้าจอดมากที่สุด

กลุ่มผู้ใช้งานหลัก:

นักศึกษาคณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่น



2. Design System

ออกแบบเป็น Modern Dashboard UI / Minimal UI

Color:

Primary: Green #16A34A

Dark Green: #15803D

Light Green: #DCFCE7

Background: #F8FAFC

White: #FFFFFF

Text: #1F2937

Gray: #64748B

Danger: #EF4444

Warning: #F59E0B

Design:

Clean

Minimal

Modern

Professional

ใช้งานง่าย

Rounded corners

Soft shadows

Material Design Icons

Responsive Design

รองรับ Desktop, Tablet และ Mobile

Font:

ใช้ Prompt หรือ Kanit

ภาษาไทยต้องอ่านง่าย



3. Authentication / Login

สร้างหน้า Login

องค์ประกอบ:

Logo Ezpark.com

Icon รูปตัว P / Parking

ชื่อ Ezpark.com

Subtitle:
“ระบบค้นหาที่จอดรถ คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่น”

Form:

Username

Password

Checkbox “จดจำฉัน”

ปุ่ม “เข้าสู่ระบบ”

Link “ลืมรหัสผ่าน?”

Link “ลงทะเบียน”

ด้านหลัง Login ให้ใช้ภาพหรือ Illustration ที่สื่อถึงลานจอดรถมหาวิทยาลัย

เมื่อ Login สำเร็จ:
→ ไปหน้า Dashboard



4. Dashboard

สร้างหน้า Dashboard เป็นหน้าหลัก

ด้านบนมี Navbar:

Ezpark.com Logo

Dashboard

Check In

Check Out

Statistics

Profile

Notification

User Profile

หน้า Dashboard แสดง:

Welcome Card

ข้อความ:

“สวัสดี, นักศึกษา 👋”

“ยินดีต้อนรับเข้าสู่ Ezpark.com”



Available Parking

แสดงจำนวนพื้นที่ว่างทั้งหมดแบบ Real-time

ตัวอย่าง:

“พื้นที่จอดรถว่างทั้งหมด”

15 ช่อง

“จากทั้งหมด 60 ช่อง”

ใช้ Green Card และ Icon รถยนต์



5. Parking Zone Map

สร้าง Parking Map สำหรับแสดงพื้นที่จอดรถ

แบ่ง Zone:

Zone A

ว่าง 12 ช่อง

สีเขียว

Zone B

เหลือ 3 ช่อง

สีเหลือง

Zone C

เต็ม

สีแดง

Zone D

ว่าง 5 ช่อง

สีเขียว

เมื่อกดแต่ละ Zone ให้แสดงรายละเอียด:

จำนวนที่จอดทั้งหมด

จำนวนที่ว่าง

จำนวนที่ถูกใช้งาน

Occupancy %

สถานะ Zone

ตัวอย่าง:

Zone A
Total: 20
Available: 12
Occupied: 8
Occupancy: 40%



6. Zone Status Cards

สร้าง Card สำหรับแต่ละ Zone

ตัวอย่าง:

🟢 Zone A
ว่าง 12 ช่อง
จากทั้งหมด 20 ช่อง

🟡 Zone B
เหลือ 3 ช่อง
จากทั้งหมด 15 ช่อง

🔴 Zone C
เต็ม
0 ช่องว่าง

🟢 Zone D
ว่าง 5 ช่อง
จากทั้งหมด 10 ช่อง

ใช้สีตามสถานะ:

Available → Green
Almost Full → Yellow
Full → Red



7. Check In

สร้างหน้า Check In

Form:

ชื่อผู้ใช้

Input

ประเภทรถ

รถจักรยานยนต์

รถยนต์

เลือก Zone

Zone A

Zone B

Zone C

Zone D

ปุ่ม:

“Check In”



Check In Logic

เมื่อผู้ใช้เลือก Zone และกด Check In:

ตรวจสอบจำนวนพื้นที่ว่างของ Zone แบบ Real-time

กรณีมีที่ว่าง

แสดง Success Modal:

✅ Check In สำเร็จ

รายละเอียด:

Zone C
ช่อง C-15

เวลาเข้า:
10:35 น.

บันทึกข้อมูล Check In ลง Database

ข้อมูลที่บันทึก:

User ID

Username

Vehicle Type

Zone

Parking Slot

Check In Time

Status = PARKED



กรณี Zone เต็ม

แสดง Error Modal:

❌ พื้นที่จอดเต็ม

“ขออภัย Zone C เต็มแล้ว”

แนะนำ Zone อื่น:

Zone B
ว่าง 8 ช่อง

Zone D
ว่าง 5 ช่อง

ให้ผู้ใช้สามารถกด Zone ที่แนะนำเพื่อเปลี่ยน Zone ได้ทันที



8. Parking Slot

แต่ละ Zone ต้องสามารถแสดงช่องจอดได้

ตัวอย่าง:

Zone A

A01 🟢 Available
A02 🟢 Available
A03 🔴 Occupied
A04 🟢 Available

สี:

Available = Green

Occupied = Red

เมื่อ Check In สำเร็จ ระบบต้องเลือกช่องจอดว่างให้ผู้ใช้อัตโนมัติ

เช่น:

Zone A → A05



9. Check Out

สร้างหน้า Check Out

แสดงข้อมูลการจอดปัจจุบันของผู้ใช้:

Zone A
Parking Slot A05
Vehicle: Motorcycle

Check In:
08:45

มีปุ่ม:

“Check Out”

เมื่อกด:

บันทึก Check Out Time

เปลี่ยน Status:
PARKED → COMPLETED

และคืน Parking Slot:

Occupied → Available

จากนั้น Update จำนวนพื้นที่ว่างแบบ Real-time

แสดง:

✅ Check Out สำเร็จ

เวลาออก:
12:30

ระยะเวลาจอด:
3 ชั่วโมง 45 นาที



10. Statistics Dashboard

สร้างหน้า Statistics

ใช้ Chart.js หรือ Recharts

แสดง:

Bar Chart

“จำนวนรถที่เข้าจอดตามช่วงเวลา”

ตัวอย่าง:

06:00
08:00
10:00
12:00
14:00
16:00
18:00
20:00

ให้เห็นช่วงเวลาที่มีรถเข้าจอดมากที่สุด



Pie / Donut Chart

“สัดส่วนการใช้งานแต่ละ Zone”

ตัวอย่าง:

Zone A 35%
Zone B 25%
Zone C 30%
Zone D 10%



Heatmap

สร้าง Heatmap:

Rows:

Zone A

Zone B

Zone C

Zone D

Columns:

06:00

08:00

10:00

12:00

14:00

16:00

18:00

20:00

สีอ่อน = ใช้น้อย
สีเข้ม = ใช้มาก



11. Parking Summary

สร้างตาราง:

Zone

Total

Available

Occupied

Occupancy

Zone A

20

12

8

40%

Zone B

15

3

12

80%

Zone C

15

0

15

100%

Zone D

10

5

5

50%



12. Peak Time Analysis

แสดงข้อมูล:

🔴 ช่วงเวลาที่คนจอดมากที่สุด
08:00 - 10:00

🟡 ช่วงเวลาปานกลาง
10:00 - 16:00

🟢 ช่วงเวลาน้อยที่สุด
00:00 - 06:00 และ 20:00 - 24:00



13. Parking Prediction

เพิ่มระบบคาดการณ์จำนวนที่จอดรถว่าง

แสดง Card:

“คาดการณ์พื้นที่ว่าง”

ตัวอย่าง:

คาดว่าเวลา 14:00
จะมีพื้นที่ว่างประมาณ

18 ช่อง

ใช้ข้อมูลย้อนหลังจาก Statistics เพื่อสร้าง Prediction

ถ้ายังไม่มีข้อมูลจริง ให้ใช้ Mock Data แต่โครงสร้างระบบต้องสามารถเปลี่ยนไปใช้ข้อมูลจริงในอนาคตได้



14. Real-time Parking

Dashboard ต้อง Update จำนวนช่องจอดแบบ Real-time

ตัวอย่าง:

Zone A
12 → 11 ช่อง

เมื่อมี User Check In

และ

11 → 12 ช่อง

เมื่อ User Check Out

ห้ามต้อง Refresh หน้าเว็บเอง

ใช้ Supabase Realtime หรือระบบ Real-time ที่เหมาะสม



15. Notification

สร้างระบบ Notification

แจ้งเตือนทุก 2 ชั่วโมง

ตัวอย่าง:

🔔 Parking Update

“ขณะนี้มีพื้นที่จอดรถว่าง 15 ช่อง”

หรือ

“Zone C เต็มแล้ว ระบบแนะนำให้ใช้ Zone B”

Notification ต้องแสดงใน Notification Bell ด้านบน



16. User Profile

สร้างหน้า Profile

แสดง:

ชื่อผู้ใช้
Username
ประเภทผู้ใช้งาน
Vehicle
ประวัติการจอด

สามารถแก้ไข:

ชื่อ

Vehicle Type

Password



17. Parking History

สร้างตารางประวัติ:

Date
Zone
Parking Slot
Vehicle
Check In
Check Out
Duration

ตัวอย่าง:

08/08/2026
Zone A
A05
Motorcycle
08:45
12:30
3h 45m



18. Database

ใช้ Supabase

สร้าง Database Structure อย่างน้อย:

users

id

username

password/auth

name

role

created_at

parking_zones

id

zone_name

total_slots

available_slots

status

parking_slots

id

zone_id

slot_number

status

parking_sessions

id

user_id

zone_id

slot_id

vehicle_type

check_in_time

check_out_time

status

notifications

id

user_id

title

message

created_at

read



19. User Flow

ระบบต้องทำงานตาม Flow:

Login
↓
Dashboard
↓
เลือก Zone
↓
Check In
↓
ตรวจสอบพื้นที่ว่าง
↓
มีที่ว่าง?
├── YES → Assign Parking Slot → Check In สำเร็จ
│
└── NO → แสดง “พื้นที่จอดเต็ม”
↓
แนะนำ Zone อื่น
↓
User เลือก Zone ใหม่

เมื่อจอดเสร็จ:

Dashboard
↓
Check Out
↓
บันทึกเวลาออก
↓
คืน Parking Slot
↓
Update Available Space
↓
Statistics Update



20. Responsive Design

Desktop:

Sidebar/Navbar

Dashboard Cards

Charts

Parking Map

Mobile:

Bottom Navigation หรือ Hamburger Menu

Cards เรียงเป็นแนวตั้ง

Charts Responsive

Check In Form ใช้งานง่ายบนมือถือ

ต้องรองรับหน้าจอ:

Desktop

Tablet

Mobile



21. Important UI Requirements

อย่าทำให้เว็บไซต์ดูเหมือน Admin Dashboard ที่ซับซ้อนเกินไป

ต้องเน้น:

Simple + Modern + Clean + Easy to Use

ผู้ใช้ควรสามารถเปิดเว็บไซต์แล้วรู้ทันทีว่า:

ตอนนี้มีที่จอดว่างกี่ช่อง

Zone ไหนว่าง

Zone ไหนเต็ม

ควรไปจอด Zone ไหน

สามารถ Check In ได้ทันที

ใช้ Animation เล็กน้อย เช่น:

Card hover

Modal animation

Loading state

Success animation

Real-time number update

อย่าใช้ Animation เยอะจนรบกวนการใช้งาน



22. Demo Data

สำหรับ Demo ให้สร้างข้อมูลตัวอย่าง:

Zone A:
20 ช่อง
ว่าง 12

Zone B:
15 ช่อง
ว่าง 3

Zone C:
15 ช่อง
ว่าง 0

Zone D:
10 ช่อง
ว่าง 5

รวม:
60 ช่อง

ว่าง:
20 ช่อง

สร้าง Mock Users และ Parking Sessions เพื่อให้ Dashboard, Statistics และ Charts มีข้อมูลแสดงผลทันที



23. Final Requirement

สร้างเป็น Full Functional Web Application

ไม่ใช่แค่ Static Mockup

ต้องสามารถ:

Login

Dashboard

Check In

Check Out

เลือก Zone

Assign Parking Slot

ตรวจสอบพื้นที่ว่าง

แนะนำ Zone อื่นเมื่อเต็ม

Update จำนวนที่จอด

บันทึก Check In / Check Out

ดู Parking History

ดู Statistics

แสดง Charts

แสดง Heatmap

Prediction

Notification

Responsive Mobile UI

หากส่วนใดต้องใช้ Backend ให้สร้างด้วย Supabase และเตรียม Database Schema / RLS / Realtime ให้พร้อมใช้งาน

ก่อนเริ่มเขียนโค้ด ให้สร้างโครงสร้างหน้าและ Component ให้เป็นระบบ และใช้ Component ซ้ำสำหรับ Zone Card, Parking Slot, Statistics Card, Modal และ Chart

เป้าหมายสุดท้าย: Ezpark.com ต้องดูเหมือนเว็บไซต์จริงที่สามารถนำไป Demo ให้กับอาจารย์หรือใช้เป็นต้นแบบระบบจริงของคณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยขอนแก่นได้

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ezpark-khon-kaen.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/278c2b7a-86db-4101-9098-f22868574f9d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
