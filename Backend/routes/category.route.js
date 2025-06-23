import { Elysia } from 'elysia'; // นำเข้า Elysia สำหรับสร้าง HTTP server
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient เพื่อเชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง instance ของ PrismaClient

// ประกาศ route สำหรับจัดการข้อมูล category (ประเภทโรค) โดยใช้ prefix /category
export const categoryRoutes = new Elysia({ prefix : "/category" })

    // GET /category - ดึงข้อมูลประเภทโรคทั้งหมด
    .get("/", async () => {
        const categories = await prisma.categories.findMany({}) // ดึงข้อมูลทั้งหมดจากตาราง categories จากฐานข้อมูล
        if(!categories) {
            throw new Error("ไม่สามารถเรียกข้อมูลประเภทโรคได้")
        }

        return {
            "resultData" : categories
        }
    })

    // POST /category - สร้างประเภทโรคใหม่
    .post("/", async ({ body }) => {
        // ตรวจสอบว่ามีชื่อซ้ำในระบบหรือไม่
        const category = await prisma.categories.findFirst({
            where : {
                CategoryName : body.CategoryName
            }
        })

        if(category) {
            throw new Error("ชื่อประเภทโรคซ้ำ")
        }

        // สร้างข้อมูล category ใหม่
        const newCategory = await prisma.categories.create({
            data : { // ข้อมูลที่ต้องการสร้าง
                CategoryName : body.CategoryName // ชื่อประเภทโรคที่รับมาจาก body 
            }
        })
        
        if(!newCategory) {
            throw new Error("สร้างประเภทโรคไม่สำเร็จ")
        }

        return {
            "message" : "สร้างประเภทโรคสำเร็จแล้ว"
        }
    })

    // PUT /category/:id - แก้ไขข้อมูลประเภทโรคตาม ID
    .put("/:id", async ({ body, params }) => { // ทำการแก้ไขข้อมูลประเภทโรคตาม ID ที่ระบุใน params
        
        const category = await prisma.categories.findFirst({
            where : {
                CategoryID : Number(params.id) // ตรวจสอบว่ามี category ตาม ID ว่ามีอยู่หรือไม่
            }
        })

        if(!category) {
            throw new Error("ไม่พบไอดีประเภทโรค")
        }

        // แก้ไขข้อมูล category
        const editCategory = await prisma.categories.update({
            where : {
                CategoryID : Number(params.id), // ใช้ ID ที่ระบุใน params เพื่อค้นหา category ที่ต้องการแก้ไข
            },
            data : {
                CategoryName : body.CategoryName // ชื่อประเภทโรคที่รับมาจาก body เมื่อมีการแก้ไข จะถูกอัพเดต ไปไว้ในฐานข้อมูล CategoryName
            }
        })

        if(!editCategory) {
            throw new Error("แก้ไขประเภทโรคไม่สำเร็จ")
        }

        return {
            "message" : "แก้ไขประเภทโรคสำเร็จ"
        }
    })

    // DELETE /category/:id - ลบประเภทโรคตาม ID
    .delete("/:id", async ({ params }) => {
        // ตรวจสอบว่ามี category ตาม ID หรือไม่
        const category = await prisma.categories.findFirst({
            where : {
                CategoryID : Number(params.id) // ใช้ ID ที่ระบุใน params เพื่อค้นหา category ที่ต้องการลบ
            },
        })

        if(!category) {
            throw new Error("ไม่พบประเภทโรค")
        }

        // ลบ category
        const deleteCategory = await prisma.categories.delete({
            where : {
                CategoryID : Number(params.id) // ใช้ ID ที่ระบุใน params เพื่อค้นหา category ที่ต้องการลบ
            }
        })

        if(!deleteCategory) {
            throw new Error("ลบประเภทโรคไม่สำเร็จ")
        }

        return {
            "message" : "ลบประเภทโรคสำเร็จ"
        }
    })

    // GET /category/:id - ดึงข้อมูลประเภทโรคตาม ID ในส่วนแก้ไข
    .get("/:id", async ({ params }) => {
        const category = await prisma.categories.findFirst({
            where : {
                CategoryID : Number(params.id) // ดึง ID ที่รับมาจาก params เพื่อค้นหาข้อมูลประเภทโรคที่ต้องการ
            }
        })

        if(!category) {
            throw new Error("ไม่สามารถเรียกข้อมูลประเภทโรคได้")
        }

        return {
            "resultData" : category
        }
    })
