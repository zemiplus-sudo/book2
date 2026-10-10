export const GAS_CODE_TEMPLATE = `/**
 * =========================================================================
 * 스마트 도서관 예약 시스템 Google Apps Script 백엔드 (Code.gs)
 * =========================================================================
 * 
 * [배포 방법]
 * 1. Google Sheets(스프레드시트)를 새로 생성합니다.
 * 2. 상단 메뉴 [확장 프로그램] > [Apps Script] 클릭.
 * 3. 기존 코드를 지우고 이 코드를 전체 붙여넣기 후 저장 (Ctrl+S).
 * 4. 상단 함수 선택창에서 'setupInitialLibrarySheets' 선택 후 [실행] 클릭 (시트 및 샘플 도서 자동 생성).
 * 5. 우측 상단 [배포] > [새 배포] 클릭:
 *    - 유형 선택: '웹 앱 (Web app)'
 *    - 설명: 'Library API v1'
 *    - 다음 사용자 권한으로 실행: '나(내 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자(Anyone)' **[중요!]**
 * 6. 배포 후 발급되는 '웹 앱 URL'을 복사하여 웹 프론트엔드의 [API 설정]에 입력하세요!
 */

function setupInitialLibrarySheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Books 시트 생성 또는 확인
  var bookSheet = ss.getSheetByName('Books');
  if (!bookSheet) {
    bookSheet = ss.insertSheet('Books');
    bookSheet.appendRow(['id', 'title', 'author', 'category', 'status', 'year', 'callNumber', 'coverUrl']);
    bookSheet.appendRow(['B001', '클린 코드', '로버트 C. 마틴', 'IT / 프로그래밍', 'AVAILABLE', '2013', '005.13-마82클', 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80']);
    bookSheet.appendRow(['B002', '모던 자바스크립트 Deep Dive', '이웅모', 'IT / 프로그래밍', 'RESERVED', '2020', '005.133-이68모', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80']);
    bookSheet.appendRow(['B003', '트렌드 코리아 2026', '김난도 외', '경제 / 경영', 'AVAILABLE', '2025', '320.1-김23트-2026', 'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?auto=format&fit=crop&w=600&q=80']);
    bookSheet.appendRow(['B004', '불편한 편의점', '김호연', '문학 / 소설', 'AVAILABLE', '2021', '813.7-김95불', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80']);
    bookSheet.appendRow(['B005', '사피엔스', '유발 하라리', '인문 / 역사', 'AVAILABLE', '2015', '909-하23사', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80']);
  }
  
  // 2. Reservations 시트 생성 또는 확인
  var resSheet = ss.getSheetByName('Reservations');
  if (!resSheet) {
    resSheet = ss.insertSheet('Reservations');
    resSheet.appendRow(['res_id', 'book_id', 'book_title', 'user_name', 'user_email', 'reserved_at', 'status']);
    resSheet.appendRow(['R001', 'B002', '모던 자바스크립트 Deep Dive', '김도서', 'reader.kim@example.com', '2026-10-08 14:30', 'ACTIVE']);
  }
}

// GET 요청 처리: 도서 목록 및 예약 목록 조회
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'getBooks';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getBooks') {
    var sheet = ss.getSheetByName('Books');
    if (!sheet) return createJsonResponse({ success: false, error: 'Books 시트를 찾을 수 없습니다.' });
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var books = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var book = {};
      for (var j = 0; j < headers.length; j++) {
        book[headers[j]] = row[j];
      }
      books.push(book);
    }
    return createJsonResponse({ success: true, books: books });
  } 
  else if (action === 'getReservations') {
    var sheet = ss.getSheetByName('Reservations');
    if (!sheet) return createJsonResponse({ success: false, error: 'Reservations 시트를 찾을 수 없습니다.' });
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var reservations = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var res = {};
      for (var j = 0; j < headers.length; j++) {
        res[headers[j]] = row[j];
      }
      // 취소된 예약은 제외하거나 상태 유지
      reservations.push(res);
    }
    return createJsonResponse({ success: true, reservations: reservations });
  }
  
  return createJsonResponse({ success: false, error: '알 수 없는 요청 action: ' + action });
}

// POST 요청 처리: 도서 예약하기 및 예약 취소하기
function doPost(e) {
  try {
    var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var payload = JSON.parse(contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'createReservation') {
      var data = payload.data || {};
      var bookId = data.book_id;
      var userName = data.user_name;
      var userEmail = data.user_email;
      
      if (!bookId || !userName || !userEmail) {
        return createJsonResponse({ success: false, message: '필수 입력 항목(도서, 이름, 이메일)이 누락되었습니다.' });
      }
      
      var bookSheet = ss.getSheetByName('Books');
      var booksData = bookSheet.getDataRange().getValues();
      var bookTitle = '';
      var bookRowIdx = -1;
      
      for (var i = 1; i < booksData.length; i++) {
        if (booksData[i][0] == bookId) {
          if (booksData[i][4] === 'RESERVED') {
            return createJsonResponse({ success: false, message: '이미 다른 이용자가 예약한 도서입니다.' });
          }
          bookTitle = booksData[i][1];
          bookRowIdx = i + 1; // 1-based row index
          break;
        }
      }
      
      if (bookRowIdx === -1) {
        return createJsonResponse({ success: false, message: '존재하지 않는 도서 ID입니다.' });
      }
      
      // 도서 상태를 'RESERVED'로 변경 (5번째 열 status)
      bookSheet.getRange(bookRowIdx, 5).setValue('RESERVED');
      
      // 예약 내역 추가
      var resSheet = ss.getSheetByName('Reservations');
      var newResId = 'R' + Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMddHHmmss');
      var reservedAt = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm');
      
      resSheet.appendRow([newResId, bookId, bookTitle, userName, userEmail, reservedAt, 'ACTIVE']);
      
      return createJsonResponse({
        success: true,
        message: '도서 예약이 성공적으로 완료되었습니다.',
        res_id: newResId
      });
    }
    
    if (action === 'cancelReservation') {
      var resId = payload.res_id;
      if (!resId) {
        return createJsonResponse({ success: false, message: '예약 번호(res_id)가 제공되지 않았습니다.' });
      }
      
      var resSheet = ss.getSheetByName('Reservations');
      var resData = resSheet.getDataRange().getValues();
      var targetBookId = '';
      var foundRow = -1;
      
      for (var r = 1; r < resData.length; r++) {
        if (resData[r][0] == resId && resData[r][6] === 'ACTIVE') {
          targetBookId = resData[r][1];
          foundRow = r + 1;
          break;
        }
      }
      
      if (foundRow === -1) {
        return createJsonResponse({ success: false, message: '유효한 활성 예약 내역을 찾을 수 없습니다.' });
      }
      
      // 예약 상태를 CANCELLED로 변경
      resSheet.getRange(foundRow, 7).setValue('CANCELLED');
      
      // 해당 도서 상태를 AVAILABLE로 복구
      var bookSheet = ss.getSheetByName('Books');
      var booksData = bookSheet.getDataRange().getValues();
      for (var b = 1; b < booksData.length; b++) {
        if (booksData[b][0] == targetBookId) {
          bookSheet.getRange(b + 1, 5).setValue('AVAILABLE');
          break;
        }
      }
      
      return createJsonResponse({
        success: true,
        message: '예약이 성공적으로 취소되었으며, 도서가 다시 이용 가능 상태로 전환되었습니다.'
      });
    }
    
    return createJsonResponse({ success: false, message: '지원하지 않는 action: ' + action });
  } catch (err) {
    return createJsonResponse({ success: false, message: '서버 오류 발생: ' + err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
