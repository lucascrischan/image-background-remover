"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

type Status = "idle" | "uploading" | "processing" | "done" | "error";

interface ErrorMessages {
  [key: string]: string;
}

const ERROR_MESSAGES: ErrorMessages = {
  FILE_TOO_LARGE: "图片最大 10MB",
  INVALID_FORMAT: "请上传 JPG/PNG/WEBP 图片",
  API_NOT_CONFIGURED: "服务暂不可用，请联系管理员",
  API_ERROR: "处理失败，请重试",
  RATE_LIMITED: "今日额度已用完，明天再来",
  UNKNOWN: "发生未知错误，请重试",
};

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!validTypes.includes(file.type)) {
      return "INVALID_FORMAT";
    }
    if (file.size > maxSize) {
      return "FILE_TOO_LARGE";
    }
    return null;
  };

  const processImage = async (file: File) => {
    const errorCode = validateFile(file);
    if (errorCode) {
      setError(ERROR_MESSAGES[errorCode]);
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setOriginalImage(base64);
      setStatus("processing");

      try {
        const response = await fetch("/api/remove", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(ERROR_MESSAGES[data.error] || ERROR_MESSAGES.API_ERROR);
          setStatus("error");
          return;
        }

        setResultImage(data.result);
        setStatus("done");
      } catch {
        setError(ERROR_MESSAGES.API_ERROR);
        setStatus("error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleReset = () => {
    setStatus("idle");
    setOriginalImage(null);
    setResultImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "removed-background.png";
    link.click();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Image Background Remover
          </h1>
          <p className="text-gray-600">
            拖拽图片上传，自动移除背景
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {status === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="text-5xl mb-4">📤</div>
              <p className="text-gray-700 font-medium mb-2">
                拖拽图片到这里，或点击选择
              </p>
              <p className="text-gray-500 text-sm">
                支持 JPG、PNG、WebP，最大 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {(status === "uploading" || status === "processing") && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4 animate-pulse">⏳</div>
              <p className="text-gray-700 font-medium">
                {status === "uploading" ? "上传中..." : "处理中..."}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                请稍候，预计需要 3-5 秒
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                重新上传
              </button>
            </div>
          )}

          {status === "done" && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2 text-center">原图</p>
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {originalImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={originalImage}
                        alt="Original"
                        className="object-contain w-full h-full"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2 text-center">结果</p>
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {/* Checkerboard pattern for transparency */}
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                         linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                         linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                         linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    />
                    {resultImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resultImage}
                        alt="Result"
                        className="object-contain w-full h-full relative z-10"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  下载透明PNG
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  重新上传
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          基于 AI 技术 · 免费使用
        </p>
      </div>
    </main>
  );
}
