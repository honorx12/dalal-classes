import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 bg-dark-bg bg-mesh">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;