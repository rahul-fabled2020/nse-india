import { ReactNode } from "react";

export type ColumnConfig<T> = {
  label: string;
  key?: keyof T;
  render?: (data: T) => ReactNode;
};

export interface INse {
  symbol: string;
  timestamp: number;
  ceCOITotal: number;
  expiryDate: string;
  peCOITotal: number;
  underlying: string;
  underlyingValue: number;
}

export interface IChunkSummary {
  ceTotal: number;
  peTotal: number;
  ceByPe: number | null;
  peByCe: number | null;
}
