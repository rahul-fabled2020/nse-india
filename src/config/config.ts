import { formatDate } from "../utils";
import { ColumnConfig, INse } from "../types";

export const nseConfig: ColumnConfig<INse>[] = [
  {
    label: "Time",
    render(data) {
      return formatDate(data.timestamp);
    },
  },
  { label: "CE Change In Open Interest", key: "ceCOITotal" },
  { label: "PE Change In Open Interest", key: "peCOITotal" },
  {
    label: "Difference: CE - PE",
    render(data) {
      return data.ceCOITotal - data.peCOITotal;
    },
  },
  {
    label: "Difference: PE - CE",
    render(data) {
      return data.peCOITotal - data.ceCOITotal;
    },
  },
  {
    label: "CE Total / PE Total",
    render(data) {
      return data.peCOITotal === 0 ? "-" : data.ceCOITotal / data.peCOITotal;
    },
  },
  {
    label: "PE Total / CE Total",
    render(data) {
      return data.ceCOITotal === 0 ? "-" : data.peCOITotal / data.ceCOITotal;
    },
  },
  { label: "Underlying", key: "underlying" },
  { label: "Underlying Value", key: "underlyingValue" },
  { label: "Expiry Date", key: "expiryDate" },
];
