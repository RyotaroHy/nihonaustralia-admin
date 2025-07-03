# 🚀 最小コスト管理者パネル - Terraformデプロイガイド

管理者パネルを最安価でAWSにデプロイする設定です。

## 💰 超低コスト構成

**予想月額費用**: **$2-5/月**

### コスト内訳:

- **Lambda**: 256MB、最小実行時間
- **CloudFront**: PriceClass_100（米国/カナダ/欧州のみ）
- **S3**: 静的ファイルストレージのみ
- **監視なし、Secrets Managerなし、ウォームアップなし**

## 🏗️ シンプルアーキテクチャ

```
Internet → CloudFront → Lambda (Next.js) + S3 (Static)
                      ↓
                 Supabase (外部DB)
```

**構成要素:**

1. **AWS Lambda**: 256MB、Next.js実行
2. **CloudFront**: CDN（限定配信地域）
3. **S3**: 静的ファイルのみ
4. **環境変数**: Lambda内で直接設定

## 📋 前提条件

```bash
# AWS CLI設定
aws configure

# Terraform インストール
brew install terraform
```

## 🔧 設定

### 1. 設定ファイル準備

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

### 2. terraform.tfvars編集

```hcl
# 基本設定
aws_region = "ap-southeast-2"
environment = "prod"

# Supabase（必須）
supabase_url = "https://your-project.supabase.co"
supabase_anon_key = "your-anon-key"
supabase_service_role_key = "your-service-role-key"

# 認証
nextauth_secret = "your-secret-key"

# 最小コスト設定
lambda_memory_size = 256  # 最小メモリ
lambda_timeout = 30
cloudfront_price_class = "PriceClass_100"  # 配信地域限定
```

## 🚀 デプロイ

### ワンコマンドデプロイ:

```bash
chmod +x terraform/deploy.sh
./terraform/deploy.sh
```

### 手動デプロイ:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 💡 コスト最適化のポイント

1. **256MB Lambda**: 最小メモリで十分
2. **監視なし**: CloudWatch最小限
3. **Secrets Managerなし**: 環境変数で直接設定
4. **ウォームアップなし**: コールドスタート許容
5. **PriceClass_100**: 配信地域限定

## 🔄 更新

```bash
# コード更新
./terraform/deploy.sh

# インフラ変更
terraform plan
terraform apply
```

## 🗑️ 削除

```bash
./terraform/deploy.sh destroy
```

## ⚠️ 制限事項

- コールドスタートあり（初回リクエスト遅延）
- 監視機能最小限
- エラー通知なし
- 配信地域限定（米国/カナダ/欧州）

**管理者パネルの軽い使用には十分です！**
