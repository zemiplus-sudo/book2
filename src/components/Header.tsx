import React from 'react';
import { BookOpen, Settings, RefreshCw, FileSpreadsheet, FileCode, Radio } from 'lucide-react';
import { isConfiguredUrl } from '../services/api';

interface HeaderProps {
  baseUrl: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenApiSettings: () => void;
  onOpenGasGuide: () => void;
  onOpenStandaloneExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  baseUrl,
  isRefreshing,
  onRefresh,
  onOpenApiSettings,
  onOpenGasGuide,
  onOpenStandaloneExport,
}) => {
  const isLive = isConfiguredUrl(baseUrl);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                스마트 도서관 예약 시스템
              </h1>
              {/* Connection Status Indicator */}
              <div
                className={`hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span>{isLive ? 'Apps Script 실시간 연결' : '데모 모드'}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Google Apps Script API 백엔드 연동 도서 대출 예약 포털
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="데이터 새로고침"
            aria-label="데이터 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Apps Script Guide */}
          <button
            onClick={onOpenGasGuide}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>백엔드 스크립트</span>
          </button>

          {/* Standalone HTML Export */}
          <button
            onClick={onOpenStandaloneExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>단일 HTML</span>
          </button>

          {/* API Settings Button */}
          <button
            onClick={onOpenApiSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>API 설정</span>
          </button>
        </div>
      </div>
    </header>
  );
};
