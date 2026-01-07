"use client"; // บอก Next.js ว่าคอมโพเนนต์นี้เป็น client-side component (รันบนเบราว์เซอร์)

import { useEffect, useMemo, useState } from "react"; // React hooks พื้นฐาน
import { useRouter } from "next/navigation"; // hook สำหรับนำทางใน Next.js
import {
  useReactTable, // hook สร้างตารางแบบ reactive
  getCoreRowModel, // core row model สำหรับ react-table (แสดงผลข้อมูลพื้นฐาน)
  getPaginationRowModel, // pagination row model สำหรับจัดการแบ่งหน้า
  flexRender, // ฟังก์ชันช่วยเรนเดอร์ค่าจาก column หรือ cell
} from "@tanstack/react-table";
import Cookies from "js-cookie"; // นำเข้า js-cookie สำหรับจัดการ cookie
import axios from "axios"; // ไลบรารีสำหรับเรียก API
import { API } from "../../../../service/api"; // ตัวแปรเก็บ URL API
import { toast } from "react-toastify"; // สำหรับแจ้งเตือนข้อความบนหน้าเว็บ
import dayjs from "dayjs"; // ไลบรารีจัดการวันที่
import relativeTime from "dayjs/plugin/relativeTime"; // plugin ของ dayjs แสดงเวลาสัมพัทธ์ เช่น "3 ชั่วโมงที่แล้ว"
import "dayjs/locale/th"; // ภาษาไทยของ dayjs
import Switch from "react-switch"; // switch component สำหรับ toggle สถานะ
import { getAdminData } from "../../../../lib/getAdminData";

const VideoManagement = () => {
  const router = useRouter(); // ใช้สำหรับการนำทางภายในแอป
  dayjs.locale("th"); // ตั้ง locale ของ dayjs เป็นภาษาไทย
  dayjs.extend(relativeTime); // เพิ่ม plugin relativeTime เข้ากับ dayjs

  // สเตทเก็บรายการวิดีโอที่โหลดมา
  const [videos, setVideos] = useState([]);
  // สเตทเก็บข้อมูลแอดมิน
  const [adminData, setAdminData] = useState(null);
  // สเตทสำหรับเปิด/ปิด modal ยืนยันลบ
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // สเตทเก็บ id ของวิดีโอที่เลือกจะลบ
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลวิดีโอจาก API
  const getVideos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/video`); // เรียก API วิดีโอ
      setVideos(response.data.resultData); // เก็บข้อมูลที่ได้ลงใน state
    } catch (error) {
      console.log(error);
      // แจ้งเตือนถ้าเรียก API ไม่สำเร็จ
      toast.error(error.response?.message || "ไม่สามารถเรียกวิดีโอได้");
    }
    setIsLoading(false);
  };

  // ดึงข้อมูลโพสต์ครั้งแรกตอน component โหลด
  useEffect(() => {
    getVideos();

    const loadAdmin = async () => {
      const data = await getAdminData();
      setAdminData(data);
    };

    loadAdmin();
  }, []);

  // ฟังก์ชันลบวิดีโอโดย id
  const deleteVideo = async (id) => {
    try {
      const response = await axios.delete(`${API}/video/${id}`, {
        data: { admin_id: adminData.id } // ส่ง admin_id ไปเพื่อตรวจสอบสิทธิ์การลบ
      }); // เรียก API ลบ
      toast.success(response.data.message || "ลบวิดีโอสำเร็จ"); // แจ้งเตือนสำเร็จ
      getVideos(); // โหลดข้อมูลใหม่หลังลบเสร็จ
    } catch (error) {
      console.log(error);
      toast.error(error.response?.message || "ไม่สามารถลบวิดีโอได้"); // แจ้งเตือนถ้าเกิดข้อผิดพลาด
    }
  };

  // ฟังก์ชันเปลี่ยนสถานะวิดีโอ (active/inactive)
  const changeStatusVideo = async (id, isActive) => {
    try {
      const response = await axios.patch(`${API}/video/change-status/${id}`, {
        isActive: isActive,
        admin_id: `${JSON.parse(Cookies.get("user")).id}`
      }); // เรียก API อัปเดตสถานะ
      toast.success(response.data.message || "เปลี่ยนแปลงสถานะสำเร็จ"); // แจ้งเตือนสำเร็จ
      getVideos(); // โหลดข้อมูลใหม่หลังเปลี่ยนสถานะ
    } catch (error) {
      console.log(error);
      toast.error(error.response?.message || "ไม่สามารถเปลี่ยนแปลงสถานะได้");
    }
  };

  // เปิด modal ยืนยันการลบ และเก็บ id วิดีโอที่จะลบ
  const openConfirmModal = (id) => {
    setSelectedVideoId(id);
    setIsConfirmOpen(true);
  };

  // ปิด modal ยืนยันลบ และเคลียร์ id วิดีโอ
  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
    setSelectedVideoId(null);
  };

  // เมื่อกดปุ่มยืนยันลบ เรียกลบวิดีโอ และปิด modal
  const handleConfirmDelete = () => {
    if (selectedVideoId) {
      deleteVideo(selectedVideoId);
      closeConfirmModal();
    }
  };

  // กำหนดคอลัมน์สำหรับ react-table (ใช้ useMemo เพื่อ optimize)
  const columns = useMemo(
    () => [
      {
        header: "#", // ชื่อหัวคอลัมน์
        accessorKey: "VideoID", // คีย์ข้อมูลใน object video
      },
      {
        header: "หน้าปก",
        // ฟังก์ชันเรนเดอร์ cell ของคอลัมน์นี้ แสดงรูปหน้าปก
        cell: ({ row }) => (
          <img
            src={row.original.imagelibrary.ImageURL} // รูปภาพจากข้อมูล
            alt={row.original.imagelibrary.ImageName} // alt text
            className="w-24 rounded-2xl" // ขนาดและมุมโค้ง
          />
        ),
      },
      {
        header: "หัวข้อ",
        accessorKey: "Title", // ชื่อวิดีโอ
      },
      {
        header: "วันที่สร้าง",
        // แสดงวันที่สร้างแบบฟอร์แมต "วัน เดือน ปี"
        cell: ({ row }) => (
          <p>{dayjs(row.original.CreatedAt).format("DD MMMM YYYY")}</p>
        ),
      },
      {
        header: "อัพเดทล่าสุด",
        // แสดงเวลาที่อัปเดตล่าสุดในรูปแบบเวลาสัมพัทธ์ เช่น "3 ชั่วโมงที่แล้ว"
        cell: ({ row }) => <p>{dayjs(row.original.UpdatedAt).fromNow()}</p>
      },
      {
        header: "โดย",
        cell: ({ row }) => (
          <>
            {/* แสดงชื่อคนที่โพสต์หรือแก้ไข" */}
            <p>{row.original.admins.AdminName}</p>
          </>
        ),
      },
      {
        header: "สถานะ",
        // แสดง switch toggle สำหรับเปิด/ปิดสถานะวิดีโอ
        cell: ({ row }) => {
          const canEdit = Boolean(
            adminData && (adminData.role === "SuperAdmin" || Number(adminData.id) === Number(row.original.AdminID) )
          );

          return (
            <div className="flex items-center gap-4">
              <Switch
                checked={row.original.isActive} // สถานะเปิด/ปิด
                onChange={() =>
                  changeStatusVideo(row.original.VideoArticleID, !row.original.isActive) // เปลี่ยนสถานะเมื่อสวิตช์ถูกคลิก
                }
                disabled={!canEdit}
                offColor="#888" // สี background เมื่อปิด
                onColor="#4CAF50" // สี background เมื่อเปิด (เขียว)
                offHandleColor="#FFF" // สีปุ่มสวิตช์เมื่อปิด
                onHandleColor="#FFF" // สีปุ่มสวิตช์เมื่อเปิด
                height={30}
                width={60}
              />
            </div>
          );
        },
      },
      {
        header: "จัดการ",
        id: "actions",
        // ปุ่มแก้ไขและลบวิดีโอ
        cell: ({ row }) => {
          const canEdit = Boolean(
            adminData && (adminData?.role === "SuperAdmin" || Number(adminData?.id) === Number(row.original.AdminID))
          );

          return (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/edit-video/${row.original.VideoArticleID}`) // นำทางไปหน้าจอแก้ไขวิดีโอ
                }
                disabled={!canEdit}
                className={`px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 ${!canEdit ? "opacity-50 pointer-events-none" : ""}`}
              >
                แก้ไข
              </button>
              <button
                onClick={() => openConfirmModal(row.original.VideoArticleID)} // เปิด modal ยืนยันลบ
                disabled={!canEdit}
                className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 ${!canEdit ? "opacity-50 pointer-events-none" : ""}`}
              >
                ลบ
              </button>
            </div>
          );
        },
      },
    ],
    [router, adminData]
  );

  // สร้างตารางด้วย react-table โดยส่งข้อมูลและคอลัมน์เข้าไป
  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(), // ใช้ row model พื้นฐาน
    getPaginationRowModel: getPaginationRowModel(), // ใช้ pagination
    initialState: { pagination: { pageSize: 10 } }, // กำหนดจำนวนแถวต่อหน้าเริ่มต้น
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
      {/* หัวเรื่องหน้าจอ */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        จัดการวิดีโอ
      </h2>

      {/* ปุ่มเพิ่มวิดีโอ นำทางไปหน้าสร้างวิดีโอใหม่ */}
      <button
        onClick={() => router.push("/admin/dashboard/add-video")}
        className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105 mb-6"
      >
        + เพิ่มวิดีโอ
      </button>

      {/* ตารางแสดงวิดีโอ มีการจัดการ overflow และกรอบ */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-600 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 text-left font-semibold text-sm uppercase tracking-wider"
                  >
                    {/* เรนเดอร์หัวคอลัมน์ */}
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-indigo-50 transition-all duration-200"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 text-gray-700">
                    {/* เรนเดอร์ข้อมูลแต่ละเซลล์ */}
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ตัวควบคุม Pagination */}
      <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
        <button
          onClick={() => table.previousPage()} // ปุ่มย้อนกลับหน้า
          disabled={!table.getCanPreviousPage()} // ปิดปุ่มถ้าไม่มีหน้าให้ย้อนกลับ
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
        >
          Previous
        </button>
        <span className="text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} {/* แสดงเลขหน้าปัจจุบัน และจำนวนหน้าทั้งหมด */}
        </span>
        <button
          onClick={() => table.nextPage()} // ปุ่มไปหน้าถัดไป
          disabled={!table.getCanNextPage()} // ปิดปุ่มถ้าไม่มีหน้าถัดไป
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
        >
          Next
        </button>
      </div>

      {/* Modal ยืนยันลบวิดีโอ */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              ยืนยันการลบวิดีโอ
            </h3>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบวิดีโอนี้?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeConfirmModal} // ปิด modal ยืนยันลบ
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete} // ยืนยันลบและลบวิดีโอ
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;
