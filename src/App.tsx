/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { BookCard } from './components/BookCard';
import { BookSkeletonGrid } from './components/BookSkeleton';
import { ReservationModal } from './components/ReservationModal';
import { ReservationsList } from './components/ReservationsList';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GasGuideModal } from './components/GasGuideModal';
import { StandaloneExportModal } from './components/StandaloneExportModal';
import { ToastContainer } from './components/Toast';

import { Book, Reservation, ReservationFormData, ToastMessage } from './types/library';
import { BOOK_CATEGORIES } from './data/mockData';
import {
  getStoredBaseUrl,
  setStoredBaseUrl,
  fetchBooks,
  fetchReservations,
  createReservation,
  cancelReservation,
  isConfiguredUrl,
  isBookAvailable,
} from './services/api';

import {
  Search,
  BookOpen,
  CalendarCheck,
  RotateCw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  BookX,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Config & State
  const [baseUrl, setBaseUrl] = useState<string>(() => getStoredBaseUrl());
  const [activeTab, setActiveTab] = useState<'books' | 'reservations'>('books');

  // Data
  const [books, setBooks] = useState<Book[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [sortBy, setSortBy] = useState<'default' | 'titleAsc' | 'yearDesc'>('default');
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  // Modals & Action States
  const [reserveModalBook, setReserveModalBook] = useState<Book | null>(null);
  const [isSubmittingReserve, setIsSubmittingReserve] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState<boolean>(false);
  const [isStandaloneExportOpen, setIsStandaloneExportOpen] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all data
  const loadData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      setIsRefreshing(true);

      try {
        const booksData = await fetchBooks(baseUrl);
        const reservationsData = await fetchReservations(baseUrl, booksData);
        setBooks(booksData);
        setReservations(reservationsData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addToast('error', '데이터 연동 오류', msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [baseUrl, addToast]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL updates
  const handleSaveApiUrl = (newUrl: string) => {
    setStoredBaseUrl(newUrl);
    setBaseUrl(newUrl);
    addToast(
      'info',
      'API 설정 저장됨',
      isConfiguredUrl(newUrl)
        ? 'Apps Script Web App API 연결 모드로 전환되었습니다.'
        : '체험용 로컬 데모 모드로 전환되었습니다.'
    );
  };

  // Handle Reserve Book Submit
  const handleReserveSubmit = async (formData: ReservationFormData) => {
    setIsSubmittingReserve(true);
    try {
      const res = await createReservation(baseUrl, formData);
      addToast('success', '도서 예약 완료', res.message);
      setReserveModalBook(null);
      // Auto-refresh data as required
      await loadData(true);
      // Automatically switch to reservations tab to show the new reservation
      setActiveTab('reservations');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', '예약 실패', msg);
      throw err; // propagates to modal for display
    } finally {
      setIsSubmittingReserve(false);
    }
  };

  // Handle Cancel Reservation
  const handleCancelReservation = async (resId: string, bookTitle: string) => {
    if (!window.confirm(`'${bookTitle}' 도서 예약을 취소하시겠습니까?`)) {
      return;
    }

    setCancellingId(resId);
    try {
      const res = await cancelReservation(baseUrl, resId);
      addToast('success', '예약 취소 완료', res.message);
      // Auto-refresh data
      await loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('error', '예약 취소 오류', msg);
    } finally {
      setCancellingId(null);
    }
  };

  // Dynamic Categories from available books
  const categories = useMemo(() => {
    const list = Array.from(new Set(books.map((b) => b.category).filter(Boolean)));
    return ['전체', ...list];
  }, [books]);

  // Filtered & Sorted Books
  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = books.filter((b) => {
      const matchCategory = selectedCategory === '전체' || b.category === selectedCategory;
      const matchQuery =
        !query ||
        b.title.toLowerCase().includes(query) ||
        b.author.toLowerCase().includes(query) ||
        (b.callNumber && b.callNumber.toLowerCase().includes(query)) ||
        (b.category && b.category.toLowerCase().includes(query));
      const matchAvailable = !onlyAvailable || isBookAvailable(b);

      return matchCategory && matchQuery && matchAvailable;
    });

    if (sortBy === 'titleAsc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'yearDesc') {
      filtered.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    }

    return filtered;
  }, [books, searchQuery, selectedCategory, sortBy, onlyAvailable]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <Header
        baseUrl={baseUrl}
        isRefreshing={isRefreshing}
        onRefresh={() => loadData(false)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenGasGuide={() => setIsGasGuideOpen(true)}
        onOpenStandaloneExport={() => setIsStandaloneExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Info Banner for Demo Mode */}
        {!isConfiguredUrl(baseUrl) && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  현재 즉시 체험 가능한 [로컬 데모 모드]로 동작 중입니다
                </h4>
                <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                  별도의 Google 스프레드시트 설정 없이 도서 예약 및 취소를 즉시 테스트하실 수 있습니다. 실제 Google Sheets 연동을 원하시면 우측 상단 <strong>[API 설정]</strong> 및 <strong>[백엔드 스크립트]</strong>를 확인하세요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => setIsGasGuideOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
              >
                연동 가이드 보기
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Statistics Bar */}
        <StatsBar books={books} reservations={reservations} />

        {/* Navigation Tabs (Books Search vs My Reservations) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'books'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>도서 검색 및 예약</span>
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'reservations'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>내 예약 내역</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                  activeTab === 'reservations'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-300/80 text-slate-700'
                }`}
              >
                {reservations.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
            <span>마지막 동기화: </span>
            <span className="font-mono text-slate-700 font-medium">
              {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* TAB 1: Books Search & Catalog */}
        {activeTab === 'books' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Search & Filters Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="도서명, 저자, 카테고리, 청구기호로 검색..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* Sort & Quick Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'default' | 'titleAsc' | 'yearDesc')}
                    className="px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700 cursor-pointer"
                  >
                    <option value="default">기본 정렬</option>
                    <option value="titleAsc">제목 가나다순</option>
                    <option value="yearDesc">최신 출간순</option>
                  </select>

                  <label className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/70 rounded-xl cursor-pointer transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>이용가능만</span>
                  </label>
                </div>
              </div>

              {/* Category Segmented Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = cat === selectedCategory;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result Counter & Details */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div>
                <span>검색 결과 </span>
                <strong className="text-slate-900 font-semibold">{filteredBooks.length}</strong>
                <span>권</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>이용 가능 </span>
                <strong className="text-emerald-700 font-semibold">
                  {filteredBooks.filter((b) => isBookAvailable(b)).length}
                </strong>
                <span>권</span>
              </div>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('전체');
                    setOnlyAvailable(false);
                  }}
                  className="text-indigo-600 hover:underline cursor-pointer"
                >
                  모든 필터 초기화
                </button>
              )}
            </div>

            {/* Books Loading Skeleton */}
            {isLoading && <BookSkeletonGrid count={8} />}

            {/* Empty Search Results */}
            {!isLoading && filteredBooks.length === 0 && (
              <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <BookX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">일치하는 도서를 찾을 수 없습니다</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  검색어가 올바른지 확인하거나 선택한 카테고리 필터를 변경해 보세요.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('전체');
                    setOnlyAvailable(false);
                  }}
                  className="mt-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
                >
                  필터 초기화
                </button>
              </div>
            )}

            {/* Book Cards Grid */}
            {!isLoading && filteredBooks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onReserve={(targetBook) => setReserveModalBook(targetBook)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: My Reservations */}
        {activeTab === 'reservations' && (
          <div className="animate-in fade-in duration-200">
            <ReservationsList
              reservations={reservations}
              onCancelReservation={handleCancelReservation}
              isLoading={isLoading}
              cancellingId={cancellingId}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">스마트 도서관 예약 시스템</span>
            <span className="text-slate-300">|</span>
            <span>Google Apps Script Web App Powered SPA</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsStandaloneExportOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              단일 index.html 내보내기
            </button>
            <button
              onClick={() => setIsGasGuideOpen(true)}
              className="text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Apps Script Code.gs 템플릿
            </button>
          </div>
        </div>
      </footer>

      {/* Reservation Modal */}
      <ReservationModal
        isOpen={Boolean(reserveModalBook)}
        book={reserveModalBook}
        onClose={() => setReserveModalBook(null)}
        onSubmit={handleReserveSubmit}
        isLoading={isSubmittingReserve}
      />

      {/* API Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        currentUrl={baseUrl}
        onClose={() => setIsApiSettingsOpen(false)}
        onSave={handleSaveApiUrl}
        onResetMock={() => {
          loadData(false);
          addToast('info', '초기화 완료', '샘플 도서 및 예약 데이터가 초기 상태로 복구되었습니다.');
        }}
      />

      {/* Google Apps Script Guide & Code Modal */}
      <GasGuideModal
        isOpen={isGasGuideOpen}
        onClose={() => setIsGasGuideOpen(false)}
      />

      {/* Standalone Single File index.html Export Modal */}
      <StandaloneExportModal
        isOpen={isStandaloneExportOpen}
        onClose={() => setIsStandaloneExportOpen(false)}
      />

      {/* Toast Stack */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
