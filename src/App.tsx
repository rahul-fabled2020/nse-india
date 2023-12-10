import { useEffect, useMemo, useState } from "react";

import { nseConfig } from "./config";
import { getRatio } from "./utils/number";
import { splitIntoChunks } from "./utils";
import { TickerSymbol } from "./constants";
import { IChunkSummary, INse } from "./types";
import { fetchNseDataByDate } from "./services/nse";
import DatePickerWrapper from "./components/common/DatePicker";

import "./App.css";

function App() {
  const [nseData, setNseData] = useState<INse[] | null>(null);
  const [selectedSymbol] = useState<TickerSymbol>(TickerSymbol.BANKNIFTY);
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [chunkSize, setChunkSize] = useState<number>(2);

  useEffect(() => {
    (async () => {
      const nseData: INse[] = await fetchNseDataByDate(date);

      setNseData(nseData);
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 0);
    })();
  }, [date]);

  const filteredNSEData = useMemo(() => {
    return (
      nseData?.filter?.((item) => item.underlying === selectedSymbol) || []
    );
  }, [nseData, selectedSymbol]);

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

  const getChunkSummary = (chunk?: INse[] | null): IChunkSummary | null => {
    let chunkTotalCE = 0;
    let chunkTotalPE = 0;

    if (!chunk) {
      return null;
    }

    chunk?.forEach((item) => {
      chunkTotalCE += item.ceCOITotal;
      chunkTotalPE += item.peCOITotal;
    });

    return {
      ceTotal: chunkTotalCE,
      peTotal: chunkTotalPE,
      ceByPe: getRatio(chunkTotalCE, chunkTotalPE),
      peByCe: getRatio(chunkTotalPE, chunkTotalCE),
    };
  };

  const renderChunk = (chunk: INse[], previousChunk: INse[] | null) => {
    const chunkSummary = getChunkSummary(chunk);
    const previousChunkSummary = getChunkSummary(previousChunk);
    const ceDifference =
      (chunkSummary?.ceTotal || 0) - (previousChunkSummary?.ceTotal || 0);
    const peDifference =
      (chunkSummary?.peTotal || 0) - (previousChunkSummary?.peTotal || 0);

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
          <h2>Current Group Summary</h2>
          <div>
            <span className="label-header">Total CE:</span>{" "}
            {chunkSummary?.ceTotal}
          </div>
          <div>
            <span className="label-header">Total PE:</span>{" "}
            {chunkSummary?.peTotal}
          </div>
          <div>
            <span className="label-header">CE / PE:</span>{" "}
            {chunkSummary?.ceByPe || "-"}
          </div>
          <div>
            <span className="label-header">PE / CE:</span>{" "}
            {chunkSummary?.peByCe || "-"}
          </div>
        </div>

        <div className="chunk-row">
          <h2>Previous Group Summary</h2>
          <div>
            <span className="label-header">Total CE:</span>
            {previousChunkSummary?.ceTotal}
          </div>
          <div>
            <span className="label-header">Total PE:</span>
            {previousChunkSummary?.peTotal}
          </div>
          <div>
            <span className="label-header">CE / PE:</span>
            {previousChunkSummary?.ceByPe || "-"}
          </div>
          <div>
            <span className="label-header">PE / CE:</span>
            {previousChunkSummary?.peByCe || "-"}
          </div>
          <div className="chunk-comparison">
            <div>
              <span className="label-header">
                Current CE Total - Previous CE Total:
              </span>
              {ceDifference}
            </div>
            <div>
              <span className="label-header">
                Current PE Total - Previous PE Total:
              </span>
              {peDifference}
            </div>
            <div>
              <span className="label-header">
                CE Difference / PE Difference:
              </span>
              {getRatio(ceDifference, peDifference) || "-"}
            </div>
            <div>
              <span className="label-header">
                PE Difference / CE Difference:
              </span>
              {getRatio(peDifference, ceDifference) || "-"}
            </div>
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
      <h1>NSE Option Chain Data {selectedSymbol && `(${selectedSymbol})`}</h1>
      <div className="container">
        {!filteredNSEData.length ? (
          <div>No Data for the date: {date}</div>
        ) : (
          !!filteredNSEData.length &&
          splitIntoChunks(filteredNSEData, chunkSize).map(
            (chunk, index, chunks) => (
              <div key={index} className="chunk">
                {renderChunk(chunk, index === 0 ? null : chunks[index - 1])}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

export default App;
