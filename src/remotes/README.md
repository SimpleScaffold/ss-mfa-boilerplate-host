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

`config/env/*.ts`(예: `config/env/local.ts`)의 `remotes` 배열에 리모트 앱 설정을 추가하면,
호스트가 **환경 설정을 기반으로 자동으로 REMOTE_APPS/라우트를 구성**합니다.
(호스트 쪽에는 생성 파일을 만들지 않고, Vite 가상 모듈로 주입됩니다.)

```typescript
export const localConfig = {
    remotes: [
        // 기존 설정들...
        {
            name: 'remoteapp3', // vite.config.ts의 remotes 키와 일치
            manifestUrl: 'http://localhost:12002/mf-manifest.json',
            // Host에서 import할 모듈 경로 (Remote 앱의 federation exposes와 일치해야 함)
            modulePath: 'remoteapp3/RemoteApp3',
            // 화면 표시용 이름 (선택)
            displayName: 'Remote App 3',
        },
    ],
}
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
| `modulePath` | `string`                                      | 리모트 앱 모듈 경로 (예: 'remoteapp1/RemoteApp1')     | ✅   |
| `fullPage`   | `boolean`                                     | 리모트 앱이 전체 페이지를 차지하는지 여부             | ❌   |
| `layoutSlot` | `'main' \| 'sidebar' \| 'header' \| 'footer'` | 레이아웃 영역 지정                                    | ❌   |
| `enabled`    | `boolean`                                     | 리모트 앱 활성화 여부 (기본값: true)                  | ❌   |

## 🔄 동작 원리

1. **예약 경로 기반 라우트**: 호스트는 `/_mfe/:id` 단일 라우트를 사용합니다. (`/_mfe/*`는 MFE 전용 예약 경로)
2. **동적 모듈 로딩**: `RemoteAppLoader`가 Module Federation을 통해 리모트 앱을 동적으로 로드합니다.
3. **에러 처리**: `RemoteAppErrorBoundary`가 리모트 앱 로딩 및 실행 중 발생하는 에러를 캐치합니다.

## 🚦 라우팅 규칙 (중요)

- **예약 경로**: `/_mfe/*`는 마이크로 프론트엔드 전용입니다. 일반 기능 URL은 이 prefix를 사용하지 않습니다.
- **접속 방법**: `/_mfe/<remoteId>` (예: `/_mfe/remoteapp1`)

## 🎨 레이아웃 영역 활용 (향후 확장)

리모트 앱을 특정 레이아웃 영역에 배치하려면:

```typescript
{
    id: 'remoteapp3',
    name: 'Remote App 3',
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
