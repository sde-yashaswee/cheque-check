import React from 'react';
import { cn } from "@/lib/utils"

export interface TextTruncateProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  maxLength: number;
}

export function TextTruncate({ text, maxLength, className, ...props }: TextTruncateProps) {
  if (!text) return null;

  const truncated = text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;

  return (
    <span title={text} className={cn("inline-block truncate", className)} {...props}>
      {truncated}
    </span>
  )
}
