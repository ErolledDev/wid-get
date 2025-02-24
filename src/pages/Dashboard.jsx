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
    salesRepName: ''
  });
  const [showCode, setShowCode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [widgetInstance, setWidgetInstance] = useState(null);

  useEffect(() => {
    if (session?.user?.id) {
      getSettings();
    }
  }, [session]);

  // Initialize widget only once after settings are loaded
  useEffect(() => {
    if (!loading && session?.user?.id && !widgetInstance) {
      initializeWidget();
    }
  }, [loading, session]);

  const initializeWidget = () => {
    // Remove existing widget if any
    const existingWidget = document.querySelector('.chat-widget');
    if (existingWidget) {
      existingWidget.remove();
    }

    // Initialize new widget with current settings
    if (window.ChatWidget) {
      const widget = new window.ChatWidget({
        uid: session.user.id,
        ...settings
      });
      setWidgetInstance(widget);
    } else {
      // Load the widget script if not already loaded
      const script = document.createElement('script');
      script.src = '/src/chat.js';
      script.type = 'module';
      script.onload = () => {
        const widget = new window.ChatWidget({
          uid: session.user.id,
          ...settings
        });
        setWidgetInstance(widget);
      };
      document.head.appendChild(script);
    }
  };

  async function getSettings() {
    try {
      setLoading(true);
      
      // Fetch the settings first
      const { data, error } = await supabase
        .from('widget_settings')
        .select('primary_color, business_name, business_info, sales_rep_name')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data) {
        setSettings({
          primaryColor: data.primary_color || '#2563eb',
          businessName: data.business_name || '',
          businessInfo: data.business_info || '',
          salesRepName: data.sales_rep_name || ''
        });
        setShowCode(true);
      } else {
        // If no settings exist, create default settings
        const { error: upsertError } = await supabase
          .from('widget_settings')
          .insert({
            user_id: session.user.id,
            primary_color: settings.primaryColor,
            business_name: settings.businessName,
            business_info: settings.businessInfo,
            sales_rep_name: settings.salesRepName
          });

        if (upsertError) throw upsertError;
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
          sales_rep_name: settings.salesRepName
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Update widget with new settings only if it exists
      if (widgetInstance) {
        widgetInstance.options = {
          ...widgetInstance.options,
          ...settings
        };
        widgetInstance.updateWidgetStyles();
        widgetInstance.updateWidgetContent();
      }

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
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const getWidgetCode = () => {
    const currentOrigin = window.location.origin;
    const crossOriginAttr = currentOrigin.includes('localhost') ? '' : ' crossorigin="anonymous"';
    return `<!-- AI Chat Widget -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${currentOrigin}/chat.js';
  script.async = true;${crossOriginAttr}
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
                <div className="grid grid-cols-1 gap-4">
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
                      Business Information
                    </label>
                    <textarea
                      rows={3}
                      value={settings.businessInfo}
                      onChange={(e) => setSettings({ ...settings, businessInfo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter information about your business..."
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