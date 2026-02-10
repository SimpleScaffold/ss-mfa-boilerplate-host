import { useMeasurementEffect } from 'src/features/function/measurement/useMeasurementEffect'

/**
 * MapViewer가 마운트된 컨텍스트에서 실행할 Viewer Effect들을 한곳에서 조합.
 * 새 기능(측정, 분석 등) 추가 시 이 훅에 effect 한 줄만 추가하면 됨.
 */
export function useViewerEffects() {
    useMeasurementEffect()
    // useShadowAnalysisEffect()
    // useProximityAnalysisEffect()
    // ...
}
