"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { QuestionField } from "@/components/survey/question-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "@/lib/survey-types";

function normalizeSearchValue(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function ShortTextQuestion({
  question,
  value,
  error,
  onChange,
}: {
  question: SurveyQuestion;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const deferredValue = useDeferredValue(value);
  const suggestions = question.suggestions ?? [];
  const normalizedQuery = normalizeSearchValue(deferredValue.trim());
  const matches = useMemo(() => {
    if (!normalizedQuery || suggestions.length === 0) {
      return [];
    }

    return suggestions
      .filter((candidate) => normalizeSearchValue(candidate).includes(normalizedQuery))
      .slice(0, 8);
  }, [normalizedQuery, suggestions]);
  const shouldShowSuggestions = isFocused && normalizedQuery.length > 0;

  return (
    <QuestionField
      id={question.id}
      label={question.label}
      helperText={question.helperText}
      required={question.required}
      error={error}
    >
      <div className="space-y-3">
        <Input
          id={question.id}
          list={suggestions.length > 0 ? `${question.id}-suggestions` : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          placeholder={question.placeholder}
          autoComplete="off"
          aria-expanded={shouldShowSuggestions}
          aria-controls={shouldShowSuggestions ? `${question.id}-suggestion-list` : undefined}
        />
        {suggestions.length > 0 ? (
          <>
            <datalist id={`${question.id}-suggestions`}>
              {suggestions.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
            <p className="text-xs leading-6 text-muted-foreground">
              候補名の一部で検索できます。候補から選ぶと表記が揃います。
            </p>
          </>
        ) : null}
        {shouldShowSuggestions ? (
          <div
            id={`${question.id}-suggestion-list`}
            className={cn(
              "rounded-2xl border border-border/80 bg-background p-2",
              matches.length > 0 ? "space-y-1" : "text-sm text-muted-foreground",
            )}
          >
            {matches.length > 0 ? (
              matches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onChange(suggestion);
                    setIsFocused(false);
                  }}
                >
                  {suggestion}
                </button>
              ))
            ) : (
              <p className="px-3 py-2">
                候補が見つからない場合は、近い所属名をそのまま入力してください。
              </p>
            )}
          </div>
        ) : null}
      </div>
    </QuestionField>
  );
}
