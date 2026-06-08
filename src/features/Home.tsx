const Home = () => {
    return (
        <div className="bg-background flex h-full w-full flex-col items-center justify-center gap-4 p-8">
            <h1 className="text-2xl font-semibold">Host Shell</h1>
            <p className="text-muted-foreground text-center text-sm">
                사이드 메뉴에서 Remote 샘플 모듈을 열어 Module Federation
                동작을 확인하세요.
            </p>
        </div>
    )
}

export default Home
