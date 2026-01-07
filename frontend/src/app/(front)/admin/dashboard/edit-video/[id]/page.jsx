"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../service/api";
import Switch from "react-switch"; // คอมโพเนนต์สวิตช์เปิด/ปิด
import dynamic from "next/dynamic"; // สำหรับโหลด react-select แบบ dynamic (ไม่ได้ใช้ในโค้ดนี้)
import { useDropzone } from "react-dropzone"; // สำหรับลากและวางไฟล์
import Cookies from "js-cookie";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function EditVideoPage() {
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  // สถานะของฟอร์ม
  const [title, setTitle] = useState("");            // ชื่อหัวข้อวิดีโอ
  const [description, setDescription] = useState("");
  const [imageId, setImageId] = useState(null); // URL รูปหน้าปก
  const [videoId, setVideoId] = useState(null);     // ลิงก์วิดีโอ (เช่น Youtube)
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);  // สถานะกำลังโหลด/ส่งข้อมูล
  const [publishStatus, setPublishStatus] = useState(true); // สถานะเผยแพร่ (true=เผยแพร่)

  const router = useRouter(); // ตัวช่วยนำทางของ Next.js
  const { id } = useParams()  // ดึงพารามิเตอร์ id จาก URL

  useEffect(() => {
    // ฟังก์ชันดึงข้อมูลวิดีโอตาม id
    const getVideoById = async () => {
      try {
        const response = await axios.get(`${API}/video/${id}`); // เรียก API
        console.log(response);
        // ตั้งค่าข้อมูลที่ได้มาในสถานะต่างๆ
        setTitle(response.data.resultData.Title);
        setDescription(response.data.resultData.Description);
        setImageId(response.data.resultData.ImageID);
        setVideoId(response.data.resultData.VideoID);
        setPublishStatus(response.data.resultData.isActive);
        setVideoUrl(response.data.resultData.videolibrary.VideoURL);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.message || "ไม่สามารถเรียกวิดีโอได้"); // แจ้งเตือนเมื่อเกิดข้อผิดพลาด
      }
    };

    const getImages = async () => {
      try {
        const response = await axios.get(`${API}/images/`);
        setImages(response.data.resultData || []);
      } catch (error) {
        console.log(error);
      }
    };
    
    const getVideos = async () => {
      try {
        const response = await axios.get(`${API}/videos/`);
        setVideos(response.data.resultData || []);
      } catch (error) {
        console.log(error);
      }
    };

    getVideoById();
    getImages();
    getVideos();
  }, []);

  const ImageOptions = images.map((img) => ({
    value: img.ImageID,
    label: img.ImageName,
    imageUrl: img.ImageURL,
  }));

  const videoOptions = videos.map((vid) => {
    const youtubeId = extractYouTubeID(vid.VideoURL);
    return {
      value: vid.VideoID,
      label: vid.VideoName,
      youtubeId,
      videoUrl: vid.VideoURL,
    };
  });

  // Custom option (แสดงรูป + ชื่อ)
  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
        <img src={data.imageUrl} alt={data.label} className="w-8 h-8 object-cover rounded mr-2" />
        <span>{data.label}</span>
      </div>
    );
  };

  // Custom selected value (แสดงเมื่อเลือกแล้ว)
  const customSingleValue = ({ data }) => (
    <div className="flex items-center">
      <img src={data.imageUrl} alt={data.label} className="w-6 h-6 object-cover rounded mr-2" />
      <span>{data.label}</span>
    </div>
  );

  // ฟังก์ชันแยก YouTube ID จาก URL
  function extractYouTubeID(url) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // ฟังก์ชันส่งข้อมูลแก้ไขวิดีโอ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // กำลังส่งข้อมูล

    try {
      // เรียก API PUT เพื่อแก้ไขข้อมูลวิดีโอ
      const response = await axios.put(`${API}/video/${id}`, {
        title,
        description,
        image_id: imageId,
        video_id: videoId,
        isActive: publishStatus,
        admin_id: `${JSON.parse(Cookies.get("user")).id}`, // ดึง id ผู้แก้ไขจาก cookie
      });
      if (response.status === 200) {
        toast.success(response.data.message || "เเก้ไขวิดีโอสำเร็จ!");
        router.push("/admin/dashboard"); // กลับหน้าแดชบอร์ดหลังแก้ไขสำเร็จ
      }
    } catch (error) {
      if (error.response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ในการแก้ไขวิดีโอนี้");
        return;
      }

      toast.error(error.response?.data?.message || "เเก้ไขวิดีโอไม่สำเร็จ");
      console.log(error);
    } finally {
      setIsLoading(false); // ปิดสถานะกำลังส่งข้อมูล
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 animate-fade-in-down">แก้ไขวิดีโอ</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Input หัวข้อวิดีโอ */}
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
            หัวข้อ
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="ป้อนหัวข้อ"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            คำอธิบาย
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="ป้อนคำอธิบาย"
            rows={3}
          />
        </div>

        {/* Input รูปหน้าปก (drag & drop) */}
        <div>
          <label
            htmlFor="image"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            หน้าปกข้อมูล
          </label>
          <Select
            id="image"
            options={ImageOptions}
            value={ImageOptions.find((option) => option.value === imageId) || null}
            onChange={(selected) => setImageId(selected?.value || null)}
            placeholder="เลือกหน้าปกข้อมูล"
            classNamePrefix="react-select"
            className="w-full"
            isClearable
            components={{
              Option: customOption,
              SingleValue: customSingleValue
            }}
          />
        </div>

        {/* Input ลิงก์วิดีโอ */}
        <div>
          <label
            htmlFor="video"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            วิดีโอ
          </label>
          <Select
            id="video"
            options={videoOptions}
            value={videoOptions.find((option) => option.value === videoId) || null}
            onChange={(selected) => {
              setVideoId(selected?.value || null);
              setSelectedVideo(selected || null); // เก็บ object ที่เลือกไว้
            }}
            placeholder="เลือกวิดีโอ"
            classNamePrefix="react-select"
            className="w-full"
            isClearable
          />
        </div>

        {videoId && !selectedVideo && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">วิดีโอตัวอย่าง</h4>
            <div>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${extractYouTubeID(videoUrl)}`}
                title={videoId}
                className="aspect-video rounded-xl overflow-hidden shadow-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {selectedVideo && (
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-2">วิดีโอตัวอย่าง</h4>
            <div>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                title={selectedVideo.label}
                className="aspect-video rounded-xl overflow-hidden shadow-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* สถานะการเผยแพร่ (สวิตช์เปิด/ปิด) */}
        <div>
          <label htmlFor="publishStatus" className="block text-lg font-medium text-gray-700 mb-2">
            สถานะการเผยแพร่
          </label>
          <div className="flex items-center gap-4">
            <span>ไม่เผยแพร่</span>
            <Switch
              checked={publishStatus}
              onChange={() => setPublishStatus(!publishStatus)} // toggle สถานะ
              offColor="#888"
              onColor="#4CAF50"
              offHandleColor="#FFF"
              onHandleColor="#FFF"
              height={30}
              width={60}
            />
            <span>เผยแพร่</span>
          </div>
        </div>

        {/* ปุ่มบันทึกและยกเลิก */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึกการแก้ไข..." : "บันทึกการแก้ไข"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}
