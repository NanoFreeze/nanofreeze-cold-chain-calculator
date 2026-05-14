#!/usr/bin/env bash
#
# scripts/deploy-opensource.sh — publish this calculator to production:
#
#   https://opensource.nanofreeze.tech/cold-chain/calculator/
#
# The site is static (a Next.js `output: "export"` build), served by CloudFront
# from a private, OAC-only S3 bucket. The CloudFront distribution + bucket are
# owned by the `NanoFreezeOpenSource` CDK stack in the operating-system monorepo;
# this script only publishes CONTENT — build → S3 sync → CloudFront invalidation.
# It never touches CloudFormation.
#
# The calculator lives under a key prefix (`cold-chain/calculator/`) so the bucket
# can host more OSS tools later, and so the subdomain's landing page at the bucket
# root is left untouched.
#
# Because the app is served from that subpath, it is BUILT with
# BASE_PATH=/cold-chain/calculator so every /_next/… asset URL resolves.
#
# Requirements: aws CLI v2 + creds (AWS_PROFILE=nanofreeze-admin), node, npm.
#
# Usage:
#   bash scripts/deploy-opensource.sh            # build + sync + invalidate
#   bash scripts/deploy-opensource.sh --dry-run  # build + show what WOULD sync

set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="${STACK_NAME:-NanoFreezeOpenSource}"
CALC_PREFIX="cold-chain/calculator"
BASE_PATH="/${CALC_PREFIX}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DRY_RUN=false
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=true

# ── Resolve the stack's bucket + distribution ────────────────────────
stack_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text 2>/dev/null
}

BUCKET="$(stack_output SiteBucketName)"
DISTRIBUTION_ID="$(stack_output DistributionId)"

if [[ -z "$BUCKET" || "$BUCKET" == "None" ]]; then
  echo "deploy-opensource: stack '$STACK_NAME' not found (or no SiteBucketName)." >&2
  echo "  The infra lives in the operating-system monorepo; deploy it once:" >&2
  echo "    cd infra/cdk && npx cdk deploy $STACK_NAME" >&2
  exit 2
fi

echo "▸ bucket:       s3://$BUCKET"
echo "▸ distribution: $DISTRIBUTION_ID"

# ── Build the static export at the production base path ──────────────
echo "▸ building the Next.js app (BASE_PATH=$BASE_PATH)…"
cd "$REPO_ROOT"
rm -rf out
BASE_PATH="$BASE_PATH" npm run build

if [[ ! -f "out/index.html" ]]; then
  echo "deploy-opensource: build produced no out/index.html — aborting." >&2
  exit 1
fi

# ── Sync ─────────────────────────────────────────────────────────────
# Two passes so we cache correctly without a config file:
#   1. /_next/… assets are content-hashed ⇒ immutable, cache for a year.
#   2. everything else (HTML, the redirect, the logo) is short-cache so a
#      republish is visible even before the invalidation lands.
SYNC_ARGS="--delete"
$DRY_RUN && SYNC_ARGS="$SYNC_ARGS --dryrun" && echo "▸ DRY RUN — nothing will be written"

echo "▸ syncing hashed assets → s3://$BUCKET/$CALC_PREFIX/_next/"
# shellcheck disable=SC2086
aws s3 sync "out/_next" "s3://$BUCKET/$CALC_PREFIX/_next" \
  --region "$AWS_REGION" $SYNC_ARGS \
  --cache-control "public, max-age=31536000, immutable"

echo "▸ syncing the rest → s3://$BUCKET/$CALC_PREFIX/"
# shellcheck disable=SC2086
aws s3 sync "out" "s3://$BUCKET/$CALC_PREFIX/" \
  --region "$AWS_REGION" $SYNC_ARGS --exclude "_next/*" \
  --cache-control "public, max-age=300, must-revalidate"

# ── Invalidate ───────────────────────────────────────────────────────
if [[ "$DRY_RUN" != "true" && -n "$DISTRIBUTION_ID" && "$DISTRIBUTION_ID" != "None" ]]; then
  echo "▸ invalidating CloudFront…"
  INVALIDATION_ID="$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/$CALC_PREFIX/*" \
    --query 'Invalidation.Id' --output text)"
  echo "  invalidation: $INVALIDATION_ID"
fi

echo
echo "✅ published → https://opensource.nanofreeze.tech/$CALC_PREFIX/"
