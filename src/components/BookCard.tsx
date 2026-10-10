import React from 'react';
import { Book } from '../types/library';
import { BookmarkPlus, BookX, CheckCircle, Clock } from 'lucide-react';
import { isBookAvailable } from '../services/api';

interface BookCardProps {
  book: Book;
  onReserve: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onReserve }) => {
  const isAvailable = isBookAvailable(book);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-sm">
      {/* Cover image header */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={
            book.coverUrl ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
          }
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {/* Status chip */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600/90 text-white backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
              <span>이용가능</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600/90 text-white backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
              <span>예약중</span>
            </div>
          )}
        </div>
      </div>

      {/* Book details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Unboxed metadata line with typographic separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-medium text-slate-600">{book.category || '일반 도서'}</span>
            {book.year && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>{book.year}년</span>
              </>
            )}
            {book.publisher && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="truncate max-w-[100px]">{book.publisher}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3
            className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug"
            title={book.title}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-slate-600 line-clamp-1">{book.author}</p>

          {/* Call number & ID */}
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>{book.callNumber || '청구기호 미지정'}</span>
            <span className="text-slate-400">ID: {book.id}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          {isAvailable ? (
            <button
              onClick={() => onReserve(book)}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>도서 예약하기</span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 px-3 text-xs font-medium text-slate-400 bg-slate-100 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>현재 다른 사용자가 예약 중</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
