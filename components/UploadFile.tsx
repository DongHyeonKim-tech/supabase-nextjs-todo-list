// pages/upload.tsx

import { useState } from "react";
import { Upload, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { supabase } from "@/lib/initSupabase";

const { Dragger } = Upload;

const UploadFile = () => {
  const [fileList, setFileList] = useState<any>([]);

  const handleUpload = async () => {
    try {
      const file = fileList[0].originFileObj;
      console.log("file: ", file);
      const { data, error } = await supabase.storage
        .from("sample-bucket")
        .upload(`/20240425/${file.name}`, file);

      if (error) {
        throw error;
      }
      console.log("upload File Data: ", data);

      message.success("파일이 성공적으로 업로드되었습니다.");
    } catch (error: any) {
      message.error("파일 업로드 중 오류가 발생했습니다.");
      console.log("error: ", error);
      console.error("파일 업로드 중 오류 발생:", error.message);
    }
  };

  const props = {
    multiple: false,
    fileList,
    onChange(info: any) {
      let fileList = [...info.fileList];
      fileList = fileList.slice(-1); // 최신 파일만 유지
      setFileList(fileList);
    },
    action: "",
  };

  return (
    <div>
      <h1>파일 업로드</h1>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          클릭하거나 파일을 이곳으로 드래그하여 업로드하세요.
        </p>
      </Dragger>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={fileList.length === 0}
        style={{ marginTop: 16 }}
      >
        업로드
      </Button>
    </div>
  );
};

export default UploadFile;
