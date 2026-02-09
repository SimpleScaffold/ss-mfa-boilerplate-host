# 메뉴 액션 시스템

메뉴 기반 액션을 리듀서로 일괄 관리하는 시스템입니다.

## 핵심 개념

### 1. 기능별 리듀서

- 각 기능별 리듀서에서 자신의 액션을 직접 관리
- FSD 구조에 맞게 분산 관리
- 예: `function/measurement/measurementReducer.ts`에서 측정 관련 액션 처리

## 사용 방법

### 기본 사용

```typescript
import {
    FinalMenuItem,
    handleFinalMenuClick,
    sampleFinalMenu,
} from '@/features/menu'
import { MeasurementAction } from '@/features/function/measurement/measurementReducer'
import { useDispatch } from 'react-redux'

// FinalMenu 사용
const menuTree = sampleFinalMenu

// 메뉴 클릭 시
handleFinalMenuClick(menuTree[0].children[0].children[0], 'MENU')

// 직접 액션 실행 (각 리듀서의 액션 사용)
const dispatch = useDispatch()
dispatch(MeasurementAction.executeDistancePlane({ unit: 'meter' }))
dispatch(MeasurementAction.executeArea({ precision: 2 }))
```

### Redux와 함께 사용

```typescript
import { menuAction } from '@/features/menu'

// 동기 액션 실행
dispatch(
    menuAction.executeActionSync({
        code: 'MEASURE_AREA',
        params: { precision: 2 },
        context: { source: 'MENU' },
    }),
)
```

## 파일 구조

```
menu/
├── types.ts              # 타입 정의
├── finalMenu.ts           # 최종 메뉴 구조 타입 및 샘플
├── utils.ts               # 유틸리티 함수
├── menuReducer.ts         # Redux Reducer
├── index.ts               # 통합 export
└── README.md              # 문서
```

## 설계 원칙

1. **메뉴는 데이터, 액션은 코드**

    - 메뉴 구조는 관리자가 설정
    - 실행 로직은 코드로 관리

2. **변하는 것 vs 변하지 않는 것**

    - 변하는 것: 메뉴 구조, 메뉴 이름
    - 변하지 않는 것: actionCode (내부 실행 키)

3. **기능별 분산 관리**
    - 각 기능별 리듀서에서 자신의 액션을 직접 관리
    - FSD 구조에 맞게 책임 분리
