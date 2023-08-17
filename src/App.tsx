import { useEffect, useState } from "react";

import { INse } from "./types";
import { nseConfig } from "./config";
import { splitIntoChunks } from "./utils";
import { TickerSymbol } from "./constants";
import { fetchNseDataByDate } from "./services/nse";
import DatePickerWrapper from "./components/common/DatePicker";

import "./App.css";

function App() {
  const [nseData, setNseData] = useState<INse[] | null>(null);
  const [selectedSymbol] = useState<TickerSymbol>(TickerSymbol.BANKNIFTY);
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    (async () => {
      const nseData: INse[] = await fetchNseDataByDate(date);

      setNseData(nseData);
    })();
  }, [date]);

  const datePicker = (
    <DatePickerWrapper
      label="Date: "
      selected={new Date(date)}
      onChange={(newDate) =>
        setDate((newDate || new Date()).toISOString().substring(0, 10))
      }
    />
  );

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
        {datePicker}
        <div>No Data for the date: {date}</div>
      </>
    );
  }

  return (
    <>
      {datePicker}
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
