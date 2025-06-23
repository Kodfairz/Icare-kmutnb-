"use client";
// ประกาศว่าไฟล์นี้เป็น Client Component ของ Next.js

import { useEffect, useMemo, useState } from "react";
// นำเข้า React hooks ที่ใช้ใน component

import { useParams, useRouter } from "next/navigation";
// นำเข้า useRouter เพื่อใช้สำหรับการนำทางเปลี่ยนหน้าใน Next.js

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
// นำเข้า React Table API สำหรับสร้างตารางแบบยืดหยุ่นและรองรับ pagination

import axios from "axios";
// นำเข้า axios สำหรับเรียก API

import { API } from "../../../../../service/api";
// นำเข้าค่าฐาน URL API ที่กำหนดไว้ในโปรเจกต์

import { toast } from "react-toastify";
// นำเข้า toast สำหรับแสดงข้อความแจ้งเตือนสถานะต่าง ๆ

import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");

export default function ArticleEdit() {
  const { id } = useParams();
  const router = useRouter();
  // ใช้สำหรับเปลี่ยนหน้า

  const [historys, setHistorys] = useState([]);
  // สถานะเก็บข้อมูลข้อมูลยาที่ดึงมาจาก API

  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลข้อมูลยาจาก API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/posts/history/${id}`);
      setHistorys(response.data.resultData); // เก็บข้อมูลข้อมูลยาลง state
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
    }
    setIsLoading(false);
  };

  // ดึงข้อมูลข้อมูลยาครั้งแรกตอน component โหลด
  useEffect(() => {
    fetchData();
  }, []);

  // กำหนดคอลัมน์สำหรับตาราง โดยใช้ useMemo เพื่อประสิทธิภาพไม่ให้สร้างใหม่ทุกครั้งที่ render
  const columns = useMemo(
    () => [
      {
        header: "ID",
        accessorKey: "EditID", // แสดง id ของข้อมูลยา
      },
      {
        header: "วันที่แก้ไข",
        cell: ({ row }) => {
          const formattedDate = dayjs(row.original.EditDate)
            .locale("th")
            .format("D MMMM YYYY H:mm");
          return <>{formattedDate}</>;
        },
      },
      {
        header: "คำอธิบายการแก้ไข",
        cell: ({ row }) => <>{row.original.EditDescription}</>, // แสดง id ของข้อมูลยา
      },
    ],
    [router]
  );

  // สร้าง instance ของ React Table โดยกำหนดข้อมูลและคอลัมน์ พร้อมเปิดใช้งาน pagination
  const table = useReactTable({
    data: historys,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }, // แสดง 10 แถวต่อหน้า
  });

  // ถ้ายังโหลดข้อมูลอยู่ แสดง UI สำหรับ loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600 text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        ประวัติการแก้ไข
      </h2>

      {/* ตารางแสดงรายการข้อมูลยา */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-600 text-white">
            {/* สร้างหัวตาราง */}
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 text-left font-semibold text-sm uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-200">
            {/* แสดงข้อมูลแต่ละแถวในตาราง */}
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-indigo-50 transition-all duration-200"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* แถบควบคุมการแบ่งหน้า */}
      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}
