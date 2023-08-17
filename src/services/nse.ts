import axios from "axios";

import { INse } from "../types";
import { config } from "../config";
import { endpoints } from "../constants";
import { interpolateUrlTemplate } from "../utils";

export const fetchNseDataByDate = async (date: string): Promise<INse[]> => {
  const url = `${config.BASE_URL}${endpoints.NSE_DATA_BY_DATE}`;
  const res = await axios.get(
    interpolateUrlTemplate(url, { date: `${date}.json` })
  );

  return res.data;
};
