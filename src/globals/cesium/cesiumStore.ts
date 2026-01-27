import type { CesiumViewer } from './cesiumTypes'

/**
 * Cesium Viewer 인스턴스를 전역으로 저장하는 저장소
 *
 * Viewer는 복잡한 DOM 객체이므로 Redux state에 저장하지 않고
 * 별도의 저장소에서 관리합니다.
 */
class CesiumViewerStore {
    private viewer: CesiumViewer | null = null

    /**
     * Viewer 인스턴스 설정
     */
    setViewer(viewer: CesiumViewer | null): void {
        this.viewer = viewer
    }

    /**
     * Viewer 인스턴스 가져오기
     */
    getViewer(): CesiumViewer | null {
        return this.viewer
    }

    /**
     * Viewer 인스턴스가 존재하는지 확인
     */
    hasViewer(): boolean {
        return this.viewer !== null && !this.viewer.isDestroyed()
    }

    /**
     * Viewer 인스턴스 제거
     */
    destroyViewer(): void {
        if (this.viewer && !this.viewer.isDestroyed()) {
            this.viewer.destroy()
            this.viewer = null
        }
    }
}

// 싱글톤 인스턴스 export
export const cesiumViewerStore = new CesiumViewerStore()
