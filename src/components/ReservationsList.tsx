import React, { useState } from 'react';
import { Reservation } from '../types/library';
import { Calendar, Trash2, Mail, User, BookOpen, Clock, Search, AlertCircle, Loader2 } from 'lucide-react';

interface ReservationsListProps {
  reservations: Reservation[];
  onCancelReservation: (resId: string, bookTitle: string) => Promise<void>;
  isLoading: boolean;
  cancellingId: string | null;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({
  reservations,
  onCancelReservation,
  isLoading,
  cancellingId,
}) => {
  const [emailFilter, setEmailFilter] = useState('');

  const filteredReservations = reservations.filter((r) => {
    if (!emailFilter.trim()) return true;
    return r.user_email.toLowerCase().includes(emailFilter.trim().toLowerCase());
  });

  return (
    <div className="space-y-5">
      {/* Search / Filter bar for reservations */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">도서 예약 현황</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            총 <strong className="text-indigo-600 font-semibold">{reservations.length}</strong>건의 활성 예약이 등록되어 있습니다.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="내 이메일로 내역 조회..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
          />
          {emailFilter && (
            <button
              onClick={() => setEmailFilter('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">예약 내역을 실시간으로 동기화하는 중...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredReservations.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {emailFilter ? '해당 이메일로 등록된 예약이 없습니다' : '현재 예약된 도서가 없습니다'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {emailFilter
              ? '입력한 이메일 주소를 다시 확인하거나, 전체 도서 검색 탭에서 예약해 보세요.'
              : '도서 검색 및 목록에서 필요한 도서를 찾아 예약 신청을 진행해 보세요.'}
          </p>
        </div>
      )}

      {/* Reservations Cards List */}
      {!isLoading && filteredReservations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReservations.map((item) => {
            const isCancelling = cancellingId === item.res_id;

            return (
              <div
                key={item.res_id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-2xs space-y-4"
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {item.res_id}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.reserved_at || '예약일시 미기록'}</span>
                    </div>
                  </div>

                  {/* Book Title */}
                  <h4 className="text-base font-bold text-slate-900 line-clamp-1 mt-1 leading-snug">
                    {item.book_title}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">도서 ID: {item.book_id}</p>

                  {/* Borrower info */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        예약자: <strong className="text-slate-800">{item.user_name}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={item.user_email}>
                        {item.user_email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancel Action */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>대출 대기중</span>
                  </div>

                  <button
                    onClick={() => onCancelReservation(item.res_id, item.book_title || '해당 도서')}
                    disabled={isCancelling}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 active:bg-rose-700 disabled:opacity-50 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>취소 진행 중...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>예약 취소</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
