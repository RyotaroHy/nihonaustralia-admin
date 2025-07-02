# Admin認証システムセットアップ手順

## 🚀 クイックセットアップ（推奨）

Supabase CLIを使用した自動セットアップ：

```bash
# 本番環境にセットアップ
npm run setup:admin

# ローカル環境にセットアップ  
npm run setup:admin:local

# 本番環境にデプロイ
npm run deploy:admin
```

## 📋 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run setup:admin` | 本番データベースにマイグレーション適用 + adminユーザー作成 |
| `npm run setup:admin:local` | ローカルSupabaseにセットアップ |
| `npm run deploy:admin` | 本番環境への完全デプロイ（ビルド+テスト+DB+ユーザー） |
| `npm run db:link` | Supabaseプロジェクトにリンク |
| `npm run db:push` | マイグレーションを本番にプッシュ |
| `npm run db:pull` | 本番スキーマをローカルにプル |
| `npm run db:diff` | ローカルと本番の差分を表示 |
| `npm run seed` | adminユーザーをシード |

---

## 🔧 手動セットアップ（フォールバック）

自動セットアップが失敗した場合のSupabase管理画面での手動手順：

### 手順：

1. **Supabase Dashboard**にアクセス
   - URL: https://supabase.com/dashboard
   - プロジェクト: `nihonaustralia` を選択

2. **SQL Editor**を開く
   - 左メニューの「SQL Editor」をクリック

3. **以下のSQLを実行**

```sql
-- Add admin verification fields to mypage_profiles table
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS admin_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE mypage_profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mypage_profiles_admin_verified 
ON mypage_profiles(admin_verified) WHERE admin_verified = true;

CREATE INDEX IF NOT EXISTS idx_mypage_profiles_verified_by 
ON mypage_profiles(verified_by);

-- Add comments for documentation
COMMENT ON COLUMN mypage_profiles.admin_verified IS 'Whether the user has admin privileges';
COMMENT ON COLUMN mypage_profiles.verified_by IS 'UUID of the admin who verified this user';
COMMENT ON COLUMN mypage_profiles.verified_at IS 'Timestamp when the user was verified';
COMMENT ON COLUMN mypage_profiles.verification_notes IS 'Notes about the verification process';
```

4. **「Run」ボタンをクリック**してSQLを実行

## 2. Admin ユーザーの作成

マイグレーション完了後、以下のコマンドでadminユーザーを作成します：

```bash
npm run seed
```

## 3. 確認

以下のクエリでadminユーザーが正しく作成されているか確認できます：

```sql
SELECT 
  p.id,
  p.full_name,
  p.admin_verified,
  p.verification_notes,
  u.email
FROM mypage_profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.admin_verified = true;
```

## 4. ログイン情報

作成されるデフォルトadminアカウント：

### システム管理者
- **Email**: `admin@nihonaustralia.com`
- **Password**: `NihonAustralia2024!Admin`
- **権限**: フル管理者権限

### コンテンツモデレーター
- **Email**: `moderator@nihonaustralia.com`
- **Password**: `NihonAustralia2024!Mod`
- **権限**: コンテンツ管理権限

### サポート担当
- **Email**: `support@nihonaustralia.com`
- **Password**: `NihonAustralia2024!Support`
- **権限**: ユーザーサポート権限

## 5. 本番環境での注意事項

⚠️ **重要**: 本番環境では以下を必ず実行してください：

1. **パスワード変更**: すべてのデフォルトパスワードを強力なものに変更
2. **メールアドレス変更**: 実際の管理者メールアドレスに変更
3. **2FA有効化**: 可能であれば2要素認証を設定
4. **権限見直し**: 必要最小限の権限のみ付与

## 6. トラブルシューティング

### マイグレーションが失敗する場合
- Supabase管理画面で手動でSQLを実行
- Service Role Keyの権限を確認

### ログインできない場合
- メールアドレスとパスワードを確認
- admin_verifiedフィールドがtrueになっているか確認
- ブラウザのキャッシュをクリア

### 権限エラーが発生する場合
- Service Role Keyが正しく設定されているか確認
- .env.localファイルの環境変数を確認