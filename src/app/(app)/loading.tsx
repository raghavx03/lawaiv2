export default function AppLoader() {
    return (
        <div className="w-full h-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 flex flex-col gap-6">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-2">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                </div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-4 animate-pulse" />
                        <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800/80 rounded-lg mb-2 animate-pulse" />
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1">
                <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg mb-6 animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                                <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
