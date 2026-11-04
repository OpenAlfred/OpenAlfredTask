/*
 * We use [&:not(:disabled)]:hover so it also works with regular <a> tags.
 * If we use "hover:enabled:" instead, it doesn't work with regular <a> tags
 * because they don't have a enabled/disable attribute as <button>s have.
 */

export const buttonCommonClassName =
  'flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70';

export const buttonGreenClassName = `${buttonCommonClassName} h-9 px-4 shadow-sm bg-primary text-primary-foreground [&:not(:disabled)]:hover:bg-primary/90`;

export const buttonRedClassName = `${buttonCommonClassName} h-9 px-4 shadow-sm bg-red-600 text-white [&:not(:disabled)]:hover:bg-red-700`;

export const buttonWhiteClassName = `${buttonCommonClassName} h-9 px-4 shadow-sm border border-border bg-card text-foreground [&:not(:disabled)]:hover:bg-muted`;

export const buttonLinkClassName = `${buttonCommonClassName} text-muted-foreground [&:not(:disabled)]:hover:text-primary`;

export const buttonIconClassName = `${buttonCommonClassName} h-8 w-8 shrink-0 text-muted-foreground [&:not(:disabled)]:hover:bg-muted [&:not(:disabled)]:hover:text-foreground`;
