import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { replaceSearch } from './usePageNavigation';
import { clampStatsDate, isValidStatsQuery, LINE_PATTERN, localDateStr, readStatsUrl, serializeStatsQuery } from '../utils/lineStatsSearch';

function initialState() {
  const draft = readStatsUrl(localDateStr(new Date()));
  return {
    draft,
    query: isValidStatsQuery(draft) ? draft : null,
    lineInvalid: draft.line !== '' && !LINE_PATTERN.test(draft.line),
    version: 0,
  };
}

export function useLineStatsSearch() {
  const [state, setState] = useState(initialState);
  const maxDate = localDateStr(new Date());

  useEffect(() => {
    const restore = () => setState(initialState());
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const setField = (field: keyof typeof state.draft, value: string | boolean) => {
    setState(current => ({
      ...current,
      draft: { ...current.draft, [field]: value },
      lineInvalid: field === 'line' ? false : current.lineInvalid,
    }));
  };

  const canSubmit = !!state.draft.line.trim() && !!state.draft.start && !!state.draft.end
    && state.draft.start <= state.draft.end;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || !canSubmit) return null;
    const query = { ...state.draft, line: state.draft.line.trim() };
    if (!LINE_PATTERN.test(query.line)) {
      setState(current => ({ ...current, lineInvalid: true }));
      return null;
    }
    setState(current => ({ draft: query, query, lineInvalid: false, version: current.version + 1 }));
    replaceSearch(serializeStatsQuery(query));
    return query;
  };

  return {
    ...state,
    maxDate,
    canSubmit,
    handleSubmit,
    setLine: (value: string) => setField('line', value),
    setStart: (value: string) => setField('start', clampStatsDate(value, maxDate)),
    setEnd: (value: string) => setField('end', clampStatsDate(value, maxDate)),
    setEstimated: (value: boolean) => setField('estimated', value),
  };
}

export type LineStatsSearch = ReturnType<typeof useLineStatsSearch>;
