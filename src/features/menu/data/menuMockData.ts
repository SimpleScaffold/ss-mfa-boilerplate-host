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

            {
                name: '3D 라이브러리',
                type: 'GROUP',
                icon: 'LayoutGrid',
                children: [
                    {
                        name: '3D 라이브러리',
                        type: 'LEAF',
                        url: '21',
                    },
                    {
                        name: '3d 텍스처 라이브러리',
                        type: 'LEAF',
                        url: '23',
                    },
                    {
                        name: '3D 자동화',
                        type: 'LEAF',
                        url: '22',
                    },
                    {
                        name: '3D 자동화2',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/simulationAnalysis/Automation.html',
                    },
                    {
                        name: '3D 건물 생성',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/building3D/Architecture2.html',
                    },
                ],
            },
            {
                name: '위치정보변환',
                type: 'GROUP',
                icon: 'MapPin',
                children: [
                    {
                        name: '위치정보변환',
                        type: 'LEAF',
                        url: '31',
                    },
                ],
            },
            {
                name: '제어',
                type: 'GROUP',
                icon: 'Sliders',
                children: [
                    {
                        name: '보조제어',
                        type: 'LEAF',
                        url: '41',
                    },
                    {
                        name: '투명도제어',
                        type: 'LEAF',
                        url: '42',
                    },
                ],
            },
            {
                name: '데이터 가시화',
                type: 'GROUP',
                icon: 'BarChart3',
                children: [
                    {
                        name: '2D 통계데이터',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/dataVisualization/uploadLayer.html',
                    },
                ],
            },
            {
                name: '기타',
                type: 'GROUP',
                icon: 'MoreHorizontal',
                children: [
                    {
                        name: '영상분할',
                        type: 'LEAF',
                        url: '61',
                    },
                    {
                        name: '3D객체 데이터 연혁관리',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/simulationAnalysis/objectDataManage.html',
                    },
                    {
                        name: '종/횡단면 분석',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/crossSectionalAnalysis/LongitudinalAnalysis.html',
                    },
                    {
                        name: '객체 분해 조립',
                        type: 'LEAF',
                        url: 'http://dev.zetalux.co.kr:58888/object.html',
                    },
                    {
                        name: '임시',
                        type: 'LEAF',
                        url: 'http://106.245.249.226:8087/local/busan/BuSan-CaptainCounty.html',
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
            {
                name: '가시권 분석',
                type: 'GROUP',
                icon: 'LayoutGrid',
                children: [
                    {
                        name: '가시권 분석',
                        type: 'LEAF',
                        url: '71',
                    },
                    {
                        name: '시곡면 분석',
                        type: 'LEAF',
                        url: '72',
                    },
                    {
                        name: '스카이라인 분석',
                        type: 'LEAF',
                        url: '73',
                    },
                    {
                        name: '평균층수 분석',
                        type: 'LEAF',
                        url: '74',
                    },
                ],
            },
            {
                name: '조망 분석',
                type: 'GROUP',
                icon: 'Network',
                children: [
                    {
                        name: '조망 분석',
                        type: 'LEAF',
                        url: '61',
                    },
                ],
            },
            {
                name: '음영 분석',
                type: 'GROUP',
                icon: 'Sliders',
                children: [
                    {
                        name: '음영 분석',
                        type: 'LEAF',
                        url: '41',
                    },
                ],
            },
            {
                name: '공간패턴 분석',
                type: 'GROUP',
                icon: 'Layers',
                children: [
                    {
                        name: '밀도맵 분석',
                        type: 'LEAF',
                        url: '11',
                    },
                    {
                        name: '핫스팟 분석',
                        type: 'LEAF',
                        url: '12',
                    },
                    {
                        name: '군집기능',
                        type: 'LEAF',
                        url: '13',
                    },
                ],
            },
        ],
    },
    {
        name: '서비스',
        type: 'GROUP',
        icon: 'FileEdit',
        children: [
            {
                name: '건축 인허가',
                type: 'GROUP',
                icon: 'FileEdit',
                children: [
                    {
                        name: '건축인허가 정보관리',
                        type: 'GROUP',
                        children: [
                            {
                                name: '건축인허가 정보관리',
                                type: 'LEAF',
                                url: '111',
                            },
                        ],
                    },
                    {
                        name: '건축인허가 적법성 평가',
                        type: 'GROUP',
                        children: [
                            {
                                name: '건축인허가 시뮬레이션',
                                type: 'LEAF',
                                url: '122',
                            },
                            {
                                name: '스마트 건축관리',
                                type: 'LEAF',
                                url: '123',
                            },
                        ],
                    },
                    {
                        name: '리포트',
                        type: 'GROUP',
                        children: [
                            {
                                name: '보고서 이력관리',
                                type: 'LEAF',
                                url: '131',
                            },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: '특화 서비스',
        type: 'GROUP',
        icon: 'Server',
        children: [
            {
                name: '양천구',
                type: 'GROUP',
                icon: 'MapPin',
                children: [
                    {
                        name: '환경 정보 모니터링',
                        type: 'GROUP',
                        children: [
                            {
                                name: '소음 모니터링',
                                type: 'LEAF',
                                url: '111',
                            },
                            {
                                name: '대기질 모티터링',
                                type: 'LEAF',
                                url: '112',
                            },
                            {
                                name: '하천 모니터링',
                                type: 'LEAF',
                                url: '113',
                            },
                        ],
                    },
                    {
                        name: '유동인구',
                        type: 'GROUP',
                        children: [
                            {
                                name: '유동인구 분석',
                                type: 'LEAF',
                                url: '124',
                            },
                        ],
                    },
                ],
            },
        ],
    },
]
