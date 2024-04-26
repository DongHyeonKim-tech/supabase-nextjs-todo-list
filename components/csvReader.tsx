import axios from "axios";
import * as Papa from "papaparse";

export const downloadAndParseCSV = async (csvURL: string): Promise<any[]> => {
  try {
    // CSV 파일 다운로드
    const response = await axios.get(csvURL, { responseType: "blob" });
    const csvData = await response.data;

    // CSV 데이터 파싱
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        encoding: "UTF-8",
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error("CSV 파일을 다운로드하고 파싱하는 중 오류 발생:", error);
    throw error;
  }
};
