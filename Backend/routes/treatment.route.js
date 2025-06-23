import { Elysia } from 'elysia'; // นำเข้า Elysia framework สำหรับสร้าง API
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient สำหรับเชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง Prisma client instance

// สร้าง router สำหรับเส้นทาง /treatments
export const TreatmentsRoutes = new Elysia({ prefix: "/treatments" })

// GET /treatments 
    .get("/diseases/:id", async ({ params }) => {
        const treatments = await prisma.disease_treatments.findMany({
            where: {
                DiseaseID: Number(params.id) // ดึงข้อมูลการรักษาที่เกี่ยวข้องกับโรคที่ระบุ โดยใช้ ID ของโรค ตาม ที่ระบุใน params
            },
            include: { //ทำการรวมข้อมูลการรักษาและโรคที่เกี่ยวข้องเพื่อมาแสดงผล
                treatments: true,
                diseases: true,
            }
        })

        if(!treatments) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : treatments };
    })

// POST /diseases/treatments //เพิ่มข้อมูลการรักษาโรคใหม่
    .post("/", async ({ body }) => {
        const treatments = await prisma.treatments.create({
            data: {
                TreatmentName: body.treatment_name, //เพื่อเก็บข้อมูลชื่อการรักษาโรค
                Description: body.description, //เพื่อเก็บข้อมูลรายละเอียดการรักษา
                Procedures: body.procedure, //เพื่อเก็บข้อมูลขั้นตอนการรักษา
                Duration: body.duration, //เพื่อเก็บข้อมูลระยะเวลาการรักษา
                SideEffects: body.side_effect ? body.side_effect : "-", //เพื่อเก็บข้อมูลผลข้างเคียงของการรักษา
                Contraindications: body.contraindication ? body.contraindication : "-", //เพื่อเก็บข้อมูลข้อห้ามใช้การรักษา
            }
        })

        const diseaseTreatment = await prisma.disease_treatments.create({
            data: {
                DiseaseID: Number(body.disease_id), //เพื่อเก็บข้อมูล ID ของโรคที่เกี่ยวข้องกับการรักษา
                TreatmentID: treatments.TreatmentID, //เพื่อเก็บข้อมูล ID ของการรักษาที่เกี่ยวข้องกับโรค
            }
        })

        if(!treatments || !diseaseTreatment) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : treatments };
    })

    // GET /treatments ดึงข้อมูลการรักษาทั้งหมดในส่วนแก้ไข
    .get("/:id", async ({ params }) => {
        const treatments = await prisma.treatments.findFirst({
            where: {
                TreatmentID: Number(params.id) // ดึงข้อมูลในแต่ละแถว เพื่อ นำมาแก้ไข ใน ID ของการรักษา ตามที่ระบุใน params
            }
        })

        if(!treatments) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : treatments };
    })

// PUT /diseases/treatments/:id แก้ไขข้อมูลการรักษาโรคตาม ID ที่ระบุ
    .put("/:id", async ({ params, body }) => {
        const treatments = await prisma.treatments.update({
            where: {
                TreatmentID: Number(params.id) // แปลง ID ที่รับมาจาก params เพื่อค้นหาข้อมูลการรักษาที่ต้องการแก้ไข
            },
            data: {
                TreatmentName: body.treatment_name, //เพื่อเก็บข้อมูลชื่อการรักษาโรค
                Description: body.description, //เพื่อเก็บข้อมูลรายละเอียดการรักษา
                Procedures: body.procedure, //เพื่อเก็บข้อมูลขั้นตอนการรักษา
                Duration: body.duration, //เพื่อเก็บข้อมูลระยะเวลาการรักษา
                SideEffects: body.side_effect, //เพื่อเก็บข้อมูลผลข้างเคียงของการรักษา
                Contraindications: body.contraindication, //เพื่อเก็บข้อมูลข้อห้ามใช้การรักษา
            }
        })

        if(!treatments) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : treatments };
    })

// DELETE /treatments/:id
    .delete("/:id", async ({ params }) => {
        const treatments = await prisma.treatments.delete({
            where: {
                TreatmentID: Number(params.id) // แปลง ID ที่รับมาจาก params เพื่อค้นหาข้อมูลการรักษาที่ต้องการลบ
            }
        })

        if(!treatments) throw new Error("ไม่สามารถลบข้อมูลได้");

        return { "message" : "ลบข้อมูลสำเร็จ" };
    })