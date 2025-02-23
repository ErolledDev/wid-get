import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { ClipboardDocumentIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    primaryColor: '#2563eb',
    businessName: '',
    businessInfo: '',
    salesRepName: '',
    productsServices: [],
    pricingInfo: {},
    targetAudience: '',
    uniqueSellingPoints: [],
    commonQuestions: {},
    salesApproach: '',
    competitorInfo: '',
    promotionInfo: {}
  });
  const [showCode, setShowCode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newProduct, setNewProduct] = useState('');
  const [newUSP, setNewUSP] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      getSettings();
    }
  }, [session]);

  // Initialize chat widget when settings change
  useEffect(() => {
    if (window.ChatWidget && session?.user?.id && !loading) {
      // Remove existing widget if any
      const existingWidget = document.querySelector('.chat-widget');
      if (existingWidget) {
        existingWidget.remove();
      }

      // Initialize new widget with current settings
      new window.ChatWidget({
        uid: session.user.id,
        ...settings
      });
    }
  }, [settings, session, loading]);

  async function getSettings() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('widget_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          primaryColor: data.primary_color,
          businessName: data.business_name,
          businessInfo: data.business_info,
          salesRepName: data.sales_rep_name,
          productsServices: data.products_services || [],
          pricingInfo: data.pricing_info || {},
          targetAudience: data.target_audience || '',
          uniqueSellingPoints: data.unique_selling_points || [],
          commonQuestions: data.common_questions || {},
          salesApproach: data.sales_approach || '',
          competitorInfo: data.competitor_info || '',
          promotionInfo: data.promotion_info || {}
        });
        setShowCode(true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Error loading settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings() {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('widget_settings')
        .upsert({
          user_id: session.user.id,
          primary_color: settings.primaryColor,
          business_name: settings.businessName,
          business_info: settings.businessInfo,
          sales_rep_name: settings.salesRepName,
          products_services: settings.productsServices,
          pricing_info: settings.pricingInfo,
          target_audience: settings.targetAudience,
          unique_selling_points: settings.uniqueSellingPoints,
          common_questions: settings.commonQuestions,
          sales_approach: settings.salesApproach,
          competitor_info: settings.competitorInfo,
          promotion_info: settings.promotionInfo
        });

      if (error) throw error;
      toast.success('Settings saved successfully!');
      setShowCode(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setSettings({
        ...settings,
        productsServices: [...settings.productsServices, newProduct.trim()]
      });
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (index) => {
    setSettings({
      ...settings,
      productsServices: settings.productsServices.filter((_, i) => i !== index)
    });
  };

  const handleAddUSP = () => {
    if (newUSP.trim()) {
      setSettings({
        ...settings,
        uniqueSellingPoints: [...settings.uniqueSellingPoints, newUSP.trim()]
      });
      setNewUSP('');
    }
  };

  const handleRemoveUSP = (index) => {
    setSettings({
      ...settings,
      uniqueSellingPoints: settings.uniqueSellingPoints.filter((_, i) => i !== index)
    });
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const getWidgetCode = () => {
    return `<!-- AI Chat Widget -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = 'https://chatwidgetai.netlify.app/chat.js';
  script.async = true;
  script.onload = function() {
    new ChatWidget({
      uid: '${session.user.id}'
    });
  };
  document.head.appendChild(script);
})();
</script>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getWidgetCode());
      toast.success('Widget code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Failed to copy code. Please try selecting and copying manually.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-indigo-600 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Chat Widget Settings
            </h1>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 text-sm text-white hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Basic Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full h-10 rounded-lg border shadow-sm"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      {showColorPicker && (
                        <div className="absolute z-10 mt-2">
                          <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                          <HexColorPicker
                            color={settings.primaryColor}
                            onChange={(color) => setSettings({ ...settings, primaryColor: color })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Representative Name
                    </label>
                    <input
                      type="text"
                      value={settings.salesRepName}
                      onChange={(e) => setSettings({ ...settings, salesRepName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter sales rep name"
                    />
                  </div>
                </div>
              </div>

              {/* Products & Services */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Products & Services</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Add a product or service"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {settings.productsServices.map((product, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                        <span>{product}</span>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Audience */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Target Audience</h2>
                <textarea
                  rows={3}
                  value={settings.targetAudience}
                  onChange={(e) => setSettings({ ...settings, targetAudience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your ideal customer profile and target market..."
                />
              </div>

              {/* Unique Selling Points */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Unique Selling Points</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUSP}
                      onChange={(e) => setNewUSP(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Add a unique selling point"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddUSP()}
                    />
                    <button
                      onClick={handleAddUSP}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {settings.uniqueSellingPoints.map((usp, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded-lg">
                        <span>{usp}</span>
                        <button
                          onClick={() => handleRemoveUSP(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales Approach */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Approach</h2>
                <textarea
                  rows={3}
                  value={settings.salesApproach}
                  onChange={(e) => setSettings({ ...settings, salesApproach: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your preferred sales approach and conversation tone..."
                />
              </div>

              {/* Competitor Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Competitor Information</h2>
                <textarea
                  rows={3}
                  value={settings.competitorInfo}
                  onChange={(e) => setSettings({ ...settings, competitorInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your competitors and market positioning..."
                />
              </div>
            </div>

            <button
              onClick={updateSettings}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>

            {showCode && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    Install Widget on Your Website
                  </h2>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                    Copy Code
                  </button>
                </div>
                <div className="relative">
                  <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
                    <code>{getWidgetCode()}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Load chat widget script */}
      <script type="module" src="/src/chat.js"></script>
    </div>
  );
}