import type { FinalMenuTree } from '../types/finalMenuTypes'

/**
 * 메뉴 Mock 데이터
 * API 응답(data 배열) 구조를 FinalMenuTree 형식으로 변환한 데이터
 *
 * 변환 규칙:
 * - menuType: 1 → GROUP, 2 → LEAF
 * - routeType: 1 → INTERNAL (actionCode: id 또는 routeName)
 * - routeType: 2 → EXTERNAL (url: proRoute, microApp: routeName)
 * - icon: Ant Design → Lucide 이름 매핑 또는 제거
 */
export const MOCK_MENU_DATA: FinalMenuTree = [
    {
        name: '기능',
        menuType: 'GROUP',
        icon: 'Compass',
        children: [
            {
                name: '측정 기능',
                menuType: 'GROUP',
                icon: 'Ruler',
                children: [
                    {
                        name: '평면거리',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '11' },
                    },
                    {
                        name: '공간거리',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '12' },
                    },
                    {
                        name: '수직거리',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '13' },
                    },
                    {
                        name: '면적측정',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '14' },
                    },
                    {
                        name: '표고측정',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '15' },
                    },
                    {
                        name: '부피 측정',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '16' },
                    },
                    {
                        name: '제거',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '17' },
                    },
                ],
            },
            {
                name: '3D 라이브러리',
                menuType: 'GROUP',
                icon: 'LayoutGrid',
                children: [
                    {
                        name: '3D 라이브러리',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '21' },
                    },
                    {
                        name: '3d 텍스처 라이브러리',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '23' },
                    },
                    {
                        name: '3D 자동화',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '22' },
                    },
                    {
                        name: '3D 자동화2',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/simulationAnalysis/Automation.html',
                            microApp: 'Automation3d',
                        },
                    },
                    {
                        name: '3D 건물 생성',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/building3D/Architecture2.html',
                            microApp: 'building3D',
                        },
                    },
                ],
            },
            {
                name: '위치정보변환',
                menuType: 'GROUP',
                icon: 'MapPin',
                children: [
                    {
                        name: '위치정보변환',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '31' },
                    },
                ],
            },
            {
                name: '제어',
                menuType: 'GROUP',
                icon: 'Sliders',
                children: [
                    {
                        name: '보조제어',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '41' },
                    },
                    {
                        name: '투명도제어',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '42' },
                    },
                ],
            },
            {
                name: '데이터 가시화',
                menuType: 'GROUP',
                icon: 'BarChart3',
                children: [
                    {
                        name: '2D 통계데이터',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/dataVisualization/uploadLayer.html',
                            microApp: 'uploadLayer',
                        },
                    },
                ],
            },
            {
                name: '기타',
                menuType: 'GROUP',
                children: [
                    {
                        name: '영상분할',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '61' },
                    },
                    {
                        name: '3D객체 데이터 연혁관리',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/simulationAnalysis/objectDataManage.html',
                            microApp: 'ObjectDataManage',
                        },
                    },
                    {
                        name: '종/횡단면 분석',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/crossSectionalAnalysis/LongitudinalAnalysis.html',
                            microApp: 'crossSectionalAnalysis',
                        },
                    },
                    {
                        name: '객체 분해 조립',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://dev.zetalux.co.kr:58888/object.html',
                            microApp: 'object',
                        },
                    },
                    {
                        name: '임시',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/local/busan/BuSan-CaptainCounty.html',
                            microApp: 'local01',
                        },
                    },
                ],
            },
        ],
    },
    {
        name: '분석',
        menuType: 'GROUP',
        icon: 'LineChart',
        children: [
            {
                name: '지형 분석',
                menuType: 'GROUP',
                icon: 'Layers',
                children: [
                    {
                        name: '경사도 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '31' },
                    },
                    {
                        name: '경사방향 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '32' },
                    },
                    {
                        name: '종/횡단면 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '33' },
                    },
                    {
                        name: '토공량 계산',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '34' },
                    },
                    {
                        name: '지형 단면 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '35' },
                    },
                    {
                        name: '지하시설물 분석',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/undergroundAnalysis/indexPage.html',
                            microApp: 'undergroundAnalysis',
                        },
                    },
                    {
                        name: '하천범람시뮬레이션',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/riverAnalysis/indexPage.html',
                            microApp: 'riverAnalysis',
                        },
                    },
                    {
                        name: '지형편집',
                        menuType: 'LEAF',
                        route: {
                            routeType: 'EXTERNAL',
                            url: 'http://106.245.249.226:8087/simulationAnalysis/TerrainEditing.html',
                            microApp: 'simulationTerrainEditing',
                        },
                    },
                ],
            },
            {
                name: '가시권 분석',
                menuType: 'GROUP',
                icon: 'LayoutGrid',
                children: [
                    {
                        name: '가시권 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '71' },
                    },
                    {
                        name: '시곡면 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '72' },
                    },
                    {
                        name: '스카이라인 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '73' },
                    },
                    {
                        name: '평균층수 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '74' },
                    },
                ],
            },
            {
                name: '조망 분석',
                menuType: 'GROUP',
                icon: 'Network',
                children: [
                    {
                        name: '조망 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '61' },
                    },
                ],
            },
            {
                name: '음영 분석',
                menuType: 'GROUP',
                icon: 'Sliders',
                children: [
                    {
                        name: '음영 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '41' },
                    },
                ],
            },
            {
                name: '공간패턴 분석',
                menuType: 'GROUP',
                icon: 'Layers',
                children: [
                    {
                        name: '밀도맵 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '11' },
                    },
                    {
                        name: '핫스팟 분석',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '12' },
                    },
                    {
                        name: '군집기능',
                        menuType: 'LEAF',
                        route: { routeType: 'INTERNAL', actionCode: '13' },
                    },
                ],
            },
        ],
    },
    {
        name: '서비스',
        menuType: 'GROUP',
        icon: 'FileEdit',
        children: [
            {
                name: '건축 인허가',
                menuType: 'GROUP',
                icon: 'FileEdit',
                children: [
                    {
                        name: '건축인허가 정보관리',
                        menuType: 'GROUP',
                        children: [
                            {
                                name: '건축인허가 정보관리',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '111',
                                },
                            },
                        ],
                    },
                    {
                        name: '건축인허가 적법성 평가',
                        menuType: 'GROUP',
                        children: [
                            {
                                name: '건축인허가 시뮬레이션',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '122',
                                },
                            },
                            {
                                name: '스마트 건축관리',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '123',
                                },
                            },
                        ],
                    },
                    {
                        name: '리포트',
                        menuType: 'GROUP',
                        children: [
                            {
                                name: '보고서 이력관리',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '131',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: '특화 서비스',
        menuType: 'GROUP',
        icon: 'Server',
        children: [
            {
                name: '양천구',
                menuType: 'GROUP',
                children: [
                    {
                        name: '환경 정보 모니터링',
                        menuType: 'GROUP',
                        children: [
                            {
                                name: '소음 모니터링',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '111',
                                },
                            },
                            {
                                name: '대기질 모티터링',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '112',
                                },
                            },
                            {
                                name: '하천 모니터링',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '113',
                                },
                            },
                        ],
                    },
                    {
                        name: '유동인구',
                        menuType: 'GROUP',
                        children: [
                            {
                                name: '유동인구 분석',
                                menuType: 'LEAF',
                                route: {
                                    routeType: 'INTERNAL',
                                    actionCode: '124',
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    },
]
