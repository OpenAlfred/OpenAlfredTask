'use client';

import 'client-only';
import { useEffect, useId, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { ServerError } from '@/features/shared/data-access/ServerResponse';
import {
  buttonGreenClassName,
  buttonLinkClassName,
  buttonWhiteClassName,
} from '@/features/shared/ui/control/button/buttonClassName';
import { inputTextClassName } from '@/features/shared/ui/control/input/inputTextClassName';
import { AlertDialog, AlertDialogBody } from '@/features/shared/ui/dialog/AlertDialog';
import { ErrorList } from '@/features/shared/ui/error/ErrorList';
import { API_TOKEN_EXPIRY_OPTIONS } from '../domain/ApiTokensDomain';
import { ApiTokenDto, createApiToken, revokeApiToken } from '../data-access/ApiTokensDataAccess';

export interface ApiTokensSectionProps {
  readonly initialTokens: Array<ApiTokenDto>;
}

/*
 * A plain UTC date, so the server and the browser render the same text.
 */
const formatDay = (date: Date) => new Date(date).toISOString().slice(0, 10);

const CopyField = ({ label, value }: { readonly label: string; readonly value: string }) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    inputRef.current?.select();

    try {
      // The clipboard API needs HTTPS. Without it the selected text can still be copied by hand.
      if (navigator.clipboard) await navigator.clipboard.writeText(value);
      else document.execCommand('copy');

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="mt-3">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          ref={inputRef}
          readOnly
          value={value}
          onFocus={(event) => event.currentTarget.select()}
          className={twJoin(inputTextClassName, 'font-mono text-xs')}
        />
        <button type="button" onClick={copy} className={twJoin(buttonWhiteClassName, 'shrink-0')}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
};

export const ApiTokensSection = ({ initialTokens }: ApiTokensSectionProps) => {
  const [tokens, setTokens] = useState(initialTokens);
  const [created, setCreated] = useState<{ name: string; token: string }>();
  const [errors, setErrors] = useState<Array<ServerError>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.origin), []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsCreating(true);
    setErrors([]);
    const { data, errors: responseErrors } = await createApiToken(formData);
    setIsCreating(false);

    if (responseErrors || !data) {
      setErrors(responseErrors ?? [{ message: 'There was an error creating the token.' }]);
      return;
    }

    setTokens(data.tokens);
    setCreated({ name: String(formData.get('name')), token: data.token });
    form.reset();
  };

  const handleRevoke = async (id: string) => {
    setErrors([]);
    const { data, errors: responseErrors } = await revokeApiToken(id);

    if (responseErrors || !data) {
      setErrors(responseErrors ?? [{ message: 'There was an error revoking the token.' }]);
      return;
    }

    setTokens(data);
  };

  return (
    <section className="rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold">API tokens</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Let an AI assistant such as Claude Code read and change your projects and tasks through the
        MCP server
        {origin && (
          <>
            {' '}
            at <code className="text-foreground">{origin}/api/mcp</code>
          </>
        )}
        . A token gives the same access as your account, so keep it secret.
      </p>

      {created && (
        <div role="status" className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">
            Token &ldquo;{created.name}&rdquo; created. Copy it now, it won&apos;t be shown again.
          </p>
          <CopyField label="Token" value={created.token} />
          {origin && (
            <CopyField
              label="Add it to Claude Code"
              value={`claude mcp add --transport http openalfred ${origin}/api/mcp --header "Authorization: Bearer ${created.token}"`}
            />
          )}
          <button
            type="button"
            className={twJoin(buttonLinkClassName, 'mt-3 h-8')}
            onClick={() => setCreated(undefined)}
          >
            Done
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="api-token-name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="api-token-name"
            name="name"
            required
            maxLength={100}
            placeholder="Claude Code on my laptop"
            className={twJoin(inputTextClassName, 'mt-1.5')}
          />
        </div>
        <div>
          <label htmlFor="api-token-expiry" className="block text-sm font-medium">
            Expires
          </label>
          <select
            id="api-token-expiry"
            name="expiresIn"
            defaultValue="365"
            className={twJoin(inputTextClassName, 'mt-1.5')}
          >
            {API_TOKEN_EXPIRY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isCreating} className={buttonGreenClassName}>
          {isCreating ? 'Creating…' : 'Create token'}
        </button>
      </form>

      {errors.length > 0 && <ErrorList className="mb-0 mt-4" errors={errors} />}

      {tokens.length > 0 ? (
        <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
          {tokens.map((token) => (
            <li key={token.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{token.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <code>{token.prefix}…</code> · Created {formatDay(token.createdAt)} ·{' '}
                  {token.lastUsedAt ? `Last used ${formatDay(token.lastUsedAt)}` : 'Never used'} ·{' '}
                  {token.expiresAt ? `Expires ${formatDay(token.expiresAt)}` : 'No expiry'}
                </p>
              </div>
              <AlertDialog
                title="Revoke API token"
                trigger={
                  <button type="button" className={twJoin(buttonLinkClassName, 'shrink-0')}>
                    Revoke
                  </button>
                }
                body={
                  <AlertDialogBody
                    confirmButtonLabel="Revoke"
                    destructive
                    message={
                      <span>
                        Anything that uses &ldquo;{token.name}&rdquo; stops working right away.
                      </span>
                    }
                    onConfirm={() => handleRevoke(token.id)}
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">You don&apos;t have any tokens yet.</p>
      )}
    </section>
  );
};
