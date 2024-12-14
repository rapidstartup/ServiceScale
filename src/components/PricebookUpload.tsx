import React, { useState, useMemo } from 'react';
import { parse } from 'papaparse';
import { BookOpen, Plus, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FileDropzone from './shared/FileDropzone';
import DataTable from './shared/DataTable';
import { PricebookEntry, usePricebookStore } from '../store/pricebookStore';

const PricebookUpload: React.FC = () => {
  const { entries, addEntries, removeEntriesByUploadId, updateEntry, deleteEntry, undeleteEntry } = usePricebookStore();
  const [isUploadOpen, setIsUploadOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<PricebookEntry | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<PricebookEntry | null>(null);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showDeleteUploadModal, setShowDeleteUploadModal] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    description: ''
  });

  const handleFileAccepted = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result;
        const results = parse(csv as string, {
          header: true,
          skipEmptyLines: true,
        });

        if (results.errors.length) {
          toast.error('Error parsing CSV file');
          return;
        }

        const uploadId = Date.now().toString();
        addEntries(results.data as PricebookEntry[], uploadId);
        toast.success('Pricebook data uploaded successfully');
      } catch (error) {
        console.error('Failed to process file:', error);
        toast.error('Failed to process the file');
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (entry: PricebookEntry) => {
    setShowEditModal(entry);
  };

  const handleDelete = (entry: PricebookEntry) => {
    setShowDeleteModal(entry);
  };

  const handleUndelete = (entry: PricebookEntry) => {
    undeleteEntry(entry.id);
    toast.success('Item restored successfully');
  };

  const handleSaveEdit = () => {
    if (showEditModal) {
      updateEntry(showEditModal.id, showEditModal);
      setShowEditModal(null);
      toast.success('Item updated successfully');
    }
  };

  const handleConfirmDelete = () => {
    if (showDeleteModal) {
      deleteEntry(showDeleteModal.id);
      setShowDeleteModal(null);
      toast.success('Item deleted successfully');
    }
  };

  const handleCreateItem = async () => {
    try {
      const item = {
        name: newItem.name,
        price: newItem.price,
        description: newItem.description
      };

      await addEntries([item], 'manual');
      setShowNewItemModal(false);
      setNewItem({
        name: '',
        price: 0,
        description: ''
      });
      toast.success('Item created successfully');
    } catch (error) {
      console.error('Failed to create item:', error);
      toast.error('Failed to create item');
    }
  };

  const handleDeleteUpload = (uploadId: string) => {
    setShowDeleteUploadModal(uploadId);
  };

  const handleConfirmDeleteUpload = async () => {
    if (showDeleteUploadModal) {
      await removeEntriesByUploadId(showDeleteUploadModal);
      setShowDeleteUploadModal(null);
      toast.success('Upload deleted successfully');
    }
  };

  const uploads = useMemo(() => {
    const uploadIds = new Set(entries.map(e => e.upload_id));
    return Array.from(uploadIds).map(id => ({
      id,
      date: new Date().toISOString(),
      filename: id === 'manual' ? 'Manually Added' : `Upload ${id}`,
      records: entries.filter(e => e.upload_id === id).length
    }));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    let filtered = entries;

    if (!selectedFilter) {
      filtered = filtered.filter(entry => !entry.deleted);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.name.toLowerCase().includes(search) ||
        entry.description?.toLowerCase().includes(search)
      );
    }

    if (selectedFilter) {
      filtered = filtered.filter(entry => entry.upload_id === selectedFilter);
    }

    return filtered;
  }, [entries, searchTerm, selectedFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pricebook</h1>
        </div>
        <button
          onClick={() => setShowNewItemModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Item</span>
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm">
        <button
          onClick={() => setIsUploadOpen(!isUploadOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <span className="text-lg font-semibold">Import Pricebook</span>
          {isUploadOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {isUploadOpen && (
          <div className="p-6 border-t">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <FileDropzone onFileAccepted={handleFileAccepted} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Previous Uploads</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between"
                    >
                      <button
                        onClick={() => setSelectedFilter(upload.id || null)}
                        className={`flex-1 text-left p-4 rounded-lg transition-colors ${
                          selectedFilter === upload.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-medium">{upload.filename}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(upload.date).toLocaleDateString()} • {upload.records} records
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteUpload(upload.id || '')}
                        className="ml-2 p-2 text-gray-500 hover:text-red-500 rounded-lg"
                        title="Delete Upload"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <select
          value={selectedFilter || ''}
          onChange={(e) => setSelectedFilter(e.target.value || null)}
          className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Items</option>
          {uploads.map((upload) => (
            <option key={upload.id} value={upload.id}>
              {upload.filename}
            </option>
          ))}
        </select>
      </div>

      {/* Pricebook Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <DataTable<PricebookEntry>
          data={filteredEntries}
          columns={['name', 'price', 'description']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUndelete={handleUndelete}
        />
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Edit Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={showEditModal.name}
                  onChange={(e) => setShowEditModal({ ...showEditModal, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={showEditModal.price}
                  onChange={(e) => setShowEditModal({ ...showEditModal, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={showEditModal.description}
                  onChange={(e) => setShowEditModal({ ...showEditModal, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Item</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this item? This action can be undone later.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {showNewItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">New Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowNewItemModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Upload Confirmation Modal */}
      {showDeleteUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Upload</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this upload? This will remove all items associated with this upload.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteUploadModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUpload}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricebookUpload;