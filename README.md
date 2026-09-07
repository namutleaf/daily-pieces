# daily-pieces (단어조각 일기 앱)

낱말 카드를 하나씩 고르면 짧은 일기가 자동으로 완성되는 앱. 완성된 일기는
인스타그램에 올리기 좋은 정사각/세로형 카드 이미지로 저장하거나 공유할 수 있어요.

React Native + Expo(SDK 57)로 작성되어 Android/iOS에서 동일한 코드로 동작합니다.

## 사용 흐름

1. 홈 화면에서 "오늘의 조각 모으기"를 누른다.
2. 날씨 → 기분 → 함께한 사람 → 장소 → 활동 → 특별한 순간, 총 6개의 카테고리에서
   낱말 카드를 하나씩 선택한다 (5~7회 선택 콘셉트).
3. 선택이 끝나면 자동으로 짧은 일기 문장이 생성되고, 무드에 따라 색이 달라지는
   카드 형태로 보여진다.
4. "이미지 저장"으로 사진 보관함에 저장하거나 "공유하기"로 인스타그램 등에 바로
   공유할 수 있다.
5. 만든 일기는 자동으로 기기에 저장되어 "지난 조각들 보기"에서 다시 볼 수 있다.

## 프로젝트 구조

```
src/
  data/words.ts        카테고리별 낱말 카드 데이터 (라벨/이모지/문장 조각)
  theme.ts             앱 공통 컬러 + 기분별 카드 그라디언트 팔레트
  types/                공용 타입 정의
  utils/
    generateDiary.ts   선택한 낱말로 일기 텍스트를 조합
    storage.ts         AsyncStorage 기반 히스토리 저장/조회/삭제
  components/
    WordCard.tsx       선택 화면의 낱말 카드
    ProgressDots.tsx   선택 진행 표시
    DiaryCard.tsx      공유용 일기 카드 (react-native-view-shot로 캡처)
  screens/
    HomeScreen.tsx
    CardSelectScreen.tsx
    ResultScreen.tsx
    HistoryScreen.tsx
  navigation/          React Navigation 스택 설정
```

## 실행하기

```bash
npm install
npm run start     # Expo 개발 서버
npm run android   # Android 에뮬레이터/기기
npm run ios       # iOS 시뮬레이터 (macOS 필요)
npm run web       # 웹 미리보기
```

## 참고

- `app.json`의 `ios.bundleIdentifier` / `android.package` (`com.dailypieces.app`)는
  실제 배포 전에 원하는 값으로 변경하세요.
- 이미지 저장 기능은 `expo-media-library` 권한이 필요합니다 (앱 최초 실행 시 권한 요청).
