"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../service/api";
import Cookies from "js-cookie";

export default function EditMedicationPage() {
    const { id } = useParams();
    const [treatmentName, setTreatmentName] = useState("");
    const [description, setDescription] = useState("");
    const [procedure, setProcedure] = useState("");
    const [duration, setDuration] = useState("");
    const [sideEffect, setSideEffect] = useState("");
    const [contraindication, setContraindication] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // ฟังก์ชันดึงข้อมูลยาจาก API
    const getTreatment = async () => {
        try {
            const response = await axios.get(`${API}/treatments/${id}`);
            const treatment = response.data.resultData; // เก็บข้อมูลยาลง state

            setTreatmentName(treatment.TreatmentName || "");
            setDescription(treatment.Description || "");
            setProcedure(treatment.Procedures || "");
            setDuration(treatment.Duration || "");
            setSideEffect(treatment.SideEffects || "");
            setContraindication(treatment.Contraindications || "");
        } catch (error) {
            console.log(error);
            toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
        }
    };

    // ดึงข้อมูลยาครั้งแรกตอน component โหลด
    useEffect(() => {
        getTreatment();
    }, []);
    //แจ้งเตือนเวลาแก้ไขสำเร็จ
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.put(`${API}/treatments/${id}`, {
                treatment_name: treatmentName,
                description: description,
                procedure: procedure,
                duration: duration,
                side_effect: sideEffect,
                contraindication: contraindication,
                admin_id: JSON.parse(Cookies.get("user")).id,
            });
            if (response.status === 200) {
                toast.success(response.data.message || "แก้ไขข้อมูลสำเร็จ!");
                router.back();
            }
        } catch (error) {
            if (error.response.status === 403) {
                toast.error("คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลการรักษา");
                setIsLoading(false);
                return;
            }

            toast.error(
                error.response?.data?.message || "แก้ไขข้อมูลไม่สำเร็จ"
            );
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto p-6 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 animate-fade-in-down">
                แก้ไขข้อมูลการรักษา
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-4xl mx-auto"
            >
                {/* ฟิลด์ข้อมูลหลัก */}
                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="treatmentName"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            วิธีการรักษา
                        </label>
                        <input
                            type="text"
                            id="treatmentName"
                            value={treatmentName}
                            onChange={(e) => setTreatmentName(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนชื่อการรักษา"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            คำอธิบายการรักษา
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนคำอธิบายการรักษา"
                            rows={4}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="procedure"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ขั้นตอนการดำเนินการ
                        </label>
                        <textarea
                            id="procedure"
                            value={procedure}
                            onChange={(e) => setProcedure(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ขั้นตอนการดำเนินการ"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="duration"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ระยะเวลาในการรักษา
                        </label>
                        <input
                            type="text"
                            id="duration"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนระยะเวลาในการรักษา"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="sideEffect"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ผลข้างเคียงที่อาจเกิดขึ้นจากการรักษา
                        </label>
                        <input
                            type="text"
                            id="sideEffect"
                            value={sideEffect}
                            onChange={(e) => setSideEffect(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนผลข้างเคียงที่อาจเกิดขึ้นจากการรักษา"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="contraindication"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ข้อห้ามใช้วิธีนี้ในบางกรณี
                        </label>
                        <input
                            type="text"
                            id="contraindication"
                            value={contraindication}
                            onChange={(e) =>
                                setContraindication(e.target.value)
                            }
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนข้อห้ามใช้วิธีนี้ในบางกรณี"
                        />
                    </div>

                    {/* ปุ่มบันทึกและยกเลิก */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading
                                ? "กำลังบันทึกการแก้ไข..."
                                : "บันทึกการแก้ไข"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
