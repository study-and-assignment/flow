"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// ✅ shared 타입 사용 - BE와 동일한 타입!
import type { FixedExtension, CustomExtension } from "@/shared/types/extension.types";

export default function Home() {
  const [fixedExtensions, setFixedExtensions] = useState<FixedExtension[]>([]);
  const [customExtensions, setCustomExtensions] = useState<CustomExtension[]>([]);
  const [newExtension, setNewExtension] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    fetchExtensions();
  }, []);

  const fetchExtensions = async () => {
    try {
      const [fixedRes, customRes] = await Promise.all([
        fetch("/api/extensions/fixed"),
        fetch("/api/extensions/custom"),
      ]);

      const fixedData = await fixedRes.json();
      const customData = await customRes.json();

      setFixedExtensions(fixedData);
      setCustomExtensions(customData);
    } catch (err) {
      console.error("Failed to fetch extensions:", err);
    } finally {
      setLoading(false);
    }
  };

  // 고정 확장자 체크 상태 변경
  const handleFixedToggle = async (id: string, isBlocked: boolean) => {
    try {
      const res = await fetch("/api/extensions/fixed", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked }),
      });

      if (res.ok) {
        setFixedExtensions((prev) =>
          prev.map((ext) => (ext.id === id ? { ...ext, isBlocked } : ext))
        );
      }
    } catch (err) {
      console.error("Failed to update extension:", err);
    }
  };

  // 커스텀 확장자 추가
  const handleAddCustom = async () => {
    setError("");

    if (!newExtension.trim()) {
      setError("확장자를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/extensions/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extension: newExtension }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setCustomExtensions((prev) => [data, ...prev]);
      setNewExtension("");
    } catch (err) {
      console.error("Failed to add extension:", err);
      setError("확장자 추가에 실패했습니다.");
    }
  };

  // 커스텀 확장자 삭제
  const handleDeleteCustom = async (id: string) => {
    try {
      const res = await fetch(`/api/extensions/custom?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCustomExtensions((prev) => prev.filter((ext) => ext.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete extension:", err);
    }
  };

  // Enter 키로 추가
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCustom();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  const blockedCount =
    fixedExtensions.filter((e) => e.isBlocked).length + customExtensions.length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            파일 확장자 차단
          </h1>
          <p className="text-slate-500">
            첨부파일 보안을 위해 특정 확장자를 차단할 수 있습니다.
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              차단된 확장자 수
              <Badge variant="secondary" className="text-base px-3 py-1">
                {blockedCount}개
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* 고정 확장자 섹션 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                고정 확장자
              </h2>
              <div className="flex flex-wrap gap-4">
                {fixedExtensions.map((ext) => (
                  <label
                    key={ext.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={ext.isBlocked}
                      onCheckedChange={(checked) =>
                        handleFixedToggle(ext.id, checked as boolean)
                      }
                    />
                    <span className="text-sm text-slate-600">{ext.extension}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* 커스텀 확장자 입력 섹션 */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                커스텀 확장자
              </h2>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="확장자 입력 (예: pdf)"
                  value={newExtension}
                  onChange={(e) => setNewExtension(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={20}
                  className="flex-1"
                />
                <Button onClick={handleAddCustom}>추가</Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                최대 20자, 영문/숫자만 가능 (현재 {customExtensions.length}/200개)
              </p>
            </section>

            {/* 커스텀 확장자 목록 */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-600">
                  등록된 커스텀 확장자
                </h3>
                <Badge variant="outline" className="text-xs">
                  {customExtensions.length}개
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-lg min-h-[80px]">
                {customExtensions.length === 0 ? (
                  <p className="text-sm text-slate-400">등록된 커스텀 확장자가 없습니다.</p>
                ) : (
                  customExtensions.map((ext) => (
                    <Badge
                      key={ext.id}
                      variant="outline"
                      className="px-3 py-1.5 text-sm flex items-center gap-1 bg-white"
                    >
                      {ext.extension}
                      <button
                        onClick={() => handleDeleteCustom(ext.id)}
                        className="ml-1 hover:text-red-500 transition-colors"
                        aria-label={`${ext.extension} 삭제`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </section>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
