"use client";

import * as React from "react";
import styles from "./page.module.css";
import { parseFrcsTripSummaryFile } from "@speleotica/frcsdata/web";
import { type FrcsTripSummaryFile } from "@speleotica/frcsdata";
import { chunk } from "lodash";

export default function Home() {
  const [file, setFile] = React.useState<File | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [tripSummaryFile, setTripSummaryFile] =
    React.useState<FrcsTripSummaryFile | null>(null);

  React.useEffect(() => {
    if (file) {
      (async () => {
        try {
          setTripSummaryFile(await parseFrcsTripSummaryFile(file));
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
      tripSummaryFile?.tripSummaries?.map((summary) =>
        summary ? (
          <div key={summary.tripIndex} className={styles.coverPage}>
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
        ) : null
      ),
    [tripSummaryFile?.tripSummaries]
  );

  return (
    <main className={styles.main}>
      <input
        type="file"
        className={styles.statSumField}
        placeholder="Select STAT_sum file"
        onChange={(e) => setFile(e.currentTarget.files?.[0])}
      />
      <div>{summaries || error}</div>
    </main>
  );
}