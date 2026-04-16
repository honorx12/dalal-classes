// src/components/Skeleton.jsx

const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-40 w-full rounded-xl',
    card: 'h-64 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    badge: 'h-6 w-20 rounded-full',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    <Skeleton variant="thumbnail" className="h-40" />
    <div className="p-5 space-y-3">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="pt-2">
        <Skeleton variant="button" />
      </div>
    </div>
  </div>
);

export const SkeletonCourseList = ({ count = 4 }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonCourseDetail = () => (
  <div className="py-8 px-4">
    <div className="max-w-4xl mx-auto space-y-6">
      <Skeleton variant="text" className="w-32 h-4" />
      <Skeleton variant="card" className="h-64 rounded-2xl" />
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl space-y-2">
          <Skeleton variant="avatar" className="mx-auto" />
          <Skeleton variant="text" className="mx-auto w-16" />
          <Skeleton variant="text" className="mx-auto w-24" />
        </div>
        <div className="bg-white p-4 rounded-xl space-y-2">
          <Skeleton variant="avatar" className="mx-auto" />
          <Skeleton variant="text" className="mx-auto w-16" />
          <Skeleton variant="text" className="mx-auto w-24" />
        </div>
        <div className="bg-white p-4 rounded-xl space-y-2">
          <Skeleton variant="avatar" className="mx-auto" />
          <Skeleton variant="text" className="mx-auto w-16" />
          <Skeleton variant="text" className="mx-auto w-24" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-8 space-y-4">
        <Skeleton variant="title" className="mx-auto" />
        <Skeleton variant="text" className="mx-auto w-2/3" />
        <div className="flex items-center justify-center gap-4 pt-4">
          <Skeleton variant="text" className="w-20 h-10" />
          <Skeleton variant="button" className="w-32" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <Skeleton variant="title" className="w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-b border-slate-100 pb-4 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <div className="flex gap-2">
              <Skeleton variant="badge" />
              <Skeleton variant="badge" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonHomePage = () => (
  <div>
    <section className="bg-slate-200 text-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center space-y-6">
        <Skeleton variant="badge" className="mx-auto bg-white/10" />
        <div className="space-y-3 max-w-2xl mx-auto">
          <Skeleton variant="title" className="h-12 mx-auto bg-white/20" />
          <Skeleton variant="title" className="h-12 w-2/3 mx-auto bg-white/20" />
        </div>
        <Skeleton variant="text" className="max-w-xl mx-auto bg-white/20" />
        <div className="flex gap-4 justify-center pt-4">
          <Skeleton variant="button" className="w-40" />
          <Skeleton variant="button" className="w-40 bg-white/10" />
        </div>
      </div>
    </section>

    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Skeleton variant="title" className="mx-auto w-64" />
          <Skeleton variant="text" className="mx-auto w-96 max-w-full" />
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl space-y-4">
              <Skeleton variant="avatar" className="mx-auto bg-slate-300" />
              <Skeleton variant="title" className="mx-auto w-24" />
              <Skeleton variant="text" className="mx-auto w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Skeleton variant="title" className="mx-auto w-48" />
          <Skeleton variant="text" className="mx-auto w-80 max-w-full" />
        </div>
        <SkeletonCourseList count={4} />
      </div>
    </section>
  </div>
);

export default Skeleton;
