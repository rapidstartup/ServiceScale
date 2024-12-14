import React, { useState, useMemo } from 'react';
import { parse } from 'papaparse';
import { Users, Plus, ChevronDown, ChevronUp, Database, FileText, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FileDropzone from './shared/FileDropzone';
import DataTable from './shared/DataTable';
import { useCustomerStore } from '../store/customerStore';
import { getPropertyData } from '../services/attomApi';
import { calculateHVACZones } from '../utils/hvacCalculator';
import { useQuoteStore } from '../store/quoteStore';
import { usePricebookStore } from '../store/pricebookStore';
import { Customer } from '../store/customerStore';
import { useTemplateStore } from '../store/templateStore';

interface CSVRow {
  [key: string]: string | undefined;
  Names?: string;
  Name?: string;
  names?: string;
  Address1?: string;
  'Address 1'?: string;
  address1?: string;
  address?: string;
  City?: string;
  city?: string;
  State?: string;
  state?: string;
  PostalCode?: string;
  'Postal Code'?: string;
  postalcode?: string;
  postal_code?: string;
  zip?: string;
  Email?: string;
}

const CustomerUpload: React.FC = () => {
  const { customers, addCustomers, removeCustomersByUploadId, updateCustomer, deleteCustomer, undeleteCustomer } = useCustomerStore();
  const { entries: pricebookEntries } = usePricebookStore();
  const { addQuote } = useQuoteStore();
  const { templates } = useTemplateStore();
  const [isUploadOpen, setIsUploadOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isLoadingPropertyData, setIsLoadingPropertyData] = useState(false);
  const [isGeneratingQuotes, setIsGeneratingQuotes] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Customer | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Customer | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showDeleteUploadModal, setShowDeleteUploadModal] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    uploadId: '',
    propertyType: '',
    city: '',
    state: '',
    yearBuilt: '',
    hvacZones: ''
  });

  const [newCustomer, setNewCustomer] = useState({
    Names: '',
    Address1: '',
    City: '',
    State: '',
    PostalCode: '',
    CombinedAddress: '',
    uploadId: 'manual'
  });

  const [showColumnMapModal, setShowColumnMapModal] = useState(false);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvFirstRow, setCsvFirstRow] = useState<Record<string, string>>({});
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: ''
  });
  const [pendingFileData, setPendingFileData] = useState<string | null>(null);

  const handleEdit = (customer: Customer) => {
    setShowEditModal(customer);
  };

  const handleDelete = (customer: Customer) => {
    setShowDeleteModal(customer);
  };

  const handleUndelete = (customer: Customer) => {
    undeleteCustomer(customer.id);
    toast.success('Customer restored successfully');
  };

  const handleSaveEdit = () => {
    if (showEditModal) {
      updateCustomer(showEditModal.id, showEditModal);
      setShowEditModal(null);
      toast.success('Customer updated successfully');
    }
  };

  const handleConfirmDelete = () => {
    if (showDeleteModal) {
      deleteCustomer(showDeleteModal.id);
      setShowDeleteModal(null);
      toast.success('Customer deleted successfully');
    }
  };

  const handleCreateCustomer = () => {
    const customer = {
      ...newCustomer,
      CombinedAddress: `${newCustomer.Address1}, ${newCustomer.City}, ${newCustomer.State} ${newCustomer.PostalCode}`.trim()
    };

    addCustomers([customer as unknown as Customer], 'manual');
    setShowNewCustomerModal(false);
    setNewCustomer({
      Names: '',
      Address1: '',
      City: '',
      State: '',
      PostalCode: '',
      CombinedAddress: '',
      uploadId: 'manual'
    });
    toast.success('Customer created successfully');
  };

  const handleDeleteUpload = (uploadId: string) => {
    setShowDeleteUploadModal(uploadId);
  };

  const handleConfirmDeleteUpload = async () => {
    if (showDeleteUploadModal) {
      await removeCustomersByUploadId(showDeleteUploadModal);
      setShowDeleteUploadModal(null);
      toast.success('Upload deleted successfully');
    }
  };

  const filterOptions = useMemo(() => {
    return {
      uploads: Array.from(new Set(customers.map(c => c.uploadId)))
        .filter((id): id is string => id !== undefined && id !== null)
        .map(id => ({
          id,
          name: id === 'manual' ? 'Manually Added' : `Upload ${id}`,
          count: customers.filter(c => c.uploadId === id).length
        })),
      propertyTypes: Array.from(new Set(customers.map(c => c.propertyType))).filter(Boolean),
      cities: Array.from(new Set(customers.map(c => c.city))).filter(Boolean),
      states: Array.from(new Set(customers.map(c => c.state))).filter(Boolean),
      years: Array.from(new Set(customers.map(c => c.yearBuilt))).filter(Boolean),
      hvacZones: ['1', '2', '3', '4'].map(zones => ({
        value: zones,
        label: `${zones} ${zones === '1' ? 'Zone' : 'Zones'}`
      }))
    };
  }, [customers]);

  const handleFileAccepted = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const results = parse(csv, {
          header: true,
          skipEmptyLines: true,
          preview: 1
        });

        if (results.errors.length) {
          toast.error('Error parsing CSV file');
          return;
        }

        setCsvHeaders(results.meta.fields || []);
        setCsvFirstRow((results.data[0] || {}) as Record<string, string>);
        setPendingFileData(csv);
        setShowColumnMapModal(true);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to process the file');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmMapping = () => {
    if (!pendingFileData) return;

    try {
      const results = parse<CSVRow>(pendingFileData, {
        header: true,
        skipEmptyLines: true,
      });

      if (results.errors.length) {
        toast.error('Error parsing CSV file');
        return;
      }

      const uploadId = Date.now().toString();
      const mappedData = results.data.map(row => ({
        name: row.Names || row.Name || row.names || '',
        email: row.Email || '',
        address: row.Address1 || row['Address 1'] || row.address1 || row.address || '',
        city: row.City || row.city || '',
        state: row.State || row.state || '',
        propertyType: '',
        propertySize: '',
        yearBuilt: '',
        uploadId
      }));

      addCustomers(mappedData, uploadId);
      toast.success('Customer data uploaded successfully');
      setShowColumnMapModal(false);
      setPendingFileData(null);
      setColumnMapping({
        name: '',
        email: '',
        address: '',
        city: '',
        state: ''
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process the file');
    }
  };

  const handleGetPropertyData = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    setIsLoadingPropertyData(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const customersToProcess = filteredCustomers.filter(c => 
        selectedCustomers.includes(c.id) && !c.deleted
      );

      for (const customer of customersToProcess) {
        try {
          const propertyData = await getPropertyData(
            customer.address,
            customer.city,
            customer.state
          );

          updateCustomer(customer.id, {
            ...customer,
            propertyType: propertyData.propertyType,
            propertySize: propertyData.propertySize,
            yearBuilt: propertyData.yearBuilt,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            lotSize: propertyData.lotSize
          });

          successCount++;
        } catch (error) {
          console.error('Error processing customer:', customer.id, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully enriched ${successCount} customer records`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to process ${errorCount} records`);
      }
    } finally {
      setIsLoadingPropertyData(false);
    }
  };

  const handleGenerateQuotes = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    setIsGeneratingQuotes(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const customersToProcess = filteredCustomers.filter(c => 
        selectedCustomers.includes(c.id) && !c.deleted
      );

      for (const customer of customersToProcess) {
        try {
          const zones = calculateHVACZones({
            grossSquareFootage: parseInt(customer.propertySize?.replace(/[^0-9]/g, '') || '0'),
            basementSquareFootage: 0,
            livingSquareFootage: parseInt(customer.propertySize?.replace(/[^0-9]/g, '') || '0'),
            hasBasement: 'N',
            fullBaths: parseFloat(customer.bathrooms || '0'),
            halfBaths: 0
          });

          const basePrice = pricebookEntries.find(entry => entry.name === 'Base HVAC System')?.price || 5000;
          const zonePrice = pricebookEntries.find(entry => entry.name === 'Additional Zone')?.price || 2500;
          const total = basePrice + (zones - 1) * zonePrice;

          addQuote({
            status: 'active',
            customer_id: customer.id,
            service: `${zones}-Zone HVAC System`,
            total,
            template_id: templates.find(t => t.is_default)?.id || '',
            created_at: new Date().toISOString(),
            property_details: {
              address: {
                streetAddress: customer.address,
                city: customer.city,
                state: customer.state
              },
              type: customer.propertyType || 'Single Family',
              size: customer.propertySize || '2,500 sqft',
              yearBuilt: customer.yearBuilt || '2000',
              bedrooms: customer.bedrooms || '3',
              bathrooms: customer.bathrooms || '2'
            }
          });

          successCount++;
        } catch (error) {
          console.error('Error generating quote for customer:', customer.id, error);
          errorCount++;
        }
      }

      toast.success(`Successfully generated ${successCount} quotes`);
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} quotes`);
      }
      
      setSelectedCustomers([]);
    } finally {
      setIsGeneratingQuotes(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.address.toLowerCase().includes(search)
      );
    }

    if (filters.uploadId) {
      filtered = filtered.filter(customer => customer.uploadId === filters.uploadId);
    }

    if (filters.propertyType) {
      filtered = filtered.filter(customer => customer.propertyType === filters.propertyType);
    }

    if (filters.city) {
      filtered = filtered.filter(customer => customer.city === filters.city);
    }

    if (filters.state) {
      filtered = filtered.filter(customer => customer.state === filters.state);
    }

    if (filters.yearBuilt) {
      filtered = filtered.filter(customer => customer.yearBuilt === filters.yearBuilt);
    }

    if (filters.hvacZones) {
      filtered = filtered.filter(customer => {
        const zones = calculateHVACZones({
          grossSquareFootage: parseInt(customer.propertySize?.replace(/[^0-9]/g, '') || '0'),
          basementSquareFootage: 0,
          livingSquareFootage: parseInt(customer.propertySize?.replace(/[^0-9]/g, '') || '0'),
          hasBasement: 'N',
          fullBaths: parseFloat(customer.bathrooms || '0'),
          halfBaths: 0
        });
        return zones.toString() === filters.hvacZones;
      });
    }

    return filtered;
  }, [customers, searchTerm, filters]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedCustomers(checked ? filteredCustomers.map(c => c.id) : []);
  };

  const handleSelectCustomer = (id: string, checked: boolean) => {
    setSelectedCustomers(prev =>
      checked ? [...prev, id] : prev.filter(customerId => customerId !== id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGetPropertyData}
            disabled={isLoadingPropertyData || selectedCustomers.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Database className="h-4 w-4" />
            <span>{isLoadingPropertyData ? 'Loading...' : 'Get Property Data'}</span>
          </button>
          <button
            onClick={handleGenerateQuotes}
            disabled={isGeneratingQuotes || selectedCustomers.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            <span>{isGeneratingQuotes ? 'Generating...' : 'Generate Quotes'}</span>
          </button>
          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <button
          onClick={() => setIsUploadOpen(!isUploadOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <span className="text-lg font-semibold">Import Customers</span>
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
                  {filterOptions.uploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between"
                    >
                      <button
                        onClick={() => setFilters({ ...filters, uploadId: upload.id })}
                        className={`flex-1 text-left p-4 rounded-lg transition-colors ${
                          filters.uploadId === upload.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <p className="font-medium">{upload.name}</p>
                        <p className="text-sm text-gray-600">
                          {upload.count} records
                        </p>
                      </button>
                      <button
                        onClick={() => handleDeleteUpload(upload.id)}
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

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={filters.propertyType}
              onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Property Types</option>
              {filterOptions.propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All States</option>
              {filterOptions.states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            
            <select
              value={filters.yearBuilt}
              onChange={(e) => setFilters({ ...filters, yearBuilt: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Years</option>
              {filterOptions.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.hvacZones}
              onChange={(e) => setFilters({ ...filters, hvacZones: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All HVAC Zones</option>
              {filterOptions.hvacZones.map(zone => (
                <option key={zone.value} value={zone.value}>{zone.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <DataTable
          data={filteredCustomers}
          columns={['name', 'email', 'address', 'city', 'state', 'propertyType', 'propertySize', 'yearBuilt', 'bedrooms', 'bathrooms', 'lotSize']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUndelete={handleUndelete}
          selectedIds={selectedCustomers}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectCustomer}
        />
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={showEditModal.email}
                  onChange={(e) => setShowEditModal({ ...showEditModal, email: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={showEditModal.address}
                  onChange={(e) => setShowEditModal({ ...showEditModal, address: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={showEditModal.city}
                    onChange={(e) => setShowEditModal({ ...showEditModal, city: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={showEditModal.state}
                    onChange={(e) => setShowEditModal({ ...showEditModal, state: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Customer</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this customer? This action can be undone later.
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

      {showNewCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">New Customer</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newCustomer.Names}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Names: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newCustomer.Address1}
                  onChange={(e) => setNewCustomer({ ...newCustomer, Address1: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newCustomer.City}
                    onChange={(e) => setNewCustomer({ ...newCustomer, City: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newCustomer.State}
                    onChange={(e) => setNewCustomer({ ...newCustomer, State: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={newCustomer.PostalCode}
                  onChange={(e) => setNewCustomer({ ...newCustomer, PostalCode: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {showColumnMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Map CSV Columns</h2>
            <p className="text-gray-600 mb-6">
              Please map your CSV columns to the required fields. Preview of first row shown below.
            </p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries({
                  name: 'Customer Name',
                  email: 'Email',
                  address: 'Address',
                  city: 'City',
                  state: 'State'
                }).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <select
                      value={columnMapping[field]}
                      onChange={(e) => setColumnMapping({
                        ...columnMapping,
                        [field]: e.target.value
                      })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select column</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header} {csvFirstRow[header] ? `(e.g., ${csvFirstRow[header]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowColumnMapModal(false);
                  setPendingFileData(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMapping}
                disabled={!Object.values(columnMapping).every(Boolean)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Upload</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this upload? This will remove all customers associated with this upload.
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

export default CustomerUpload;