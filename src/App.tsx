import { ReactNode, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "./App.css";
import axios from "axios";

const enum Symbol {
  "BANKNIFTY" = "BANKNIFTY",
}

export interface INse {
  ceCOITotal: number;
  expiryDate: string;
  peCOITotal: number;
  symbol: string;
  timestamp: number;
  underlying: string;
  underlyingValue: number;
}

type ColumnConfig<T> = {
  label: string;
  key?: keyof T;
  render?: (data: T) => ReactNode;
};

function formatDate(date: number | Date | string) {
  const today = new Date(date);

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")} ${String(
    today.getHours()
  ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
    today.getSeconds()
  ).padStart(2, "0")}`;
}

const splitIntoChunks = <T,>(array: T[], chunkSize: number = 10) => {
  if (!array) {
    return [];
  }

  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);

    chunks.push(chunk);
  }

  return chunks;
};

const nseConfig: ColumnConfig<INse>[] = [
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

function App() {
  const [nseData, setNseData] = useState<INse[] | null>(null);
  const [selectedSymbol] = useState<Symbol>(Symbol.BANKNIFTY);
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    const fetchR = async () => {
      //       const url = import.meta.env.VITE_API_URL;
      const url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${url}/load-json/${date}.json`);
      const nseData: INse[] = res.data;

      setNseData(nseData);
    };

    fetchR();
  }, [date]);

  const renderDatePicker = () => {
    return (
      <div
        className="date-wrapper"
        style={{
          marginTop: 12,
          marginBottom: 12,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        Date:
        <DatePicker
          selected={new Date(date)}
          onChange={(newDate) =>
            setDate((newDate || new Date()).toISOString().substring(0, 10))
          }
        />
      </div>
    );
  };

  const renderChunk = (chunk: INse[]) => {
    let chunkTotalCE = 0;
    let chunkTotalPE = 0;

    return (
      <div className="table">
        <div className="row">
          {nseConfig.map((col) => (
            <div key={col.label} className="column column-header">
              {col.label}
            </div>
          ))}
        </div>
        {chunk?.map((item) => {
          chunkTotalCE += item.ceCOITotal;
          chunkTotalPE += item.peCOITotal;

          return (
            <div className="row" key={item.timestamp}>
              {nseConfig.map((col) =>
                col.render ? (
                  <div key={col.label} className="column">
                    {col.render(item)}
                  </div>
                ) : (
                  <div key={col.label} className="column">
                    {item[col.key || "timestamp"]}
                  </div>
                )
              )}
            </div>
          );
        })}

        <div className="chunk-row">
          <div>Total CE: {chunkTotalCE}</div>
          <div>Total PE: {chunkTotalPE}</div>
          <div>
            CE / PE: {chunkTotalPE === 0 ? "-" : chunkTotalCE / chunkTotalPE}
          </div>
          <div>
            PE / CE: {chunkTotalCE === 0 ? "-" : chunkTotalPE / chunkTotalCE}
          </div>
        </div>
      </div>
    );
  };

  if (!nseData?.filter?.((item) => item.underlying === selectedSymbol)) {
    return (
      <>
        {renderDatePicker()}
        <div>No Data for the date: {date}</div>
      </>
    );
  }

  return (
    <>
      {renderDatePicker()}
      {nseData &&
        splitIntoChunks(
          nseData?.filter?.((item) => item.underlying === selectedSymbol)
        ).map((chunk, index) => (
          <div key={index} className="chunk">
            {renderChunk(chunk)}
          </div>
        ))}
    </>
  );
}

export default App;
