"use client";

import { createContext, useContext } from "react";
import defaultConfig, { type ClientConfig } from "@/config/client.config";

export const ClientConfigContext = createContext<ClientConfig>(defaultConfig);

export function useClientConfig(): ClientConfig {
  return useContext(ClientConfigContext);
}
