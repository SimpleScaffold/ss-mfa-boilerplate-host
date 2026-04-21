import type { FinalMenuTree } from '../types/finalMenuTypes'

/**
 * 메뉴 Mock 데이터
 * - type: GROUP | LEAF
 * - url: LEAF 전용
 *   - 모달 모듈: '{remoteName}/{path}' (예: measurement/planar-distance) → remotes name으로 해당 remote(12001 등) 매핑, path는 kebab→Pascal로 MF 로드
 *   - 외부: http(s)로 시작하는 전체 URL
 *   - 기타 내부: actionCode
 */
export const MOCK_MENU_DATA: FinalMenuTree = [
    {
        name: '기능',
        type: 'GROUP',
        icon: 'Compass',
        children: [
            {
                name: '측정 기능',
                type: 'GROUP',
                icon: 'Ruler',
                children: [
                    {
                        name: '평면거리',
                        type: 'LEAF',
                        url: 'measurement/planar-distance',
                    },
                    {
                        name: '공간거리',
                        type: 'LEAF',
                        url: 'measurement/spatial-distance',
                    },
                    {
                        name: '수직거리',
                        type: 'LEAF',
                        url: 'measurement/vertical-distance',
                    },
                    {
                        name: '면적측정',
                        type: 'LEAF',
                        url: 'measurement/planar-area',
                    },
                    {
                        name: '표고측정',
                        type: 'LEAF',
                        url: '15',
                    },
                    {
                        name: '부피 측정',
                        type: 'LEAF',
                        url: '16',
                    },
                    {
                        name: '제거',
                        type: 'LEAF',
                        url: '17',
                    },
                ],
            },
        ],
    },
    {
        name: '분석',
        type: 'GROUP',
        icon: 'LineChart',
        children: [
            {
                name: '지형 분석',
                type: 'GROUP',
                icon: 'Layers',
                children: [
                    {
                        name: '경사도 분석',
                        type: 'LEAF',
                        url: '31',
                    },
                    {
                        name: '경사방향 분석',
                        type: 'LEAF',
                        url: '32',
                    },
                    {
                        name: '종/횡단면 분석',
                        type: 'LEAF',
                        url: '33',
                    },
                    {
                        name: '토공량 계산',
                        type: 'LEAF',
                        url: 'terrain-analysis/terrain-volume',
                    },
                    {
                        name: '지형 단면 분석',
                        type: 'LEAF',
                        url: '35',
                    },
                    {
                        name: '지하시설물 분석',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/undergroundAnalysis/indexPage.html',
                    },
                    {
                        name: '하천범람시뮬레이션',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/riverAnalysis/indexPage.html',
                    },
                    {
                        name: '지형편집',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/simulationAnalysis/TerrainEditing.html',
                    },
                ],
            },
        ],
    },
]
