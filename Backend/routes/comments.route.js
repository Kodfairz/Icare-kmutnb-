import { Elysia } from 'elysia'; // นำเข้า Elysia framework สำหรับสร้าง HTTP server
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient เพื่อใช้เชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient

// สร้าง router สำหรับจัดการคอมเมนต์ โดยใช้ prefix เป็น /comments
export const commentRoutes = new Elysia({ prefix : "/comments" })

    // POST /comments - เพิ่มความคิดเห็นใหม่
    .post("/", async ({ body }) => {
        // สร้างคอมเมนต์ใหม่จากข้อมูลที่ส่งมาใน body
        const comment = await prisma.feedbacks.create({
            data : {
                FeedbackText : body.value, // ใส่ค่าข้อความความคิดเห็น
                HealthArticleID : body.id // ใส่ ID ของบทความสุขภาพที่เกี่ยวข้อง
            }
        })

        if(!comment) {
            // ถ้าไม่สามารถสร้างได้ ให้โยน error
            throw new Error("ไม่สามารถส่งข้อความ")
        }

        return {
            "message" : "ส่งข้อความสำเร็จ"
        }
    })

    // GET /comments - ดึงความคิดเห็นทั้งหมด เรียงจากล่าสุดก่อน
    .get("/", async () => {
        const comments = await prisma.feedbacks.findMany({
            orderBy: {
                CreatedAt: 'desc' // เรียงตามเวลาสร้างล่าสุด
            },
            include: {
                healtharticles: { // รวมข้อมูลบทความสุขภาพที่เกี่ยวข้อง
                    include: {
                        diseases: true // รวมข้อมูลโรคที่เกี่ยวข้องกับบทความ
                    }
                }
            }
        })

        if(!comments) {
            throw new Error("ไม่สามารถเรียกข้อความทั้งหมดได้")
        }

        return {
            "resultData" : comments
        }
    })
