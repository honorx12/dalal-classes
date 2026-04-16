import { useRef, useEffect } from 'react';
import { X, Download, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuthStore } from '../store/useAuthStore';

const CertificateModal = ({ course, onClose }) => {
  const { user, profile } = useAuthStore();
  const certificateRef = useRef(null);
  const studentName = profile?.full_name || user?.user_metadata?.full_name || 'Student';
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const certificateId = `${Date.now()}-${user?.id?.slice(0, 8)}`;

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dalal-Classes-Certificate-${course.title.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Your Certificate</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-dark-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div 
          ref={certificateRef}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border-4 border-accent-violet/30 relative overflow-hidden"
          style={{ aspectRatio: '1.414 / 1' }}
        >
          <div className="absolute inset-0 bg-mesh opacity-20"></div>
          
          <div className="relative h-full flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Dalal Classes</span>
            </div>

            <p className="text-accent-cyan text-lg tracking-widest uppercase mb-2">Certificate of Completion</p>
            
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-accent-violet to-transparent my-4"></div>
            
            <p className="text-slate-400 mb-2">This certifies that</p>
            <h1 className="text-4xl font-bold text-white mb-4">{studentName}</h1>
            <p className="text-slate-400 mb-2">has successfully completed the course</p>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent mb-6">
              {course.title}
            </h2>

            <div className="flex items-center gap-8 text-sm text-slate-400">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="text-white">{completionDate}</p>
              </div>
              <div className="w-px h-10 bg-slate-700"></div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-white font-mono text-xs">{certificateId}</p>
              </div>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-slate-500">Verified Certificate</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 w-20 h-20 border-2 border-accent-violet/20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-accent-cyan/20 rounded-full"></div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-cyan text-white font-semibold rounded-xl hover:shadow-glow transition-all"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
