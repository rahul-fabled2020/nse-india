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
  const [chunkSize, setChunkSize] = useState<number>(10);

  useEffect(() => {
    (async () => {
      const nseData: INse[] = await fetchNseDataByDate(date);

      setNseData(nseData);
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 0);
    })();
  }, [date]);
  console.log("Render");

  const handleSelection: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    setChunkSize(Number(event.target.value));
  };

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

  return (
    <div className="wrapper">
      <div className="header">
        {datePicker}
        <select
          onChange={handleSelection}
          style={{ padding: 8 }}
          value={chunkSize}
        >
          <option disabled selected>
            Select Number of Records To Group
          </option>
          {Array(100)
            .fill(1)
            .map((n, i) => n + i)
            .map((item) => (
              <option value={item}>{item}</option>
            ))}
        </select>
      </div>
      <div className="container">
        {!nseData?.filter?.((item) => item.underlying === selectedSymbol) ? (
          <div>No Data for the date: {date}</div>
        ) : (
          nseData &&
          splitIntoChunks(
            nseData?.filter?.((item) => item.underlying === selectedSymbol),
            chunkSize
          ).map((chunk, index) => (
            <div key={index} className="chunk">
              {renderChunk(chunk)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
