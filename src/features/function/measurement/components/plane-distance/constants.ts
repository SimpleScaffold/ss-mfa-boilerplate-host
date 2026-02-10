/**
 * 평면 거리 측정 상수
 */

const PREFIX = 'measurement_plane_distance'

export const ENTITY_IDS = {
    LINE: `${PREFIX}_line`,
    LABEL: `${PREFIX}_label`,
    POINT_START: `${PREFIX}_point_start`,
    POINT_END: `${PREFIX}_point_end`,
} as const

export const DEFAULTS = {
    LINE_WIDTH: 3,
    POINT_SIZE: 8,
    /** 라벨 폰트 (확대해도 잘 보이도록 큼) */
    LABEL_FONT: 'bold 20px sans-serif',
    LABEL_OUTLINE_WIDTH: 3,
} as const
