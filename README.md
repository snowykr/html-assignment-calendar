# 과제 관리 캘린더 애플리케이션

모바일 친화적인 과제 관리 캘린더 웹 애플리케이션입니다. iPhone 16 Pro 디자인을 모방한 UI로 일본어 과제 데이터를 효율적으로 관리할 수 있습니다.

## 주요 기능

- 📅 2주간 캘린더 뷰
- 📚 과목별 과제 관리
- 🔍 필터링 기능 (제출완료/기한초과 숨기기)
- 📱 모바일 최적화 iPhone 디자인
- ⚡ ES6 모듈 기반 구조

## 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
- **Styling**: Custom CSS + TailwindCSS CDN
- **Deployment**: Vercel (Static Site)

## 프로젝트 구조

```
/
├── index.html              # 메인 HTML 페이지
├── css/
│   ├── styles.css         # 기본 레이아웃 스타일
│   └── components.css     # 컴포넌트별 스타일
├── js/
│   ├── app.js            # 메인 애플리케이션
│   ├── calendar.js       # 캘린더 기능
│   ├── assignments.js    # 과제 관리 기능
│   ├── subjects.js       # 과목별 표시 기능
│   └── utils.js          # 유틸리티 함수
├── data/
│   ├── assignments.json  # 과제 데이터 (JSON)
│   └── assignments.js    # 과제 데이터 (JS 모듈)
├── img/
│   └── iphone-frame.png  # iPhone 베젤 이미지
├── vercel.json           # Vercel 배포 설정
└── package.json          # 프로젝트 메타데이터
```

## 로컬 개발

### 요구사항
- Python 3.x (로컬 서버용)
- 모던 웹 브라우저 (ES6 모듈 지원)

### 실행 방법

1. 저장소 클론
```bash
git clone <repository-url>
cd html-assignment-calendar
```

2. 로컬 서버 실행
```bash
# Python 내장 서버 사용
python3 -m http.server 8001

# 또는 npm scripts 사용
npm run dev
```

3. 브라우저에서 접속
```
http://localhost:8001
```

## Vercel 배포

### 1. GitHub 저장소 연결

1. GitHub에 프로젝트 push
2. [Vercel](https://vercel.com)에 로그인
3. "New Project" 클릭
4. GitHub 저장소 연결

### 2. 배포 설정

Vercel이 자동으로 `vercel.json` 설정을 인식하여 배포합니다.

- **Build Command**: 없음 (정적 사이트)
- **Output Directory**: `./` (루트 디렉토리)
- **Install Command**: 없음

### 3. 환경 설정

추가 환경 변수는 필요하지 않습니다. 모든 설정이 `vercel.json`에 포함되어 있습니다.

### 4. 자동 배포

- `main` 브랜치에 push하면 자동으로 프로덕션 배포
- 다른 브랜치에 push하면 프리뷰 배포 생성

## 커스터마이징

### 과제 데이터 수정

`data/assignments.js` 파일을 편집하여 과제 데이터를 수정할 수 있습니다:

```javascript
export const assignmentsData = [
    {
        "id": 1,
        "courseName": "과목명",
        "round": "회차",
        "title": "과제 제목",
        "dueDate": "2025-06-01",
        "dueTime": "23:59",
        "platform": "teams", // 또는 "openlms"
        "completed": false
    }
    // ... 더 많은 과제
];
```

### 스타일 수정

- `css/styles.css`: 전역 스타일 및 레이아웃
- `css/components.css`: 개별 컴포넌트 스타일

### 기능 추가

- `js/` 폴더의 모듈 파일들을 수정하여 새로운 기능 추가
- ES6 모듈 시스템을 사용하여 코드 분리

## 브라우저 지원

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

ES6 모듈을 지원하는 모든 모던 브라우저에서 작동합니다.

## 라이센스

MIT License

## 기여

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 