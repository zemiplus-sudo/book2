export interface Book {
  id: string; // e.g. "B001"
  title: string;
  author: string;
  category: string;
  status: string; // '이용가능' | 'AVAILABLE' | '예약중' | 'RESERVED'
  coverUrl?: string;
  publisher?: string;
  year?: number | string;
  callNumber?: string; // 청구기호 e.g. 005.13-박23
  description?: string;
  isbn?: string;
}

export interface Reservation {
  res_id: string; // e.g. "R001"
  book_id: string;
  book_title?: string;
  user_name: string;
  user_email: string;
  reserved_at?: string;
  res_date?: string;
  status?: string;
}

export interface ReservationFormData {
  book_id: string;
  user_name: string;
  user_email: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
