import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Config } from "../constants/Config";
import { AUTH_TOKEN_KEY } from "../constants/auth";
import {
  PrepareRequestDto,
  PrepareRequestResponse,
  ContinueRequestDto,
  ContinueRequestResponse,
  LaunchRequestDto,
  LaunchRequestResponse,
} from "../types/api";

export const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const aiService = {
  async prepareRequest(
    data: PrepareRequestDto,
  ): Promise<PrepareRequestResponse> {
    const response = await api.post("/ai-requests/prepare", data);
    return response.data;
  },

  async continueRequest(
    data: ContinueRequestDto,
  ): Promise<ContinueRequestResponse> {
    const response = await api.post("/ai-requests/continue", data);
    return response.data;
  },

  async launchRequest(
    data: LaunchRequestDto,
  ): Promise<LaunchRequestResponse> {
    const response = await api.post("/ai-requests/launch", data);
    return response.data;
  },
};