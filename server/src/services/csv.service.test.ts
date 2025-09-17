import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CSVService } from "./csv.service";

const tmpDir = path.join(__dirname, "../uploads");
const stringsPath = path.join(tmpDir, "strings.csv");
const classificationsPath = path.join(tmpDir, "classifications.csv");

const csvService = new CSVService();

const sampleClassifications = `Topic,SubTopic,Industry,Classification\nT1,ST1,Ind1,C1\nT2,ST2,Ind2,C2`;
const sampleStrings = `Tier,Industry,Topic,Subtopic,Prefix,Fuzzing-Idx,Prompt,Risks,Keywords\n1,Ind1,T1,ST1,Pre,0,Do something,RiskA,KeyA\n2,Ind2,T2,ST2,Pre,1,Do more,RiskB,KeyB`;

describe("CSVService", () => {
  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(classificationsPath, sampleClassifications);
    fs.writeFileSync(stringsPath, sampleStrings);
  });

  afterAll(() => {
    try {
      if (fs.existsSync(tmpDir)) {
        for (const file of fs.readdirSync(tmpDir)) {
          if (file.endsWith(".csv")) {
            try {
              fs.unlinkSync(path.join(tmpDir, file));
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch {
      /* ignore */
    }
  });

  it("parse should read classifications file", async () => {
    const { results, headers } = await csvService.parse<any>(
      classificationsPath
    );
    expect(headers).toEqual([
      "Topic",
      "SubTopic",
      "Industry",
      "Classification",
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].Topic).toBe("T1");
  });

  it("parse should read strings file", async () => {
    const { results, headers } = await csvService.parse<any>(stringsPath);
    expect(headers).toHaveLength(9);
    expect(results[1].Prompt).toBe("Do more");
  });

  it("normalise should trim key whitespace", () => {
    const rows = [{ " Topic ": "T1", "SubTopic ": "ST1" } as any];
    const norm = csvService.normalise(rows);

    expect(Object.keys(norm[0])).toEqual(["Topic", "SubTopic"]);
  });

  it("validators should validate strings vs classifications", async () => {
    const { results: classRows } = await csvService.parse<any>(
      classificationsPath
    );
    const { results: stringRows } = await csvService.parse<any>(stringsPath);
    const { isValid, errors } = csvService.validateStringsData(
      stringRows,
      classRows
    );
    expect(isValid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("validators should catch invalid combination", () => {
    const classRows = [
      { Topic: "T1", SubTopic: "ST1", Industry: "Ind1", Classification: "C1" },
    ];
    const stringRows = [
      {
        Tier: "1",
        Industry: "BadInd",
        Topic: "T1",
        Subtopic: "ST1",
        Prefix: "Pre",
        "Fuzzing-Idx": "0",
        Prompt: "Prompt",
        Risks: "R",
        Keywords: "K",
      },
    ];
    const { isValid, errors } = csvService.validateStringsData(
      stringRows as any,
      classRows as any
    );
    expect(isValid).toBe(false);
    expect(errors[0].error).toContain("Invalid combination");
  });

  it("validateClassificationsData should find missing fields", () => {
    const rows = [
      { Topic: "", SubTopic: "ST", Industry: "Ind", Classification: "" },
    ];
    const { isValid, errors } = csvService.validateClassificationsData(
      rows as any
    );
    expect(isValid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });
});
