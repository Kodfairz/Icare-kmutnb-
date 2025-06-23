import { Elysia } from 'elysia'; // นำเข้า Elysia framework สำหรับสร้าง API
import { PrismaClient } from '@prisma/client'; // นำเข้า PrismaClient สำหรับเชื่อมต่อฐานข้อมูล

const prisma = new PrismaClient(); // สร้าง Prisma client instance

// สร้าง router สำหรับเส้นทาง /posts
export const postRoutes = new Elysia({ prefix: "/posts" })

    // POST /posts - สร้างโพสต์ใหม่
    //
    .post("/", async ({ body }) => {
        console.log("Creating new post with body:", body);
        // ตรวจสอบว่า title ซ้ำหรือไม่
        const diseases = await prisma.diseases.findFirst({
            where : { DiseaseName : body.name }
        })

        if(diseases) throw new Error("มีข้อมูลนี้แล้ว");

        // สร้างโรคใหม่
        const newDisease = await prisma.diseases.create({
            data : {
                DiseaseName : body.name, 
                Description : body.description,
                CategoryID : Number(body.category_id),
                RiskFactors : body.risk_factors,
                Prevention : body.prevention,
                Symptoms : body.symptoms,
                Diagnosis : body.diagnosis,
                ICD10_Code : body.icd10_code,
            }
        })

        // // สร้างรูปใหม่
        // const newImage = await prisma.imagelibrary.create({
        //     data : {
        //         ImageName : body.image_name,
        //         ImageURL : body.image_url,
        //     }
        // })

        // // สร้างวิดีโอใหม่
        // const newVideo = await prisma.videolibrary.create({
        //     data : {
        //         VideoName : body.video_name,
        //         VideoURL : body.video_url,
        //     }
        // })

        // สร้างโพสต์ใหม่
        const newPost = await prisma.healtharticles.create({
            data : {
                DiseaseID : newDisease.DiseaseID,
                AdminID : Number(body.admin_id),
                ImageID : Number(body.image_id),
                VideoID : body.video_id ? Number(body.video_id) : null,
                Views : 0,
                isActive : body.isActive,
            }
        })

        if(!newPost) throw new Error("เพิ่มข้อมูลไม่สำเร็จ");

        return { "message" : "เพิ่มข้อมูลสำเร็จแล้ว" };
    })

    // GET /posts - ดึงโพสต์ทั้งหมดที่เปิดเผยอยู่ (isActive)
    .get("/", async () => {
        const healtharticles = await prisma.healtharticles.findMany({
            where : { isActive : true }, // ดึงเฉพาะโพสต์ที่เปิดเผยอยู่
            include : {
                diseases: {
                    include: { categories: true }
                },
                imagelibrary: true
            }
        })

        if(!healtharticles) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : healtharticles };
    })

    // GET /posts/post-recommend - ดึงโพสต์ยอดนิยม (views มากสุด 6 อันดับ)
    .get("/post-recommend", async () => {
        const healtharticles = await prisma.healtharticles.findMany({
            orderBy: { Views: 'desc' }, // เรียงลำดับจาก Views มากไปน้อย
            include : {
                diseases : { // ดึงข้อมูลโรคที่เกี่ยวข้อง
                    include : { 
                        categories : true // ดึงข้อมูลหมวดหมู่ของโรค
                    }
                },
                imagelibrary : true, // ดึงข้อมูลรูปภาพที่เกี่ยวข้อง
                videolibrary : true, // ดึงข้อมูลวิดีโอที่เกี่ยวข้อง
            },
            where : { isActive : true }, //ดึงเฉพาะโพสต์ที่เปิดเผยอยู่
            take: 6 
        });

        if(!healtharticles) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : healtharticles };
    })

    // GET /posts/admin - ดึงโพสต์ทั้งหมด (รวมโพสต์ที่ไม่ active)
    .get("/admin", async () => {
        const healtharticles = await prisma.healtharticles.findMany({
            include : {
                diseases : {
                    include : {
                        categories : true
                    }
                },
                imagelibrary : true,
                videolibrary : true,
                articleedits : { // ดึงข้อมูลการแก้ไขโพสต์ล่าสุด
                    orderBy : {
                        EditDate : 'desc' // เรียงลำดับจากวันที่แก้ไขล่าสุด
                    },
                    take : 1 // ดึงแค่การแก้ไขล่าสุด
                },
                admins : true, // ดึงข้อมูลผู้ดูแลโพสต์
            }
        })

        if(!healtharticles) throw new Error("ไม่สามารถเรียกข้อมูลได้");

        return { "resultData" : healtharticles }; // ส่งข้อมูลโพสต์ทั้งหมดที่ดึงมาได้
    })

    // PATCH /posts/change-status/:id - เปลี่ยนสถานะการเผยแพร่ของโพสต์
    .patch("/change-status/:id", async ({ body, params }) => {  // ถ้ารับ id ต้องใช้ params
        const healtharticles = await prisma.healtharticles.findFirst({ 
            where : { HealthArticleID : Number(params.id) }  // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
        })

        if(!healtharticles) throw new Error("ไม่เจอข้อมูล");

        const updateHealtharticles = await prisma.healtharticles.update({
            data : {
                isActive : body.isActive,
            },
            where : { HealthArticleID : Number(params.id) } // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
        })

        await prisma.articleedits.create({
            data : {
                HealthArticleID : healtharticles.HealthArticleID,
                AdminID : Number(body.admin_id),
                EditDescription : "เปลี่ยนสถานะการเผยแพร่", // คำอธิบายการแก้ไข
            }
        })

        if(!updateHealtharticles) throw new Error("ไม่สามารถเปลี่ยนแปลงสถานะการเผยแพร่ได้");

        return { "message" : "เปลี่ยนสถานะสำเร็จ" };
    })

    // DELETE คือ http method /posts/:id - ลบโพสต์
    .delete("/:id", async ({ params }) => {
        console.log(params)
        const healtharticles = await prisma.healtharticles.findFirst({
            where : { HealthArticleID : Number(params.id) } // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
        })

        if(!healtharticles) throw new Error("ไม่เจอข้อมูล");

        const deleteDisease = await prisma.diseases.delete({
            where: { DiseaseID: healtharticles.DiseaseID } // ดึงโพสต์ตาม DiseaseID ที่ได้จาก healtharticles เพื่อทำการลบโรคที่เกี่ยวข้อง
        })

        // ลบ medications ที่ไม่มีโรคอื่นใช้อยู่ deleteMany คือ ลบข้อทั้งหมดที่ตรงตามเงื่อนไข
        await prisma.medications.deleteMany({ 
            where: {
                disease_medications: {
                    none: {} // ไม่มีการเชื่อมโยงกับ disease อื่นๆ
                }
            }
        });

        // ลบ treatments ที่ไม่มีโรคอื่นใช้อยู่
        await prisma.treatments.deleteMany({
            where: {
                disease_treatments: {
                    none: {}
                }
            }
        });

        if(!deleteDisease) throw new Error("ไม่สามารถลบข้อมูลได้");

        return { "message" : "ลบข้อมูลสำเร็จ" };
    })

    // GET /posts/:id - ดึงข้อมูลโพสต์ตาม ID ในส่วนของแก้ไขดึงข้อมูลมาแสดง
    .get("/:id", async ({ params }) => {
        const healtharticles = await prisma.healtharticles.findFirst({
            where : { HealthArticleID : Number(params.id) }, // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
            include: {
                diseases: true,
                videolibrary: true,
            }
        })

        if(!healtharticles) throw new Error("ไม่เจอข้อมูล");

        return { "resultData" : healtharticles }; // ส่งข้อมูลโพสต์ที่ดึงมาได้
    })

    // PUT /posts/:id - แก้ไขข้อมูลโพสต์
    .put("/:id", async ({ body, params }) => {
        console.log(body)
        const healtharticles = await prisma.healtharticles.findFirst({ // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
            where : { DiseaseID : Number(params.id) } // ดึงโพสต์ตาม DiseaseID ที่ได้จาก params
        })

        if(!healtharticles) throw new Error("ไม่เจอข้อมูล");

        const updateDisease = await prisma.diseases.update({
            where: { DiseaseID: Number(params.id) }, // แก้ไขตาม ID ของโรคที่ส่งมา จาก params 
            data: {
                DiseaseName: body.name,
                Description: body.description,
                categories: {
                    connect: { CategoryID: body.category_id }
                },
                RiskFactors: body.risk_factors,
                Prevention: body.prevention,
                Symptoms: body.symptoms,
                Diagnosis: body.diagnosis,
                ICD10_Code: body.icd10_code,
            }
        })

        const updateHealthArticles = await prisma.healtharticles.update({
            where: { HealthArticleID: healtharticles.HealthArticleID }, // ทำการดึงตัวแปร healtharticles ที่ได้มา จากการค้นหา เพื่อมาแก้ไขตาราง HealthArticles
            data: { // ทำการรับข้อมูลจาก request body เพื่อมาแก้ไขตาราง HealthArticles ส่วนนี้
                AdminID: Number(body.admin_id), 
                ImageID: Number(body.image_id),
                VideoID: body.video_id ? Number(body.video_id) : null,
                isActive: body.isActive,
            }
        })

        await prisma.articleedits.create({
            data : {
                HealthArticleID : healtharticles.HealthArticleID,
                AdminID : Number(body.admin_id),
                EditDescription : body.edit_description,
            }
        })

        if(!updateDisease || !updateHealthArticles) throw new Error("ไม่สามารถแก้ไขข้อมูลได้");

        return { "message" : "แก้ไขข้อมูลสำเร็จ" };
    })

    // GET /posts/user/:id - ดึงข้อมูลโพสต์ตาม ID ของผู้ใช้ และเพิ่มยอด View ข้อมูลภายใน post   findFirst ดึง healtharticles มาแสดงอันเดียว
    .get("/user/:id", async ({ params }) => {
        const healtharticles = await prisma.healtharticles.findFirst({
            where : { HealthArticleID : Number(params.id) }, // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
            include: {
                diseases: {
                    include : {
                        categories : true,
                        disease_medications : {
                            include : {
                                medications : true,
                            },
                        },
                        disease_treatments : {
                            include : {
                                treatments : true,
                            },
                        },
                    },
                },
                videolibrary: true,
                imagelibrary: true,
                admins: true,
                articleedits : {
                    orderBy : {
                        EditDate : 'desc'   // เรียงลำดับจากวันที่แก้ไขล่าสุด
                    },
                    take : 1 // ดึงแค่การแก้ไขล่าสุด
                },
            }
        })

        if(!healtharticles) throw new Error("ไม่เจอข้อมูล");

        // อัปเดตยอดผู้ชม
        const updateView = await prisma.healtharticles.update({
            where : { HealthArticleID : Number(params.id) }, // ดึงโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
            data : { Views : healtharticles.Views + 1 } // เพิ่มยอด View ขึ้น ทีละ 1
        })

        return { "resultData" : healtharticles }; // ส่งข้อมูลโพสต์ที่ดึงมาได้
    })

    // GET /posts/history/:id - ดึงประวัติการแก้ไขโพสต์ตาม ID  findMany คือดึงข้อมูลทั้งหมดที่เกี่ยวข้องกับ articleedits ที่ส่งมา
    .get("/history/:id", async ({ params }) => {
        const history = await prisma.articleedits.findMany({
            where : { HealthArticleID : Number(params.id) }, // ดึงประวัติการแก้ไขโพสต์ตาม HealthArticleID ด้วย ID ที่ส่งมา จาก params
        })

        if(!history) throw new Error("ไม่เจอข้อมูล");

        return { "resultData" : history };
    })