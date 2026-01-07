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

import Cookies from "js-cookie";
// นำเข้า js-cookie สำหรับจัดการ cookie

import axios from "axios";
// นำเข้า axios สำหรับเรียก API

import { API } from "../../../../../service/api";
// นำเข้าค่าฐาน URL API ที่กำหนดไว้ในโปรเจกต์

import { toast } from "react-toastify";
// นำเข้า toast สำหรับแสดงข้อความแจ้งเตือนสถานะต่าง ๆ

import ModalConfirm from "../../../../../components/ModalConfirm";  // เพิ่ม import ModalConfirm
import { getAdminData } from "../../../../../lib/getAdminData";
// นำเข้า ModalConfirm สำหรับ modal ยืนยันการลบข้อมูล

export default function Medic_Treatment() {
  const { id } = useParams();
  const router = useRouter();
  // ใช้สำหรับเปลี่ยนหน้า

  const [adminData, setAdminData] = useState(null);
  // สถานะเก็บข้อมูลผู้ดูแลระบบที่ล็อกอินอยู่

  const [disease, setDisease] = useState([]);
  // สถานะเก็บข้อมูลข้อมูลยาที่ดึงมาจาก API

  const [medics, setMedics] = useState([]);
  // สถานะเก็บข้อมูลข้อมูลยาที่ดึงมาจาก API

  const [treatments, setTreatments] = useState([]);
  // สถานะเก็บข้อมูลการรักษาที่ดึงมาจาก API

  const [activeTab, setActiveTab] = useState('medications');
  // state สำหรับจัดการ active tab

  const [isModalMedicOpen, setIsModalMedicOpen] = useState(false);
  // สถานะควบคุมการเปิด/ปิด modal ยืนยันการลบ

  const [isModalTreatmentOpen, setIsModalTreatmentOpen] = useState(false);
  // สถานะควบคุมการเปิด/ปิด modal ยืนยันการลบ

  const [isLoading, setIsLoading] = useState(true);

  const [medicIdToDelete, setMedicIdToDelete] = useState(null);
  // เก็บ id ของข้อมูลยาที่ต้องการลบ

  const [treatmentIdToDelete, setTreatmentIdToDelete] = useState(null);
  // เก็บ id ของข้อมูลการรักษาที่ต้องการลบ

  useEffect(() => {
    const loadAdmin = async () => {
      const data = await getAdminData();
      setAdminData(data);
    };

    loadAdmin();
  }, []);

  // ฟังก์ชันดึงข้อมูลข้อมูลยาจาก API
  const getDisease = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/posts/${id}`);
      setDisease(response.data.resultData); // เก็บข้อมูลข้อมูลยาลง state
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
    }
    setIsLoading(false);
  };

  // ฟังก์ชันดึงข้อมูลข้อมูลยาจาก API
  const getMedics = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/medics/diseases/${id}`);
      setMedics(response.data.resultData); // เก็บข้อมูลข้อมูลยาลง state
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
    }
    setIsLoading(false);
  };

  // ฟังก์ชันดึงข้อมูลข้อมูลยาจาก API
  const getTreatments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/treatments/diseases/${id}`);
      setTreatments(response.data.resultData); // เก็บข้อมูลข้อมูลยาลง state
    } catch (error) {
      console.log(error);
      toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
    }
    setIsLoading(false);
  };

  // ดึงข้อมูลข้อมูลยาครั้งแรกตอน component โหลด
  useEffect(() => {
      getDisease();
      getMedics();
      getTreatments();
  }, []);

  // ฟังก์ชันลบข้อมูลยาตาม id ที่เลือกไว้
  const deleteMedic = async () => {
    try {
      const response = await axios.delete(`${API}/medics/${medicIdToDelete}`, {
        data: { admin_id: adminData.id } // ส่ง admin_id ไปเพื่อตรวจสอบสิทธิ์การลบ
      });
      toast.success(response.data.message || "ลบข้อมูลสำเร็จแล้ว");
      getMedics(); // ดึงข้อมูลใหม่หลังลบเสร็จ
      setIsModalMedicOpen(false); // ปิด modal confirm
      setMedicIdToDelete(null); // ล้างค่า id ที่จะลบ
    } catch (error) {
      if (error.response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ในการลบข้อมูลยานี้");
        return;
      }

      toast.error(error.response.message || "ไม่สามารถลบข้อมูลได้");
      console.log(error);
    }
  };

  // ฟังก์ชันลบข้อมูลยาตาม id ที่เลือกไว้
  const deleteTreatment = async () => {
    try {
      const response = await axios.delete(`${API}/treatments/${treatmentIdToDelete}`, {
        data: { admin_id: adminData.id } // ส่ง admin_id ไปเพื่อตรวจสอบสิทธิ์การลบ
      });
      toast.success(response.data.message || "ลบข้อมูลสำเร็จแล้ว");
      getTreatments(); // ดึงข้อมูลใหม่หลังลบเสร็จ
      setIsModalTreatmentOpen(false); // ปิด modal confirm
      setTreatmentIdToDelete(null); // ล้างค่า id ที่จะลบ
    } catch (error) {
      if (error.response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ในการลบข้อมูลการรักษานี้");
        return;
      }

      toast.error(error.response.message || "ไม่สามารถลบข้อมูลได้");
      console.log(error);
    }
  };

  const canEdit = Boolean(
    adminData && (adminData.role === "SuperAdmin" || Number(adminData.id) === Number(disease.AdminID))
  )

  // กำหนดคอลัมน์สำหรับตาราง โดยใช้ useMemo เพื่อประสิทธิภาพไม่ให้สร้างใหม่ทุกครั้งที่ render
  const columnsMedications = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "MedicationID", // แสดง id ของข้อมูลยา
      },
      {
        header: "ชื่อยา",
        cell: ({ row }) => (
          <>
            {row.original.medications.MedicationName}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "ชื่อสามัญ",
        cell: ({ row }) => (
          <>
            {row.original.medications.GenericName}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "รูปแบบยา",
        cell: ({ row }) => (
          <>
            {row.original.medications.DosageForm}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "ความแรงของยา",
        cell: ({ row }) => (
          <>
            {row.original.medications.Strength}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "ข้อบ่งใช้",
        cell: ({ row }) => (
          <>
            {row.original.medications.Indications}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "ผลข้างเคียง",
        cell: ({ row }) => (
          <>
            {row.original.medications.SideEffects}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "ข้อห้ามใช้",
        cell: ({ row }) => (
          <>
            {row.original.medications.Contraindications}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "อาการสำหรับผู้ที่แพ้ยา",
        cell: ({ row }) => (
          <>
            {row.original.medications.SymptomsDrugAllergies}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "วิธีการรักษาอาการแพ้ยา",
        cell: ({ row }) => (
          <>
            {row.original.medications.TreatDrugAllergies}
          </>
        ), // แสดง id ของข้อมูลยา
      },
      {
        header: "จัดการ",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              {/* ปุ่มแก้ไข */}
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/edit-medication/${row.original.MedicationID}`)
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
                  setMedicIdToDelete(row.original.MedicationID);
                  setIsModalMedicOpen(true);
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
            </div>
          );
        },
      },
    ],
    [router, adminData, canEdit]
  );

  // กำหนดคอลัมน์สำหรับตาราง โดยใช้ useMemo เพื่อประสิทธิภาพไม่ให้สร้างใหม่ทุกครั้งที่ render
  const columnsTreatments = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "TreatmentID", // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "ชื่อวิธีการรักษา",
        cell: ({ row }) => (
          <>
            {row.original.treatments.TreatmentName}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "คำอธิบายวิธีการรักษา",
        cell: ({ row }) => (
          <>
            {row.original.treatments.Description}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "ขั้นตอนการดำเนินการ",
        cell: ({ row }) => (
          <>
            {row.original.treatments.Procedures}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "ระยะเวลาในการรักษา",
        cell: ({ row }) => (
          <>
            {row.original.treatments.Duration}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "ผลข้างเคียง",
        cell: ({ row }) => (
          <>
            {row.original.treatments.SideEffects}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "ข้อห้ามใช้",
        cell: ({ row }) => (
          <>
            {row.original.treatments.Contraindications}
          </>
        ), // แสดง id ของข้อมูลการรักษา
      },
      {
        header: "จัดการ",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              {/* ปุ่มแก้ไข */}
              <button
                onClick={() =>
                  router.push(`/admin/dashboard/edit-treatment/${row.original.TreatmentID}`)
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
                  setTreatmentIdToDelete(row.original.TreatmentID);
                  setIsModalTreatmentOpen(true);
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
            </div>
          );
        },
      },
    ],
    [router, adminData, canEdit]
  );

  // สร้าง instance ของ React Table โดยกำหนดข้อมูลและคอลัมน์ พร้อมเปิดใช้งาน pagination
  const tableMedications = useReactTable({
    data: medics,
    columns: columnsMedications,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }, // แสดง 10 แถวต่อหน้า
  });

  // สร้าง instance ของ React Table โดยกำหนดข้อมูลและคอลัมน์ พร้อมเปิดใช้งาน pagination
  const tableTreatments = useReactTable({
    data: treatments,
    columns: columnsTreatments,
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
      <div className="w-full">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
              activeTab === 'medications'
                ? 'bg-indigo-600 text-white border-indigo-600 border-b-2'
                : 'bg-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
            } rounded-tl-lg`}
          >
            จัดการข้อมูลยา
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
              activeTab === 'treatments'
                ? 'bg-indigo-600 text-white border-indigo-600 border-b-2'
                : 'bg-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
            } rounded-tr-lg`}
          >
            จัดการข้อมูลการรักษา
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg p-6">
          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                จัดการข้อมูลยาของโรค {disease?.diseases?.DiseaseName}
              </h2>

              {/* ปุ่มเพิ่มข้อมูลยา เปลี่ยนหน้าไปยังฟอร์มเพิ่มข้อมูลยา */}
              <button
                onClick={() => router.push(`/admin/dashboard/add-medication/${id}`)}
                disabled={!canEdit}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105 mb-6 disabled:opacity-50 disabled:pointer-events-none"
              >
                + เพิ่มข้อมูล
              </button>

              {/* ตารางแสดงรายการข้อมูลยา */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600 text-white">
                    {/* สร้างหัวตาราง */}
                    {tableMedications.getHeaderGroups().map((headerGroup) => (
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
                    {tableMedications.getRowModel().rows.map((row) => (
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
                  onClick={() => tableMedications.previousPage()}
                  disabled={!tableMedications.getCanPreviousPage()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {tableMedications.getState().pagination.pageIndex + 1} of{" "}
                  {tableMedications.getPageCount()}
                </span>
                <button
                  onClick={() => tableMedications.nextPage()}
                  disabled={!tableMedications.getCanNextPage()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Treatments Tab */}
          {activeTab === 'treatments' && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                จัดการข้อมูลการรักษาของโรค {disease?.diseases?.DiseaseName}
              </h2>

              {/* ปุ่มเพิ่มข้อมูลการรักษา เปลี่ยนหน้าไปยังฟอร์มเพิ่มข้อมูลการรักษา */}
              <button
                onClick={() => router.push(`/admin/dashboard/add-treatment/${id}`)}
                disabled={!canEdit}
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 hover:scale-105 mb-6 disabled:opacity-50 disabled:pointer-events-none"
              >
                + เพิ่มข้อมูล
              </button>

              {/* ตารางแสดงรายการข้อมูลการรักษา */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-600 text-white">
                    {/* สร้างหัวตาราง */}
                    {tableTreatments.getHeaderGroups().map((headerGroup) => (
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
                    {tableTreatments.getRowModel().rows.map((row) => (
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
                  onClick={() => tableTreatments.previousPage()}
                  disabled={!tableTreatments.getCanPreviousPage()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {tableTreatments.getState().pagination.pageIndex + 1} of{" "}
                  {tableTreatments.getPageCount()}
                </span>
                <button
                  onClick={() => tableTreatments.nextPage()}
                  disabled={!tableTreatments.getCanNextPage()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Confirm สำหรับยืนยันการลบข้อมูลยา */}
      {isModalMedicOpen && (
        <ModalConfirm
          isOpen={isModalMedicOpen}
          title="ยืนยันการลบข้อมูลยา"
          message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลยานี้? การลบไม่สามารถย้อนกลับได้"
          onConfirm={deleteMedic}
          onCancel={() => setIsModalMedicOpen(false)}
          confirmText="ลบ"
          cancelText="ยกเลิก"
        />
      )}

      {/* Modal Confirm สำหรับยืนยันการลบข้อมูลการรักษา */}
      {isModalTreatmentOpen && (
        <ModalConfirm
          isOpen={isModalTreatmentOpen}
          title="ยืนยันการลบข้อมูลการรักษา"
          message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลการรักษานี้? การลบไม่สามารถย้อนกลับได้"
          onConfirm={deleteTreatment}
          onCancel={() => setIsModalTreatmentOpen(false)}
          confirmText="ลบ"
          cancelText="ยกเลิก"
        />
      )}
    </div>
  );
}
