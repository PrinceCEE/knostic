import { useCallback, useEffect, useState } from "react";
import { Table, Tabs, UploadButton } from "@/components";
import type { StringsData, ClassificationsData, ApiErrorLike } from "@/types";
import { apiService } from "@/api";

function Home() {
  const [stringsData, setStringsData] = useState<StringsData[]>([]);
  const [classificationsData, setClassificationsData] = useState<
    ClassificationsData[]
  >([]);
  const [fileList, setFileList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [tabLoadingIndex, setTabLoadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveErrorList, setSaveErrorList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [stringsSnapshot, setStringsSnapshot] = useState<StringsData[] | null>(
    null
  );
  const [classificationsSnapshot, setClassificationsSnapshot] = useState<
    ClassificationsData[] | null
  >(null);

  const stringsDataHeaders = [
    "Tier",
    "Industry",
    "Topic",
    "Subtopic",
    "Prefix",
    "Fuzzing-Idx",
    "Prompt",
    "Risks",
    "Keywords",
  ];

  const classificationsDataHeaders = [
    "Topic",
    "SubTopic",
    "Industry",
    "Classification",
  ];

  const fetchFiles = useCallback(async () => {
    try {
      const files = await apiService.getFiles();
      setFileList(files);
      return files;
    } catch (err: unknown) {
      console.error(err);
      return [] as string[];
    }
  }, []);

  const fetchFileData = useCallback(async (filename: string) => {
    try {
      const rows = await apiService.getFile(filename);
      if (filename.includes("strings")) {
        setStringsData(rows as StringsData[]);
      } else if (filename.includes("classifications")) {
        setClassificationsData(rows as ClassificationsData[]);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const files = await fetchFiles();
      if (files.length > 0) {
        setActiveTab(0);
        await fetchFileData(files[0]);
      }
    })();
  }, [fetchFiles, fetchFileData]);

  const handleStringsUpload = async (file: File | null) => {
    if (!file) return;
    setUploadLoading(true);
    setError(null);
    try {
      const data = await apiService.uploadFile({ stringsFile: file });
      if (data?.stringsData) {
        setStringsData(data.stringsData);
      }
      const files = await fetchFiles();
      const idx = files.findIndex((f) => f.includes("strings"));
      if (idx >= 0) {
        setActiveTab(idx);
        await fetchFileData(files[idx]);
      }
    } catch (err: unknown) {
      const e = err as ApiErrorLike;
      if (e && e.response) {
        setError(
          e.response.data?.error || e.response.data?.message || "Upload failed"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClassificationsUpload = async (file: File | null) => {
    if (!file) return;
    setUploadLoading(true);
    setError(null);
    try {
      const data = await apiService.uploadFile({ classificationsFile: file });
      if (data?.classificationsData)
        setClassificationsData(data.classificationsData);
      const files = await fetchFiles();
      const idx = files.findIndex((f) => f.includes("classifications"));
      if (idx >= 0) {
        setActiveTab(idx);
        await fetchFileData(files[idx]);
      }
    } catch (err: unknown) {
      const e = err as ApiErrorLike;
      if (e && e.response) {
        setError(
          e.response.data?.error || e.response.data?.message || "Upload failed"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const activeFilename = fileList[activeTab];
  const isStringsActive = activeFilename?.includes("strings");
  const currentTable = isStringsActive ? stringsData : classificationsData;
  const currentHeaders = isStringsActive
    ? stringsDataHeaders
    : classificationsDataHeaders;

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    if (isStringsActive) {
      setStringsData((prev) => {
        const next = [...prev];
        const row: StringsData = { ...next[rowIndex] };
        if (field in row) {
          (row as Record<string, string>)[field] = value;
        }
        next[rowIndex] = row;
        setDirty(true);
        return next;
      });
    } else {
      setClassificationsData((prev) => {
        const next = [...prev];
        const row: ClassificationsData = { ...next[rowIndex] };
        if (field in row) {
          (row as Record<string, string>)[field] = value;
        }
        next[rowIndex] = row;
        setDirty(true);
        return next;
      });
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    if (isStringsActive) {
      setStringsData((prev) => prev.filter((_, i) => i !== rowIndex));
    } else {
      setClassificationsData((prev) => prev.filter((_, i) => i !== rowIndex));
    }
    setDirty(true);
  };

  const handleAddRow = () => {
    if (isStringsActive) {
      const blank: StringsData = {
        Tier: "",
        Industry: "",
        Topic: "",
        Subtopic: "",
        Prefix: "",
        "Fuzzing-Idx": "",
        Prompt: "",
        Risks: "",
        Keywords: "",
      };
      setStringsData((prev) => [blank, ...prev]);
    } else {
      const blank: ClassificationsData = {
        Topic: "",
        SubTopic: "",
        Industry: "",
        Classification: "",
      };
      setClassificationsData((prev) => [blank, ...prev]);
    }
    setDirty(true);
  };

  const validateCurrent = (): string[] => {
    const errors: string[] = [];
    if (isStringsActive) {
      stringsData.forEach((row, idx) => {
        [
          "Tier",
          "Industry",
          "Topic",
          "Subtopic",
          "Prefix",
          "Fuzzing-Idx",
          "Prompt",
        ].forEach((field) => {
          if (!(row as Record<string, string>)[field]) {
            errors.push(`Row ${idx + 1}: ${field} is empty`);
          }
        });
      });
    } else {
      classificationsData.forEach((row, idx) => {
        ["Topic", "SubTopic", "Industry", "Classification"].forEach((field) => {
          if (!(row as Record<string, string>)[field]) {
            errors.push(`Row ${idx + 1}: ${field} is empty`);
          }
        });
      });
    }
    return errors;
  };

  const handleSave = async () => {
    if (!activeFilename) return;
    setSaveErrorList([]);
    setError(null);
    const clientErrors = validateCurrent();
    if (clientErrors.length) {
      setSaveErrorList(clientErrors);
      return;
    }
    setSaving(true);
    try {
      const payload = isStringsActive ? stringsData : classificationsData;
      const result = await apiService.updateFile(activeFilename, payload);
      if (!result?.success) {
        const serverErrors = Array.isArray(result?.data)
          ? (result.data as string[])
          : [];
        setSaveErrorList(serverErrors.length ? serverErrors : ["Save failed"]);
        return;
      }

      await fetchFileData(activeFilename);
      setDirty(false);

      if (isStringsActive) {
        setStringsSnapshot(stringsData.map((r) => ({ ...r })));
      } else {
        setClassificationsSnapshot(classificationsData.map((r) => ({ ...r })));
      }
    } catch {
      setSaveErrorList(["Unexpected error saving changes"]);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!dirty) return;
    if (isStringsActive && stringsSnapshot) {
      setStringsData(stringsSnapshot.map((r) => ({ ...r })));
    } else if (!isStringsActive && classificationsSnapshot) {
      setClassificationsData(classificationsSnapshot.map((r) => ({ ...r })));
    }
    setDirty(false);
    setSaveErrorList([]);
  };

  useEffect(() => {
    if (dirty) return;
    if (
      activeFilename?.includes("strings") &&
      stringsData.length &&
      !stringsSnapshot
    ) {
      setStringsSnapshot(stringsData.map((r) => ({ ...r })));
    } else if (
      activeFilename?.includes("classifications") &&
      classificationsData.length &&
      !classificationsSnapshot
    ) {
      setClassificationsSnapshot(classificationsData.map((r) => ({ ...r })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeFilename,
    stringsData.length,
    classificationsData.length,
    dirty,
    stringsSnapshot,
    classificationsSnapshot,
  ]);

  return (
    <div className="px-10 pt-6 min-h-screen flex flex-col gap-8">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-3xl font-bold">Manage your Data</h1>
        <h3 className="text-gray-500 font-semibold">
          Upload, view and edit your string and classification data.
        </h3>
      </div>
      <div className="w-full bg-white rounded-md p-5 flex flex-col gap-4">
        <h2 className="text-xl text-gray-700 font-semibold">Upload New Data</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <UploadButton
            label={uploadLoading ? "Uploading..." : "Upload Strings Data"}
            onFileSelect={handleStringsUpload}
            resetAfterSelect
          />
          <UploadButton
            label={
              uploadLoading ? "Uploading..." : "Upload Classifications Data"
            }
            onFileSelect={handleClassificationsUpload}
            resetAfterSelect
          />
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <h2 className="text-xl text-gray-700 font-semibold">Uploaded Files</h2>
        <div className="flex flex-col gap-5 flex-1">
          <Tabs
            tabs={[
              fileList.find((f) => f.includes("strings")) || "strings.csv",
              fileList.find((f) => f.includes("classifications")) ||
                "classifications.csv",
            ]}
            activeIndex={activeTab}
            loadingIndex={tabLoadingIndex ?? undefined}
            onChange={async (i) => {
              setActiveTab(i);
              const targetFile = fileList[i];
              if (targetFile) {
                if (targetFile.includes("strings")) {
                  setStringsData([]);
                } else if (targetFile.includes("classifications")) {
                  setClassificationsData([]);
                }
                setTabLoadingIndex(i);
                await fetchFileData(targetFile);
                setTabLoadingIndex((prev) => (prev === i ? null : prev));
              }
            }}
          />
          <div className="flex gap-3 items-center flex-wrap sticky top-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-10 border border-gray-200 rounded px-3 py-2">
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm disabled:opacity-50 cursor-pointer"
              disabled={saving}
            >
              Add Row
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm disabled:opacity-50 cursor-pointer"
              disabled={!dirty || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-300 text-gray-800 rounded text-sm disabled:opacity-50 cursor-pointer"
              disabled={!dirty || saving}
            >
              Cancel
            </button>
            {dirty && !saving && (
              <span className="text-xs text-amber-600 font-medium">
                Unsaved changes
              </span>
            )}
          </div>
          <Table
            headers={currentHeaders}
            data={currentTable}
            editable
            maxHeight="calc(100vh - 380px)"
            onCellChange={handleCellChange}
            onDeleteRow={handleDeleteRow}
          />
          {!!saveErrorList.length && (
            <div className="flex flex-col gap-1 bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-auto">
              {saveErrorList.map((e, i) => (
                <span key={i} className="text-xs text-red-700">
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
