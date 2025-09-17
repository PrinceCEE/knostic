import { describe, it, expect, beforeAll, vi } from "vitest";
import express from "express";
import request from "supertest";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { UploadsHandler } from "./uploads.handler";
import { CSVService } from "@/services";
import { Logger } from "@/logger";

// logger mock
const logger: Logger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  child: () => logger,
} as any;

const uploadDir = path.join(__dirname, "../uploads");
const stringsPath = path.join(uploadDir, "strings.csv");
const classificationsPath = path.join(uploadDir, "classifications.csv");

const csvService = new CSVService();
const handler = new UploadsHandler(logger, csvService);

const app = express();
app.use(express.json());

app.get("/api/csv/files", async (req, res, next) => {
  try {
    const r = await handler.getFileNames(req, res);
    res.json(r);
  } catch (e) {
    next(e);
  }
});

app.get("/api/csv/files/:filename", async (req, res, next) => {
  try {
    const r = await handler.getFile(req, res);
    res.json(r);
  } catch (e) {
    next(e);
  }
});

app.put("/api/csv/files/:filename", async (req, res, next) => {
  try {
    await handler.updateFile(req, res);
  } catch (e) {
    next(e);
  }
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

app.post(
  "/api/csv",
  upload.fields([
    { name: "stringsFile", maxCount: 1 },
    { name: "classificationsFile", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const r = await handler.handleUpload(req, res);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }
);

describe("UploadsHandler", () => {
  beforeAll(() => {
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    // seed files
    if (!fs.existsSync(classificationsPath)) {
      fs.writeFileSync(
        classificationsPath,
        "Topic,SubTopic,Industry,Classification\nT1,ST1,Ind1,C1"
      );
    }
    if (!fs.existsSync(stringsPath)) {
      fs.writeFileSync(
        stringsPath,
        "Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords\n1,Ind1,T1,ST1,Pre,0,Prompt,Risk,Key"
      );
    }
  });

  it("lists file names", async () => {
    const res = await request(app).get("/api/csv/files");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining(["strings.csv", "classifications.csv"])
    );
  });

  it("gets a file", async () => {
    const res = await request(app).get("/api/csv/files/strings.csv");
    expect(res.status).toBe(200);
    // Baseline seeded file has Prompt as 'Prompt'
    expect(res.body.data[0].Prompt).toBe("Prompt");
  });

  it("updates strings.csv successfully", async () => {
    const res = await request(app)
      .put("/api/csv/files/strings.csv")
      .send({
        updates: [
          {
            Tier: "1",
            Industry: "Ind1",
            Topic: "T1",
            Subtopic: "ST1",
            Prefix: "Pre",
            "Fuzzing-Idx": "0",
            Prompt: "Prompt 2",
            Risks: "Risk",
            Keywords: "Key",
          },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects invalid strings update (bad combination)", async () => {
    const res = await request(app)
      .put("/api/csv/files/strings.csv")
      .send({
        updates: [
          {
            Tier: "1",
            Industry: "BadInd",
            Topic: "T1",
            Subtopic: "ST1",
            Prefix: "Pre",
            "Fuzzing-Idx": "0",
            Prompt: "Prompt 3",
            Risks: "Risk",
            Keywords: "Key",
          },
        ],
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("uploads new files", async () => {
    const newClassFile = path.join(uploadDir, "new-classifications.csv");
    fs.writeFileSync(
      newClassFile,
      "Topic,SubTopic,Industry,Classification\nT2,ST2,Ind2,C2"
    );
    const newStringsFile = path.join(uploadDir, "new-strings.csv");
    fs.writeFileSync(
      newStringsFile,
      "Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords\n1,Ind2,T2,ST2,Pre,0,PromptX,Risk,Key"
    );

    const res = await request(app)
      .post("/api/csv")
      .attach("classificationsFile", newClassFile)
      .attach("stringsFile", newStringsFile);
    expect(res.status).toBe(200);
    expect(res.body.data.classificationsData.length).toBeGreaterThan(0);
    expect(res.body.data.stringsData.length).toBeGreaterThan(0);
  });
});
