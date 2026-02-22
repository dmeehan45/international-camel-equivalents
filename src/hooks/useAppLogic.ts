import { useEffect, useMemo, useState } from 'react';
import { calculateIceWithModifiers, compareProxyUnits, toCamelValue } from '../core/conversion.js';
import { applyDashboardView, validateDashboardInput } from '../core/dashboard-view.js';
import {
  createProxyDefinition,
  mergeWithExtensions,
  readStoredExtensions,
  writeStoredExtensions,
} from '../core/proxy-library.js';
import {
  locationPresets,
  readCustomizerSettings,
  resolveCamelMultiplier,
  writeCustomizerSettings,
} from '../core/customizer-settings.js';
import { buildCompareSummary, filterReferenceProxies, validateReferenceCatalog } from '../core/reference-library.js';
import { generateFormalizedMessage, listTemplates } from '../core/formalizer.js';
import { buildSharePayload } from '../core/share-export.js';
import { createHistoryEntry, formatRelativeAge, readBidHistory, writeBidHistory } from '../core/history-archive.js';
import type { ProxyDefinition } from '../domain/types';

const camelUsdRate = 500;
const maxRows = 25;

type UnitType = 'USD' | 'CAMEL' | 'PROXY';

export function useAppLogic() {
  const [proxies, setProxies] = useState<ProxyDefinition[]>([]);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('1000');
  const [unit, setUnit] = useState<UnitType>('USD');
  const [proxyId, setProxyId] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [sort, setSort] = useState('quantity-desc');
  const [locationKey, setLocationKey] = useState('default');
  const [language, setLanguage] = useState('en');
  const [manualMultiplier, setManualMultiplier] = useState('1');
  const [overrideProxyId, setOverrideProxyId] = useState('');
  const [overrideRate, setOverrideRate] = useState('');
  const [referenceQuery, setReferenceQuery] = useState('');
  const [referenceCategory, setReferenceCategory] = useState('');
  const [referenceSource, setReferenceSource] = useState('all');
  const [compareAmount, setCompareAmount] = useState('1');
  const [compareFromProxyId, setCompareFromProxyId] = useState('');
  const [compareToProxyId, setCompareToProxyId] = useState('');
  const [newProxyName, setNewProxyName] = useState('');
  const [newProxyRate, setNewProxyRate] = useState('');
  const [newProxyCategory, setNewProxyCategory] = useState('');
  const [newProxyDescription, setNewProxyDescription] = useState('');
  const [generatorStatus, setGeneratorStatus] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('formal');
  const [messageProxyId, setMessageProxyId] = useState('');
  const [messageOutput, setMessageOutput] = useState('');
  const [shareOutput, setShareOutput] = useState('');
  const [archiveStatus, setArchiveStatus] = useState('');
  const [archiveEntries, setArchiveEntries] = useState<any[]>([]);

  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    const saved = readCustomizerSettings();
    if (locationPresets[saved.locationKey]) setLocationKey(saved.locationKey);
    if (Number.isFinite(saved.manualMultiplier) && saved.manualMultiplier > 0) {
      setManualMultiplier(String(saved.manualMultiplier));
    }
    setLanguage(saved.language);
    setArchiveEntries(readBidHistory());

    fetch('/src/data/proxies.json')
      .then((response) => response.json())
      .then((baseProxies) => {
        validateReferenceCatalog(baseProxies);
        const merged = mergeWithExtensions(baseProxies, readStoredExtensions());
        setProxies(merged);
      })
      .catch((loadError: Error) => setError(loadError.message));
  }, []);

  useEffect(() => {
    writeCustomizerSettings({
      locationKey,
      manualMultiplier: Number(manualMultiplier),
      language,
    });
  }, [locationKey, manualMultiplier, language]);

  useEffect(() => {
    if (!proxies.length) return;
    if (!proxyId) setProxyId(proxies[0].id);
    if (!overrideProxyId) setOverrideProxyId(proxies[0].id);
    if (!compareFromProxyId) setCompareFromProxyId(proxies[0].id);
    if (!compareToProxyId) setCompareToProxyId(proxies[Math.min(1, proxies.length - 1)].id);
    if (!messageProxyId) setMessageProxyId(proxies[0].id);
  }, [proxies, proxyId, overrideProxyId, compareFromProxyId, compareToProxyId, messageProxyId]);

  const modifiers = useMemo(() => {
    const camelMultiplier = resolveCamelMultiplier({ locationKey, manualMultiplier: Number(manualMultiplier) });
    const out: { camelMultiplier: number; proxyRateOverrides?: Record<string, number> } = { camelMultiplier };
    if (overrideRate.trim()) {
      out.proxyRateOverrides = { [overrideProxyId]: Number(overrideRate) };
    }
    return out;
  }, [locationKey, manualMultiplier, overrideProxyId, overrideRate]);

  const dashboard = useMemo(() => {
    try {
      const parsedAmount = Number(amount);
      validateDashboardInput({ amount: parsedAmount, unit, proxyId });
      const baseCamelValue = toCamelValue({ amount: parsedAmount, unit, proxyId, camelUsdRate }, proxies);
      const { camelValue, equivalents } = calculateIceWithModifiers(
        { amount: parsedAmount, unit, proxyId, camelUsdRate },
        proxies,
        modifiers,
      );
      const sorted = applyDashboardView(equivalents, { query: filterQuery, sort: sort as any });
      const visible = sorted.slice(0, maxRows);
      const nextResult = { amount: parsedAmount, unit, camelValue, equivalents: sorted };
      setLastResult(nextResult);
      setError('');
      return { camelValue, baseCamelValue, visible, total: sorted.length };
    } catch (renderError: any) {
      setLastResult(null);
      setError(renderError.message);
      return null;
    }
  }, [amount, unit, proxyId, proxies, modifiers, filterQuery, sort]);

  const referenceRows = useMemo(() => {
    const visible = filterReferenceProxies(proxies, {
      query: referenceQuery,
      category: referenceCategory,
      source: referenceSource as any,
    });
    return { rows: visible.slice(0, 20), total: visible.length };
  }, [proxies, referenceQuery, referenceCategory, referenceSource]);

  const compareSummary = useMemo(() => {
    try {
      const quantity = compareProxyUnits(
        { amount: Number(compareAmount), fromProxyId: compareFromProxyId, toProxyId: compareToProxyId },
        proxies,
      );
      const fromName = proxies.find((item) => item.id === compareFromProxyId)?.name ?? 'Proxy A';
      const toName = proxies.find((item) => item.id === compareToProxyId)?.name ?? 'Proxy B';
      return buildCompareSummary({ amount: Number(compareAmount), fromName, toName, quantity });
    } catch (compareError: any) {
      return compareError.message;
    }
  }, [compareAmount, compareFromProxyId, compareToProxyId, proxies]);

  function addProxy() {
    try {
      const newProxy = createProxyDefinition(
        {
          name: newProxyName,
          ratePerCamel: newProxyRate,
          category: newProxyCategory,
          description: newProxyDescription,
        },
        proxies,
      );
      const updated = [...proxies, newProxy];
      setProxies(updated);
      writeStoredExtensions([...readStoredExtensions(), newProxy]);
      setGeneratorStatus(`${newProxy.name} added to your local proxy library.`);
      setNewProxyName('');
      setNewProxyRate('');
      setNewProxyCategory('');
      setNewProxyDescription('');
    } catch (proxyError: any) {
      setGeneratorStatus(proxyError.message);
    }
  }

  function formalize() {
    if (!lastResult) {
      setMessageOutput('Run a valid conversion first to generate a message.');
      return;
    }

    const selected = lastResult.equivalents.find((item: any) => item.proxyId === messageProxyId) ?? lastResult.equivalents[0];
    try {
      setMessageOutput(
        generateFormalizedMessage({
          template: messageTemplate,
          camelValue: lastResult.camelValue,
          proxyName: selected.proxyName,
          proxyQuantity: selected.quantity,
        }),
      );
    } catch (formalizerError: any) {
      setMessageOutput(formalizerError.message);
    }
  }

  async function copyShareText() {
    const payload = buildShare();
    if (!payload) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload.shareText);
      return;
    }
  }

  function buildShare() {
    try {
      const payload = buildSharePayload(lastResult, { proxyId: messageProxyId, message: messageOutput });
      setShareOutput(payload.shareText);
      return payload;
    } catch (shareError: any) {
      setShareOutput(shareError.message);
      return null;
    }
  }

  function archiveBid() {
    if (!lastResult) {
      setArchiveStatus('Run a valid conversion first to archive a bid.');
      return;
    }

    try {
      const topProxy = lastResult.equivalents[0];
      const entry = createHistoryEntry({
        amount: lastResult.amount,
        unit: lastResult.unit,
        camelValue: lastResult.camelValue,
        summary: `${lastResult.camelValue} camels • top proxy ${topProxy.proxyName} (${topProxy.quantity})`,
      });
      const updated = [entry, ...archiveEntries];
      setArchiveEntries(updated);
      writeBidHistory(updated);
      setArchiveStatus('Bid archived in your local time capsule.');
    } catch (archiveError: any) {
      setArchiveStatus(archiveError.message);
    }
  }

  return {
    locationPresets,
    messageTemplates: listTemplates(),
    proxies,
    error,
    amount,
    setAmount,
    unit,
    setUnit,
    proxyId,
    setProxyId,
    filterQuery,
    setFilterQuery,
    sort,
    setSort,
    locationKey,
    setLocationKey,
    language,
    setLanguage,
    manualMultiplier,
    setManualMultiplier,
    overrideProxyId,
    setOverrideProxyId,
    overrideRate,
    setOverrideRate,
    referenceQuery,
    setReferenceQuery,
    referenceCategory,
    setReferenceCategory,
    referenceSource,
    setReferenceSource,
    compareAmount,
    setCompareAmount,
    compareFromProxyId,
    setCompareFromProxyId,
    compareToProxyId,
    setCompareToProxyId,
    compareSummary,
    newProxyName,
    setNewProxyName,
    newProxyRate,
    setNewProxyRate,
    newProxyCategory,
    setNewProxyCategory,
    newProxyDescription,
    setNewProxyDescription,
    generatorStatus,
    addProxy,
    messageTemplate,
    setMessageTemplate,
    messageProxyId,
    setMessageProxyId,
    messageOutput,
    setMessageOutput,
    formalize,
    shareOutput,
    buildShare,
    copyShareText,
    openMailDraft: () => window.open(buildShare()?.urls.mailto, '_blank'),
    openSmsDraft: () => window.open(buildShare()?.urls.sms, '_blank'),
    openTwitterDraft: () => window.open(buildShare()?.urls.twitter, '_blank'),
    openWhatsappDraft: () => window.open(buildShare()?.urls.whatsapp, '_blank'),
    archiveStatus,
    archiveEntries,
    archiveBid,
    formatRelativeAge,
    dashboard,
    referenceRows,
  };
}
