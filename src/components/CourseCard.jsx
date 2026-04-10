// src/components/CourseCard.jsx
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const CourseCard = ({ course, enrollment }) => {
  const progress = enrollment?.progress || 0;

  return (
    <Link to={`/courses/${course.id}`} className="block">
      <div className="card-hover bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${course.gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-5xl font-bold opacity-30">
              {course.title.charAt(0)}
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 text-slate-800 text-xs font-medium rounded-full">
              {course.level}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {course.title}
          </h3>
          <p className="text-slate-600 text-sm mb-4 flex-grow">
            {course.description}
          </p>
          {enrollment ? (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Progress</span>
                <span className="font-medium text-slate-900">{progress}%</span>
              </div>
              <ProgressBar progress={progress} />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy">
                ₹{course.price}
              </span>
              <span className="text-amber-600 font-medium text-sm">
                View Course →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
