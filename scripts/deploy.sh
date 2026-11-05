#!/usr/bin/env bash
# Ships the last commit to a server over SSH and rebuilds the stack there. Use it when the server
# has no Git repository to pull from.
#
#   ./scripts/deploy.sh user@192.168.178.20 srv/opentask
#   DRY_RUN=1 ./scripts/deploy.sh user@192.168.178.20 srv/opentask
#
# The first argument is the SSH target. The second is a folder inside the home folder of the
# server (default: opentask). It needs a .env, see docs/SELF_HOSTING.md. Files that only exist on
# the server stay: .env, docker-compose.override.yml, backups/ and deploy.log.
# DRY_RUN=1 only lists what would change. Needs rsync on both machines and Docker on the server.
set -euo pipefail

target="${1:?Usage: scripts/deploy.sh user@host [folder]}"
folder="${2:-opentask}"

# rsync --delete runs in this folder. Only accept a plain relative path such as "opentask" or
# "srv/opentask": no "~", no leading "/", and no "." or ".." parts.
if ! [[ "$folder" =~ ^[A-Za-z0-9_-][A-Za-z0-9._-]*(/[A-Za-z0-9_-][A-Za-z0-9._-]*)*$ ]]; then
  echo "The folder must be a plain path inside the home folder of the server, like srv/opentask. Not '$folder'." >&2
  exit 1
fi

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "Note: uncommitted changes are not deployed, only the last commit ($(git rev-parse --short HEAD))."
fi

# Export the commit, so build leftovers and local files never reach the server.
export_dir="$(mktemp -d)"
trap 'rm -rf "$export_dir"' EXIT
git archive HEAD | tar -x -C "$export_dir"

# Compare by content and leave times and permissions alone: git archive gives every file the time
# of the commit, so comparing times would list the whole tree after every commit, and the
# permissions of the temporary folder (700) must not end up on the folder on the server.
# New files still get the permissions of the source, like the executable bit of scripts.
rsync_flags=(-rlzc --delete)
[ -z "${DRY_RUN:-}" ] || rsync_flags+=(--dry-run --itemize-changes)

rsync "${rsync_flags[@]}" \
  --exclude=/.env \
  --exclude=/docker-compose.override.yml \
  --exclude=/backups/ \
  --exclude=/deploy.log \
  "$export_dir/" "$target:$folder/"

if [ -n "${DRY_RUN:-}" ]; then
  echo "Dry run: nothing was changed on the server."
  exit 0
fi

if ! ssh "$target" "test -f '$folder/.env'"; then
  echo "The code is on the server, but $target:$folder has no .env yet." >&2
  echo "Create it from .env.example, then run this script again." >&2
  exit 1
fi

ssh "$target" "cd '$folder' && docker compose up -d --build"
