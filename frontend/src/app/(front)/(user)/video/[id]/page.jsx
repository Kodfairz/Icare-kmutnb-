"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { API } from "../../../../service/api";

const Video = () => { 
  // เป็นคอมโพเนนต์ที่ใช้สำหรับแสดงรายละเอียดของวิดีโอ
  const { id } = useParams();
  const router = useRouter();
  // ใช้ useParams เพื่อดึง id ของวิดีโอจาก URL
  const [video, setVideo] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [visibleDetails, setVisibleDetails] = useState(false);
  const detailsRef = useRef(null);

  const getVideoById = async () => {
    try {
      const response = await axios.get(`${API}/video/user/${id}`);
      setVideo(response.data.resultData);
      setFadeIn(true);
    } catch (error) {
      toast.error(error.response?.message || "ไม่สามารถเรียกวิดีโอได้");
    }
  };

  useEffect(() => {
    getVideoById();
  }, [id]);

  useEffect(() => {
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleDetails(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (detailsRef.current) observer.observe(detailsRef.current);

    return () => {
      if (detailsRef.current) observer.unobserve(detailsRef.current);
    };
  }, [video]);

  const renderVideoPreview = (link) => {
    if (typeof link === "string" && link) {
      const youtubePattern =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = link.match(youtubePattern);
      if (match) {
        const videoId = match[1];
        return (
          <>
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="my-2 text-xs text-center text-gray-400 italic">ที่มา: <a href={video.videolibrary.VideoURL} className="hover:underline" target="_blank">{video.videolibrary.VideoURL}</a></p>
          </>
        );
      }
    }
    return <p className="text-red-500">ไม่สามารถแสดงวิดีโอได้</p>;
  };

  if (!video) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-xl animate-pulse">กำลังโหลด...</span>
      </div>
    );
  }

  const fadeInClass = fadeIn
    ? "opacity-100 translate-y-0 transition-opacity transition-transform duration-700 ease-out"
    : "opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out";

  const detailsClass = visibleDetails
    ? "opacity-100 translate-y-0 transition-opacity transition-transform duration-700 ease-out"
    : "opacity-0 translate-y-8 transition-opacity transition-transform duration-700 ease-out";

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* ปุ่มย้อนกลับ */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-lg hover:bg-gray-100 hover:text-indigo-600 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        ย้อนกลับ
      </button>

      {/* ชื่อวิดีโอ */}
      <h1 className={`text-3xl font-bold mb-4 text-gray-800 ${fadeInClass}`}>
        {video.Title}
      </h1>

      {/* preview วิดีโอ */}
      <div className={fadeInClass}>{renderVideoPreview(video.videolibrary.VideoURL)}</div>

      {/* คำอธิบายวิดีโอ */}
      <div className="mt4-8">
        <p className={`text-xl font-bold ${fadeInClass}`}>คำอธิบาย</p>
        <p>{video.Description}</p>
      </div>

      {/* ข้อมูลเพิ่มเติม (thumbnail + user info) */}
      <div
        ref={detailsRef}
        className={`mt-6 flex items-center gap-4 ${detailsClass}`}
      >
        <img
          src={video.imagelibrary.ImageURL}
          width={120}
          height={70}
          alt={video.imagelibrary.ImageURL}
          className="rounded-md shadow-md object-cover"
        />
        <div>
          <p className="text-sm text-gray-500">
            สร้างโดย: {video.admins.AdminName}
          </p>
          <p className="text-sm text-gray-500">
            อัปเดตล่าสุดโดย: {video.admins.AdminName}
          </p>
          <p className="text-sm text-gray-500">
            สร้างเมื่อ: {new Date(video.CreatedAt).toLocaleDateString("th-TH")}
          </p>
          <p className="text-sm text-gray-500">
            อัปเดตล่าสุด: {new Date(video.UpdatedAt).toLocaleDateString("th-TH")}
          </p>
          <p className="text-sm text-gray-500">ดูแล้ว: {video.Views} ครั้ง</p>
          <span
            className={`inline-block mt-2 px-2 py-1 rounded ${
              video.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {video.isActive ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Video;
