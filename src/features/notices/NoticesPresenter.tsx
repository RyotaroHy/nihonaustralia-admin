import { useState } from 'react';
import { AdminNotice } from './_api/get-notices';
import { 
  HiSearch, 
  HiSortAscending, 
  HiSortDescending, 
  HiTrash, 
  HiPencil, 
  HiPlus,
  HiX 
} from 'react-icons/hi';

type NoticesPresenterProps = {
  notices: AdminNotice[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  searchTerm: string;
  sortBy: 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  isUpdating: boolean;
  showCreateModal: boolean;
  editingNotice: AdminNotice | null;
  onSearch: (search: string) => void;
  onSortChange: (sortBy: 'created_at' | 'updated_at', sortOrder: 'asc' | 'desc') => void;
  onPageChange: (page: number) => void;
  onShowCreate: () => void;
  onHideCreate: () => void;
  onCreate: (data: { message_ja: string; message_en?: string }) => void;
  onShowEdit: (notice: AdminNotice) => void;
  onHideEdit: () => void;
  onUpdate: (noticeId: string, data: { message_ja?: string; message_en?: string }) => void;
  onDelete: (noticeId: string) => void;
};

export function NoticesPresenter({
  notices,
  totalCount,
  hasMore,
  currentPage,
  searchTerm,
  sortBy,
  sortOrder,
  isUpdating,
  showCreateModal,
  editingNotice,
  onSearch,
  onSortChange,
  onPageChange,
  onShowCreate,
  onHideCreate,
  onCreate,
  onShowEdit,
  onHideEdit,
  onUpdate,
  onDelete,
}: NoticesPresenterProps) {
  const handleSortClick = (field: typeof sortBy) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === 'desc' ? <HiSortDescending className="h-4 w-4" /> : <HiSortAscending className="h-4 w-4" />;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notices</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage platform notices and announcements ({totalCount.toLocaleString()} total)
          </p>
        </div>
        <button
          onClick={onShowCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <HiPlus className="h-5 w-5 mr-2" />
          Create Notice
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created By
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSortClick('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    {getSortIcon('created_at')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSortClick('updated_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Updated</span>
                    {getSortIcon('updated_at')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <span className="inline-block w-6 h-4 mr-2">🇯🇵</span>
                        {notice.message_ja.substring(0, 100)}
                        {notice.message_ja.length > 100 && '...'}
                      </div>
                      {notice.message_en && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="inline-block w-6 h-4 mr-2">🇺🇸</span>
                          {notice.message_en.substring(0, 100)}
                          {notice.message_en.length > 100 && '...'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {notice.created_by_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(notice.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(notice.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onShowEdit(notice)}
                        disabled={isUpdating}
                        className="inline-flex items-center p-1 border border-transparent rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 disabled:opacity-50"
                        title="Edit notice"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(notice.id)}
                        disabled={isUpdating}
                        className="inline-flex items-center p-1 border border-transparent rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900 disabled:opacity-50"
                        title="Delete notice"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {Math.ceil(totalCount / 20)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <NoticeModal
          title="Create Notice"
          isUpdating={isUpdating}
          onSubmit={onCreate}
          onClose={onHideCreate}
        />
      )}

      {/* Edit Modal */}
      {editingNotice && (
        <NoticeModal
          title="Edit Notice"
          initialData={editingNotice}
          isUpdating={isUpdating}
          onSubmit={(data) => onUpdate(editingNotice.id, data)}
          onClose={onHideEdit}
        />
      )}
    </div>
  );
}

// Modal component for creating/editing notices
function NoticeModal({
  title,
  initialData,
  isUpdating,
  onSubmit,
  onClose,
}: {
  title: string;
  initialData?: AdminNotice;
  isUpdating: boolean;
  onSubmit: (data: { message_ja: string; message_en?: string }) => void;
  onClose: () => void;
}) {
  const [messageJa, setMessageJa] = useState(initialData?.message_ja || '');
  const [messageEn, setMessageEn] = useState(initialData?.message_en || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageJa.trim()) return;

    onSubmit({
      message_ja: messageJa.trim(),
      message_en: messageEn.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Japanese Message *
            </label>
            <textarea
              value={messageJa}
              onChange={(e) => setMessageJa(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter Japanese message..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              English Message (Optional)
            </label>
            <textarea
              value={messageEn}
              onChange={(e) => setMessageEn(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter English message..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !messageJa.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}