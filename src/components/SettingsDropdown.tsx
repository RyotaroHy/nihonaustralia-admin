'use client';

import { useState } from 'react';
import { 
  HiCog, 
  HiX, 
  HiSun, 
  HiMoon, 
  HiDesktopComputer,
  HiBell,
  HiMail,
  HiRefresh,
  HiViewList,
  HiDownload,
  HiUpload,
  HiTrash
} from 'react-icons/hi';
import { useAdminSettings } from '@/hooks/useAdminSettings';

type SettingsDropdownProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SettingsDropdown({ isOpen, onClose }: SettingsDropdownProps) {
  const { settings, updateSetting, resetSettings, exportSettings, importSettings } = useAdminSettings();
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importSettings(file);
      alert('設定をインポートしました');
    } catch (error) {
      alert('設定のインポートに失敗しました: ' + (error as Error).message);
    } finally {
      setImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const themeOptions = [
    { value: 'light', label: 'ライト', icon: HiSun },
    { value: 'dark', label: 'ダーク', icon: HiMoon },
    { value: 'system', label: 'システム', icon: HiDesktopComputer },
  ] as const;

  const refreshOptions = [
    { value: 10, label: '10秒' },
    { value: 30, label: '30秒' },
    { value: 60, label: '1分' },
    { value: 300, label: '5分' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HiCog className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              設定
            </h3>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <HiX className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Theme Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              テーマ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('theme', option.value)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                      settings.theme === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              言語
            </label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value as 'ja' | 'en')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Notification Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              通知設定
            </label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HiBell className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">ブラウザ通知</span>
              </div>
              <button
                onClick={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HiMail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">メール通知</span>
              </div>
              <button
                onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HiRefresh className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">自動更新</span>
              </div>
              <button
                onClick={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.autoRefresh && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">更新間隔</label>
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {refreshOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Display Settings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HiViewList className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">コンパクト表示</span>
            </div>
            <button
              onClick={() => updateSetting('compactMode', !settings.compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.compactMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Import/Export Settings */}
          <div className="pt-4 border-t dark:border-gray-600">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              設定の管理
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportSettings}
                className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <HiDownload className="h-4 w-4 mr-1" />
                エクスポート
              </button>
              
              <label className="flex items-center justify-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <HiUpload className="h-4 w-4 mr-1" />
                {importing ? '読み込み中...' : 'インポート'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>

            <button
              onClick={() => {
                if (confirm('設定をリセットしますか？この操作は元に戻せません。')) {
                  resetSettings();
                }
              }}
              className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <HiTrash className="h-4 w-4 mr-1" />
              リセット
            </button>
          </div>
        </div>
      </div>
    </>
  );
}