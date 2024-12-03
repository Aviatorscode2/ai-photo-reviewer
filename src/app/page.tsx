"use client";
import { useState, useEffect } from "react";

import { useChat } from "ai/react";
import Markdown from "react-markdown";
import { useDropzone } from "react-dropzone";

export default function Chat() {
  const [encodedFiles, setEncodedFiles] = useState<string[]>([]);
  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: async (files) => {
      const getBase64 = async (file: Blob): Promise<string> => {
        var reader = new FileReader();
        reader.readAsDataURL(file as Blob);

        return new Promise((reslove, reject) => {
          reader.onload = () => reslove(reader.result as any);
          reader.onerror = (error) => reject(error);
        });
      };
      const eFiles: string[] = [];
      for (const file of files) {
        eFiles.push(await getBase64(file));
      }
      setEncodedFiles(eFiles);
    },
  });
  const { messages, handleSubmit, isLoading } = useChat({
    body: {
      encodedFiles,
    },
  });

  useEffect(() => {
    if (
      !isLoading &&
      encodedFiles.length > 0 &&
      !messages.find(({ role }) => role !== "user")
    ) {
      handleSubmit();
    }
  }, [isLoading, encodedFiles, messages, handleSubmit]);

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center py-10">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dropzone & Image Preview */}
          <section className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition">
            {encodedFiles.length === 0 ? (
              <div
                {...getRootProps({
                  className:
                    'dropzone w-full h-32 flex flex-col justify-center items-center cursor-pointer',
                })}
              >
                <input {...getInputProps()} />
                <p className="text-lg text-gray-600 font-medium">
                  Drag & drop your photo here or click to select
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {encodedFiles.map((file, i) => (
                  <img
                    src={file}
                    key={i}
                    className="rounded-lg shadow-md object-cover w-full"
                  />
                ))}
              </div>
            )}
          </section>

          {/* Chat Output */}
          <div className="flex flex-col gap-4">
            {isLoading && (
              <div className="flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
                <p className="text-gray-600 font-semibold ml-4">
                  Describing your image... please wait.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className="bg-gray-100 p-4 rounded-lg shadow-md text-gray-800"
              >
                {m.role !== 'user' && <Markdown>{m.content}</Markdown>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}