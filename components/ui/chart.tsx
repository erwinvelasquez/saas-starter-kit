"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

export const ChartContainer: React.FC<{ config: ChartConfig; children: React.ReactNode }> = ({ config, children }) => {
  return <div className="chart-container">{children}</div>;
};

export const ChartTooltip: React.FC<{ content: React.ReactNode }> = ({ content }) => {
  return <div className="chart-tooltip">{content}</div>;
};

export const ChartTooltipContent: React.FC = () => {
  return <div className="chart-tooltip-content">Tooltip Content</div>;
};
