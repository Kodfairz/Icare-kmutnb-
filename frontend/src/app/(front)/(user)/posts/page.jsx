'use client';

import { useState, useEffect } from 'react';  // React hooks
import axios from 'axios';                     // Axios สำหรับเรียก API
import { API } from '../../../service/api';   // URL API backend
import Head from 'next/head';                   // จัดการ <head> ของหน้าเว็บ
import Link from 'next/link';                   // สำหรับสร้างลิงก์ใน Next.js

export default function Posts() {
  // State เก็บข้อมูลโพสต์ทั้งหมดที่ดึงมาจาก backend
  const [posts, setPosts] = useState([]);
  // State เก็บรายชื่อ category จาก backend
  const [categories, setCategories] = useState([]);
  // State เก็บ category ที่ผู้ใช้เลือกแสดง (default = 'ทั้งหมด')
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  // State เก็บข้อความค้นหา
  const [searchTerm, setSearchTerm] = useState('');
  // State ควบคุม animation fade-in
  const [fadeIn, setFadeIn] = useState(false);

  // --- State สำหรับ Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 12;  // จำนวนโพสต์ต่อหน้า

  // ฟังก์ชันดึงข้อมูลโพสต์และ category จาก backend
  const getData = async () => {
    try {
      // ดึงข้อมูลโพสต์ และหมวดหมู่พร้อมกัน
      const [postRes, categoryRes] = await Promise.all([
        axios.get(`${API}/posts`),
        axios.get(`${API}/category`)
      ]);

      setPosts(postRes.data.resultData);

      // ดึงเฉพาะชื่อ category
      const fetchedCategories = categoryRes.data.resultData.map(cat => cat.CategoryName);

      // กำหนดลำดับหมวดหมู่ที่ต้องการแสดงก่อน (รวม 'ทั้งหมด' ด้วย)
      const desiredOrder = ['ทั้งหมด', 'โรคทั่วไป', 'ศีรษะ', 'ลำตัว', 'ลำตัวส่วนล่าง', 'อุบัติเหตุ'];

      // จัดเรียง category ให้อยู่ตามลำดับที่กำหนดและเพิ่มรายการอื่นที่เหลือไว้ท้าย
      const sorted = [
        'ทั้งหมด',
        ...desiredOrder.filter(cat => fetchedCategories.includes(cat)),
        ...fetchedCategories.filter(cat => !desiredOrder.includes(cat))
      ];

      // ลบรายการซ้ำ
      const uniqueSorted = Array.from(new Set(sorted));

      setCategories(uniqueSorted);

      setFadeIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  // ดึงข้อมูลตอน component โหลดครั้งแรก
  useEffect(() => {
    getData();
  }, []);

  // กรองโพสต์ตาม category และ search term
  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'ทั้งหมด' || post.diseases.categories.CategoryName === activeCategory;
    const matchesSearch = post.diseases.DiseaseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // คำนวณตำแหน่งโพสต์สำหรับหน้า pagination ปัจจุบัน
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  // เลือกโพสต์ที่จะแสดงในหน้านั้น ๆ
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  // จำนวนหน้าทั้งหมด (ปัดขึ้น)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // กำหนดคลาสสำหรับ animation fade-in + slide-in
  const fadeInClass = fadeIn
    ? 'opacity-100 translate-y-0 transition-opacity transition-transform duration-700 ease-out'
    : 'opacity-0 translate-y-6 transition-opacity transition-transform duration-700 ease-out';

  return (
    <div className="bg-gradient-to-b from-blue-100 to-white min-h-screen">
      <Head>
        <title>iCare@KMUTNB</title>
        <meta name="description" content="คู่มือโรคและอุบัติเหตุสำหรับคุณ" />
      </Head>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className={`text-3xl sm:text-4xl text-gray-800 font-semibold font-anakotmai text-center mb-6 sm:mb-8 ${fadeInClass}`}>
          iCare@KMUTNB
        </h1>

        {/* ช่องค้นหา */}
        <div className={`flex flex-col sm:flex-row justify-center mb-6 ${fadeInClass}`}>
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // กลับไปหน้าแรกทุกครั้งที่ค้นหาใหม่
            }}
            className="w-full sm:max-w-md p-3 border bg-white border-gray-300 rounded-md sm:rounded-l-md shadow-sm focus:ring-2 focus:ring-blue-500 font-anakotmai mb-4 sm:mb-0"
          />
        </div>

        {/* ปุ่ม category */}
        <div className={`flex justify-start sm:justify-center mb-6 sm:mb-8 space-x-2 overflow-x-auto pb-2 ${fadeInClass}`}>
          {categories.map((category, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveCategory(category);
                setCurrentPage(1); // กลับไปหน้าแรกทุกครั้งที่เปลี่ยน category
              }}
              className={`px-3 py-2 rounded-full font-anakotmai transition duration-300 whitespace-nowrap text-sm sm:text-base ${
                activeCategory === category
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* แสดงโพสต์ในรูปแบบ grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentPosts.map((item) => (
            <div
              key={item.HealthArticleID}
              className={`bg-white p-4 rounded-xl shadow-md text-center font-anakotmai transition duration-300 hover:shadow-xl ${fadeInClass}`}
            >
              <img
                src={item.imagelibrary.ImageURL}
                alt={item.imagelibrary.ImageName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h4 className="text-lg font-medium text-gray-800 mb-2">{item.diseases.DiseaseName}</h4>
              <h5 className="text-sm text-gray-500 mb-4">
                ประเภทข้อมูล : {item.diseases.categories.CategoryName}
              </h5>
              <Link
                href={`/post/${item.HealthArticleID}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg transition hover:bg-blue-600 hover:scale-105"
              >
                ดูข้อมูล
              </Link>
            </div>
          ))}
        </div>

        {/* ปุ่มเปลี่ยนหน้า */}
        <div className="flex justify-center space-x-4 mt-8 mb-12">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ก่อนหน้า
          </button>

          <span className="self-center text-gray-700 font-semibold">
            หน้า {currentPage} / {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ถัดไป
          </button>
        </div>
      </main>
    </div>
  );
}
