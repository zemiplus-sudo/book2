import React, { useState } from 'react';
import { X, Code2, Copy, Check, ExternalLink, FileSpreadsheet } from 'lucide-react';
import { GAS_CODE_TEMPLATE } from '../data/gasScriptTemplate';

interface GasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GasGuideModal: React.FC<GasGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(GAS_CODE_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Apps Script 백엔드 배포 가이드</h3>
              <p className="text-xs text-slate-500">Google Sheets와 연결하는 Code.gs 전체 코드</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
          {/* Steps */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              🚀 3분 연동 순서
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>
                새로운 <strong>Google 스프레드시트</strong>를 열고 상단 메뉴 <strong>[확장 프로그램] → [Apps Script]</strong>를 클릭합니다.
              </li>
              <li>
                아래 코드를 전체 복사하여 <code>Code.gs</code>에 붙여넣고 저장합니다 (Ctrl+S).
              </li>
              <li>
                상단 함수 드롭다운에서 <strong>setupInitialLibrarySheets</strong>를 선택하고 [실행]을 눌러 Books/Reservations 시트와 샘플 도서를 자동 생성합니다.
              </li>
              <li>
                우측 상단 <strong>[배포] → [새 배포]</strong> 선택 후 <strong>유형: 웹 앱</strong>, <strong>액세스: 모든 사용자(Anyone)</strong>로 설정하여 배포합니다.
              </li>
              <li>
                발급된 <strong>웹 앱 URL</strong>을 복사하여 상단 [API 설정]에 입력하면 실시간으로 연동됩니다!
              </li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-slate-300">
              <span className="font-mono text-[11px] flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Code.gs
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '복사 완료!' : '전체 코드 복사'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin">
              {GAS_CODE_TEMPLATE}
            </pre>
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
