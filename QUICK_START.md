# 🚀 Admin Panel Quick Start Guide

## 即座に使用可能！

現在のシステムは**メールベース認証**で完全に動作します。

### 1. 開発サーバー起動

```bash
npm run dev
```

### 2. Admin Loginページアクセス

```
http://localhost:3002/auth/signin
```

### 3. 管理者アカウントでログイン

```
Email: admin@nihonaustralia.com
Password: NihonAustralia2024!Admin
```

### 4. 管理画面アクセス

ログイン成功後、自動的に管理画面にリダイレクトされます：

- **ダッシュボード**: 統計情報とアクティビティ
- **ユーザー管理**: ユーザー一覧と検証機能  
- **投稿管理**: 求人投稿の管理と承認
- **お知らせ管理**: システム通知の作成・編集

## 🔑 利用可能なAdmin アカウント

| 役割 | Email | Password | 権限 |
|------|-------|----------|------|
| システム管理者 | admin@nihonaustralia.com | NihonAustralia2024!Admin | フル管理者権限 |
| モデレーター | moderator@nihonaustralia.com | NihonAustralia2024!Mod | コンテンツ管理 |
| サポート | support@nihonaustralia.com | NihonAustralia2024!Support | ユーザーサポート |

## 🛡️ セキュリティ機能

- ✅ **Admin権限チェック**: メールアドレスベース認証で動作中
- ✅ **自動ログアウト**: 非Admin用户は自動サインアウト
- ✅ **日本語UI**: 管理者向けインターフェース
- ✅ **セッション管理**: 安全なログイン/ログアウト

## 📊 管理機能

### ダッシュボード
- プラットフォーム統計
- リアルタイムアクティビティ
- ユーザー・投稿・お知らせ数

### ユーザー管理
- ユーザー一覧表示
- 検索・フィルタリング
- ユーザー検証機能

### 投稿管理  
- 求人投稿一覧
- ステータス管理（下書き・公開・終了）
- 投稿削除機能

### お知らせ管理
- お知らせ作成・編集
- 日本語・英語対応
- 公開管理

## 🔧 オプション: データベース強化

より高度な権限管理が必要な場合、以下の手順でデータベースを強化できます：

### 1. Supabase管理画面でSQL実行

```sql
-- Admin verification fields
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified 
ON mypage_profiles(admin_verified) WHERE admin_verified = true;
```

### 2. Admin権限を更新

```bash
npm run seed
```

## ⚠️ 本番環境での注意事項

1. **パスワード変更**: すべてのデフォルトパスワードを変更
2. **メールアドレス更新**: 実際の管理者メールに変更  
3. **環境変数確認**: 本番用の設定を確認
4. **アクセスログ**: 管理者活動の監視設定

---

**✨ 準備完了！管理業務を開始できます。**