export type ClassificationsData = {
  Topic: string;
  SubTopic: string;
  Industry: string;
  Classification: string;
};

export type StringsData = {
  Tier: string;
  Industry: string;
  Topic: string;
  Subtopic: string;
  Prefix: string;
  "Fuzzing-Idx": string;
  Prompt: string;
  Risks: string;
  Keywords: string;
};

export type RowValidationError = {
  index: number;
  row: StringsData | ClassificationsData;
  error: string;
};

export interface ApiErrorLike {
  response?: {
    data?: { error?: string; message?: string };
  };
  message?: string;
}
