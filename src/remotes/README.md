# 리모트 앱 관리 구조

리모트 앱을 어디에 띄울지 결정하고 관리하기 위한 파일 구조입니다.

## 📁 파일 구조

```
src/
├── remotes/
│   ├── config.ts                    # 리모트 앱 설정 중앙 관리
│   ├── RemoteAppLoader.tsx          # 리모트 앱 동적 로더
│   ├── RemoteAppErrorBoundary.tsx   # 리모트 앱 에러 처리
│   ├── index.ts                     # Export 모음
│   └── README.md                    # 이 문서
└── pages/
    └── remotes/
        └── RemoteAppPage.tsx        # 리모트 앱 페이지 컴포넌트
```

## 🎯 사용 방법

### 1. 새로운 리모트 앱 추가하기

`src/remotes/config.ts` 파일에 리모트 앱 설정을 추가하면 자동으로 라우트가 생성됩니다:

```typescript
export const REMOTE_APPS: RemoteAppConfig[] = [
    // 기존 설정들...
    {
        id: 'remoteapp3', // vite.config.ts의 remotes 키와 일치
        name: 'Remote App 3', // 표시 이름
        routePath: '/remote-app-3', // 라우트 경로
        modulePath: 'remoteapp3/RemoteApp3', // 모듈 경로
        fullPage: true, // 전체 페이지 여부
        enabled: true, // 활성화 여부
    },
]
```

### 2. 리모트 앱을 특정 페이지에 임베드하기

리모트 앱을 전체 페이지가 아닌 특정 컴포넌트 내부에 렌더링하려면:

```tsx
import {
    RemoteAppLoader,
    RemoteAppErrorBoundary,
    findRemoteAppById,
} from 'src/remotes'

function MyPage() {
    const remoteApp = findRemoteAppById('remoteapp1')

    if (!remoteApp) return null

    return (
        <div>
            <h1>My Page</h1>
            <div className="remote-app-container">
                <RemoteAppErrorBoundary config={remoteApp}>
                    <RemoteAppLoader config={remoteApp} />
                </RemoteAppErrorBoundary>
            </div>
        </div>
    )
}
```

### 3. 리모트 앱에 Props 전달하기

```tsx
<RemoteAppLoader
    config={remoteApp}
    props={{
        userId: '123',
        theme: 'dark',
    }}
/>
```

## 📋 설정 옵션

### RemoteAppConfig

| 필드         | 타입                                          | 설명                                                  | 필수 |
| ------------ | --------------------------------------------- | ----------------------------------------------------- | ---- |
| `id`         | `string`                                      | 리모트 앱 식별자 (vite.config.ts의 remotes 키와 일치) | ✅   |
| `name`       | `string`                                      | 리모트 앱 표시 이름                                   | ✅   |
| `routePath`  | `string`                                      | 리모트 앱이 렌더링될 라우트 경로                      | ✅   |
| `modulePath` | `string`                                      | 리모트 앱 모듈 경로 (예: 'remoteapp1/RemoteApp1')     | ✅   |
| `fullPage`   | `boolean`                                     | 리모트 앱이 전체 페이지를 차지하는지 여부             | ❌   |
| `layoutSlot` | `'main' \| 'sidebar' \| 'header' \| 'footer'` | 레이아웃 영역 지정                                    | ❌   |
| `enabled`    | `boolean`                                     | 리모트 앱 활성화 여부 (기본값: true)                  | ❌   |

## 🔄 동작 원리

1. **설정 기반 라우트 생성**: `config.ts`의 설정을 기반으로 라우터가 자동으로 라우트를 생성합니다.
2. **동적 모듈 로딩**: `RemoteAppLoader`가 Module Federation을 통해 리모트 앱을 동적으로 로드합니다.
3. **에러 처리**: `RemoteAppErrorBoundary`가 리모트 앱 로딩 및 실행 중 발생하는 에러를 캐치합니다.

## 🎨 레이아웃 영역 활용 (향후 확장)

리모트 앱을 특정 레이아웃 영역에 배치하려면:

```typescript
{
    id: 'remoteapp3',
    name: 'Remote App 3',
    routePath: '/dashboard',
    modulePath: 'remoteapp3/RemoteApp3',
    fullPage: false,
    layoutSlot: 'sidebar', // 사이드바 영역에 렌더링
    enabled: true,
}
```

## 📝 타입 선언

리모트 앱을 사용하기 전에 타입 선언 파일을 생성해야 합니다:

```typescript
// src/remoteapp1.d.ts
declare module 'remoteapp1/RemoteApp1' {
    import { ComponentType } from 'react'
    const RemoteApp1: ComponentType<{ userId?: string; theme?: string }>
    export default RemoteApp1
}
```

## 🚀 장점

1. **중앙 집중식 관리**: 모든 리모트 앱 설정을 한 곳에서 관리
2. **자동 라우트 생성**: 설정만 추가하면 자동으로 라우트 생성
3. **타입 안정성**: TypeScript로 타입 안정성 보장
4. **에러 처리**: 통합된 에러 처리 메커니즘
5. **유연한 배치**: 전체 페이지 또는 특정 영역에 배치 가능
