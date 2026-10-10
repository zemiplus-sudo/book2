import React, { useState, useEffect } from 'react';
import { Book, ReservationFormData } from '../types/library';
import { X, BookmarkPlus, Loader2, AlertCircle, Calendar, User, Mail, ShieldCheck } from 'lucide-react';

interface ReservationModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSubmit: (formData: ReservationFormData) => Promise<void>;
  isLoading: boolean;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  book,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUserName('');
      setUserEmail('');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !book) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedName = userName.trim();
    const trimmedEmail = userEmail.trim();

    if (!trimmedName) {
      setErrorMessage('예약자 성명을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      await onSubmit({
        book_id: book.id,
        user_name: trimmedName,
        user_email: trimmedEmail,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || '예약 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookmarkPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">도서 대출 예약 신청</h3>
              <p className="text-xs text-slate-500">지정된 수령 기간 내 대출 창구를 방문해주세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Selected Book Overview */}
        <div className="p-4 mx-6 mt-5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-3.5">
          <img
            src={
              book.coverUrl ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
            }
            alt={book.title}
            className="w-12 h-16 object-cover rounded-md bg-slate-200 border border-slate-200 shrink-0 shadow-2xs"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] text-slate-500 font-medium">
              {book.category} · {book.year ? `${book.year}년` : ''}
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate leading-tight mt-0.5" title={book.title}>
              {book.title}
            </h4>
            <p className="text-xs text-slate-600 truncate mt-0.5">{book.author}</p>
            <p className="text-[11px] text-indigo-600 font-mono mt-1 font-semibold">도서 ID: {book.id}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              예약자 성명 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              예약자 이메일 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="예: gildong@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              예약 완료 안내 및 내 예약 내역 조회/취소 인증에 사용됩니다.
            </p>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-indigo-900/80">
              예약 후 <strong>3영업일</strong> 이내에 중앙도서관 대출 데스크에서 도서를 수령해 주세요. 미수령 시 예약이 자동 취소됩니다.
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 rounded-xl transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>예약 처리 중...</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>예약 신청 확정</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
