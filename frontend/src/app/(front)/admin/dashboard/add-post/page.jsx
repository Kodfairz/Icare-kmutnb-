"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";

import axios from "axios";
import { toast } from "react-toastify";
import { API } from "../../../../service/api";
import Switch from "react-switch";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import Cookies from "js-cookie";

const Select = dynamic(() => import("react-select"), { ssr: false });

export default function AddPostPage() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(null);
  const [imageId, setImageId] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [icd10Code, setIcd10Code] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [publishStatus, setPublishStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  
  // States สำหรับเลือกโหมด (จากคลัง/อัปโหลดใหม่)
  const [imageMode, setImageMode] = useState("library"); // "library" หรือ "new"
  const [videoMode, setVideoMode] = useState("library"); // "library" หรือ "new"
  
  // States สำหรับข้อมูลรูปภาพใหม่
  const [newImageName, setNewImageName] = useState("");
  const [newImageURL, setNewImageURL] = useState("");
  const [newImageCredit, setNewImageCredit] = useState("");
  
  // States สำหรับข้อมูลวิดีโอใหม่
  const [newVideoName, setNewVideoName] = useState("");
  const [newVideoURL, setNewVideoURL] = useState("");
  
  const router = useRouter();

  // ตัว editor สำหรับเนื้อหาในฟิลด์หลัก
  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[150px]",
      },
    },
    immediatelyRender: false,
  });

  // editor สำหรับอาการ
  const symptomEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[150px]",
      },
    },
  });

  // editor สำหรับสถานการณ์
  const situationEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[150px]",
      },
    },
  });

  // editor สำหรับการป้องกัน
  const protectionEditor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: true }), Underline],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-0 focus:outline-none min-h-[150px]",
      },
    },
  });

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get(`${API}/category/`);
        setCategories(response.data.resultData || []);
      } catch (error) {
        console.log(error);
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

    getCategories();
    getImages();
    getVideos();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) {
      toast.error("กรุณาเลือกไฟล์รูปภาพ!");
      return null;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("รองรับเฉพาะไฟล์รูปภาพ!");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", `jyvur9yd`);
    formData.append("folder", "icare");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dcq3ijz0g/image/upload`,
        formData
      );
      return response.data.url;
    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );
      toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
      return null;
    }
  };

  const addImage = (editorInstance) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const imageUrl = await handleImageUpload(file);
      if (imageUrl && editorInstance) {
        editorInstance.chain().focus().setImage({ src: imageUrl }).run();
      }
    };
  };

  // ฟังก์ชันอัปโหลดรูปหน้าปกใหม่
  const handleCoverImageUpload = async (file) => {
    const imageUrl = await handleImageUpload(file);
    if (imageUrl) {
      setNewImageURL(imageUrl);
    }
  };

  const onDropCoverImage = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleCoverImageUpload(acceptedFiles[0]);
    }
  };
  
  const { getRootProps: getRootPropsCoverImage, getInputProps: getInputPropsCoverImage } = useDropzone({
    onDrop: onDropCoverImage,
    accept: "image/*",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      toast.error("กรุณาเลือกประเภทข้อมูล");
      return;
    }
    setIsLoading(true);

    try {
      const content = editor?.getHTML() || "";
      const symptom = symptomEditor?.getHTML() || "";
      const situation = situationEditor?.getHTML() || "";
      const protection = protectionEditor?.getHTML() || "";

      const user = Cookies.get("user");
      if (!user) {
        toast.error("กรุณาเข้าสู่ระบบ");
        setIsLoading(false);
        return;
      }
      const userId = JSON.parse(user).id;

      let finalImageId = imageId;
      let finalVideoId = videoId;

      // ถ้าเลือกโหมดอัปโหลดรูปภาพใหม่
      if (imageMode === "new") {
        if (!newImageName || !newImageURL || !newImageCredit) {
          toast.error("กรุณากรอกข้อมูลรูปภาพให้ครบถ้วน");
          setIsLoading(false);
          return;
        }
        const imageResponse = await axios.post(`${API}/images`, {
          image_name: newImageName,
          image_url: newImageURL,
          credit: newImageCredit,
        });
        finalImageId = imageResponse.data.resultData.ImageID;
      }

      // ถ้าเลือกโหมดเพิ่มวิดีโอใหม่
      if (videoMode === "new") {
        if (!newVideoName || !newVideoURL) {
          toast.error("กรุณากรอกข้อมูลวิดีโอให้ครบถ้วน");
          setIsLoading(false);
          return;
        }
        const videoResponse = await axios.post(`${API}/videos`, {
          video_name: newVideoName,
          video_url: newVideoURL,
        });
        finalVideoId = videoResponse.data.resultData.VideoID;
      }

      const response = await axios.post(`${API}/posts`, {
        name: title,
        description: description,
        category_id: category.toString(),
        image_id: finalImageId,
        video_id: finalVideoId,
        icd10_code: icd10Code,
        risk_factors: content,
        symptoms: symptom,
        diagnosis: situation,
        prevention: protection,
        isActive: publishStatus,
        admin_id: userId,
      });
      if (response.status === 200) {
        toast.success(response.data.message || "เพิ่มข้อมูลสำเร็จ!");
        router.push("/admin/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "เพิ่มโพสต์ไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  // const renderVideoPreview = (link) => {
  //   const youtubePattern =
  //     /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  //   const match = link.match(youtubePattern);
  //   if (match) {
  //     const videoId = match[1];
  //     return (
  //       <iframe
  //         width="100%"
  //         height="100%"
  //         src={`https://www.youtube.com/embed/${videoId}`}
  //         title="YouTube video"
  //         frameBorder="0"
  //         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  //         allowFullScreen
  //       />
  //     );
  //   }
  //   return null;
  // };

  // const { getRootProps, getInputProps } = useDropzone({
  //   onDrop,
  //   accept: "image/*",
  // });

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

  // Toolbar component สำหรับ editor ย่อย
  const RenderToolbar = ({ editorInstance }) => {
    if (!editorInstance) return null; // ถ้า editor ยังไม่พร้อม แสดงอะไรไม่ได้เลย

    return (
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => editorInstance.chain().focus().toggleBold().run()}
          disabled={!editorInstance.can().chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded border ${editorInstance.isActive("bold")
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-800 hover:bg-indigo-100"
            } transition`}
          title="ตัวหนา"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editorInstance.chain().focus().toggleItalic().run()}
          disabled={!editorInstance.can().chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded border ${editorInstance.isActive("italic")
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-800 hover:bg-indigo-100"
            } transition`}
          title="ตัวเอียง"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editorInstance.chain().focus().toggleUnderline().run()}
          disabled={!editorInstance.can().chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded border ${editorInstance.isActive("underline")
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-800 hover:bg-indigo-100"
            } transition`}
          title="ขีดเส้นใต้"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => addImage(editorInstance)}
          className="px-2 py-1 rounded border bg-white text-gray-800 hover:bg-indigo-100 transition"
          title="แทรกรูปภาพ"
        >
          รูปภาพ
        </button>
      </div>
    );
  };


  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 animate-fade-in-down">
        เพิ่มข้อมูล
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 space-y-6 max-w-4xl mx-auto"
      >
        {/* ฟิลด์ข้อมูลหลัก */}
        <div className="space-y-6">
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
            
            {/* ตัวเลือกโหมด */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setImageMode("library")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  imageMode === "library"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                เลือกจากคลัง
              </button>
              <button
                type="button"
                onClick={() => setImageMode("new")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  imageMode === "new"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                อัปโหลดใหม่
              </button>
            </div>

            {/* แสดงตามโหมดที่เลือก */}
            {imageMode === "library" ? (
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
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="ชื่อรูปภาพ"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div
                  {...getRootPropsCoverImage()}
                  className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer rounded-lg hover:border-indigo-400"
                >
                  <input {...getInputPropsCoverImage()} />
                  <p className="text-gray-500">ลากและวางหรือคลิกเพื่อเลือกรูปภาพ</p>
                  {newImageURL && (
                    <img
                      src={newImageURL}
                      alt="Preview"
                      className="max-w-xs max-h-60 w-full h-auto mx-auto rounded-lg mt-4 object-cover shadow"
                    />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="เครดิตรูปภาพ"
                  value={newImageCredit}
                  onChange={(e) => setNewImageCredit(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="video"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              วิดีโอแนะนำ
            </label>
            
            {/* ตัวเลือกโหมด */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => setVideoMode("library")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  videoMode === "library"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                เลือกจากคลัง
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("new")}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  videoMode === "new"
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                    : "border-gray-300 bg-white text-gray-700"
                }`}
              >
                เพิ่มลิงก์ใหม่
              </button>
            </div>

            {/* แสดงตามโหมดที่เลือก */}
            {videoMode === "library" ? (
              <Select
                id="video"
                options={videoOptions}
                value={videoOptions.find((option) => option.value === videoId) || null}
                onChange={(selected) => {
                  setVideoId(selected?.value || null);
                  setSelectedVideo(selected || null);
                }}
                placeholder="เลือกวิดีโอแนะนำ"
                classNamePrefix="react-select"
                className="w-full"
                isClearable
              />
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="ชื่อวิดีโอ"
                  value={newVideoName}
                  onChange={(e) => setNewVideoName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder="URL วิดีโอ YouTube"
                  value={newVideoURL}
                  onChange={(e) => {
                    setNewVideoURL(e.target.value);
                    const youtubeId = extractYouTubeID(e.target.value);
                    if (youtubeId) {
                      setSelectedVideo({
                        youtubeId,
                        label: newVideoName || "วิดีโอใหม่",
                        videoUrl: e.target.value
                      });
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

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

          {/* <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              หน้าปกข้อมูล
            </label>
            <div
              {...getRootProps()}
              className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer rounded-lg"
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">ลากและวางหรือเลือกไฟล์</p>
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="max-w-xs max-h-60 w-full h-auto mx-auto rounded-lg mt-4 object-cover shadow"
                />
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="imageName"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              ชื่อรูปภาพ
            </label>
            <input
              type="text"
              id="imageName"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="ป้อนชื่อรูปภาพ"
            />
          </div> */}

          {/* <div>
            <label
              htmlFor="videoLink"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              ลิงก์วิดีโอแนะนำ
            </label>
            <input
              type="url"
              id="videoLink"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="กรอกลิงก์วิดีโอแนะนำ"
            />
            {videoLink && (
              <div className="mt-4 aspect-video w-full max-w-xl mx-auto rounded-lg overflow-hidden shadow-lg">
                {renderVideoPreview(videoLink)}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="videoName"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              ชื่อวิดีโอ
            </label>
            <input
              type="text"
              id="videoName"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              required
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="ป้อนชื่อวิดีโอ"
            />
          </div> */}

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
        </div>

        {/* แท็บแก้ไขเนื้อหา */}
        <div className="mt-6">
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            {["edit", "symptom", "situation", "protection"].map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-semibold rounded-t-lg transition-colors ${activeTab === tab
                    ? "bg-indigo-100 text-indigo-700 border border-b-0 border-indigo-300"
                    : "text-gray-500 hover:text-indigo-600"
                  }`}
              >
                {tab === "edit"
                  ? "รายละเอียดของโรค"
                  : tab === "symptom"
                    ? "อาการ"
                    : tab === "situation"
                      ? "การติดต่อ"
                      : "ดูแล และ การป้องกัน"}
              </button>
            ))}
          </div>

          {/* // แสดง Editor เฉพาะเมื่อแท็บที่เลือกคือ "edit" */}
          {activeTab === "edit" && (
            <>
              {/* แถบเครื่องมือของ Editor (Toolbar) ที่เชื่อมกับอินสแตนซ์ของ editor หลัก */}
              <RenderToolbar editorInstance={editor} />
              {/* พื้นที่เขียนเนื้อหาหลัก */}
              <EditorContent editor={editor} className="border rounded-md p-4 min-h-[150px]" />
            </>
          )}

          {/* แสดง Editor เฉพาะเมื่อแท็บที่เลือกคือ "symptom"*/}
          {activeTab === "symptom" && (
            <>
              {/* แถบเครื่องมือของ Editor สำหรับเนื้อหา 'อาการ' */}
              <RenderToolbar editorInstance={symptomEditor} />
              {/* พื้นที่เขียนเนื้อหา 'อาการ' */}
              <EditorContent
                editor={symptomEditor}
                className="border rounded-md p-4 min-h-[100px]"
              />
            </>
          )}

{/* // แสดง Editor เฉพาะเมื่อแท็บที่เลือกคือ "situation" */}
          {activeTab === "situation" && (
            <>
              {/* แถบเครื่องมือของ Editor สำหรับเนื้อหา 'สถานการณ์' */}
              <RenderToolbar editorInstance={situationEditor} />
              {/* พื้นที่เขียนเนื้อหา 'สถานการณ์' */}
              <EditorContent
                editor={situationEditor}
                className="border rounded-md p-4 min-h-[100px]"
              />
            </>
          )}

{/* // แสดง Editor เฉพาะเมื่อแท็บที่เลือกคือ "protection" */}
          {activeTab === "protection" && (
            <>
              {/* แถบเครื่องมือของ Editor สำหรับเนื้อหา 'การป้องกัน' */}
              <RenderToolbar editorInstance={protectionEditor} />
              {/* พื้นที่เขียนเนื้อหา 'การป้องกัน' */}
              <EditorContent
                editor={protectionEditor}
                className="border rounded-md p-4 min-h-[100px]"
              />
            </>
          )}

        </div>

        {/* ปุ่มบันทึกและยกเลิก */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "กำลังบันทึกข้อมูล..." : "บันทึกข้อมูล"}
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
