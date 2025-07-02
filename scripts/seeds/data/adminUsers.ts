export const adminUsers = [
  {
    email: 'admin@nihonaustralia.com',
    password: 'NihonAustralia2024!Admin',
    full_name: 'システム管理者',
    phone: '+61400000000',
    gender: 'prefer_not_to_say' as const,
    au_state: 'NSW' as const,
    bio: '日豪コミュニティプラットフォームの管理者アカウントです。',
    admin_verified: true,
    verification_notes: '初期システム管理者アカウント',
  },
  {
    email: 'moderator@nihonaustralia.com',
    password: 'NihonAustralia2024!Mod',
    full_name: 'コンテンツモデレーター',
    phone: '+61400000001',
    gender: 'prefer_not_to_say' as const,
    au_state: 'VIC' as const,
    bio: 'コンテンツの管理とモデレーションを担当します。',
    admin_verified: true,
    verification_notes: 'コンテンツモデレーター権限',
  },
  {
    email: 'support@nihonaustralia.com',
    password: 'NihonAustralia2024!Support',
    full_name: 'サポート担当',
    phone: '+61400000002',
    gender: 'prefer_not_to_say' as const,
    au_state: 'QLD' as const,
    bio: 'ユーザーサポートとお問い合わせ対応を担当します。',
    admin_verified: true,
    verification_notes: 'ユーザーサポート権限',
  },
];

export type AdminUser = typeof adminUsers[0];