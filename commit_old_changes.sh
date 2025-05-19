#!/bin/bash

# === CONFIGURATION ===
USERNAME="Adnan Nuredin"
EMAIL="152042446+Adnan7389@users.noreply.github.com"
START_DATE="2025-04-07"
END_DATE="2025-05-31"

# === Setup git identity ===
git config user.name "$USERNAME"
git config user.email "$EMAIL"

# === Collect uncommitted files ===
FILES=$(git diff --cached --name-only; git ls-files --others --exclude-standard)
if [ -z "$FILES" ]; then
  echo "❌ No uncommitted changes found. Stage your files or modify something first."
  exit 1
fi

# === Date helpers ===
start_ts=$(date -d "$START_DATE" +%s)
end_ts=$(date -d "$END_DATE" +%s)
total_days=$(( (end_ts - start_ts) / 86400 ))
total_files=$(echo "$FILES" | wc -l)
commits_per_day=3

# Calculate approximate day spacing
spacing=$(( total_days / (total_files / commits_per_day + 1) ))

# === Start committing ===
echo "🕒 Committing $total_files files evenly between $START_DATE and $END_DATE..."

i=0
current_day=$start_ts

for file in $FILES; do
  # Advance date every few files
  if (( i % commits_per_day == 0 && i > 0 )); then
    current_day=$(( current_day + spacing * 86400 ))
    if (( current_day > end_ts )); then
      current_day=$end_ts
    fi
  fi

  commit_date=$(date -d "@$(( current_day + RANDOM % 86400 ))" +"%Y-%m-%d %H:%M:%S")

  git add "$file"
  git commit --date="$commit_date" -m "Add/update $file (archived work from 2024)"

  ((i++))
done

echo "✅ Finished committing $total_files files with evenly spaced dates."
