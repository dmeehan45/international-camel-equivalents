import type {
  AdvisoryUnlockState,
  ArchiveTrendInsightResult,
  MaidenResponseEstimateResult,
  ProxyAffinityResult,
  VolatilityForecastResult,
} from '../domain/types';

export const ADVISORY_UNLOCK_KEY = 'dbt.advisory.unlock.v1';
export const ADVISORY_QUIZ_LAST_RESULT_KEY = 'dbt.advisory.quiz.lastResult.v1';
export const ADVISORY_QUIZ_APPLY_NEXT_BID_KEY = 'dbt.advisory.quiz.applyNextBid.v1';
export const ADVISORY_FORECAST_APPLIED_KEY = 'dbt.advisory.forecast.applied.v1';
export const ADVISORY_ESTIMATE_APPLIED_KEY = 'dbt.advisory.estimate.applied.v1';
export const ADVISORY_ARCHIVE_APPLIED_KEY = 'dbt.advisory.archive.applied.v1';

function safeRead<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWrite<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readAdvisoryUnlockState(): AdvisoryUnlockState {
  const parsed = safeRead<AdvisoryUnlockState>(ADVISORY_UNLOCK_KEY);
  if (!parsed || !parsed.hasUnlockedFurtherAdvisoryTools) {
    return { hasUnlockedFurtherAdvisoryTools: false };
  }
  return parsed;
}

export function writeAdvisoryUnlockState(state: AdvisoryUnlockState) {
  safeWrite(ADVISORY_UNLOCK_KEY, state);
}

export function readApplyNextBidProxyId() {
  const parsed = safeRead<{ proxyId: string; source: string }>(ADVISORY_QUIZ_APPLY_NEXT_BID_KEY);
  return parsed?.proxyId || '';
}

export function writeApplyNextBid(result: ProxyAffinityResult) {
  safeWrite(ADVISORY_QUIZ_LAST_RESULT_KEY, result);
  safeWrite(ADVISORY_QUIZ_APPLY_NEXT_BID_KEY, { proxyId: result.proxyId, source: 'quiz' });
}

export function writeAppliedForecast(result: VolatilityForecastResult) {
  safeWrite(ADVISORY_FORECAST_APPLIED_KEY, result);
}

export function readAppliedForecast() {
  return safeRead<VolatilityForecastResult>(ADVISORY_FORECAST_APPLIED_KEY);
}

export function writeAppliedEstimate(result: MaidenResponseEstimateResult) {
  safeWrite(ADVISORY_ESTIMATE_APPLIED_KEY, result);
}

export function readAppliedEstimate() {
  return safeRead<MaidenResponseEstimateResult>(ADVISORY_ESTIMATE_APPLIED_KEY);
}

export function writeAppliedArchiveInsight(result: ArchiveTrendInsightResult) {
  safeWrite(ADVISORY_ARCHIVE_APPLIED_KEY, result);
}

export function readAppliedArchiveInsight() {
  return safeRead<ArchiveTrendInsightResult>(ADVISORY_ARCHIVE_APPLIED_KEY);
}

export function clearAppliedAdvisoryOutputs() {
  [ADVISORY_FORECAST_APPLIED_KEY, ADVISORY_ESTIMATE_APPLIED_KEY, ADVISORY_ARCHIVE_APPLIED_KEY, ADVISORY_QUIZ_APPLY_NEXT_BID_KEY].forEach((key) => {
    localStorage.removeItem(key);
  });
}
