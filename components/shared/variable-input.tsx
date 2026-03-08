"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input } from "@/components/ui/input";
import React from "react";
import { cn } from "@/lib/utils";
import { useVariableSuggestions } from "@/hooks/use-variable-suggestions";

interface VariableInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

export const VariableInput = forwardRef<HTMLInputElement, VariableInputProps>(
  function VariableInput({ value, onChange, onKeyDown: externalKeyDown, className, ...props }, ref) {
    const [cursorPos, setCursorPos] = useState(0);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const innerRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => innerRef.current!);

    const { isTriggered, suggestions, noEnvWarning, showNoEnvToast, highlightedHtml, currentEnv } =
      useVariableSuggestions(value, cursorPos);

    // Only render mirror when there are completed {{var}} tokens AND an env is active
    const hasVariableTokens = currentEnv && /\{\{[^}]+\}\}/.test(value);

    // Show suggestions when triggered with results, hide otherwise
    useEffect(() => {
      if (isTriggered && suggestions.length > 0) {
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    }, [isTriggered, suggestions.length]);

    // Show toast when no env
    useEffect(() => {
      if (noEnvWarning) showNoEnvToast();
    }, [noEnvWarning, showNoEnvToast]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        setCursorPos(e.target.selectionStart ?? val.length);
      },
      [onChange]
    );

    const applySuggestion = useCallback(
      (key: string) => {
        const before = value.slice(0, cursorPos).replace(/\{\{[^}]*$/, `{{${key}}}`);
        const after = value.slice(cursorPos);
        onChange(before + after);
        setShowSuggestions(false);
        innerRef.current?.focus();
      },
      [value, cursorPos, onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
          externalKeyDown?.(e as any);
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          applySuggestion(suggestions[selectedIndex].key);
        } else if (e.key === "Escape") {
          setShowSuggestions(false);
        } else {
          externalKeyDown?.(e as any);
        }
      },
      [showSuggestions, suggestions, selectedIndex, applySuggestion, externalKeyDown]
    );

    // Close suggestions on outside click
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (
          innerRef.current &&
          !innerRef.current.parentElement?.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
      <div className="relative">
        {/* Mirror div — underneath Input, renders {{var}} tokens in color */}
        {hasVariableTokens && (
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-0 pointer-events-none overflow-hidden",
              "h-8 px-2.5 py-1 text-sm rounded-md border border-transparent",
              "whitespace-nowrap text-foreground font-mono",
              className
            )}
            style={{ lineHeight: "inherit", background: "transparent" }}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
        <Input
          ref={innerRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={(e) => setCursorPos((e.target as HTMLInputElement).selectionStart ?? 0)}
          onClick={(e) => setCursorPos((e.target as HTMLInputElement).selectionStart ?? 0)}
          className={cn(
            hasVariableTokens ? "bg-transparent text-transparent caret-foreground" : "text-foreground",
            className
          )}
          {...props}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-panel border border-border rounded-lg shadow-xl overflow-hidden">
            {suggestions.map((v, i) => (
              <button
                key={v.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  applySuggestion(v.key);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs text-left transition-colors ${
                  i === selectedIndex ? "bg-raised" : "hover:bg-raised/50"
                }`}
              >
                <span className="font-mono" style={{ color: "var(--var-valid)" }}>
                  {v.key}
                </span>
                <span className="text-foreground-subtle truncate">
                  {v.value}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
