"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../service/api";
import Cookies from "js-cookie";

export default function EditMedicationPage() {
    const { id } = useParams();
    const [medicationName, setMedicationName] = useState("");
    const [genericName, setGenericName] = useState("");
    const [dosageForm, setDosageForm] = useState("");
    const [strength, setStrength] = useState("");
    const [indication, setIndication] = useState("");
    const [sideEffect, setSideEffect] = useState("");
    const [contraindication, setContraindication] = useState("");
    const [symptomsDrugAllergies, setSymptomsDrugAllergies] = useState("");
    const [treatDrugAllergies, setTreatDrugAllergies] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // ฟังก์ชันดึงข้อมูลยาจาก API
    const getMedics = async () => {
        try {
            const response = await axios.get(`${API}/medics/${id}`);
            const medic = response.data.resultData; // เก็บข้อมูลยาลง state

            setMedicationName(medic.MedicationName || "");
            setGenericName(medic.GenericName || "");
            setDosageForm(medic.DosageForm || "");
            setStrength(medic.Strength || "");
            setIndication(medic.Indications || "");
            setSideEffect(medic.SideEffects || "");
            setContraindication(medic.Contraindications || "");
            setSymptomsDrugAllergies(medic.SymptomsDrugAllergies || "");
            setTreatDrugAllergies(medic.TreatDrugAllergies || "");
        } catch (error) {
            console.log(error);
            toast.error(error.response.message || "ไม่สามารถเรียกข้อมูลได้"); // แจ้งเตือนถ้าดึงข้อมูลไม่สำเร็จ
        }
    };

    // ดึงข้อมูลยาครั้งแรกตอน component โหลด
    useEffect(() => {
        getMedics();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.put(`${API}/medics/${id}`, {
                medic_name: medicationName,
                generic_name: genericName,
                dosage: dosageForm,
                strength: strength,
                indication: indication,
                side_effect: sideEffect,
                contraindication: contraindication,
                symptoms_drug_allergies: symptomsDrugAllergies,
                treat_drug_allergies: treatDrugAllergies,
                admin_id: JSON.parse(Cookies.get("user")).id,
            });
            if (response.status === 200) {
                toast.success(response.data.message || "แก้ไขข้อมูลสำเร็จ!");
                router.back();
            }
        } catch (error) {
            if (error.response.status === 403) {
                toast.error("คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลยา");
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
                แก้ไขข้อมูลยา
            </h1>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-4xl mx-auto"
            >
                {/* ฟิลด์ข้อมูลหลัก */}
                <div className="space-y-6">
                    <div>
                        <label
                            htmlFor="MedicationName"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ชื่อยา
                        </label>
                        <input
                            type="text"
                            id="MedicationName"
                            value={medicationName}
                            onChange={(e) => setMedicationName(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนชื่อยา"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="genericName"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ชื่อสามัญทางยา
                        </label>
                        <input
                            type="text"
                            id="genericName"
                            value={genericName}
                            onChange={(e) => setGenericName(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนชื่อสามัญทางยา"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="dosageForm"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            รูปแบบยา
                        </label>
                        <select
                            id="dosageForm"
                            value={dosageForm}
                            onChange={(e) => setDosageForm(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        >
                            <option value="เม็ด">เม็ด</option>
                            <option value="น้ำ">น้ำ</option>
                            <option value="ฉีด">ฉีด</option>
                            <option value="ดม">ดม</option>
                            <option value="ทา">ทา</option>
                            <option value="พ่น">พ่น</option>
                            <option value="ผง">ผง</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="strength"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ความรุนแรงของยา
                        </label>
                        <input
                            type="text"
                            id="strength"
                            value={strength}
                            onChange={(e) => setStrength(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ขนาดโดส เช่น 500mg"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="indication"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ข้อบ่งใช้
                        </label>
                        <input
                            type="text"
                            id="indication"
                            value={indication}
                            onChange={(e) => setIndication(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ใช้ในกรณีใด เช่น ลดไข้, แก้ปวด"
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
                            placeholder="ป้อนผลข้างเคียง"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="contraindication"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            ข้อห้าม
                        </label>
                        <input
                            type="text"
                            id="contraindication"
                            value={contraindication}
                            onChange={(e) =>
                                setContraindication(e.target.value)
                            }
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนข้อห้าม"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="symptomsDrugAllergies"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            อาการสำหรับผู้ที่แพ้ยา
                        </label>
                        <input
                            type="text"
                            id="symptomsDrugAllergies"
                            value={symptomsDrugAllergies}
                            onChange={(e) =>
                                setSymptomsDrugAllergies(e.target.value)
                            }
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนอาการสำหรับผู้ที่แพ้ยา"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="treatDrugAllergies"
                            className="block text-lg font-medium text-gray-700 mb-2"
                        >
                            วิธีการรักษาอาการแพ้ยา
                        </label>
                        <textarea
                            id="treatDrugAllergies"
                            value={treatDrugAllergies}
                            onChange={(e) =>
                                setTreatDrugAllergies(e.target.value)
                            }
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            placeholder="ป้อนวิธีการรักษาอาการแพ้ยา"
                            rows={3}
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
