import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/initSupabase";
import { read, utils } from "xlsx";
import { downloadAndParseCSV } from "@/components/csvReader";

const TodoDetail = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [csvUrl, setCsvUrl] = useState<string>("");

  useEffect(() => {
    if (router.query.user) {
      setUser(JSON.parse(router.query.user as string));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => console.log("user: ", user), [user]);

  const [files, setFiles] = useState<any>([]);
  const [csvData, setCsvData] = useState<any>([]);

  useEffect(() => {
    fetchFiles();
    getUploadedFileURL("/20240425/test4.csv");
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("sample-bucket")
        .list("20240426", {
          limit: 100,
          offset: 0,
        });

      if (error) {
        throw error;
      }
      console.log("data: ", data);
      setFiles(data);

      const workbook = read(data[0], { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const csvData = utils.sheet_to_json(sheet, { header: 1 });
      console.log("csvData: ", csvData);
      setCsvData(csvData);
    } catch (error: any) {
      console.error("파일 목록을 가져오는 중 오류 발생:", error.message);
    }
  };

  const getUploadedFileURL = async (fileName: string) => {
    try {
      // 파일의 URL을 생성합니다.
      const { data, error } = await supabase.storage
        .from("sample-bucket")
        .createSignedUrl(fileName, 60); // URL이 만료되기까지의 시간(초)을 설정합니다.

      if (error) {
        throw error;
      }
      console.log("signedURL: ", data.signedUrl);
      // return data.signedUrl;
      setCsvUrl(data.signedUrl);
    } catch (error: any) {
      console.error("파일 URL을 생성하는 중 오류 발생:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (csvUrl) fetchData(csvUrl);
  }, [csvUrl]);

  const fetchData = async (csvURL: string) => {
    try {
      const csvData = await downloadAndParseCSV(csvURL);
      console.log("CSV 데이터:", csvData);
      // CSV 데이터를 원하는 대로 처리
    } catch (error) {
      console.error("CSV 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  return (
    <div>
      <h1>파일 목록</h1>
      <ul>
        {files.map((file: any) => (
          <li key={file.id}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoDetail;
