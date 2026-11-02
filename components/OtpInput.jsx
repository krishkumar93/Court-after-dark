"use client";

import { useRef, useEffect } from "react";

export default function OtpInput({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  autoFocus = true,
  length = 6,
}) {
  const inputRefs = useRef([]);

  // Ensure digits array matches length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  function handleChange(index, e) {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, "");

    if (!cleanDigits) {
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    if (cleanDigits.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < cleanDigits.length && index + i < length; i++) {
        newDigits[index + i] = cleanDigits[i];
      }
      const combined = newDigits.join("");
      onChange(combined);
      const nextFocus = Math.min(length - 1, index + cleanDigits.length);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanDigits.slice(-1);
    onChange(newDigits.join(""));

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const focusIndex = Math.min(length - 1, pasted.length);
    inputRefs.current[focusIndex]?.focus();
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Verification digit ${i + 1} of ${length}`}
          className={`h-12 w-10 sm:h-14 sm:w-12 rounded-lg text-center text-xl sm:text-2xl font-mono font-bold transition outline-none ${
            hasError
              ? "border-2 border-red-500 bg-red-50 text-red-900"
              : digits[i]
              ? "border-2 border-[#a71d2a] bg-red-50/50 text-slate-900 shadow-xs"
              : "border border-slate-300 bg-slate-50 text-slate-800 hover:border-slate-400 focus:border-[#a71d2a] focus:bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      ))}
    </div>
  );
}
