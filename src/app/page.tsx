"use client";

import { useState, useCallback, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const { data: session } = useSession();
  const [status, setStatus] = useState<Status>("idle");
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

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
        const response = await fetch(
          "https://image-background-remover-api.aletogig99.workers.dev",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          }
        );

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
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Image Background Remover
            </h1>
            <p className="text-gray-600">拖拽图片上传，自动移除背景</p>
          </div>

          {/* Auth section */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700 font-medium">
                    {session.user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                登录
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && status === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            {error}
          </div>
        )}

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
