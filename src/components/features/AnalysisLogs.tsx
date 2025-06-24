import { useAnalysisStore } from '@/store/useAnalysisStore';
import { categoryInfo } from '@/utils/log-parser';
import { LogCategory } from '@/types/analysis-log';

export function AnalysisLogs() {
  const { getLatestLogs, openDetailModal } = useAnalysisStore();
  const latestLogs = getLatestLogs();

  const renderLogCard = (category: LogCategory) => {
    const info = categoryInfo[category];
    const log = latestLogs[category];
    
    return (
      <div 
        key={category}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-gray-600/20 cursor-pointer hover:bg-white/15 transition-all duration-200"
        onClick={() => openDetailModal(category)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full ${info.bgColor} flex items-center justify-center`}>
            <span className="text-white text-xs">{info.icon}</span>
          </div>
          <span className="font-medium text-mono-900">{info.title}</span>
        </div>
        
        <div className="text-sm text-mono-700 mb-2">
          {log ? log.content : info.description}
        </div>
        
        {log && (
          <div className="text-xs text-mono-500 flex items-center justify-between">
            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            <span className="text-mono-600 hover:text-mono-800 transition-colors">
              상세보기 →
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-8">
      {renderLogCard('preference')}
      {renderLogCard('profile')}
      {renderLogCard('considerations')}
    </div>
  );
}

// 로그 상세보기 모달 컴포넌트
export function LogDetailModal() {
  const { detailModal, closeDetailModal } = useAnalysisStore();
  
  if (!detailModal.isOpen || !detailModal.category) return null;
  
  const info = categoryInfo[detailModal.category];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeDetailModal}
      ></div>
      
      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${info.bgColor} flex items-center justify-center`}>
                <span className="text-white">{info.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
              </div>
            </div>
            <button
              onClick={closeDetailModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-96">
          {detailModal.logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>아직 분석 로그가 없습니다.</p>
              <p className="text-sm mt-1">대화를 진행하시면 분석 내용이 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {detailModal.logs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{log.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 