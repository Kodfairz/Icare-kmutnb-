"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // ใช้สำหรับ navigation ใน Next.js (ถ้าจำเป็น)
import { API } from "../../service/api"; // ตัวแปร API endpoint
import { getAdminData } from "../../lib/getAdminData";
import { toast } from "react-toastify"; // ใช้แสดงแจ้งเตือน
import axios from "axios"; // สำหรับเรียก API
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table"; // ตารางสำหรับแสดงข้อมูล
import AddAdminModal from "./AddAdminModal"; // Modal สำหรับเพิ่มแอดมิน
import EditAdminModal from "./EditAdminModal"; // Modal สำหรับแก้ไขแอดมิน
import EditChangePassword from "./EditChangePassword"; // Modal เปลี่ยนรหัสผ่าน

// Component Modal ยืนยันการทำรายการ เช่น การลบข้อมูล
function ConfirmModal({ open, onClose, onConfirm, title = "ยืนยัน", description = "คุณต้องการดำเนินการต่อหรือไม่?" }) {
    if (!open) return null; // ถ้า modal ไม่เปิด ให้ไม่แสดงอะไร

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{description}</p>
                <div className="flex justify-end gap-2">
                    {/* ปุ่มยกเลิก */}
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                        ยกเลิก
                    </button>
                    {/* ปุ่มยืนยัน */}
                    <button
                        onClick={() => {
                            onConfirm(); // เรียกฟังก์ชันยืนยัน
                            onClose();   // ปิด modal
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        ยืนยัน
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminList() {
    // สถานะเก็บข้อมูลแอดมิน
    const [adminList, setAdminList] = useState([]);
    // สถานะเก็บข้อมูลแอดมินปัจจุบัน
    const [adminData, setAdminData] = useState(null);
    // สถานะเปิด/ปิด modal เพิ่มแอดมิน
    const [isModalOpen, setIsModalOpen] = useState(false);
    // สถานะเปิด/ปิด modal แก้ไขแอดมิน
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    // สถานะเปิด/ปิด modal เปลี่ยนรหัสผ่าน
    const [isModalOpenChangePassword, setIsModalOpenChangePassword] = useState(false);
    // เก็บ id ของผู้ใช้ที่เลือกแก้ไขหรือเปลี่ยนรหัสผ่าน
    const [idUser, setIdUser] = useState("");

    // สถานะเปิด/ปิด Confirm Modal สำหรับลบผู้ใช้
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    // เก็บ id ของผู้ใช้ที่ต้องการลบ
    const [userIdToDelete, setUserIdToDelete] = useState(null);

    // เมื่อ component โหลดครั้งแรก ให้เรียกข้อมูลแอดมินทั้งหมด
    useEffect(() => {
        fetchAdminsData();

        const loadAdmin = async () => {
            const data = await getAdminData();
            setAdminData(data);
        };

        loadAdmin();
    }, []);

    // ฟังก์ชันเรียกข้อมูลแอดมินจาก API
    const fetchAdminsData = async () => {
        try {
            const response = await axios.get(`${API}/users`);
            setAdminList(response.data.resultData); // เก็บข้อมูลใน state
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch admins"); // แจ้งเตือนเมื่อมีข้อผิดพลาด
        }
    };

    // ฟังก์ชันเพิ่มแอดมินใหม่
    const handleAddUser = async (newUser) => {
        try {
            await axios.post(`${API}/users`, {
                username: newUser.AdminName,
                password: newUser.password,
            });
            toast.success("เพิ่มข้อมูลแอดมินสำเร็จ");
            setIsModalOpen(false); // ปิด modal
            fetchAdminsData(); // โหลดข้อมูลใหม่
        } catch (error) {
            toast.error(error.response?.message || "ไม่สามารถเพิ่มข้อมูลแอดมินได้");
        }
    };

    // ฟังก์ชันลบแอดมิน
    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`${API}/users/${userId}`);
            toast.success("ลบข้อมูลแอดมินสำเร็จ!");
            fetchAdminsData();
        } catch (error) {
            toast.error(error.response?.message || "ไม่สามารถลบข้อมูลได้");
        }
    };

    // เตรียมเปิด Confirm Modal ลบผู้ใช้ พร้อมเก็บ id ที่จะลบ
    const confirmDeleteUser = (userId) => {
        setUserIdToDelete(userId);
        setIsConfirmModalOpen(true);
    };

    // ฟังก์ชันแก้ไขข้อมูลแอดมิน
    const handleEditUser = async (newUser) => {
        try {
            await axios.put(`${API}/users/${idUser}`, {
                username: newUser.AdminName,
            });
            toast.success("แก้ไขแอดมินสำเร็จ");
            setIsModalOpenEdit(false);
            fetchAdminsData();
        } catch (error) {
            toast.error(error.response?.message || "ไม่สามารถแก้ไขข้อมูลแอดมินได้");
        }
    };

    // ฟังก์ชันเปลี่ยนรหัสผ่านแอดมิน
    const handleChangePassword = async (input) => {
        try {
            const response = await axios.put(`${API}/users/change-password/${idUser}`, {
                oldPassword: input.password,
                newPassword: input.newPassword,
            });
            toast.success(response.data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
            setIsModalOpenChangePassword(false);
            fetchAdminsData();
        } catch (error) {
            toast.error(error.response?.message || "ไม่สามารถแก้ไขรหัสผ่านได้");
        }
    };

    // ฟังก์ชันเปลี่ยนสถานะแอดมิน (active/inactive)
    const handleStatusChange = async (userId) => {
        try {
            await axios.patch(`${API}/users/status/${userId}`);
            toast.success("เปลี่ยนสถานะสำเร็จ");
            fetchAdminsData();
        } catch (error) {
            toast.error(error.response?.message || "ไม่สามารถเปลี่ยนสถานะได้");
        }
    };

    // กำหนดคอลัมน์ของตาราง
    const columns = useMemo(
        () => [
            { header: "ไอดี", accessorKey: "AdminID" }, // แสดง id
            { header: "ผู้ใช้", accessorKey: "AdminName" }, // แสดง username
            adminData?.role === "SuperAdmin" && {
                id: "status",
                header: "สถานะ",
                accessorKey: "active",
                cell: ({ row }) => (
                    <select
                        value={row.original.isActive ? "active" : "inactive"}
                        onChange={() => handleStatusChange(row.original.AdminID)} // เปลี่ยนสถานะเมื่อเลือก option
                        className="bg-gray-50 text-gray-700 border border-gray-300 rounded-lg p-2"
                    >
                        <option value="active">ใช้งานอยู่</option>
                        <option value="inactive">ปิดใช้งาน</option>
                    </select>
                ),
            },
            {
                header: "เครื่องมือ",
                id: "actions",
                cell: ({ row }) => {
                    const canEdit = Boolean(
                        adminData && (adminData?.role === "SuperAdmin" || Number(adminData?.id) === Number(row.original.AdminID))
                    );

                    return (
                        <div className="flex gap-2">
                            {/* ปุ่มแก้ไขข้อมูล */}
                            <button
                                onClick={() => {
                                    if (!canEdit) return;
                                    setIsModalOpenEdit(true);
                                    setIdUser(row.original.AdminID); // กำหนด idUser ที่จะแก้ไข
                                }}
                                disabled={!canEdit}
                                className={`px-3 py-1 bg-amber-500 text-white hover:bg-amber-600 rounded-lg transition-all duration-200 hover:scale-105 ${
                                    !canEdit
                                        ? "opacity-50 pointer-events-none"
                                        : ""
                                }`}
                            >
                                แก้ไข
                            </button>
                            {/* ปุ่มเปลี่ยนรหัสผ่าน */}
                            <button
                                onClick={() => {
                                    if (!canEdit) return;
                                    setIsModalOpenChangePassword(true);
                                    setIdUser(row.original.AdminID); // กำหนด idUser ที่จะแก้ไขรหัสผ่าน
                                }}
                                disabled={!canEdit}
                                className={`px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-all duration-200 hover:scale-105 ${
                                    !canEdit
                                        ? "opacity-50 pointer-events-none"
                                        : ""
                                }`}
                            >
                                เปลี่ยนรหัสผ่าน
                            </button>
                            {/* ปุ่มลบ */}
                            <button
                                onClick={() => confirmDeleteUser(row.original.AdminID)}
                                disabled={!canEdit}
                                className={`px-3 py-1 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105 ${
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
        ].filter(Boolean),
        [adminData]
    );

    // สร้างตารางด้วย react-table
    const table = useReactTable({
        data: adminList,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: { pagination: { pageSize: 10 } }, // ตั้งค่าเริ่มต้น แสดง 10 แถวต่อหน้า
    });

    return (
        <div>
            {/* ส่วนหัวแสดงชื่อและปุ่มเพิ่มแอดมิน */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">แสดงข้อมูลแอดมิน</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-105"
                >
                    + เพิ่มข้อมูลแอดมิน
                </button>
            </div>

            {/* Modal เพิ่มแอดมิน */}
            {isModalOpen && (
                <AddAdminModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddUser} />
            )}

            {/* Modal แก้ไขแอดมิน */}
            {isModalOpenEdit && (
                <EditAdminModal
                    onClose={() => setIsModalOpenEdit(false)}
                    onSubmit={handleEditUser}
                    idUser={idUser}
                />
            )}

            {/* Modal เปลี่ยนรหัสผ่าน */}
            {isModalOpenChangePassword && (
                <EditChangePassword
                    onClose={() => setIsModalOpenChangePassword(false)}
                    onSubmit={handleChangePassword}
                    idUser={idUser}
                />
            )}

            {/* Modal ยืนยันการลบ */}
            <ConfirmModal
                open={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => handleDeleteUser(userIdToDelete)}
                title="ยืนยันการลบผู้ใช้"
                description="คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
            />

            {/* ตารางแสดงข้อมูล */}
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
                                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ปุ่มควบคุมการเลื่อนหน้า */}
            <div className="mt-6 flex flex-wrap gap-4 justify-between items-center">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-all duration-200"
                >
                    Previous
                </button>
                <span className="text-gray-600">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
