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
} as const
