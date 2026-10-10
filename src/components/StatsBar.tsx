import React from 'react';
import { Book, Reservation } from '../types/library';
import { BookOpen, CheckCircle2, BookmarkCheck, CalendarClock } from 'lucide-react';
import { isBookAvailable } from '../services/api';

interface StatsBarProps {
  books: Book[];
  reservations: Reservation[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ books, reservations }) => {
  const totalBooks = books.length;
  const availableBooks = books.filter((b) => isBookAvailable(b)).length;
  const reservedBooks = totalBooks - availableBooks;
  const activeReservationsCount = reservations.length;

  const stats = [
    {
      label: '전체 소장 도서',
      value: `${totalBooks}권`,
      sub: '도서관 전체 데이터베이스',
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: '대출 / 예약 가능',
      value: `${availableBooks}권`,
      sub: '지금 즉시 예약 가능',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: '현재 예약 대기',
      value: `${reservedBooks}권`,
      sub: '이용자 대출 준비중',
      icon: CalendarClock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: '활성 예약 건수',
      value: `${activeReservationsCount}건`,
      sub: '취소/수령 관리 목록',
      icon: BookmarkCheck,
      color: 'text-sky-600 bg-sky-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex items-center gap-3.5 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 truncate">{item.label}</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {item.value}
              </h3>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">{item.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
