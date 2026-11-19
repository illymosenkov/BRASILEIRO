#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 3 ]]; then
  echo "Usage: $0 /path/to/android.jar /path/to/build-tools/d8 output.dex" >&2
  exit 2
fi
android_jar=$1
d8=$2
output=$3
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf -- "$work_dir"' EXIT
mkdir "$work_dir/classes" "$work_dir/dex"
mapfile -t stubs < <(find "$source_dir/compile-stubs" -name '*.java' | sort)
javac --release 8 -encoding UTF-8 -cp "$android_jar" -d "$work_dir/classes" \
  "${stubs[@]}" "$source_dir/BoraBackupPlugin.java"
"$d8" --min-api 23 --lib "$android_jar" --classpath "$work_dir/classes" \
  --output "$work_dir/dex" "$work_dir/classes/br/bora/civic41/BoraBackupPlugin.class"
cp "$work_dir/dex/classes.dex" "$output"
