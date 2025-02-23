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
  });
  const [showCode, setShowCode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (session) {
      getSettings();
    }
  }, [session]);

  async function getSettings() {
    try {
      setLoading(true);
      
      let { data, error } = await supabase
        .from('widget_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const latestSettings = data[0];
        setSettings({
          primaryColor: latestSettings.primary_color,
          businessName: latestSettings.business_name,
          businessInfo: latestSettings.business_info,
          salesRepName: latestSettings.sales_rep_name,
        });
      } else {
        const defaultSettings = {
          user_id: session.user.id,
          primary_color: '#2563eb',
          business_name: '',
          business_info: '',
          sales_rep_name: '',
        };

        const { error: insertError } = await supabase
          .from('widget_settings')
          .insert(defaultSettings);

        if (insertError) throw insertError;
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
      
      await supabase
        .from('widget_settings')
        .delete()
        .eq('user_id', session.user.id);

      const { error } = await supabase
        .from('widget_settings')
        .insert({
          user_id: session.user.id,
          primary_color: settings.primaryColor,
          business_name: settings.businessName,
          business_info: settings.businessInfo,
          sales_rep_name: settings.salesRepName,
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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        toast.success('Signed out successfully');
        navigate('/');
      } else {
        throw error;
      }
    } catch (error) {
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
      primaryColor: '${settings.primaryColor}',
      businessName: '${settings.businessName}',
      businessInfo: '${settings.businessInfo}',
      salesRepName: '${settings.salesRepName}'
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Information
                </label>
                <textarea
                  rows={4}
                  value={settings.businessInfo}
                  onChange={(e) => setSettings({ ...settings, businessInfo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter information about your business, products, services, and any specific instructions for the AI..."
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
    </div>
  );
}