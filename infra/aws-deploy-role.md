# AWS deploy role — GitHub Actions → opensource.nanofreeze.tech

The [`Deploy to opensource.nanofreeze.tech`](../.github/workflows/deploy-opensource.yml)
workflow authenticates to AWS with **OIDC** — no long-lived keys in GitHub. It
assumes a single-purpose IAM role. This is the one piece that must be created by
an account admin (`AWS_PROFILE=nanofreeze-admin`, account `841652051959`); the
OIDC identity provider (`token.actions.githubusercontent.com`) already exists.

The role is deliberately minimal:

- **Who can assume it** — only workflows on the **`main`** branch of
  **this repo**. Not PRs, not other branches, not other repos.
- **What it can do** — write the `cold-chain/calculator/` prefix of the site
  bucket, and invalidate the one CloudFront distribution. No other bucket, no
  other prefix, no other distribution, no CloudFormation, no IAM.

## Create it

```bash
ACCOUNT=841652051959
BUCKET=nanofreezeopensource-sitebucket397a1860-fbgtuzxfztqu
DISTRIBUTION=EQ8X4YGXWKQAC

cat > /tmp/trust.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
      "StringLike": { "token.actions.githubusercontent.com:sub": "repo:NanoFreeze/nanofreeze-cold-chain-calculator:ref:refs/heads/main" }
    }
  }]
}
JSON

cat > /tmp/perms.json <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "ListBucketForSync", "Effect": "Allow", "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::${BUCKET}" },
    { "Sid": "WriteCalculatorPrefixOnly", "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::${BUCKET}/cold-chain/calculator/*" },
    { "Sid": "InvalidateThisDistributionOnly", "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::${ACCOUNT}:distribution/${DISTRIBUTION}" }
  ]
}
JSON

aws iam create-role \
  --role-name nanofreeze-github-actions-opensource \
  --assume-role-policy-document file:///tmp/trust.json \
  --description "GitHub Actions OIDC — deploy nanofreeze-cold-chain-calculator to opensource.nanofreeze.tech"

aws iam put-role-policy \
  --role-name nanofreeze-github-actions-opensource \
  --policy-name opensource-deploy \
  --policy-document file:///tmp/perms.json
```

The role ARN (`arn:aws:iam::841652051959:role/nanofreeze-github-actions-opensource`)
is already wired into the workflow's `AWS_ROLE` env. Once the role exists, every
push to `main` deploys automatically; the local `scripts/deploy-opensource.sh`
remains as a manual fallback.
