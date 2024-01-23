import { useEffect, useMemo, useState } from "react";

import { nseConfig } from "./config";
import { getRatio } from "./utils/number";
import { splitIntoChunks } from "./utils";
import { TickerSymbol } from "./constants";
import { IChunkSummary, INse } from "./types";
import { fetchNseDataByDate } from "./services/nse";
import DatePickerWrapper from "./components/common/DatePicker";

import "./App.css";

const pollInterval = 1 * 1000 * 60; // milliseconds

function App() {
  const [nseData, setNseData] = useState<INse[] | null>(null);
  const [selectedSymbol] = useState<TickerSymbol>(TickerSymbol.BANKNIFTY);
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [chunkSize, setChunkSize] = useState<number>(2);

  useEffect(() => {
    async function handleNSEDataFetch() {
      const nseData: INse[] = await fetchNseDataByDate(date);

      setNseData(nseData);
      setTimeout(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }, 0);
    }

    handleNSEDataFetch();

    const timer = setInterval(handleNSEDataFetch, pollInterval);

    return () => clearInterval(timer);
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
      <div className="table-wrapper">
        <table className="table">
          <tr className="row">
            {nseConfig.map((col) => (
              <td key={col.label} className="column column-header">
                {col.label}
              </td>
            ))}
          </tr>
          {chunk?.map((item) => {
            return (
              <tr className="row" key={item.timestamp}>
                {nseConfig.map((col) =>
                  col.render ? (
                    <td key={col.label} className="column">
                      {col.render(item)}
                    </td>
                  ) : (
                    <td key={col.label} className="column">
                      {item[col.key || "timestamp"]}
                    </td>
                  )
                )}
              </tr>
            );
          })}
        </table>
        <div className="chunk-row">
          <table className="table">
            <tr className="row">
              <td className="column column-header">Stat</td>
              <td className="column column-header">Current Group Summary</td>
              <td className="column column-header">Previous Group Summary</td>
              <td className="column column-header">Difference</td>
            </tr>
            <tr className="row">
              <td className="column column-header">Total CE</td>
              <td className="column">{chunkSummary?.ceTotal || "-"}</td>
              <td className="column">{previousChunkSummary?.ceTotal || "-"}</td>
              <td className="column">
                {chunkSummary?.ceTotal ||
                  0 - (previousChunkSummary?.ceTotal || 0)}
              </td>
            </tr>
            <tr className="row">
              <td className="column column-header">Total PE</td>
              <td className="column">{chunkSummary?.peTotal || "-"}</td>
              <td className="column">{previousChunkSummary?.peTotal || "-"}</td>
              <td className="column">
                {chunkSummary?.peTotal ||
                  0 - (previousChunkSummary?.peTotal || 0)}
              </td>
            </tr>
            <tr className="row">
              <td className="column column-header">CE / PE</td>
              <td className="column">{chunkSummary?.ceByPe || "-"}</td>
              <td className="column">{previousChunkSummary?.ceByPe || "-"}</td>
              <td className="column">-</td>
            </tr>
            <tr className="row">
              <td className="column column-header">PE / CE</td>
              <td className="column">{chunkSummary?.peByCe || "-"}</td>
              <td className="column">{previousChunkSummary?.peByCe || "-"}</td>
              <td className="column">-</td>
            </tr>
          </table>
        </div>

        <div className="chunk-row">
          <div>
            <span className="label-header">CE Difference / PE Difference:</span>
            {getRatio(ceDifference, peDifference) || "-"}
          </div>
          <div>
            <span className="label-header">PE Difference / CE Difference:</span>
            {getRatio(peDifference, ceDifference) || "-"}
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
          {Array(100)
            .fill(1)
            .map((n, i) => n + i)
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
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
