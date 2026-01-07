"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../service/api";
import Cookies from "js-cookie";

export default function AddTreatmentPage() {
    const { id } = useParams();
    const [treatmentName, setTreatmentName] = useState("");
    const [description, setDescription] = useState("");
    const [procedure, setProcedure] = useState("");
    const [duration, setDuration] = useState("");
    const [sideEffect, setSideEffect] = useState("");
    const [contraindication, setContraindication] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${API}/treatments`, {
                treatment_name: treatmentName,
                description: description,
                procedure: procedure,
                duration: duration,
                side_effect: sideEffect,
                contraindication: contraindication,
                disease_id: id,
                admin_id: JSON.parse(Cookies.get("user")).id,
            });
            if (response.status === 200) {
                toast.success(response.data.message || "เพิ่มข้อมูลสำเร็จ!");
                router.back();
            }
        } catch (error) {
            if (error.response.status === 403) {
                toast.error("คุณไม่มีสิทธิ์ในการเพิ่มข้อมูลการรักษา");
                setIsLoading(false);
                return;
            }

            toast.error(
                error.response?.data?.message || "เพิ่มข้อมูลไม่สำเร็จ"
            );
        }
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto p-6 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 animate-fade-in-down">
                เพิ่มข้อมูลการรักษา
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
                            placeholder="ป้อนวิธีการรักษา"
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
                            rows={3}
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
                            ผลข้างเคียง
                        </label>
                        <input
                            type="text"
                            id="sideEffect"
                            value={sideEffect}
                            onChange={(e) => setSideEffect(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ผลข้างเคียงที่อาจเกิดขึ้นจากการรักษา"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="contraindication"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ข้อห้ามใช้วิธีนี้
                        </label>
                        <input
                            type="text"
                            id="contraindication"
                            value={contraindication}
                            onChange={(e) =>
                                setContraindication(e.target.value)
                            }
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ข้อห้ามใช้วิธีนี้ในบางกรณี (เช่น ผู้ป่วยโรคหัวใจ)"
                        />
                    </div>

                    {/* ปุ่มบันทึกและยกเลิก */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
                        >
                            {isLoading
                                ? "กำลังบันทึกข้อมูล..."
                                : "บันทึกข้อมูล"}
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
