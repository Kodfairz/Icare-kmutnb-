"use client"; 
// ประกาศว่าไฟล์นี้เป็น Client Component ของ Next.js

import { useEffect, useMemo, useState } from "react";
// นำเข้า React hooks ที่ใช้ใน component

import { useRouter } from "next/navigation";
// นำเข้า useRouter เพื่อใช้สำหรับการนำทางเปลี่ยนหน้าใน Next.js

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
// นำเข้า React Table API สำหรับสร้างตารางแบบยืดหยุ่นและรองรับ pagination

import Cookies from "js-cookie";
// นำเข้า js-cookie สำหรับจัดการ cookie

import axios from "axios";
// นำเข้า axios สำหรับเรียก API

import { API } from "../../../../service/api";
// นำเข้าค่าฐาน URL API ที่กำหนดไว้ในโปรเจกต์

import { toast } from "react-toastify";
// นำเข้า toast สำหรับแสดงข้อความแจ้งเตือนสถานะต่าง ๆ

import dayjs from 'dayjs';
// นำเข้า dayjs สำหรับจัดการวันที่และเวลา

import relativeTime from "dayjs/plugin/relativeTime";
// นำเข้า plugin สำหรับแสดงเวลาที่ผ่านมาในรูปแบบ relative เช่น "2 ชั่วโมงที่แล้ว"

import "dayjs/locale/th"; // ต้องมีการ import locale ของไทยก่อน
// นำเข้า locale ภาษาไทยของ dayjs

import Switch from "react-switch"; // นำเข้าคอมโพเนนต์ switch
// นำเข้า Switch component สำหรับสวิตช์เปิด/ปิด

import ModalConfirm from "../../../ModalConfirm";  // เพิ่ม import ModalConfirm
import { getAdminData } from "../../../../lib/getAdminData";
// นำเข้า ModalConfirm สำหรับ modal ยืนยันการลบข้อมูล

export default function BlogManagement() {
  dayjs.locale("th"); // ตั้งค่า locale เป็นภาษาไทยสำหรับ dayjs
  dayjs.extend(relativeTime); // เพิ่ม plugin relativeTime ให้ dayjs ใช้งานได้

  const router = useRouter();
  // ใช้สำหรับเปลี่ยนหน้า

  const [userId, setUserId] = useState(null);
  // สถานะเก็บ id ของผู้ใช้ที่ล็อกอินอยู่

  const [adminData, setAdminData] = useState(null);

  const [posts, setPosts] = useState([]);
  // สถานะเก็บข้อมูลโพสต์ที่ดึงมาจาก API

  const [isModalOpen, setIsModalOpen] = useState(false);
  // สถานะควบคุมการเปิด/ปิด modal ยืนยันการลบ

  const [isLoading, setIsLoading] = useState(true);

  // เก็บ id ของโพสต์ที่ต้องการลบ
  const [postIdToDelete, setPostIdToDelete] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      setIsLoading(true);
      const cookie = Cookies.get("user");

      if (cookie) {
        try {
          const parsed = JSON.parse(cookie);
          setUserId(parsed.id);
        } catch (e) {
          console.error("Error parsing cookie:", e);
          toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
        }
      } else {
        toast.error("ไม่พบข้อมูลผู้ใช้ใน cookie");
      }
      setIsLoading(false);
    };

    fetchUserId();

    const loadAdmin = async () => {
      const data = await getAdminData();
      setAdminData(data);
    };

    loadAdmin();
  }, []);

  // ฟังก์ชันดึงข้อมูลโพสต์จาก API
  const getPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/posts/admin`);
      setPosts(response.data.resultData); // เก็บข้อมูลโพสต์ลง state
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
    }
    setIsLoading(false);
  };

  // ดึงข้อมูลโพสต์ครั้งแรกตอน component โหลด
  useEffect(() => {
    getPosts();

    const loadAdmin = async () => {
      const data = await getAdminData();
      setAdminData(data);
    };

    loadAdmin();
  }, []);

  // ฟังก์ชันเปลี่ยนสถานะเปิด/ปิดโพสต์ (isActive)
  const changeStatus = async (id, status) => {
    try {
      const response = await axios.patch(`${API}/posts/change-status/${id}`, {
        isActive: status,
        admin_id: Number(adminData.id)
      });

      toast.success(response.data.message || "เปลี่ยนสถานะสำเร็จแล้ว");
      getPosts(); // ดึงข้อมูลใหม่มาอัปเดตหลังเปลี่ยนสถานะ
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  // ฟังก์ชันลบโพสต์ตาม id ที่เลือกไว้
  const deletePost = async () => {
    try {
      const response = await axios.delete(`${API}/posts/${postIdToDelete}`, {
        data: { admin_id: adminData.id } // ส่ง admin_id ไปเพื่อตรวจสอบสิทธิ์การลบ
      });
      toast.success(response.data.message || "ลบข้อมูลสำเร็จแล้ว");
      getPosts(); // ดึงข้อมูลใหม่หลังลบเสร็จ
      setIsModalOpen(false); // ปิด modal confirm
      setPostIdToDelete(null); // ล้างค่า id ที่จะลบ
    } catch (error) {
      if (error.response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ในการลบโพสต์นี้");
        return;
      }

      toast.error(error.response.message || "ไม่สามารถลบข้อมูลได้");
      console.log(error);
    }
  };

  // กำหนดคอลัมน์สำหรับตาราง โดยใช้ useMemo เพื่อประสิทธิภาพไม่ให้สร้างใหม่ทุกครั้งที่ render
  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "HealthArticleID", // แสดง id ของโพสต์
      },
      {
        header: "หน้าปก",
        cell: ({ row }) => (
          <>
            {/* แสดงรูปหน้าปกโพสต์ */}
            <img
              src={row.original.imagelibrary.ImageURL}
              alt={row.original.imagelibrary.ImageName}
              className="w-24 rounded-2xl"
            />
          </>
        ),
      },
      {
        header: "หัวข้อ",
        cell: ({ row }) => (
          <>
            {row.original.diseases.DiseaseName}
          </>
        ),
      },
      {
        header: "ประเภทข้อมูล",
        cell: ({ row }) => (
          <>
            {/* แสดงชื่อประเภทข้อมูลในรูปแบบ badge สีเขียว */}
            <p className="bg-green-500 text-white p-2 rounded-full text-center font-semibold shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              {row.original.diseases.categories.CategoryName}
            </p>
          </>
        ),
      },
      {
        header: "วันที่สร้าง",
        cell: ({ row }) => (
          <>
            {/* แสดงวันที่สร้างในรูปแบบวันที่เต็ม (เช่น 15 พฤษภาคม 2568) */}
            <p>{dayjs(row.original.Created_At).format("DD MMMM YYYY")}</p>
          </>
        ),
      },
      {
        header: "อัพเดทล่าสุด",
        cell: ({ row }) => {
          const editDate = row.original.articleedits?.[0]?.EditDate;
          return <p>{editDate ? dayjs(editDate).fromNow() : "ไม่มีข้อมูล"}</p>;
        }
      },
      {
        header: "โพสต์โดย",
        cell: ({ row }) => (
          <>
            {/* แสดงชื่อคนที่โพสต์" */}
            <p>{row.original.admins.AdminName}</p>
          </>
        ),
      },
      {
        header: "สถานะ",
        cell: ({ row }) => {
            const canEdit = Boolean(
              adminData && (adminData.role === "SuperAdmin" || (Number(adminData.id) === Number(row.original.AdminID)))
            )

            return (
              <div className="flex items-center gap-4">
                {/* สวิตช์เปิด/ปิดสถานะโพสต์ */}
                <Switch
                  checked={row.original.isActive}
                  onChange={() =>
                    changeStatus(row.original.HealthArticleID, !row.original.isActive)
                  }
                  disabled={!canEdit}
                  offColor="#888"
                  onColor="#4CAF50"
                  offHandleColor="#FFF"
                  onHandleColor="#FFF"
                  height={30}
                  width={60}
                />
              </div>
            );
        },
      },
      {
        header: "จัดการ",
        cell: ({ row }) => {
          const canEdit = Boolean(
            adminData && (adminData.role === "SuperAdmin" || (Number(adminData.id) === Number(row.original.AdminID)))
          )

          return (
            <div className="flex gap-2">
              {/* ปุ่มดูข้อมูล */}
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/medic-treatment/${row.original.diseases.DiseaseID}`)
                }
                className="px-4 py-2 rounded-lg text-white bg-sky-500 hover:bg-sky-600"
              >
                ดูข้อมูลยา/รักษา
              </button>
              
              {/* ปุ่มแก้ไข */}
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/edit-post/${row.original.HealthArticleID}`)
                }
                disabled={!canEdit}
                className={`px-4 py-2 rounded-lg text-white bg-orange-500 hover:bg-orange-600 ${
                  !canEdit
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                แก้ไข
              </button>

              {/* ปุ่มลบ */}
              <button
                onClick={() => {
                  setPostIdToDelete(row.original.HealthArticleID);
                  setIsModalOpen(true);
                }}
                disabled={!canEdit}
                className={`px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 ${
                  !canEdit
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                ลบ
              </button>

              {/* ปุ่มประวัติ */}
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/articles-edit/${row.original.HealthArticleID}`)
                }
                className="px-4 py-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600"
              >
                ประวัติ
              </button>
            </div>
          );
        },
      },
    ],
    [router, userId]
  );

  // สร้าง instance ของ React Table โดยกำหนดข้อมูลและคอลัมน์ พร้อมเปิดใช้งาน pagination
  const table = useReactTable({
    data: posts,
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
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        จัดการข่าวสาร
      </h2>

      {/* ปุ่มเพิ่มโพสต์ เปลี่ยนหน้าไปยังฟอร์มเพิ่มโพสต์ */}
      <button
        onClick={() => router.push("/admin/dashboard/add-post")}
        className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105 mb-6"
      >
        + เพิ่มข้อมูล
      </button>

      {/* ตารางแสดงรายการโพสต์ */}
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

      {/* Modal Confirm สำหรับยืนยันการลบโพสต์ */}
      {isModalOpen && (
        <ModalConfirm
          isOpen={isModalOpen}
          title="ยืนยันการลบโพสต์"
          message="คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้? การลบไม่สามารถย้อนกลับได้"
          onConfirm={deletePost}
          onCancel={() => setIsModalOpen(false)}
          confirmText="ลบ"
          cancelText="ยกเลิก"
        />
      )}
    </div>
  );
}
