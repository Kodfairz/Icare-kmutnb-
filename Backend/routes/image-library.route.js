import { Elysia } from 'elysia'; // นำเข้า Elysia framework สำหรับสร้าง API
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient สำหรับเชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง Prisma client instance

// สร้าง router สำหรับเส้นทาง /images
export const ImageRoutes = new Elysia({ prefix: "/images" })

// GET /images
    .get("/", async () => {
        const images = await prisma.imagelibrary.findMany() // ดึงข้อมูลภาพทั้งหมดจากฐานข้อมูล

        if(!images) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : images };
    })
// POST /images
    .post("/", async ({ body }) => {
        // ตรวจสอบว่า title ซ้ำหรือไม่
        const image = await prisma.imagelibrary.findFirst({
            where : { ImageName : body.image_name } // ตรวจสอบว่ามีชื่อภาพซ้ำในระบบหรือไม่
        })

        if(image) throw new Error("มีข้อมูลนี้แล้ว");

        const newImage = await prisma.imagelibrary.create({
            data: {
                ImageName: body.image_name,
                ImageURL: body.image_url,
                Credit: body.credit,
            }
        })

        if(!newImage) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : newImage };
    })

    // GET /images/:id ส่วนนี้ใช้เพื่อดึงข้อมูลภาพตาม ID ที่ระบุ เพื่อนำมาแก้ไข  ดึงข้อมูลในหน้าแก้ไข
    .get("/:id", async ({ params }) => {
        const image = await prisma.imagelibrary.findFirst({
            where: {
                ImageID: Number(params.id) // แปลง ID ที่รับมาจาก params 
            }
        })

        if(!image) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : image };
    })

// PUT /images/:id แก้ไขข้อมูลภาพตาม ID ที่ระบุ
    .put("/:id", async ({ params, body }) => {
        const image = await prisma.imagelibrary.update({
            where: {
                ImageID: Number(params.id) // แปลง ID ที่รับมาจาก params 
            },
            data: {
                ImageName: body.image_name,
                ImageURL: body.image_url,
                Credit: body.credit,
            }
        })

        if(!image) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : image };
    })

// DELETE /images/:id
    .delete("/:id", async ({ params }) => {
        const image = await prisma.imagelibrary.delete({
            where: {
                ImageID: Number(params.id) // แปลง ID ที่รับมาจาก params
            }
        })

        if(!image) throw new Error("ไม่สามารถลบข้อมูลได้");

        return { "message" : "ลบข้อมูลสำเร็จ" };
    })