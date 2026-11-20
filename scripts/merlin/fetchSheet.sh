#!/usr/bin/env bash
# Downloads every tab of Merlin's "Tekken 6 Combo Library" (published Google Sheet) as CSV
# into src/data/t6-merlin/csv/. Then run: node scripts/merlin/parseSheet.mjs
set -euo pipefail
SHEET="2PACX-1vSrQDVLlXLCnW7Bo1LnF2yBjObEBWady8sfX4Fz8j2lUIpAINFQWa0f5-qBLUR8QMcjEX5NtCx1pgUU"
OUT="$(dirname "$0")/../../src/data/t6-merlin/csv"
mkdir -p "$OUT"
curl -sL "https://docs.google.com/spreadsheets/d/e/$SHEET/pubhtml" \
  | grep -oE 'name: "([^"\\]|\\.)*"[^}]*gid: "[0-9]+"' \
  | sed -E 's/name: "([^"]*)".*gid: "([0-9]+)"/\2\t\1/' \
  | while IFS=$'\t' read -r gid name; do
      curl -sfL -o "$OUT/$name.csv" "https://docs.google.com/spreadsheets/d/e/$SHEET/pub?single=true&output=csv&gid=$gid"
      echo "$name"
      sleep 0.5
    done
