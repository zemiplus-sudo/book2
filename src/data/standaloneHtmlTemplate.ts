export const STANDALONE_INDEX_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>스마트 도서관 예약 시스템</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">

  <!-- 메인 헤더 -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
          <i data-lucide="book-open" class="w-5 h-5"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">스마트 도서관 예약 시스템</h1>
          <p class="text-xs text-slate-500 hidden sm:block">Google Apps Script Web App 실시간 연동</p>
        </div>
      </div>

      <!-- 우측 컨트롤: API 설정 버튼 & 내 예약 뱃지 -->
      <div class="flex items-center gap-2">
        <button id="btnOpenApiConfig" class="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5">
          <i data-lucide="settings" class="w-3.5 h-3.5"></i>
          <span>API 설정</span>
          <span id="apiStatusDot" class="w-2 h-2 rounded-full bg-amber-500"></span>
        </button>
      </div>
    </div>
  </header>

  <!-- 메인 컨테이너 -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- 상단 탭 네비게이션: 도서 목록 vs 내 예약 내역 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div class="flex items-center gap-2 bg-slate-200/70 p-1 rounded-xl">
        <button id="tabBooksBtn" onclick="switchTab('books')" class="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-700 shadow-xs transition-all flex items-center gap-2">
          <i data-lucide="library" class="w-4 h-4"></i>
          <span>도서 검색 및 목록</span>
        </button>
        <button id="tabReservationsBtn" onclick="switchTab('reservations')" class="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2">
          <i data-lucide="calendar-check" class="w-4 h-4"></i>
          <span>내 예약 내역</span>
          <span id="resBadgeCount" class="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">0</span>
        </button>
      </div>

      <!-- 새로고침 버튼 -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button onclick="refreshData()" class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors">
          <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
          <span>새로고침</span>
        </button>
      </div>
    </div>

    <!-- 섹션 1: 도서 목록 뷰 -->
    <div id="viewBooks" class="space-y-6">
      <!-- 검색 및 필터 바 -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div class="relative flex-1">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="searchInput" oninput="applyFilters()" placeholder="도서명, 저자, 카테고리 검색..." class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors">
          </div>
          <div class="flex items-center gap-2">
            <select id="sortSelect" onchange="applyFilters()" class="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700">
              <option value="default">기본 정렬</option>
              <option value="titleAsc">제목 오름차순</option>
              <option value="yearDesc">최신 발행순</option>
            </select>
            <label class="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200/80 transition-colors select-none">
              <input type="checkbox" id="onlyAvailableCheck" onchange="applyFilters()" class="rounded text-indigo-600 focus:ring-indigo-500">
              <span>이용 가능만 보기</span>
            </label>
          </div>
        </div>

        <!-- 카테고리 칩 -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="categoryChipsContainer">
          <!-- 동적 생성 -->
        </div>
      </div>

      <!-- 도서 통계 요약 -->
      <div class="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          <span>총 </span><strong id="totalCount" class="text-slate-800 font-semibold">0</strong><span>권 검색됨</span>
          <span class="mx-1">·</span>
          <span>이용 가능 </span><strong id="availableCount" class="text-emerald-700 font-semibold">0</strong><span>권</span>
        </div>
      </div>

      <!-- 스켈레톤 로더 (로딩 중 표시) -->
      <div id="booksLoadingSkeleton" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
          <div class="w-full h-44 bg-slate-100 rounded-xl"></div>
          <div class="h-4 bg-slate-100 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
          <div class="w-full h-44 bg-slate-100 rounded-xl"></div>
          <div class="h-4 bg-slate-100 rounded w-3/4"></div>
          <div class="h-3 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>

      <!-- 도서 카드 그리드 -->
      <div id="booksGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 hidden">
        <!-- JS 렌더링 -->
      </div>

      <!-- 검색 결과 없음 상태 -->
      <div id="noBooksNotice" class="hidden py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
        <i data-lucide="book-x" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
        <h3 class="text-base font-semibold text-slate-700">검색 조건에 맞는 도서가 없습니다</h3>
        <p class="text-xs text-slate-500 mt-1">검색어를 변경하거나 필터를 초기화해 보세요.</p>
      </div>
    </div>

    <!-- 섹션 2: 내 예약 내역 뷰 -->
    <div id="viewReservations" class="space-y-6 hidden">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 class="text-base font-bold text-slate-900">도서 대출 예약 현황</h2>
            <p class="text-xs text-slate-500 mt-0.5">예약하신 도서는 대출 창구에서 3일 이내에 수령해주세요.</p>
          </div>
          <!-- 이메일 검색 필터 -->
          <div class="w-full sm:w-72 relative">
            <i data-lucide="mail" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="email" id="resFilterEmail" oninput="renderReservations()" placeholder="내 이메일로 필터링..." class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600">
          </div>
        </div>
      </div>

      <!-- 예약 목록 로딩 -->
      <div id="resLoading" class="py-12 text-center text-slate-500">
        <div class="w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <span class="text-xs">예약 내역을 불러오는 중...</span>
      </div>

      <!-- 예약 목록 테이블/카드 -->
      <div id="reservationsContainer" class="space-y-3 hidden">
        <!-- JS 렌더링 -->
      </div>

      <div id="noReservationsNotice" class="hidden py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
        <i data-lucide="inbox" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
        <h3 class="text-base font-semibold text-slate-700">현재 활성화된 예약 내역이 없습니다</h3>
        <p class="text-xs text-slate-500 mt-1">도서 검색 탭에서 원하는 책을 찾아 예약해보세요.</p>
      </div>
    </div>

  </main>

  <!-- 예약하기 모달 -->
  <div id="reserveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs hidden">
    <div class="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <i data-lucide="bookmark-plus" class="w-4 h-4"></i>
          </div>
          <h3 class="text-base font-bold text-slate-900">도서 예약 신청</h3>
        </div>
        <button onclick="closeReserveModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="reserveForm" onsubmit="handleReserveSubmit(event)" class="p-6 space-y-4">
        <!-- 선택된 책 정보 -->
        <div class="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
          <img id="modalBookCover" src="" class="w-12 h-16 object-cover rounded bg-slate-200 border border-slate-200 shrink-0">
          <div class="min-w-0 flex-1">
            <h4 id="modalBookTitle" class="text-sm font-bold text-slate-900 truncate"></h4>
            <p id="modalBookAuthor" class="text-xs text-slate-500 truncate mt-0.5"></p>
            <p class="text-[11px] text-indigo-600 font-mono mt-1">도서 ID: <span id="modalBookId"></span></p>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">신청자 성명 <span class="text-rose-500">*</span></label>
          <input type="text" id="reserveUserName" required placeholder="예: 홍길동" class="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">신청자 이메일 <span class="text-rose-500">*</span></label>
          <input type="email" id="reserveUserEmail" required placeholder="예: user@example.com" class="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600">
          <p class="text-[11px] text-slate-400 mt-1">예약 알림 및 예약 취소 시 본인 확인에 사용됩니다.</p>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <button type="button" onclick="closeReserveModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            취소
          </button>
          <button type="submit" id="reserveSubmitBtn" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
            <span id="reserveSubmitText">예약 확정</span>
            <div id="reserveSubmitSpinner" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin hidden"></div>
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- API 설정 모달 -->
  <div id="apiConfigModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs hidden">
    <div class="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-900">Google Apps Script API 설정</h3>
        <button onclick="closeApiConfigModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Apps Script Web App 배포 URL</label>
          <input type="text" id="apiBaseUrlInput" placeholder="https://script.google.com/macros/s/.../exec" class="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600">
          <p class="text-[11px] text-slate-500 mt-1.5">
            비워두시면 브라우저 내부 <strong>로컬 데모 모드</strong>로 즉시 작동합니다. 실제 Google Sheets 연동 시 배포된 웹 앱 URL을 입력하세요.
          </p>
        </div>
        <div class="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
          <p class="font-semibold text-slate-800">⚠️ 배포 시 주의사항 (CORS):</p>
          <p>• 배포 시 [액세스 권한이 있는 사용자]를 반드시 <strong>'모든 사용자(Anyone)'</strong>로 설정해야 외부 fetch가 허용됩니다.</p>
          <p>• fetch 옵션에 <code>redirect: 'follow'</code>가 적용되어 있습니다.</p>
        </div>
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button onclick="saveApiUrl()" class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">
            설정 저장
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 토스트 알림 컨테이너 -->
  <div id="toastContainer" class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"></div>

  <!-- JavaScript 로직 -->
  <script>
    // 상태 관리
    const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxOuNUDg8SfYUKklc5gmdhiY7neIlAg4zLq_jLOJYfqThPiSkMlfbVDAzViGx3zfdfEcg/exec';
    let BASE_URL = localStorage.getItem('smart_lib_apps_script_url') || DEFAULT_GAS_URL;
    let currentTab = 'books';
    let rawBooks = [];
    let rawReservations = [];
    let currentCategory = '전체';
    let selectedBookForReserve = null;

    function checkIsAvailable(book) {
      if (!book || !book.status) return true;
      const s = String(book.status).trim();
      return s === '이용가능' || s === 'AVAILABLE' || s === '대출가능';
    }

    // 초기 샘플 목업 데이터 (URL 미설정 시 즉시 체험용)
    const MOCK_BOOKS = [
      { id: 'B001', title: '클린 코드: 애자일 소프트웨어 장인 정신', author: '로버트 C. 마틴', category: 'IT / 프로그래밍', status: 'AVAILABLE', year: 2013, callNumber: '005.13-마82클', coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80' },
      { id: 'B002', title: '모던 자바스크립트 Deep Dive', author: '이웅모', category: 'IT / 프로그래밍', status: 'RESERVED', year: 2020, callNumber: '005.133-이68모', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
      { id: 'B003', title: '트렌드 코리아 2026', author: '김난도 외', category: '경제 / 경영', status: 'AVAILABLE', year: 2025, callNumber: '320.1-김23트-2026', coverUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?auto=format&fit=crop&w=600&q=80' },
      { id: 'B004', title: '불편한 편의점', author: '김호연', category: '문학 / 소설', status: 'AVAILABLE', year: 2021, callNumber: '813.7-김95불', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
      { id: 'B005', title: '사피엔스: 유인원에서 사이보그까지', author: '유발 하라리', category: '인문 / 역사', status: 'AVAILABLE', year: 2015, callNumber: '909-하23사', coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
      { id: 'B006', title: '도둑맞은 집중력', author: '요한 하리', category: '자기계발 / 심리', status: 'RESERVED', year: 2023, callNumber: '181.2-하34도', coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80' }
    ];

    const MOCK_RESERVATIONS = [
      { res_id: 'R001', book_id: 'B002', book_title: '모던 자바스크립트 Deep Dive', user_name: '김도서', user_email: 'reader@example.com', reserved_at: '2026-10-08 14:30', status: 'ACTIVE' },
      { res_id: 'R002', book_id: 'B006', book_title: '도둑맞은 집중력', user_name: '이지은', user_email: 'jieun@iceu.kr', reserved_at: '2026-10-09 09:15', status: 'ACTIVE' }
    ];

    function isRealUrl() {
      return BASE_URL && BASE_URL !== 'YOUR_APPS_SCRIPT_WEBAPP_URL' && BASE_URL.startsWith('https://script.google.com/macros/s/');
    }

    // 초기화
    document.addEventListener('DOMContentLoaded', () => {
      lucide.createIcons();
      updateApiStatusBadge();
      initLocalDataIfNeeded();
      refreshData();

      document.getElementById('btnOpenApiConfig').addEventListener('click', () => {
        document.getElementById('apiBaseUrlInput').value = isRealUrl() ? BASE_URL : '';
        document.getElementById('apiConfigModal').classList.remove('hidden');
      });
    });

    function initLocalDataIfNeeded() {
      if (!localStorage.getItem('smart_lib_local_books')) {
        localStorage.setItem('smart_lib_local_books', JSON.stringify(MOCK_BOOKS));
      }
      if (!localStorage.getItem('smart_lib_local_res')) {
        localStorage.setItem('smart_lib_local_res', JSON.stringify(MOCK_RESERVATIONS));
      }
    }

    function updateApiStatusBadge() {
      const dot = document.getElementById('apiStatusDot');
      if (isRealUrl()) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-amber-500';
      }
    }

    function closeApiConfigModal() {
      document.getElementById('apiConfigModal').classList.add('hidden');
    }

    function saveApiUrl() {
      const val = document.getElementById('apiBaseUrlInput').value.trim();
      BASE_URL = val || 'YOUR_APPS_SCRIPT_WEBAPP_URL';
      localStorage.setItem('smart_lib_apps_script_url', BASE_URL);
      updateApiStatusBadge();
      closeApiConfigModal();
      showToast('설정 저장', isRealUrl() ? 'Apps Script API 연결 모드로 전환되었습니다.' : '데모 모드로 설정되었습니다.', 'info');
      refreshData();
    }

    // 탭 전환
    function switchTab(tab) {
      currentTab = tab;
      const viewBooks = document.getElementById('viewBooks');
      const viewReservations = document.getElementById('viewReservations');
      const tabBooksBtn = document.getElementById('tabBooksBtn');
      const tabReservationsBtn = document.getElementById('tabReservationsBtn');

      if (tab === 'books') {
        viewBooks.classList.remove('hidden');
        viewReservations.classList.add('hidden');
        tabBooksBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-700 shadow-xs transition-all flex items-center gap-2';
        tabReservationsBtn.className = 'px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2';
      } else {
        viewBooks.classList.add('hidden');
        viewReservations.classList.remove('hidden');
        tabReservationsBtn.className = 'px-4 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-700 shadow-xs transition-all flex items-center gap-2';
        tabBooksBtn.className = 'px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2';
        renderReservations();
      }
      lucide.createIcons();
    }

    // 데이터 새로고침
    async function refreshData() {
      setLoadingState(true);
      try {
        await Promise.all([loadBooks(), loadReservations()]);
      } catch (err) {
        showToast('데이터 로딩 오류', err.message, 'error');
      } finally {
        setLoadingState(false);
      }
    }

    function setLoadingState(loading) {
      const skel = document.getElementById('booksLoadingSkeleton');
      const grid = document.getElementById('booksGrid');
      const resLoading = document.getElementById('resLoading');
      const resContainer = document.getElementById('reservationsContainer');

      if (loading) {
        skel.classList.remove('hidden');
        grid.classList.add('hidden');
        resLoading.classList.remove('hidden');
        resContainer.classList.add('hidden');
      } else {
        skel.classList.add('hidden');
        grid.classList.remove('hidden');
        resLoading.classList.add('hidden');
        resContainer.classList.remove('hidden');
      }
    }

    // 도서 목록 GET 요청
    async function loadBooks() {
      if (!isRealUrl()) {
        await new Promise(r => setTimeout(r, 200));
        rawBooks = JSON.parse(localStorage.getItem('smart_lib_local_books') || '[]');
      } else {
        const url = BASE_URL + (BASE_URL.includes('?') ? '&' : '?') + 'action=getBooks';
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        const json = await res.json();
        rawBooks = Array.isArray(json) ? json : (json.books || []);
      }
      renderCategoryChips();
      applyFilters();
    }

    // 예약 목록 GET 요청
    async function loadReservations() {
      if (!isRealUrl()) {
        await new Promise(r => setTimeout(r, 200));
        rawReservations = JSON.parse(localStorage.getItem('smart_lib_local_res') || '[]').filter(r => r.status === 'ACTIVE');
      } else {
        const url = BASE_URL + (BASE_URL.includes('?') ? '&' : '?') + 'action=getReservations';
        const res = await fetch(url, { method: 'GET', redirect: 'follow' });
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json.reservations || []);
        rawReservations = list.filter(r => r.status === 'ACTIVE' || !r.status);
      }
      document.getElementById('resBadgeCount').innerText = rawReservations.length;
      renderReservations();
    }

    // 카테고리 칩 렌더링
    function renderCategoryChips() {
      const categories = ['전체', ...Array.from(new Set(rawBooks.map(b => b.category).filter(Boolean)))];
      const container = document.getElementById('categoryChipsContainer');
      container.innerHTML = categories.map(cat => {
        const isActive = cat === currentCategory;
        return \`<button onclick="setCategory('\${cat}')" class="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors \${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}">\${cat}</button>\`;
      }).join('');
    }

    function setCategory(cat) {
      currentCategory = cat;
      renderCategoryChips();
      applyFilters();
    }

    // 필터링 및 도서 렌더링
    function applyFilters() {
      const query = document.getElementById('searchInput').value.trim().toLowerCase();
      const sort = document.getElementById('sortSelect').value;
      const onlyAvail = document.getElementById('onlyAvailableCheck').checked;

      let filtered = rawBooks.filter(b => {
        const matchCat = currentCategory === '전체' || b.category === currentCategory;
        const matchQuery = !query ||
          (b.title && b.title.toLowerCase().includes(query)) ||
          (b.author && b.author.toLowerCase().includes(query)) ||
          (b.category && b.category.toLowerCase().includes(query));
        const matchAvail = !onlyAvail || checkIsAvailable(b);
        return matchCat && matchQuery && matchAvail;
      });

      if (sort === 'titleAsc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'yearDesc') {
        filtered.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
      }

      document.getElementById('totalCount').innerText = filtered.length;
      document.getElementById('availableCount').innerText = filtered.filter(b => checkIsAvailable(b)).length;

      const grid = document.getElementById('booksGrid');
      const noBooksNotice = document.getElementById('noBooksNotice');

      if (filtered.length === 0) {
        grid.innerHTML = '';
        noBooksNotice.classList.remove('hidden');
        return;
      }

      noBooksNotice.classList.add('hidden');
      grid.innerHTML = filtered.map(book => {
        const isAvailable = checkIsAvailable(book);
        return \`
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 transition-all hover:shadow-xs group">
            <div class="h-48 overflow-hidden bg-slate-100 relative">
              <img src="\${book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'}" alt="\${book.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              <div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-semibold backdrop-blur-md \${isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-amber-600/90 text-white'}">
                \${isAvailable ? '이용가능' : '예약중'}
              </div>
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div class="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <span>\${book.category || '기타'}</span>
                  \${book.year ? \`<span>·</span><span>\${book.year}년</span>\` : ''}
                </div>
                <h3 class="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">\${book.title}</h3>
                <p class="text-xs text-slate-600 mt-1 line-clamp-1">\${book.author}</p>
                \${book.callNumber ? \`<p class="text-[11px] text-slate-400 font-mono mt-1">\${book.callNumber}</p>\` : ''}
              </div>
              <div>
                \${isAvailable ? \`
                  <button onclick="openReserveModal('\${book.id}')" class="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs">
                    <i data-lucide="bookmark-plus" class="w-3.5 h-3.5"></i>
                    <span>예약하기</span>
                  </button>
                \` : \`
                  <button disabled class="w-full py-2 px-3 text-xs font-medium rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed">
                    현재 예약 중
                  </button>
                \`}
              </div>
            </div>
          </div>
        \`;
      }).join('');

      lucide.createIcons();
    }

    // 예약 모달 열기
    function openReserveModal(bookId) {
      const book = rawBooks.find(b => b.id === bookId);
      if (!book) return;
      selectedBookForReserve = book;
      document.getElementById('modalBookCover').src = book.coverUrl || '';
      document.getElementById('modalBookTitle').innerText = book.title;
      document.getElementById('modalBookAuthor').innerText = book.author;
      document.getElementById('modalBookId').innerText = book.id;
      document.getElementById('reserveUserName').value = '';
      document.getElementById('reserveUserEmail').value = '';
      document.getElementById('reserveModal').classList.remove('hidden');
    }

    function closeReserveModal() {
      document.getElementById('reserveModal').classList.add('hidden');
      selectedBookForReserve = null;
    }

    // 예약하기 POST 요청
    async function handleReserveSubmit(e) {
      e.preventDefault();
      if (!selectedBookForReserve) return;

      const userName = document.getElementById('reserveUserName').value.trim();
      const userEmail = document.getElementById('reserveUserEmail').value.trim();

      if (!userName || !userEmail) {
        showToast('입력 확인', '성명과 이메일을 모두 입력해주세요.', 'error');
        return;
      }

      const submitBtn = document.getElementById('reserveSubmitBtn');
      const submitText = document.getElementById('reserveSubmitText');
      const submitSpinner = document.getElementById('reserveSubmitSpinner');

      submitBtn.disabled = true;
      submitText.innerText = '예약 처리 중...';
      submitSpinner.classList.remove('hidden');

      try {
        if (!isRealUrl()) {
          // 로컬 데모 모드 시뮬레이션
          await new Promise(r => setTimeout(r, 400));
          const books = JSON.parse(localStorage.getItem('smart_lib_local_books') || '[]');
          const target = books.find(b => b.id === selectedBookForReserve.id);
          if (target) target.status = 'RESERVED';
          localStorage.setItem('smart_lib_local_books', JSON.stringify(books));

          const resList = JSON.parse(localStorage.getItem('smart_lib_local_res') || '[]');
          const newRes = {
            res_id: 'R' + Date.now().toString().slice(-6),
            book_id: selectedBookForReserve.id,
            book_title: selectedBookForReserve.title,
            user_name: userName,
            user_email: userEmail,
            reserved_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
            status: 'ACTIVE'
          };
          resList.unshift(newRes);
          localStorage.setItem('smart_lib_local_res', JSON.stringify(resList));
        } else {
          // 실제 Google Apps Script POST 요청
          const payload = {
            action: 'createReservation',
            data: {
              book_id: selectedBookForReserve.id,
              user_name: userName,
              user_email: userEmail
            }
          };

          const res = await fetch(BASE_URL, {
            method: 'POST',
            redirect: 'follow', // 필수
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (data.success === false) {
            throw new Error(data.message || '예약 실패');
          }
        }

        showToast('예약 성공', \`'\${selectedBookForReserve.title}' 예약이 완료되었습니다.\`, 'success');
        closeReserveModal();
        await refreshData();
      } catch (err) {
        showToast('예약 실패', err.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitText.innerText = '예약 확정';
        submitSpinner.classList.add('hidden');
      }
    }

    // 예약 취소 POST 요청
    async function handleCancelReservation(resId, bookTitle) {
      if (!confirm(\`'\${bookTitle}' 예약을 취소하시겠습니까?\`)) {
        return;
      }

      try {
        if (!isRealUrl()) {
          await new Promise(r => setTimeout(r, 300));
          let resList = JSON.parse(localStorage.getItem('smart_lib_local_res') || '[]');
          const target = resList.find(r => r.res_id === resId);
          if (target) {
            target.status = 'CANCELLED';
            const books = JSON.parse(localStorage.getItem('smart_lib_local_books') || '[]');
            const b = books.find(item => item.id === target.book_id);
            if (b) b.status = 'AVAILABLE';
            localStorage.setItem('smart_lib_local_books', JSON.stringify(books));
          }
          resList = resList.filter(r => r.res_id !== resId);
          localStorage.setItem('smart_lib_local_res', JSON.stringify(resList));
        } else {
          const payload = {
            action: 'cancelReservation',
            res_id: resId
          };

          const res = await fetch(BASE_URL, {
            method: 'POST',
            redirect: 'follow', // 필수
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (data.success === false) {
            throw new Error(data.message || '취소 실패');
          }
        }

        showToast('예약 취소', \`'\${bookTitle}' 예약이 취소되었습니다.\`, 'info');
        await refreshData();
      } catch (err) {
        showToast('취소 실패', err.message, 'error');
      }
    }

    // 내 예약 뷰 렌더링
    function renderReservations() {
      const emailFilter = (document.getElementById('resFilterEmail').value || '').trim().toLowerCase();
      const container = document.getElementById('reservationsContainer');
      const noResNotice = document.getElementById('noReservationsNotice');

      let list = rawReservations;
      if (emailFilter) {
        list = list.filter(r => r.user_email && r.user_email.toLowerCase().includes(emailFilter));
      }

      if (list.length === 0) {
        container.innerHTML = '';
        noResNotice.classList.remove('hidden');
        return;
      }

      noResNotice.classList.add('hidden');
      container.innerHTML = list.map(item => \`
        <div class="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors">
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 text-xs">
              <span class="font-mono text-indigo-600 font-semibold">\${item.res_id}</span>
              <span class="text-slate-300">·</span>
              <span class="text-slate-500">예약일시: \${item.reserved_at || '-'}</span>
            </div>
            <h4 class="text-base font-bold text-slate-900 truncate">\${item.book_title}</h4>
            <div class="flex items-center gap-3 text-xs text-slate-600">
              <span>신청자: <strong>\${item.user_name}</strong></span>
              <span>·</span>
              <span>\${item.user_email}</span>
            </div>
          </div>
          <button onclick="handleCancelReservation('\${item.res_id}', '\${item.book_title.replace(/'/g, "\\\\'")}')" class="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all flex items-center gap-1.5 self-end sm:self-center shrink-0">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            <span>예약 취소</span>
          </button>
        </div>
      \`).join('');

      lucide.createIcons();
    }

    // 알림 토스트
    function showToast(title, message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const colors = {
        success: 'border-emerald-500 text-emerald-900 bg-white',
        error: 'border-rose-500 text-rose-900 bg-white',
        info: 'border-indigo-500 text-slate-900 bg-white'
      };

      toast.className = \`p-4 rounded-xl shadow-lg border-l-4 \${colors[type]} border border-slate-100 flex items-start gap-3 pointer-events-auto transform transition-all duration-300 animate-in slide-in-from-right\`;
      toast.innerHTML = \`
        <div class="flex-1">
          <h5 class="text-xs font-bold">\${title}</h5>
          \${message ? \`<p class="text-xs text-slate-600 mt-0.5">\${message}</p>\` : ''}
        </div>
      \`;

      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
  </script>
</body>
</html>`;
