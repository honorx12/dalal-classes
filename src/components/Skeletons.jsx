function SkeletonBox({ className = '' }) {
  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
      <div className="h-40 bg-slate-200 animate-pulse" />
      <div className="p-5">
        <SkeletonBox className="h-4 w-3/4 mb-2" />
        <SkeletonBox className="h-3 w-full mb-1" />
        <SkeletonBox className="h-3 w-5/6 mb-4" />
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox className="h-5 w-16" />
          <SkeletonBox className="h-3 w-20" />
        </div>
        <SkeletonBox className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function ChapterAccordionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonBox className="w-7 h-7 rounded-full" />
              <div>
                <SkeletonBox className="h-4 w-40 mb-1" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            </div>
            <SkeletonBox className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CoursesPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <SkeletonBox className="h-8 w-48 mb-2 bg-slate-600" />
          <SkeletonBox className="h-4 w-64 bg-slate-600" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function LessonPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SkeletonBox className="h-4 w-28 mb-6" />
        <SkeletonBox className="w-full aspect-video rounded-2xl mb-6" />
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SkeletonBox className="h-6 w-2/3 mb-2" />
              <SkeletonBox className="h-3 w-24" />
            </div>
            <SkeletonBox className="h-10 w-36 rounded-xl flex-shrink-0" />
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-3 w-5/6" />
            <SkeletonBox className="h-3 w-4/6" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-10 w-28 rounded-xl" />
          <SkeletonBox className="h-4 w-16" />
          <SkeletonBox className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-800 py-12 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-5">
          <SkeletonBox className="w-16 h-16 rounded-full bg-slate-600" />
          <div>
            <SkeletonBox className="h-6 w-40 mb-2 bg-slate-600" />
            <SkeletonBox className="h-3 w-52 bg-slate-600" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
              <SkeletonBox className="h-8 w-12 mx-auto mb-2" />
              <SkeletonBox className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
        <SkeletonBox className="h-6 w-32 mb-5" />
        <div className="flex flex-col gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex-1">
                <SkeletonBox className="h-4 w-48 mb-3" />
                <SkeletonBox className="h-2 w-full rounded-full" />
              </div>
              <SkeletonBox className="h-10 w-24 rounded-xl flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CourseDetailSkeleton() {
  return (
    <div>
      <div className="bg-slate-300 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonBox className="h-5 w-40 mb-4 bg-slate-400" />
          <SkeletonBox className="h-10 w-3/4 mb-4 bg-slate-400" />
          <SkeletonBox className="h-5 w-2/3 mb-6 bg-slate-400" />
          <div className="flex gap-6">
            <SkeletonBox className="h-4 w-24 bg-slate-400" />
            <SkeletonBox className="h-4 w-24 bg-slate-400" />
            <SkeletonBox className="h-4 w-24 bg-slate-400" />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <SkeletonBox className="h-6 w-40 mb-5" />
            <ChapterAccordionSkeleton />
          </div>
          <div className="lg:w-72">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <SkeletonBox className="h-8 w-24 mb-1" />
              <SkeletonBox className="h-3 w-40 mb-5" />
              <SkeletonBox className="h-12 w-full rounded-xl mb-5" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <SkeletonBox className="w-4 h-4 rounded-full" />
                  <SkeletonBox className="h-3 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
