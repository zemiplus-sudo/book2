import { Book, Reservation, ReservationFormData } from '../types/library';
import { INITIAL_BOOKS, INITIAL_RESERVATIONS } from '../data/mockData';

export const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxOuNUDg8SfYUKklc5gmdhiY7neIlAg4zLq_jLOJYfqThPiSkMlfbVDAzViGx3zfdfEcg/exec';

const STORAGE_KEY_URL = 'smart_lib_apps_script_url';
const STORAGE_KEY_BOOKS = 'smart_lib_local_books';
const STORAGE_KEY_RESERVATIONS = 'smart_lib_local_reservations';

export const getStoredBaseUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_APPS_SCRIPT_URL;
};

export const setStoredBaseUrl = (url: string): void => {
  if (url.trim()) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }
};

// Check if URL is valid and not placeholder
export const isConfiguredUrl = (url: string): boolean => {
  return Boolean(
    url &&
    url.trim() !== '' &&
    url.trim() !== 'YOUR_APPS_SCRIPT_WEBAPP_URL' &&
    url.startsWith('https://script.google.com/macros/s/')
  );
};

export const isBookAvailable = (book: Book): boolean => {
  if (!book || !book.status) return true;
  const s = String(book.status).trim();
  return s === '이용가능' || s === 'AVAILABLE' || s === '대출가능' || s === '보관중';
};

// Deterministic cover images if backend doesn't provide them
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
];

const getFallbackCover = (id: string, title: string): string => {
  const hash = (id + title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COVERS[Math.abs(hash) % FALLBACK_COVERS.length];
};

// Local storage mock helpers for fallback
const getMockBooks = (): Book[] => {
  const saved = localStorage.getItem(STORAGE_KEY_BOOKS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(INITIAL_BOOKS));
  return INITIAL_BOOKS;
};

const saveMockBooks = (books: Book[]) => {
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
};

const getMockReservations = (): Reservation[] => {
  const saved = localStorage.getItem(STORAGE_KEY_RESERVATIONS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
  return INITIAL_RESERVATIONS;
};

const saveMockReservations = (reservations: Reservation[]) => {
  localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(reservations));
};

export const resetLocalMockData = () => {
  localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(INITIAL_BOOKS));
  localStorage.setItem(STORAGE_KEY_RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
};

const formatReservationDate = (rawDate?: string): string => {
  if (!rawDate) return '';
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return rawDate;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  } catch {
    return rawDate;
  }
};

/**
 * 도서 목록 조회 API
 * GET BaseURL + "?action=getBooks"
 */
export async function fetchBooks(baseUrl: string): Promise<Book[]> {
  if (!isConfiguredUrl(baseUrl)) {
    await new Promise((r) => setTimeout(r, 300));
    return getMockBooks();
  }

  const endpoint = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=getBooks`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
    }

    const data = await res.json();
    let rawList: Book[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data.books && Array.isArray(data.books)) {
      rawList = data.books;
    } else if (data.success === false) {
      throw new Error(data.error || data.message || '도서 목록을 불러오지 못했습니다.');
    }

    // Normalize books (ensure coverUrl, category, id)
    return rawList.map((b, idx) => ({
      ...b,
      id: String(b.id || `B${String(idx + 1).padStart(3, '0')}`),
      title: b.title || '제목 없음',
      author: b.author || '저자 미상',
      category: b.category || '일반 도서',
      status: b.status || '이용가능',
      coverUrl: b.coverUrl && b.coverUrl.trim() !== '' ? b.coverUrl : getFallbackCover(String(b.id), b.title),
    }));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('fetchBooks error:', err);
    throw new Error(`Google Apps Script 연결 실패: ${errorMsg}`);
  }
}

/**
 * 예약 목록 조회 API
 * GET BaseURL + "?action=getReservations"
 */
export async function fetchReservations(
  baseUrl: string,
  allBooks: Book[] = []
): Promise<Reservation[]> {
  if (!isConfiguredUrl(baseUrl)) {
    await new Promise((r) => setTimeout(r, 250));
    return getMockReservations().filter((r) => r.status !== 'CANCELLED' && r.status !== '취소');
  }

  const endpoint = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=getReservations`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
    }

    const data = await res.json();
    let list: Reservation[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data.reservations && Array.isArray(data.reservations)) {
      list = data.reservations;
    } else if (data.success === false) {
      throw new Error(data.error || data.message || '예약 목록을 불러오지 못했습니다.');
    }

    // Filter out cancelled ones
    const activeList = list.filter((item) => {
      const s = (item.status || '').trim();
      return s !== 'CANCELLED' && s !== '취소';
    });

    // Populate missing book_title or reserved_at
    const booksMap = new Map(allBooks.map((b) => [String(b.id), b.title]));

    return activeList.map((item) => {
      const displayDate = formatReservationDate(item.reserved_at || item.res_date);
      const title =
        item.book_title || booksMap.get(String(item.book_id)) || `도서 (${item.book_id})`;

      return {
        ...item,
        res_id: String(item.res_id || ''),
        book_id: String(item.book_id || ''),
        book_title: title,
        reserved_at: displayDate || '예약 완료',
      };
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('fetchReservations error:', err);
    throw new Error(`Google Apps Script 연결 실패: ${errorMsg}`);
  }
}

/**
 * 도서 예약하기 API
 * POST BaseURL
 * Body: { action: "createReservation", data: { book_id, user_name, user_email } }
 * 필수 옵션: redirect: 'follow'
 */
export async function createReservation(
  baseUrl: string,
  formData: ReservationFormData
): Promise<{ success: boolean; message: string; res_id?: string }> {
  if (!isConfiguredUrl(baseUrl)) {
    // Local demo simulation
    await new Promise((r) => setTimeout(r, 400));
    const books = getMockBooks();
    const targetBook = books.find((b) => b.id === formData.book_id);
    if (!targetBook) {
      throw new Error('도서를 찾을 수 없습니다.');
    }
    if (!isBookAvailable(targetBook)) {
      throw new Error('이미 예약된 도서입니다.');
    }

    targetBook.status = '예약중';
    saveMockBooks(books);

    const reservations = getMockReservations();
    const newResId = 'R' + Date.now().toString().slice(-6);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReservation: Reservation = {
      res_id: newResId,
      book_id: targetBook.id,
      book_title: targetBook.title,
      user_name: formData.user_name,
      user_email: formData.user_email,
      reserved_at: formattedDate,
      status: 'ACTIVE',
    };
    reservations.unshift(newReservation);
    saveMockReservations(reservations);

    return {
      success: true,
      message: `'${targetBook.title}' 도서 예약이 완료되었습니다.`,
      res_id: newResId,
    };
  }

  try {
    const payload = {
      action: 'createReservation',
      data: {
        book_id: formData.book_id,
        user_name: formData.user_name,
        user_email: formData.user_email,
      },
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      redirect: 'follow', // 필수 요구사항
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (data.success === false) {
      throw new Error(data.message || data.error || '예약 처리에 실패했습니다.');
    }

    return {
      success: true,
      message: data.message || '도서 예약이 성공적으로 완료되었습니다.',
      res_id: data.res_id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('createReservation error:', err);
    throw new Error(errorMsg);
  }
}

/**
 * 예약 취소하기 API
 * POST BaseURL
 * Body: { action: "cancelReservation", res_id: "R001" }
 * 필수 옵션: redirect: 'follow'
 */
export async function cancelReservation(
  baseUrl: string,
  resId: string
): Promise<{ success: boolean; message: string }> {
  if (!isConfiguredUrl(baseUrl)) {
    // Local demo simulation
    await new Promise((r) => setTimeout(r, 350));
    const reservations = getMockReservations();
    const targetIdx = reservations.findIndex((r) => r.res_id === resId);
    if (targetIdx === -1) {
      throw new Error('해당 예약 정보를 찾을 수 없습니다.');
    }

    const targetRes = reservations[targetIdx];
    targetRes.status = 'CANCELLED';
    reservations.splice(targetIdx, 1);
    saveMockReservations(reservations);

    const books = getMockBooks();
    const book = books.find((b) => b.id === targetRes.book_id);
    if (book) {
      book.status = '이용가능';
      saveMockBooks(books);
    }

    return {
      success: true,
      message: `'${targetRes.book_title || '도서'}' 예약이 정상적으로 취소되었습니다.`,
    };
  }

  try {
    const payload = {
      action: 'cancelReservation',
      res_id: resId,
    };

    const res = await fetch(baseUrl, {
      method: 'POST',
      redirect: 'follow', // 필수 요구사항
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
    }

    const data = await res.json();
    if (data.success === false) {
      throw new Error(data.message || data.error || '예약 취소 처리에 실패했습니다.');
    }

    return {
      success: true,
      message: data.message || '예약이 성공적으로 취소되었습니다.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('cancelReservation error:', err);
    throw new Error(errorMsg);
  }
}
