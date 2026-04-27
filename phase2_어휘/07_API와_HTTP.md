# 07. API와 HTTP 🍕

## 한 줄로 말하면

API = **다른 가게에 주문 넣기**예요.
인터넷의 거의 모든 데이터 교환이 이렇게 일어나요.

---

## 🍕 식당 주문 비유

피자 가게에 전화로 주문해본 적 있죠?

| 식당 | API |
|---|---|
| 손님 (나) | 우리 프로그램 (**클라이언트**) |
| 가게 | 외부 서버 (**API 제공자**) |
| 주문 | **요청** (request) |
| 피자 | **응답** (response) |
| 메뉴판 | API 문서 |

---

## 1) HTTP 메서드 — 무슨 동작이죠?

| 메서드 | 의미 | 예시 |
|---|---|---|
| **GET** | 가져오기 | "메뉴판 좀 보여주세요" |
| **POST** | 새로 만들기 | "피자 한 판 주문할게요" |
| **PUT/PATCH** | 수정 | "주소 바꿀게요" |
| **DELETE** | 삭제 | "주문 취소해주세요" |

---

## 2) URL 구조 — 주소 읽는 법

```
https://api.example.com/users/123?lang=ko
```

분해해볼게요:

| 부분 | 뜻 |
|---|---|
| `https://` | 프로토콜 (배달 방법) |
| `api.example.com` | 도메인 (가게 이름) |
| `/users/123` | 경로 (어떤 메뉴?) |
| `?lang=ko` | 쿼리 (옵션 추가) |

---

## 3) 실제 코드 — 주문하는 법

### 가장 기본 (fetch)

```javascript
const response = await fetch("https://api.example.com/users/123")
const data = await response.json()
console.log(data)  // { id: 123, name: "철수" }
```

### axios 라이브러리 (자주 씀)

```javascript
import axios from "axios"
const { data } = await axios.get("https://api.example.com/users/123")
```

### POST — 뭔가 보낼 때

```javascript
await axios.post("https://api.example.com/users", {
  name: "영희",
  email: "younghee@example.com"
})
```

### Python:

```python
import requests
res = requests.get("https://api.example.com/users/123")
data = res.json()
```

---

## 4) 상태 코드 — 가게의 답변 🚦

음식이 잘 나왔는지, 문제가 있었는지 알려주는 숫자예요.

| 코드 | 색깔 | 의미 |
|---|---|---|
| **200 OK** | 🟢 | 성공! |
| **201 Created** | 🟢 | 새로 만들었어요 |
| **301/302** | 🟡 | 이사했어요 (리다이렉트) |
| **400 Bad Request** | 🔴 | 주문서가 이상해요 |
| **401 Unauthorized** | 🔴 | 로그인 안 됐어요 |
| **403 Forbidden** | 🔴 | 로그인은 됐는데 권한 없음 |
| **404 Not Found** | 🔴 | 그런 메뉴 없어요 |
| **429 Too Many** | 🔴 | 너무 자주 시켰어요 |
| **500 Server Error** | 💥 | 가게가 터졌어요! |

> 💡 **4xx = 우리 잘못, 5xx = 가게 잘못.** 첫 자리만 봐도 누구 잘못인지 보여요!

---

## 5) 헤더 vs 본문

```javascript
await axios.post(
  "https://api.example.com/users",
  { name: "영희" },                              // body — 진짜 데이터
  { headers: { "Authorization": "Bearer xyz" }} // headers — 부가 정보
)
```

| | 비유 | 내용 |
|---|---|---|
| **헤더** | 봉투 겉 | 인증 토큰, 데이터 형식 |
| **본문** | 봉투 안 편지 | 실제 보내는 데이터 |

---

## 6) JSON — 통하는 언어 🌐

API 사이에서 데이터 주고받는 표준 형식이에요.

```json
{
  "name": "철수",
  "tags": ["admin", "korean"],
  "active": true
}
```

JavaScript 객체랑 거의 같죠? 서버는 이런 모양의 글자(string)를 보내고, `response.json()`이 객체로 바꿔줘요.

---

## 7) REST? GraphQL? 뭐가 뭐예요?

- **REST** = 위에 설명한 GET/POST/... 방식. **가장 흔함**.
- **GraphQL** = 한 군데서 원하는 것만 골라 받는 방식.
- **WebSocket** = 한 번 연결하면 양쪽이 계속 떠들 수 있는 방식 (채팅 등).

대부분 REST를 만나요.

---

## 🤖 AI한테 부탁할 때

| 이런 상황 | 이렇게 말해보세요 |
|---|---|
| API 연동 시키기 | "이 API 문서 [링크] 참고해서 GET /users 호출 함수 만들어줘. 응답: `[{id, name, email}]`" |
| 401 에러 | "API 키를 어디에 어떤 형식으로? Authorization 헤더 점검" |
| 404 에러 | "URL 확인. 슬래시, 쿼리, ID 값" |
| 응답이 가끔 빈 객체로 옴 | "응답에 null이나 빈 값 올 수 있는 케이스 처리" |
| 너무 자주 호출 → 429 | "이 API는 분당 10번 한도. rate limit 처리 추가" |

### 💡 검수 꿀팁

- AI가 만든 API 코드에 **API 키가 박혀있으면** 큰일! 환경변수로 빼야 해요 (다음 레슨).
- 응답이 항상 기대한 형식이라고 가정하면 위험. "**필드가 없을 수도**" 항상 의심.

---

## 🎯 확인해봐요

1. 사용자 정보를 가져오려면 GET, POST 중 어느 것?
2. 응답 코드 403이 나왔어요. 우리 잘못? 서버 잘못?

<details>
<summary>👀 정답 보기</summary>

1. **GET** (가져오기 = read).
2. **우리 잘못** (4xx). 권한 없는 자원 접근. 로그인이나 권한 점검.

</details>

---

다음 → **08. 환경변수와 시크릿 (비밀 일기장)**
