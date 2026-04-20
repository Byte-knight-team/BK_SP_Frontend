import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, MapPin, Zap, Save, X, LogOut } from 'lucide-react';
import BrandLogo from '../components/Customer/BrandLogo';

export default function AccountPage() {
  const navigate = useNavigate();
  const [editingSection, setEditingSection] = useState(null);
  
  // Mock user data - in a real app, this would come from context/API
  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    username: 'johndoe92',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    loyaltyPoints: 2450,
    memberSince: 'March 2024',
  });

  const [formData, setFormData] = useState(profile);

  const handleEdit = (section) => {
    setFormData(profile);
    setEditingSection(section);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData(profile);
  };

  const handleSave = () => {
    setProfile(formData);
    setEditingSection(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-6">
      <div className="mx-auto w-full max-w-[600px]">
        {/* Header */}
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Menu
        </button>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] mb-4">
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
            <BrandLogo />
            <h1 className="mt-3 text-3xl font-bold">My Account</h1>
          </div>

          {/* Account Summary */}
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">{profile.fullName}</p>
                <p className="text-sm text-slate-500">@{profile.username}</p>
                <p className="mt-1 text-xs text-slate-400">Member since {profile.memberSince}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <User size={24} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Loyalty Points Section */}
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Zap size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600">Loyalty Points</p>
                  <p className="text-2xl font-bold text-slate-900">{profile.loyaltyPoints}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
          </div>

          {/* Editable Sections */}
          <div className="space-y-0 divide-y divide-slate-200">
            {/* Email Section */}
            <EditableSection
              icon={<Mail size={18} />}
              label="Email Address"
              value={profile.email}
              isEditing={editingSection === 'email'}
              onEdit={() => handleEdit('email')}
              onCancel={handleCancel}
              onSave={handleSave}
              fieldName="email"
              formValue={formData.email}
              onChange={handleChange}
              type="email"
            />

            {/* Phone Section */}
            <EditableSection
              icon={<Phone size={18} />}
              label="Phone Number"
              value={profile.phone}
              isEditing={editingSection === 'phone'}
              onEdit={() => handleEdit('phone')}
              onCancel={handleCancel}
              onSave={handleSave}
              fieldName="phone"
              formValue={formData.phone}
              onChange={handleChange}
              type="tel"
            />

            {/* Username Section */}
            <EditableSection
              icon={<User size={18} />}
              label="Username"
              value={`@${profile.username}`}
              isEditing={editingSection === 'username'}
              onEdit={() => handleEdit('username')}
              onCancel={handleCancel}
              onSave={handleSave}
              fieldName="username"
              formValue={formData.username}
              onChange={handleChange}
              type="text"
            />

            {/* Address Section */}
            <EditableSection
              icon={<MapPin size={18} />}
              label="Delivery Address"
              value={profile.address}
              isEditing={editingSection === 'address'}
              onEdit={() => handleEdit('address')}
              onCancel={handleCancel}
              onSave={handleSave}
              fieldName="address"
              formValue={formData.address}
              onChange={handleChange}
              type="text"
              isTextarea={true}
            />

            {/* Password Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <Lock size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Password</p>
                    <p className="text-xs text-slate-500">••••••••</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit('password')}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// Reusable Editable Section Component
function EditableSection({
  icon,
  label,
  value,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  fieldName,
  formValue,
  onChange,
  type = 'text',
  isTextarea = false,
}) {
  return (
    <div className="px-6 py-4">
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="mt-1 truncate text-sm text-slate-900 leading-relaxed">{value}</p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="ml-3 flex-shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
              {icon}
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
          {isTextarea ? (
            <textarea
              name={fieldName}
              value={formValue}
              onChange={onChange}
              rows="3"
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          ) : (
            <input
              type={type}
              name={fieldName}
              value={formValue}
              onChange={onChange}
              className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            />
          )}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
