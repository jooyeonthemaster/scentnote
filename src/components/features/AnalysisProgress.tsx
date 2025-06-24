import { useAnalysisStore } from '@/store/useAnalysisStore';

export function AnalysisProgress() {
  const { progress } = useAnalysisStore();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-mono-700">분석 진행률</span>
        <span className="text-sm font-semibold text-mono-900">{progress.overall}%</span>
      </div>
      
      {/* 진행률 바 */}
      <div className="w-full bg-gray-600/20 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-mono-700 to-mono-900 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.overall}%` }}
        ></div>
      </div>
      
      {progress.overall >= 80 && (
        <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
          <p className="text-xs text-green-700">
            🎉 분석이 거의 완료되었습니다!
          </p>
        </div>
      )}
    </div>
  );
} 