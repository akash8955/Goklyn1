import React, { useState } from 'react';
import UpdateProfileForm from '../components/settings/UpdateProfileForm';
import ChangePasswordForm from '../components/settings/ChangePasswordForm';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <UpdateProfileForm />;
      case 'security':
        return <ChangePasswordForm />;
      default:
        return <UpdateProfileForm />;
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <div className="settings-layout">
        <div className="settings-nav">
          <ul>
            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </li>
            <li
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              Security
            </li>
          </ul>
        </div>
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
