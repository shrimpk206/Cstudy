# 07. API와 HTTP — 요청, 응답, 메서드, 상태코드

## 핵심 한 줄

API = "다른 프로그램에 말 거는 창구". 인터넷의 거의 모든 데이터 교환이 HTTP API로 일어납니다.

---

## 1) 비유

식당에서 주문을 떠올리세요:
- 손님 = 우리 프로그램 (클라이언트)
- 주방 = 외부 서버 (API 제공자)
- 주문서 = **요청(request)**
- 음식 = **응답(response)**
- 메뉴판 = API 문서

## 2) HTTP 메서드 — 무엇을 하려는지

| 메서드 | 의미 | 예시 |
|---|---|---|
| **GET** | 가져오기 | "사용자 목록 줘" |
| **POST** | 새로 만들기 | "새 사용자를 등록해줘" |
| **PUT/PATCH** | 수정 | "이 사용자 이름을 바꿔줘" |
| **DELETE** | 삭제 | "이 사용자 지워줘" |

## 3) URL의 구조

```
https://api.example.com/users/123?lang=ko
```
- `https://` — 프로토콜
- `api.example.com` — 도메인 (서버 주소)
- `/users/123` — 경로 (어떤 자원?)
- `?lang=ko` — 쿼리 파라미터 (옵션)

## 4) 실제 요청 코드

```javascript
// 가장 기본 (브라우저/Node.js 내장)
const response = await fetch("https://api.example.com/users/123")
const data = await response.json()
console.log(data)  // { id: 123, name: "철수" }

// axios 라이브러리 (자주 씀)
import axios from "axios"
const { data } = await axios.get("https://api.example.com/users/123")

// POST 예시
await axios.post("https://api.example.com/users", {
  name: "영희",
  email: "younghee@example.com"
})
```

Python:
```python
import requests
res = requests.get("https://api.example.com/users/123")
data = res.json()
```

## 5) 상태 코드 (status code) — 응답이 어떻게 됐는지

| 코드 | 의미 | 자주 만나는 경우 |
|---|---|---|
| **200 OK** | 성공 | 정상 응답 |
| **201 Created** | 만들어짐 | POST로 새로 등록 성공 |
| **301/302** | 리다이렉트 | URL이 바뀜 |
| **400 Bad Request** | 잘못된 요청 | 보낸 데이터 형식이 틀림 |
| **401 Unauthorized** | 인증 안 됨 | API 키/로그인 필요 |
| **403 Forbidden** | 권한 없음 | 로그인은 됐지만 이 자원엔 접근 불가 |
| **404 Not Found** | 못 찾음 | URL이 틀림 |
| **429 Too Many Requests** | 너무 많이 요청함 | 잠시 쉬어야 함 |
| **500 Internal Server Error** | 서버 잘못 | 우리 잘못 아님, 서버가 터짐 |

**핵심 구분:** 4xx = 우리 잘못, 5xx = 서버 잘못.

## 6) 헤더(headers)와 본문(body)

```javascript
await axios.post(
  "https://api.example.com/users",
  { name: "영희" },                              // body — 보내는 데이터
  { headers: { "Authorization": "Bearer xyz" }} // headers — 부가 정보
)
```

- **헤더**: 인증 토큰, 데이터 형식 같은 메타정보
- **본문**: 실제 보내는 데이터 (보통 JSON)

## 7) JSON

API에서 주고받는 데이터의 표준 형식:
```json
{
  "name": "철수",
  "tags": ["admin", "korean"],
  "active": true
}
```
JavaScript 객체랑 거의 같습니다. 서버는 이 형식의 글자(string)를 보내고, `response.json()`이 객체로 변환해줍니다.

## 8) REST API vs 다른 것

- **REST**: 위에 설명한 GET/POST/PUT/DELETE 방식. 가장 흔함.
- **GraphQL**: 한 엔드포인트에서 원하는 필드만 골라 받는 방식.
- **WebSocket**: 한 번 연결하면 양방향으로 계속 통신.

대부분 REST를 만나게 됩니다.

---

## AI에게 적용

| 상황 | 이렇게 말하세요 |
|---|---|
| API 연동을 하라고 시킴 | "이 API 문서 [링크] 참고해서 GET /users 호출하는 함수 만들어줘. 응답은 `[{id, name, email}]` 형식" |
| 401 에러 남 | "401이 나는데, API 키를 어디에 어떻게 넣어야 해? Authorization 헤더 형식 확인해줘" |
| 404 에러 | "URL이 맞는지 확인. 슬래시 위치, 쿼리 파라미터, ID 값 점검" |
| 응답이 가끔 빈 객체로 옴 | "응답에 `null`이나 빈 값이 올 수 있는 케이스를 처리해줘" |
| 너무 자주 호출함 → 429 | "이 API는 분당 10번까지만 가능해. rate limit 처리 추가해줘" |

**검수 포인트:**
- AI가 만든 API 호출 코드에서 **API 키가 코드에 박혀있으면** 큰일! 환경변수로 빼야 합니다 (다음 레슨).
- 응답이 항상 우리가 기대한 형식이라고 가정하면 위험. "필드가 없을 수도 있다"고 생각하세요.

---

## 자가점검

1. 사용자 정보를 가져오려면 GET, POST 중 어느 것?
2. 응답 코드 403이 나왔다. 우리 잘못일까 서버 잘못일까?

<details>
<summary>정답</summary>

1. **GET** (가져오기 = read).
2. **우리 잘못** (4xx 계열). 권한이 없는 자원에 접근 시도. 로그인 정보나 권한 설정 점검.
</details>
