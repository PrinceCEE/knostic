import axios from "axios";
import type { AxiosInstance } from "axios";
import type { StringsData, ClassificationsData } from "@/types";

class ApiService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_URL + "/api",
    });

    this.uploadFile = this.uploadFile.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.getFile = this.getFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
  }

  async uploadFile(files: {
    stringsFile?: File | null;
    classificationsFile?: File | null;
  }) {
    const formData = new FormData();
    if (files.stringsFile) {
      formData.append("stringsFile", files.stringsFile);
    }
    if (files.classificationsFile) {
      formData.append("classificationsFile", files.classificationsFile);
    }
    const { data } = await this.axios.post("/csv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data.data as {
      stringsData?: StringsData[];
      classificationsData?: ClassificationsData[];
    };
  }

  async getFiles() {
    const { data } = await this.axios.get("/csv/files");
    return data.data as string[];
  }

  async getFile(filename: string) {
    const { data } = await this.axios.get(
      `/csv/files/${encodeURIComponent(filename)}`
    );
    return data.data as (StringsData | ClassificationsData)[];
  }

  async updateFile(
    filename: string,
    updates: (StringsData | ClassificationsData)[]
  ) {
    try {
      const { data } = await this.axios.put(
        `/csv/files/${encodeURIComponent(filename)}`,
        {
          updates,
        }
      );
      return data as {
        success: boolean;
        message: string;
        data?: unknown;
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } } | undefined;
      if (e?.response?.data) {
        return e.response.data as {
          success: boolean;
          message: string;
          data?: unknown;
        };
      }
      throw err;
    }
  }
}

export const apiService = new ApiService();
