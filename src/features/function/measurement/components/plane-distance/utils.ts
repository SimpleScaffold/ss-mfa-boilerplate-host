import * as Cesium from 'cesium'
import type { Viewer } from 'cesium'

export type Unit = 'm' | 'km' | 'ft' | 'mi'

/**
 * 거리(meter)를 지정된 단위로 변환
 */
export function formatDistance(
    meters: number,
    unit: Unit,
): { value: number; label: string } {
    switch (unit) {
        case 'km':
            return { value: meters / 1000, label: 'km' }
        case 'ft':
            return { value: meters * 3.28084, label: 'ft' }
        case 'mi':
            return { value: meters / 1609.344, label: 'mi' }
        default:
            return { value: meters, label: 'm' }
    }
}

/**
 * Viewer에서 마우스/터치 위치로 글로브/지형 상의 위치(Cartesian3)를 얻습니다.
 */
export function getPositionFromScene(
    viewer: Viewer,
    position: Cesium.Cartesian2,
    terrainOnly = true,
): Cesium.Cartesian3 | undefined {
    const scene = viewer.scene
    const globe = scene.globe

    if (
        terrainOnly &&
        globe.terrainProvider instanceof Cesium.EllipsoidTerrainProvider
    ) {
        const ray = scene.camera.getPickRay(position)
        if (!ray) return undefined
        const intersection = Cesium.IntersectionTests.rayEllipsoid(
            ray,
            globe.ellipsoid,
        )
        if (intersection) {
            return Cesium.Ray.getPoint(ray, intersection.start)
        }
        return undefined
    }

    const position3 = scene.pickPosition(position)
    if (position3) return position3

    const ray = scene.camera.getPickRay(position)
    if (!ray) return undefined

    const intersection = Cesium.IntersectionTests.rayEllipsoid(
        ray,
        globe.ellipsoid,
    )
    if (intersection) {
        return Cesium.Ray.getPoint(ray, intersection.start)
    }
    return undefined
}

/**
 * 평면 거리(측지선 거리) 계산 - WGS84 타원체 표면의 거리
 */
export function computeGeodesicDistance(
    start: Cesium.Cartesian3,
    end: Cesium.Cartesian3,
): number {
    const ellipsoid = Cesium.Ellipsoid.WGS84
    const startCarto = ellipsoid.cartesianToCartographic(start)
    const endCarto = ellipsoid.cartesianToCartographic(end)

    const geodesic = new Cesium.EllipsoidGeodesic(startCarto, endCarto)
    return geodesic.surfaceDistance
}
