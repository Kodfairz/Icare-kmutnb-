-- CreateEnum
CREATE TYPE "admins_Role" AS ENUM ('SuperAdmin', 'Admin', '');

-- CreateTable
CREATE TABLE "admins" (
    "AdminID" SERIAL NOT NULL,
    "AdminName" VARCHAR(100) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "CreatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Role" "admins_Role" NOT NULL DEFAULT 'Admin',

    CONSTRAINT "admins_pkey" PRIMARY KEY ("AdminID")
);

-- CreateTable
CREATE TABLE "articleedits" (
    "EditID" SERIAL NOT NULL,
    "HealthArticleID" INTEGER NOT NULL,
    "AdminID" INTEGER NOT NULL,
    "EditDate" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EditDescription" TEXT,

    CONSTRAINT "articleedits_pkey" PRIMARY KEY ("EditID")
);

-- CreateTable
CREATE TABLE "categories" (
    "CategoryID" SERIAL NOT NULL,
    "CategoryName" VARCHAR(100) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("CategoryID")
);

-- CreateTable
CREATE TABLE "disease_medications" (
    "DiseaseID" INTEGER NOT NULL,
    "MedicationID" INTEGER NOT NULL,

    CONSTRAINT "disease_medications_pkey" PRIMARY KEY ("DiseaseID","MedicationID")
);

-- CreateTable
CREATE TABLE "disease_treatments" (
    "DiseaseID" INTEGER NOT NULL,
    "TreatmentID" INTEGER NOT NULL,

    CONSTRAINT "disease_treatments_pkey" PRIMARY KEY ("DiseaseID","TreatmentID")
);

-- CreateTable
CREATE TABLE "diseases" (
    "DiseaseID" SERIAL NOT NULL,
    "DiseaseName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "CategoryID" INTEGER NOT NULL,
    "ICD10_Code" VARCHAR(20),
    "RiskFactors" TEXT NOT NULL,
    "Prevention" TEXT NOT NULL,
    "Symptoms" TEXT NOT NULL,
    "Diagnosis" TEXT NOT NULL,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("DiseaseID")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "FeedbackID" SERIAL NOT NULL,
    "FeedbackText" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "HealthArticleID" INTEGER,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("FeedbackID")
);

-- CreateTable
CREATE TABLE "healtharticles" (
    "HealthArticleID" SERIAL NOT NULL,
    "DiseaseID" INTEGER NOT NULL,
    "AdminID" INTEGER NOT NULL,
    "ImageID" INTEGER NOT NULL,
    "VideoID" INTEGER,
    "Views" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "healtharticles_pkey" PRIMARY KEY ("HealthArticleID")
);

-- CreateTable
CREATE TABLE "imagelibrary" (
    "ImageID" SERIAL NOT NULL,
    "ImageName" VARCHAR(255) NOT NULL,
    "ImageURL" VARCHAR(255) NOT NULL,
    "Credit" VARCHAR(255) NOT NULL,

    CONSTRAINT "imagelibrary_pkey" PRIMARY KEY ("ImageID")
);

-- CreateTable
CREATE TABLE "medications" (
    "MedicationID" SERIAL NOT NULL,
    "MedicationName" VARCHAR(255) NOT NULL,
    "GenericName" VARCHAR(255) NOT NULL,
    "DosageForm" VARCHAR(100) NOT NULL,
    "Strength" VARCHAR(50),
    "Indications" TEXT,
    "SideEffects" TEXT,
    "Contraindications" TEXT,
    "SymptomsDrugAllergies" VARCHAR(255),
    "TreatDrugAllergies" VARCHAR(255),

    CONSTRAINT "medications_pkey" PRIMARY KEY ("MedicationID")
);

-- CreateTable
CREATE TABLE "treatments" (
    "TreatmentID" SERIAL NOT NULL,
    "TreatmentName" VARCHAR(255) NOT NULL,
    "Description" TEXT NOT NULL,
    "Procedures" TEXT NOT NULL,
    "Duration" VARCHAR(50) NOT NULL,
    "SideEffects" TEXT,
    "Contraindications" TEXT,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("TreatmentID")
);

-- CreateTable
CREATE TABLE "videoarticles" (
    "VideoArticleID" SERIAL NOT NULL,
    "AdminID" INTEGER NOT NULL,
    "ImageID" INTEGER NOT NULL,
    "VideoID" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Views" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "videoarticles_pkey" PRIMARY KEY ("VideoArticleID")
);

-- CreateTable
CREATE TABLE "videolibrary" (
    "VideoID" SERIAL NOT NULL,
    "VideoName" VARCHAR(255) NOT NULL,
    "VideoURL" VARCHAR(255) NOT NULL,

    CONSTRAINT "videolibrary_pkey" PRIMARY KEY ("VideoID")
);

-- CreateIndex
CREATE INDEX "articleedits_AdminID_idx" ON "articleedits"("AdminID");

-- CreateIndex
CREATE INDEX "articleedits_HealthArticleID_idx" ON "articleedits"("HealthArticleID");

-- CreateIndex
CREATE INDEX "MedicationID" ON "disease_medications"("MedicationID");

-- CreateIndex
CREATE INDEX "TreatmentID" ON "disease_treatments"("TreatmentID");

-- CreateIndex
CREATE INDEX "CategoryID" ON "diseases"("CategoryID");

-- CreateIndex
CREATE INDEX "feedbacks_HealthArticleID_idx" ON "feedbacks"("HealthArticleID");

-- CreateIndex
CREATE INDEX "healtharticles_AdminID_idx" ON "healtharticles"("AdminID");

-- CreateIndex
CREATE INDEX "DiseaseID" ON "healtharticles"("DiseaseID");

-- CreateIndex
CREATE INDEX "ImageID" ON "healtharticles"("ImageID");

-- CreateIndex
CREATE INDEX "healtharticles_VideoID_idx" ON "healtharticles"("VideoID");

-- CreateIndex
CREATE INDEX "videoarticles_VideoID_idx" ON "videoarticles"("VideoID");

-- CreateIndex
CREATE INDEX "videoarticles_AdminID_idx" ON "videoarticles"("AdminID");

-- CreateIndex
CREATE INDEX "videoarticles_ImageID_idx" ON "videoarticles"("ImageID");

-- AddForeignKey
ALTER TABLE "articleedits" ADD CONSTRAINT "articleedits_ibfk_1" FOREIGN KEY ("HealthArticleID") REFERENCES "healtharticles"("HealthArticleID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "articleedits" ADD CONSTRAINT "articleedits_ibfk_2" FOREIGN KEY ("AdminID") REFERENCES "admins"("AdminID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "disease_medications" ADD CONSTRAINT "disease_medications_ibfk_1" FOREIGN KEY ("DiseaseID") REFERENCES "diseases"("DiseaseID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "disease_medications" ADD CONSTRAINT "disease_medications_ibfk_2" FOREIGN KEY ("MedicationID") REFERENCES "medications"("MedicationID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "disease_treatments" ADD CONSTRAINT "disease_treatments_ibfk_1" FOREIGN KEY ("DiseaseID") REFERENCES "diseases"("DiseaseID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "disease_treatments" ADD CONSTRAINT "disease_treatments_ibfk_2" FOREIGN KEY ("TreatmentID") REFERENCES "treatments"("TreatmentID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "diseases" ADD CONSTRAINT "diseases_ibfk_1" FOREIGN KEY ("CategoryID") REFERENCES "categories"("CategoryID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_ibfk_1" FOREIGN KEY ("HealthArticleID") REFERENCES "healtharticles"("HealthArticleID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "healtharticles" ADD CONSTRAINT "healtharticles_ibfk_1" FOREIGN KEY ("DiseaseID") REFERENCES "diseases"("DiseaseID") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "healtharticles" ADD CONSTRAINT "healtharticles_ibfk_2" FOREIGN KEY ("ImageID") REFERENCES "imagelibrary"("ImageID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "healtharticles" ADD CONSTRAINT "healtharticles_ibfk_3" FOREIGN KEY ("VideoID") REFERENCES "videolibrary"("VideoID") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "healtharticles" ADD CONSTRAINT "healtharticles_ibfk_4" FOREIGN KEY ("AdminID") REFERENCES "admins"("AdminID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "videoarticles" ADD CONSTRAINT "imagearticles_ibfk_1" FOREIGN KEY ("ImageID") REFERENCES "imagelibrary"("ImageID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "videoarticles" ADD CONSTRAINT "videoarticles_ibfk_1" FOREIGN KEY ("VideoID") REFERENCES "videolibrary"("VideoID") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "videoarticles" ADD CONSTRAINT "videoarticles_ibfk_2" FOREIGN KEY ("AdminID") REFERENCES "admins"("AdminID") ON DELETE RESTRICT ON UPDATE RESTRICT;
