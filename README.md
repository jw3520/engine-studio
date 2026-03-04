# 🚀 Neuro-T Engine Studio (멀티뷰 분석 대시보드)

> **GUI가 없는 Neuro-T Engine의 한계를 극복하기 위해 제작된, 딥러닝 모델 추론 결과 정밀 비교 분석 도구입니다.**

---

## 📺 프로젝트 시연

### 1. SEG (Segmentation) 분석
![SEG Analysis](./ref/SEG_images.png)
*세그멘테이션 모델의 GT와 Pred 마스크 비교 및 실시간 면적 분석*

### 2. ORD (Oriented Object Detection) 분석
![ORD Analysis](./ref/ORD_images.png)
*회전 박스 모델의 정확한 위치 매핑 및 각도 디버깅*

---

## 🛡️ 프로젝트 배경 및 목적
*   **GUI 부재 보완:** Neuro-T Engine은 강력한 딥러닝 엔진이나 자체 시각화 도구가 부족하여 추론 결과를 직관적으로 확인하기 어렵습니다.
*   **Image-to-Image 정밀 분석:** 단순 수치(Metrics) 확인을 넘어, 실제 이미지 위에서 레이블과 추론 결과가 어떻게 어긋나는지 육안으로 검증할 수 있는 환경이 필요했습니다.
*   **ORD(Oriented Object Detection) 특화:** 회전된 객체 검출 모델의 복잡한 좌표 구조(`obox`)를 정확하게 렌더링하여 분석 효율을 극대화합니다.

---

## ✨ 주요 기능

### 1. 🔍 3-View 동기화 분석 시스템
*   **Original / GT / PRED** 세 가지 뷰를 동일한 타임라인으로 동기화하여 표시함.
*   이미지 전환 시 모든 뷰가 즉시 갱신되어 모델의 오검출 및 미검출 사례를 빠르게 파악 가능.

### 2. 📏 실시간 면적 및 좌표 분석 (Hover Debug)
*   **Shoelace Algorithm:** 마스크(Blob)에 마우스를 올리면 실시간으로 정밀 면적(px²)을 계산하여 툴팁으로 제공.
*   **Flexible Detection:** 객체 내부가 아닌 외곽선 근처(15px)만 가도 자석처럼 호버되는 유도리 있는 인터페이스 구현.
*   **Cross-Panel Sync:** 한쪽 화면에서 호버 시 반대쪽 화면의 동일 위치 객체도 함께 하이라이트됨.

### 3. 📐 ORD 모델 완벽 지원
*   **Rotated Rect Rendering:** 중앙 좌표(`cx, cy`), 크기(`w, h`), 각도(`angle`) 기반의 회전 박스를 오차 없이 렌더링.
*   반시계 방향 각도 보정을 통해 실제 엔진의 추론 데이터와 100% 일치하는 오버레이 구현.

### 4. ⚡ 고성능 탐색 및 확대 뷰어
*   **Layered Rendering:** 배경 이미지와 마스크 레이어를 분리하여 고해상도 이미지에서도 렉 없는 호버링 지원.
*   **Infinite Navigation:** 이미지 리스트의 처음과 끝이 연결된 무한 순환 내비게이션 지원.
*   **Smart Zoom:** 확대 다이얼로그 내에서 마우스 휠 줌 및 드래그(Pan)를 통한 정밀 관찰 가능.

---

## 🛠 기술 스택
*   **Frontend:** HTML5 Canvas, Vanilla JS, CSS3
*   **Backend:** Node.js, Express
*   **Data Format:** JSON (COCO Style & Custom Neuro-T Format)

---

## 🚀 시작하기

### 1. 설치
```bash
# 저장소 복제
git clone https://github.com/jw3520/engine-studio.git

# 의존성 설치
npm install
```

### 2. 실행
```bash
# 서버 시작
npm start

# 브라우저에서 접속
http://localhost:3001
```

### 3. 사용 방법
1.  **Task Path**에 `labels.json`과 `images/` 폴더가 있는 경로를 입력합니다.
2.  **Output Path**에 `predict_result.json`이 있는 경로를 입력합니다.
3.  **데이터 불러오기** 버튼을 눌러 분석을 시작합니다.

---

## ⌨️ 단축키 안내
| 기능 | 단축키 |
| :--- | :--- |
| **다음 / 이전 이미지** | `→` / `←` |
| **10개 / 100개 점프** | `Shift` / `Alt` + `화살표` |
| **탭 전환 (확대창)** | `1`(Orig), `2`(GT), `3`(Pred) |
| **확대 / 축소 / 리셋** | `+` / `-` / `0` |
| **확대창 닫기** | `ESC` |

---

## 📄 라이선스
Copyright © 2026 jw3520. All rights reserved.
