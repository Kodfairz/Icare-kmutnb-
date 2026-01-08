import { Geist, Geist_Mono } from "next/font/google";
// นำเข้า font จาก Google Fonts ผ่าน next/font โดยใช้ Geist และ Geist Mono

import "./globals.css";
// นำเข้า stylesheets หลักของโปรเจกต์

import './font.css'
// นำเข้าไฟล์ css สำหรับฟอนต์เพิ่มเติม (น่าจะเป็น custom font หรือการปรับแต่งฟอนต์)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
// กำหนด font Geist แบบ Sans-serif
// กำหนด CSS variable "--font-geist-sans" สำหรับใช้งานใน style
// เลือก subset ภาษา latin

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
// กำหนด font Geist แบบ Mono (monospace)
// กำหนด CSS variable "--font-geist-mono"
// เลือก subset ภาษา latin

export const metadata = {
  title: "iCare@KMUTNB",
  icons: {
    icon: '/pharmacy.png',
  },
};
// กำหนด metadata ของแอป เช่น ชื่อหน้าเว็บ และไอคอนที่จะใช้แสดงในแท็บเบราว์เซอร์

import { ToastContainer, toast } from 'react-toastify';
// นำเข้า ToastContainer และ toast สำหรับแสดง toast notification

import { url } from "inspector";
// (อันนี้น่าจะไม่ได้ใช้และอาจลบได้) นำเข้า url จาก inspector (ไม่เกี่ยวข้องกับ UI)

export default function RootLayout({ children }) {
  // คอมโพเนนต์ RootLayout ทำหน้าที่เป็น layout หลักของแอป (ใช้ใน Next.js app directory)

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        // กำหนด class ที่ใช้ CSS variables ของฟอนต์ Geist Sans และ Mono
        // รวมถึงเปิดใช้งาน antialiasing ของฟอนต์เพื่อให้ตัวอักษรคมชัด
      >
        <ToastContainer />
        {/* ติดตั้ง ToastContainer ไว้ที่ root เพื่อแสดง toast notification */}
        
        {children}
        {/* แสดงเนื้อหาลูกที่ส่งเข้ามา (เช่น หน้าเพจ หรือคอมโพเนนต์อื่น) */}
      </body>
    </html>
  );
}
