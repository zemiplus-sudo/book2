import { Book, Reservation } from '../types/library';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'B001',
    title: '클린 코드: 애자일 소프트웨어 장인 정신',
    author: '로버트 C. 마틴 (Robert C. Martin)',
    category: 'IT / 프로그래밍',
    status: 'AVAILABLE',
    publisher: '인사이트',
    year: 2013,
    callNumber: '005.13-마82클',
    description: '소프트웨어 장인이 되기 위한 필수 지침서. 나쁜 코드가 초래하는 재앙과 깨끗한 코드를 작성하는 방법을 명확하게 제시합니다.',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80',
    isbn: '978-89-6626-095-9'
  },
  {
    id: 'B002',
    title: '모던 자바스크립트 Deep Dive',
    author: '이웅모',
    category: 'IT / 프로그래밍',
    status: 'RESERVED',
    publisher: '위키북스',
    year: 2020,
    callNumber: '005.133-이68모',
    description: '자바스크립트의 기본 개념부터 ECMAScript 최신 사양까지 동작 원리를 꼼꼼하게 파헤치는 필독서.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    isbn: '979-11-5839-223-9'
  },
  {
    id: 'B003',
    title: '트렌드 코리아 2026',
    author: '김난도 외',
    category: '경제 / 경영',
    status: 'AVAILABLE',
    publisher: '미래의창',
    year: 2025,
    callNumber: '320.1-김23트-2026',
    description: '다가올 시대의 라이프스타일과 소비 트렌드를 한눈에 조망하는 대한민국 대표 트렌드 예측서.',
    coverUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be8510ab?auto=format&fit=crop&w=600&q=80',
    isbn: '978-89-5989-720-0'
  },
  {
    id: 'B004',
    title: '불편한 편의점',
    author: '김호연',
    category: '문학 / 소설',
    status: 'AVAILABLE',
    publisher: '나무옆의자',
    year: 2021,
    callNumber: '813.7-김95불',
    description: '청파동 골목 모퉁이에 자리 잡은 작은 편의점에서 펼쳐지는 이웃들의 따스하고 유쾌한 힐링 드라마.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    isbn: '979-11-6157-118-8'
  },
  {
    id: 'B005',
    title: '사피엔스: 유인원에서 사이보그까지',
    author: '유발 하라리',
    category: '인문 / 역사',
    status: 'AVAILABLE',
    publisher: '김영사',
    year: 2015,
    callNumber: '909-하23사',
    description: '인류의 기원과 인지혁명, 농업혁명, 과학혁명을 거쳐 기술 문명에 이른 거대한 역사적 서사.',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    isbn: '978-89-349-7246-4'
  },
  {
    id: 'B006',
    title: '도둑맞은 집중력',
    author: '요한 하리',
    category: '자기계발 / 심리',
    status: 'RESERVED',
    publisher: '어크로스',
    year: 2023,
    callNumber: '181.2-하34도',
    description: '우리의 집중력은 왜 무너졌는가? 스마트폰과 현대 시스템이 앗아간 몰입을 되찾기 위한 전 세계 탐사 보고서.',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    isbn: '979-11-92313-14-6'
  },
  {
    id: 'B007',
    title: '원씽 (The ONE Thing)',
    author: '게리 켈러, 제이 파파산',
    category: '자기계발 / 심리',
    status: 'AVAILABLE',
    publisher: '비즈니스북스',
    year: 2013,
    callNumber: '199.1-켈34원',
    description: '복잡한 세상을 이기는 단순함의 힘. 인생에서 가장 중요한 단 하나에 집중하는 성공의 원리.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    isbn: '978-89-97594-06-8'
  },
  {
    id: 'B008',
    title: '코스모스 (Cosmos)',
    author: '칼 세이건',
    category: 'IT / 과학',
    status: 'AVAILABLE',
    publisher: '사이언스북스',
    year: 2006,
    callNumber: '440-세62코',
    description: '광대한 우주와 지구, 그리고 생명의 신비를 서정적이고 깊이 있는 필체로 그려낸 불멸의 과학 교양서.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    isbn: '978-89-8371-189-2'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    res_id: 'R001',
    book_id: 'B002',
    book_title: '모던 자바스크립트 Deep Dive',
    user_name: '김도서',
    user_email: 'reader.kim@example.com',
    reserved_at: '2026-10-08 14:30',
    status: 'ACTIVE'
  },
  {
    res_id: 'R002',
    book_id: 'B006',
    book_title: '도둑맞은 집중력',
    user_name: '이지은',
    user_email: 'jieun@iceu.kr',
    reserved_at: '2026-10-09 09:15',
    status: 'ACTIVE'
  }
];

export const BOOK_CATEGORIES = [
  '전체',
  'IT / 프로그래밍',
  '문학 / 소설',
  '경제 / 경영',
  '인문 / 역사',
  '자기계발 / 심리',
  'IT / 과학'
];
