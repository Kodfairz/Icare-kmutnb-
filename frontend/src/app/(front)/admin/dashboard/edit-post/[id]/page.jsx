"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../../service/api";
import Switch from "react-switch";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import Cookies from "js-cookie";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [icd10Code, setIcd10Code] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [publishStatus, setPublishStatus] = useState(true);
  const [editDescription, setEditDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[150px]",
      },
    },
  });

  const symptomEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[100px]",
      },
    },
  });

  const situationEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[100px]",
      },
    },
  });

  const protectionEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[100px]",
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postRes, catRes, imgRes, vidRes] = await Promise.all([
          axios.get(`${API}/posts/${id}`),
          axios.get(`${API}/category/`),
          axios.get(`${API}/images`),
          axios.get(`${API}/videos`),
        ]);

        const post = postRes.data.resultData;
        setTitle(post.diseases.DiseaseName);
        setDescription(post.diseases.Description);
        setCategory(post.diseases.CategoryID);
        setImageId(post.ImageID);
        setVideoId(post?.VideoID);
        setVideoUrl(post.videolibrary?.VideoURL);
        setIcd10Code(post.diseases.ICD10_Code);
        setPublishStatus(post.isActive);

        editor?.commands.setContent(post.diseases.RiskFactors);
        symptomEditor?.commands.setContent(post.diseases.Symptoms);
        situationEditor?.commands.setContent(post.diseases.Diagnosis);
        protectionEditor?.commands.setContent(post.diseases.Prevention);

        setCategories(catRes.data.resultData);
        setImages(imgRes.data.resultData);
        setVideos(vidRes.data.resultData);
      } catch (err) {
        console.error(err);
        toast.error("โหลดข้อมูลไม่สำเร็จ");
      }
    };
    fetchData();
  }, [id, editor, symptomEditor, situationEditor, protectionEditor]);

  // // ฟังก์ชันดึง videoId จากลิงก์ YouTube
  // const getYouTubeVideoId = (link) => {
  //   if (!link) return null;
  //   const regex =
  //     /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  //   const match = link.match(regex);
  //   return match ? match[1] : null;
  // };

  // // เช็ค validity ของลิงก์วิดีโอทุกครั้งที่เปลี่ยน videoLink
  // useEffect(() => {
  //   const videoId = getYouTubeVideoId(videoLink);
  //   setIsVideoValid(!!videoId);
  // }, [videoLink]);

  const categoryOptions = categories.map((cat) => ({
    value: cat.CategoryID,
    label: cat.CategoryName,
  }));

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
      videoUrl: vid.VideoURL
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

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith("image/")) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "jyvur9yd");
    formData.append("folder", "icare");
    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dcq3ijz0g/image/upload`,
        formData
      );
      return res.data.url;
    } catch (err) {
      toast.error("อัปโหลดภาพไม่สำเร็จ");
      return null;
    }
  };

  // const onDrop = async (acceptedFiles) => {
  //   if (acceptedFiles.length > 0) {
  //     const url = await handleImageUpload(acceptedFiles[0]);
  //     if (url) setCoverImage(url);
  //   }
  // };

  // const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return toast.error("กรุณาเลือกประเภทข้อมูล");
    setIsLoading(true);

    try {
      const content = editor?.getHTML() || "";
      const symptom = symptomEditor?.getHTML() || "";
      const situation = situationEditor?.getHTML() || "";
      const protection = protectionEditor?.getHTML() || "";

      const user = JSON.parse(Cookies.get("user"));
      const userId = user.id;

      const res = await axios.put(`${API}/posts/${id}`, {
        name: title,
        description: description,
        category_id: category,
        image_id: imageId,
        video_id: videoId,
        icd10_code: icd10Code,
        risk_factors: content,
        symptoms: symptom,
        diagnosis: situation,
        prevention: protection,
        isActive: publishStatus,
        admin_id: userId,
        edit_description: editDescription,
      });

      toast.success(res.data.message || "อัปเดตข้อมูลสำเร็จ");
      router.push("/admin/dashboard");
    } catch (err) {
      if (err.response.status === 403) {
        toast.error("คุณไม่มีสิทธิ์ในการแก้ไขโพสต์นี้");
        return;
      }

      toast.error("อัปเดตข้อมูลไม่สำเร็จ");
      console.error("Error updating post:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // const renderVideoPreview = (videoId) => {
  //   if (!videoId) return null;
  //   return (
  //     <div className="mt-4 rounded-lg border-4 border-red-500 overflow-hidden shadow-lg max-w-xl mx-auto">
  //       <iframe
  //         className="w-full aspect-video"
  //         src={`https://www.youtube.com/embed/${videoId}`}
  //         title="YouTube video preview"
  //         allowFullScreen
  //       />
  //     </div>
  //   );
  // };

  const RenderToolbar = ({ editorInstance }) => {
    if (!editorInstance) return null;
    return (
      <div className="flex gap-2 mb-2">
        {["bold", "italic", "underline"].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() =>
              editorInstance
                .chain()
                .focus()[`toggle${cmd[0].toUpperCase() + cmd.slice(1)}`]()
                .run()
            }
            className={`px-2 py-1 border rounded ${
              editorInstance.isActive(cmd)
                ? "bg-indigo-500 text-white"
                : "bg-white text-gray-800"
            }`}
          >
            {cmd.charAt(0).toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.click();
            input.onchange = async () => {
              const file = input.files[0];
              if (!file) return;
              const url = await handleImageUpload(file);
              if (url)
                editorInstance.chain().focus().setImage({ src: url }).run();
            };
          }}
          className="px-2 py-1 border rounded bg-white text-gray-800"
        >
          รูปภาพ
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">แก้ไขโพสต์</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div>
          <label
            htmlFor="title"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            หัวข้อ
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="ป้อนคำอธิบาย"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            ประเภทของข้อมูล
          </label>
          <Select
            id="category"
            options={categoryOptions}
            value={categoryOptions.find((option) => option.value === category) || null}
            onChange={(selected) => setCategory(selected?.value || null)}
            placeholder="เลือกประเภทข้อมูล"
            classNamePrefix="react-select"
            className="w-full"
            isClearable
          />
        </div>

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

        <div>
          <label
            htmlFor="video"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            วิดีโอแนะนำ
          </label>
          <Select
            id="video"
            options={videoOptions}
            value={videoOptions.find((option) => option.value === videoId) || null}
            onChange={(selected) => {
              setVideoId(selected?.value || null);
              setSelectedVideo(selected || null); // เก็บ object ที่เลือกไว้
            }}
            placeholder="เลือกวิดีโอแนะนำ"
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

        <div>
          <label
            htmlFor="icd10Code"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            ICD10 Code
          </label>
          <input
            type="text"
            id="icd10Code"
            value={icd10Code}
            onChange={(e) => setIcd10Code(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="ป้อน ICD10 Code"
          />
        </div>

        {/* สวิตช์สถานะ */}
        <div>
          <label
            htmlFor="publishStatus"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            สถานะเผยแพร่
          </label>
          <Switch
            checked={publishStatus}
            onChange={setPublishStatus}
            offColor="#d1d5db"
            onColor="#4f46e5"
            uncheckedIcon={false}
            checkedIcon={false}
            height={24}
            width={48}
            handleDiameter={22}
            aria-label="Toggle publish status"
          />
        </div>

        <div>
          <div className="flex gap-4 border-b">
            {["edit", "symptom", "situation", "protection"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500"
                }`}
              >
                {tab === "edit"
                  ? "รายละเอียดของโรค"
                  : tab === "symptom"
                  ? "อาการ"
                  : tab === "situation"
                  ? "การติดต่อ"
                  : "วิธีดูแล และ การป้องกัน"}
              </button>
            ))}
          </div>

          <div className="my-4">
            {activeTab === "edit" && (
              <>
                <RenderToolbar editorInstance={editor} />
                <EditorContent
                  editor={editor}
                  className="border rounded p-4 min-h-[150px]"
                />
              </>
            )}
            {activeTab === "symptom" && (
              <>
                <RenderToolbar editorInstance={symptomEditor} />
                <EditorContent
                  editor={symptomEditor}
                  className="border rounded p-4 min-h-[150px]"
                />
              </>
            )}
            {activeTab === "situation" && (
              <>
                <RenderToolbar editorInstance={situationEditor} />
                <EditorContent
                  editor={situationEditor}
                  className="border rounded p-4 min-h-[150px]"
                />
              </>
            )}
            {activeTab === "protection" && (
              <>
                <RenderToolbar editorInstance={protectionEditor} />
                <EditorContent
                  editor={protectionEditor}
                  className="border rounded p-4 min-h-[150px]"
                />
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="editDesctiption"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              คำอธิบายการแก้ไข
            </label>
            <textarea
              id="editDesctiption"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="ป้อนคำอธิบายการแก้ไข"
              rows={3}
            />
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
