"use client"
import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from '@hugeicons/react';
import { Mic01Icon as MicIcon, MicOff01Icon as MicOffIcon } from '@hugeicons/core-free-icons';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export interface InputProps extends React.ComponentProps<"input"> {
  enableMic?: boolean;
  leftIcon?: any;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, enableMic, leftIcon, onChange, value, ...props }, ref) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [isMicActive, setIsMicActive] = React.useState(false);
  const internalRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    if (isMicActive && transcript) {
      // Create a synthetic event to trigger onChange
      if (internalRef.current) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(internalRef.current, transcript);
        const ev2 = new Event('input', { bubbles: true});
        internalRef.current.dispatchEvent(ev2);
      }
    }
  }, [transcript, isMicActive]);

  const toggleMic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (listening) {
      SpeechRecognition.stopListening();
      setIsMicActive(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsMicActive(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsMicActive(false);
    }
    props.onBlur?.(e);
  };

  return (
    <div className="relative w-full">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none">
          <HugeiconsIcon icon={leftIcon} className="h-5 w-5" />
        </div>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        ref={(node: any) => { internalRef.current = node; if (typeof ref === "function") { ref(node); } else if (ref) { (ref as any).current = node; } }}
        className={cn(
          "h-10 w-full min-w-0 rounded-sm border border-input bg-canvas-parchment px-4 py-2 text-base transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-surface-tile-1",
          leftIcon && "pl-10",
          enableMic !== false && (!type || type === 'text' || type === 'search' || type === 'url') && browserSupportsSpeechRecognition && "pr-10",
          className
        )}
        onChange={onChange}
        value={value}
        onBlur={handleBlur}
        {...props}
      />
      {enableMic !== false && (!type || type === "text" || type === "search" || type === "url") && browserSupportsSpeechRecognition && (
        <button
          type="button"
          onClick={toggleMic}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors",
            listening ? "bg-red-100 text-red-500 animate-pulse" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <HugeiconsIcon icon={listening ? MicOffIcon : MicIcon} className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
