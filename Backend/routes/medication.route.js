import { Elysia } from 'elysia'; // นำเข้า Elysia framework สำหรับสร้าง API
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient สำหรับเชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง Prisma client instance

// สร้าง router สำหรับเส้นทาง /medic
export const MedicationsRoutes = new Elysia({ prefix: "/medics" })



// GET /medics หน้าข้อมูลยาที่แสดงผล
    .get("/diseases/:id", async ({ params }) => {
        const medics = await prisma.disease_medications.findMany({ // ดึงข้อมูลการรักษาโรคที่เกี่ยวข้องกับโรคที่ระบุ
            where: {
                DiseaseID: Number(params.id) //โดยมีเงื่อนไขว่า DiseaseID ต้องตรงกับ ID ที่ระบุใน params
            },
            include: {
                medications: true,
                diseases: true,
            }
        })

        if(!medics) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : medics };
    })

// POST /diseases/medics // ส่วนเพิ่มข้อมูลการรักษาโรคใหม่
    .post("/", async ({ body }) => {
        const medics = await prisma.medications.create({
            data: {
                MedicationName: body.medic_name, //เพื่อเก็บข้อมูลชื่อยาที่ใช้รักษาโรค
                GenericName: body.generic_name, //เพื่อเก็บข้อมูลชื่อสามัญของยา
                DosageForm: body.dosage,//เพื่อเก็บข้อมูลรูปแบบการใช้ยา
                Strength: body.strength, //เพื่อเก็บข้อมูลความเข้มข้นของยา
                Indications: body.indication ? body.indication : "-", //เพื่อเก็บข้อมูลการใช้ยา
                SideEffects: body.side_effect ? body.side_effect : "-", //เพื่อเก็บข้อมูลผลข้างเคียงของยา
                Contraindications: body.contraindication ? body.contraindication : "-", //เพื่อเก็บข้อมูลข้อห้ามใช้ยา
                SymptomsDrugAllergies: body.symptoms_drug_allergies ? body.symptoms_drug_allergies : "-", // เก็บข้อมูลอาการแพ้ยา
                TreatDrugAllergies: body.treat_drug_allergies ? body.treat_drug_allergies : "-", // เก็บข้อมูลการรักษาอาการแพ้ยา
            }
        })

        const diseaseMedic = await prisma.disease_medications.create({
            data: {
                DiseaseID: Number(body.disease_id), //เพื่อเก็บข้อมูล ID ของโรคที่เกี่ยวข้องกับยา
                MedicationID: medics.MedicationID,
            }
        })

        if(!medics || !diseaseMedic) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : medics };
    })

    // GET /medics ดึงข้อมูลยาทั้งหมดในช่องแก้ไข
    .get("/:id", async ({ params }) => {
        const medics = await prisma.medications.findFirst({
            where: {
                MedicationID: Number(params.id) // แปลง ID ที่รับมาจาก params เพื่อนำมาแสดงข้อมูล
            }
        })

        if(!medics) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : medics };
    })

// PUT /diseases/medics/:id ส่วนแก้ไข
    .put("/:id", async ({ params, body }) => {
        const medics = await prisma.medications.update({
            where: {
                MedicationID: Number(params.id) // แปลง ID ที่รับมาจาก params เพื่อค้นหาข้อมูลยา
            },
            data: { //
                MedicationName: body.medic_name, //ข้อมูลชื่อยาที่ใช้รักษาโรค
                GenericName: body.generic_name, //ข้อมูลชื่อสามัญของยา
                DosageForm: body.dosage, //ข้อมูลรูปแบบการใช้ยา
                Strength: body.strength, //ข้อมูลความเข้มข้นของยา
                Indications: body.indication, //ข้อมูลการใช้ยา
                SideEffects: body.side_effect, //ข้อมูลผลข้างเคียงของยา
                Contraindications: body.contraindication, //ข้อมูลข้อห้ามใช้ยา
                SymptomsDrugAllergies: body.symptoms_drug_allergies,// // เก็บข้อมูลอาการแพ้ยา
                TreatDrugAllergies: body.treat_drug_allergies,// // เก็บข้อมูลการรักษาอาการแพ้ยา
            }
        })

        if(!medics) throw new Error("ไม่สามารถบันทึกข้อมูลได้");

        return { "resultData" : medics }; //เก็บไว้ในตัวแปร medics
    })

// DELETE /medics/:id
    .delete("/:id", async ({ params }) => {
        const medics = await prisma.medications.delete({
            where: {
                MedicationID: Number(params.id) // แปลง ID ที่รับมาจาก params เพื่อค้นหาข้อมูลยา
            }
        })

        if(!medics) throw new Error("ไม่สามารถลบข้อมูลได้");

        return { "message" : "ลบข้อมูลสำเร็จ" };
    })