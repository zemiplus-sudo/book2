import React, { useState } from 'react';
import { X, Settings, Link2, CheckCircle2, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { isConfiguredUrl, resetLocalMockData } from '../services/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  currentUrl: string;
  onClose: () => void;
  onSave: (url: string) => void;
  onResetMock: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  currentUrl,
  onClose,
  onSave,
  onResetMock,
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const isReal = isConfiguredUrl(urlInput);

  const handleTestConnection = async () => {
    if (!urlInput.trim() || !urlInput.startsWith('https://script.google.com/macros/s/')) {
      setTestStatus('error');
      setTestMessage('올바른 Google Apps Script 웹 앱 배포 URL을 입력해주세요.');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Google Apps Script에 연결을 시도하는 중...');

    try {
      const endpoint = `${urlInput.trim()}${urlInput.includes('?') ? '&' : '?'}action=getBooks`;
      const res = await fetch(endpoint, {
        method: 'GET',
        redirect: 'follow',
      });

      if (!res.ok) {
        throw new Error(`HTTP 에러 발생 (${res.status})`);
      }

      const data = await res.json();
      if (data && (Array.isArray(data) || Array.isArray(data.books))) {
        setTestStatus('success');
        setTestMessage('연결 성공! Google Sheets와 성공적으로 통신했습니다.');
      } else {
        setTestStatus('error');
        setTestMessage('응답을 수신했으나 올바른 JSON 형식이 아닙니다.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestStatus('error');
      setTestMessage(`연결 실패: ${msg}. 배포 권한이 '모든 사용자(Anyone)'로 되어 있는지 확인하세요.`);
    }
  };

  const handleSave = () => {
    onSave(urlInput.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Google Apps Script API 연동 설정</h3>
              <p className="text-xs text-slate-500">스프레드시트 Web App 엔드포인트 URL 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Apps Script Web App 배포 URL (Base URL)
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              * URL을 비워두거나 빈 값으로 저장하면 브라우저 내 <strong>체험용 로컬 데모 모드</strong>로 자동 동작합니다.
            </p>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testStatus === 'testing'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{testMessage}</span>
            </div>
          )}

          {/* CORS & Web App Deployment Notes */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Apps Script CORS 이슈 대응 안내
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900/90 leading-relaxed">
              <li>
                웹 앱 배포 시 <strong>[액세스 권한이 있는 사용자]</strong>를 반드시 <strong>&apos;모든 사용자 (Anyone)&apos;</strong>로 지정해야 브라우저 외부 요청이 허용됩니다.
              </li>
              <li>
                Google Apps Script는 POST 응답 시 302 리디렉션을 사용하므로 시스템 내부적으로 <code>redirect: &apos;follow&apos;</code> 옵션이 완벽히 적용되어 있습니다.
              </li>
            </ul>
          </div>

          {/* Reset Demo Data */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => {
                resetLocalMockData();
                onResetMock();
                setTestStatus('idle');
                setUrlInput('');
              }}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-[11px]"
            >
              <Database className="w-3.5 h-3.5" />
              <span>체험용 샘플 데이터 초기화</span>
            </button>

            {urlInput && urlInput.startsWith('https://') && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium flex items-center gap-1.5 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>연결 테스트</span>
              </button>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-2xs"
            >
              설정 저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
