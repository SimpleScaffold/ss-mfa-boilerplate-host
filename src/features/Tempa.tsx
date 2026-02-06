import React from 'react'

const Tempa: React.FC = () => {
    return (
        <div className="bg-background text-foreground antialiased">
            <div className="bg-background fixed inset-0 z-0">
                <div className="map-bg absolute inset-0"></div>
            </div>
            <div className="relative z-10 flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="bg-card border-border flex w-72 flex-col border-r shadow-sm transition-all duration-300">
                    <div className="border-border flex h-14 items-center border-b px-6">
                        <div className="text-primary flex items-center gap-2">
                            <span className="text-foreground text-sm font-bold tracking-tight uppercase">
                                Climate MFE Platform
                            </span>
                        </div>
                    </div>
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
                        sidebar
                    </div>
                    <div className="border-border bg-muted/50 border-t p-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="bg-muted border-card size-8 rounded-full border bg-cover bg-center"
                                style={{
                                    backgroundImage:
                                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC6yY2iiPqgyA-t3pGmvpYNB7320qLehPnB1sxiQym035GIrGuLaiAJE9GsYBG5ey7EMIXdkFumTK9mJGtyLrf82Er6mgz6AlxqyK8GADlNm-fFuJ1eYLrID_FDKwOZ9a1qbCb-AZGyPpz2VvFIrhSxrMAEapiBR9SylB6VT_Tzt7PJsOPYglNX5PfrZwHVjZSFe4mGR-e3wubVWXeHQZFMkNH-phEHYLv_CPefHsGxUFVvDbWkDKhGxLx0XLlzxY73HYd7Fm9u2Dwr")',
                                }}
                            ></div>
                            <div className="flex-1">
                                <p className="text-foreground text-[12px] font-bold">
                                    김관리 연구원
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                    통합재난대응팀
                                </p>
                            </div>
                            <button className="text-muted-foreground hover:text-foreground">
                                <span className="material-symbols-outlined text-lg">
                                    logout
                                </span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="relative flex flex-1 flex-col overflow-hidden">
                    <header className="bg-card/80 border-border flex h-14 items-center justify-between border-b px-6 backdrop-blur-sm"></header>

                    <div className="relative flex-1"></div>

                    {/* Bottom Navigation */}
                </main>
            </div>
        </div>
    )
}

export default Tempa
