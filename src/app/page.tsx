"use client";

import * as React from "react";
import styles from "./page.module.css";
import { parseFrcsTripSummaryFile } from "@speleotica/frcsdata/web";
import { type FrcsTripSummaryFile } from "@speleotica/frcsdata";
import { chunk, range } from "lodash";

export default function Home() {
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [dragOver, setDragOver] = React.useState(false);
  const [tripSummaryFile, setTripSummaryFile] =
    React.useState<FrcsTripSummaryFile | null>(null);

  React.useEffect(() => {
    if (file) {
      (async () => {
        try {
          const parsed = await parseFrcsTripSummaryFile(file);
          if (!parsed.tripSummaries.length) {
            throw new Error(
              `No trip summaries found; is ${file.name} a valid STAT_sum file?`
            );
          }
          setTripSummaryFile(parsed);
          setError(undefined);
        } catch (error) {
          setTripSummaryFile(null);
          setError(error instanceof Error ? error.message : String(error));
        }
      })();
    }
  }, [file]);

  const summaries = React.useMemo(
    () =>
      tripSummaryFile?.tripSummaries?.length
        ? range(tripSummaryFile?.tripSummaries?.length || 0).map((index) => {
            const summary = tripSummaryFile?.tripSummaries?.[index];
            return summary ? (
              <div key={index} className={styles.coverPage}>
                <div className={styles.tripNumber}>{summary.tripNumber}</div>
                <div className={styles.date}>
                  {String(summary.date.getMonth() + 1).padStart(2, " ")}/
                  {String(summary.date.getDate()).padStart(2, " ")}/
                  {summary.date.getFullYear()}
                </div>
                <div className={styles.tripName}>{summary.name}</div>
                <div className={styles.stats}>
                  <div className={styles.totalLength}>
                    {summary.totalLength.toString()}
                  </div>
                  <div className={styles.numShots}>{summary.numShots} sta.</div>
                  <div className={styles.excluded}>
                    EXCLUDED:
                    <div className={styles.excludedLength}>
                      {summary.excludedLength
                        .get(summary.totalLength.unit)
                        .toFixed(2)}
                    </div>
                    <div className={styles.numExcludedShots}>
                      {summary.numExcludedShots}
                    </div>
                  </div>
                </div>
                <div className={styles.team}>
                  {summary.team.map((name, index) => (
                    <div key={index}>{name}</div>
                  ))}
                </div>
                <table className={styles.shots}>
                  <tbody>
                    {chunk(summary.shots, 4).map((row, index) => (
                      <tr key={index}>
                        {row.map((value, index) => (
                          <td key={index}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div key={index} className={styles.coverPage} />
            );
          })
        : undefined,
    [tripSummaryFile?.tripSummaries]
  );

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.items[0]?.kind === "file") {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.items[0]?.kind === "file") {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    }
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    const file = e.dataTransfer.items[0]?.getAsFile();
    if (file) {
      e.preventDefault();
      e.stopPropagation();
      setFile(file);
      setDragOver(false);
    }
  }, []);

  return (
    <main
      className={styles.main}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {dragOver ? (
        <div className={styles.statSumField}>Drop file to view</div>
      ) : (
        <div className={styles.statSumField}>
          <label htmlFor="statSumField">
            Select a STAT_sum file (or drag and drop):
          </label>
          <input
            id="statSumField"
            type="file"
            className={styles.statSumField}
            placeholder="Select STAT_sum file"
            onChange={(e) => setFile(e.currentTarget.files?.[0])}
          />
        </div>
      )}
      <div>
        {summaries ||
          (error ? <div style={{ color: "red" }}>{error}</div> : undefined)}
      </div>
    </main>
  );
}
