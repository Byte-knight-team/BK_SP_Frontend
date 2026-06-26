import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Mail, Phone, Lock, MapPin, Zap, Save, X, LogOut, Loader2, Camera, Trash2, BarChart3 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import EditableSection from '../../components/customer/EditableSection';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import { useCart } from '../../context/CartContext';
import { getCustomerProfile, updateCustomerPassword, updateCustomerProfile, createProfilePicturePresignUrl, updateProfilePictureKey, removeProfilePicture } from '../../apis/customer/profile';
import { uploadFileToPresignedUrl } from '../../apis/customer/orders';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AccountPage() {
  const navigate = useNavigate();
  const [editingSection, setEditingSection] = useState(null);
  const { clearCart } = useCart();
  
  const [formData, setFormData] = useState({});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: profile, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      const res = await getCustomerProfile();
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || 'Failed to load profile.');
      return payload.data;
    }
  });

  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
    if (profile) {
      setFormData(profile);
      if (profile.profilePictureUrl) {
        localStorage.setItem('customer_profile_pic', profile.profilePictureUrl);
      } else {
        localStorage.removeItem('customer_profile_pic');
      }
      window.dispatchEvent(new Event('profile_picture_updated'));
    }
  }, [profile, queryError]);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Profile picture must be under 5MB');
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP formats are supported');
      return;
    }

    setIsUploadingImage(true);
    try {
      // 1. Get presigned URL
      const presignRes = await createProfilePicturePresignUrl(file.name, file.type);
      const presignPayload = await presignRes.json().catch(() => ({}));
      if (!presignRes.ok) throw new Error(presignPayload?.message || 'Failed to get upload URL');

      const { uploadUrl, objectKey } = presignPayload.data;

      // 2. Upload to S3 directly
      const uploadRes = await uploadFileToPresignedUrl(uploadUrl, file);
      if (!uploadRes.ok) throw new Error('Failed to upload image to S3');

      // 3. Update backend
      const updateRes = await updateProfilePictureKey(objectKey);
      const updatePayload = await updateRes.json().catch(() => ({}));
      if (!updateRes.ok) throw new Error(updatePayload?.message || 'Failed to update profile picture');

      // 4. Reload profile to get the new GET URL
      await refetch();
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePicture = async () => {
    if (!profile?.profilePictureUrl) return;
    
    setIsUploadingImage(true);
    try {
      const res = await removeProfilePicture();
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to remove picture');
      }
      
      await refetch();
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleEdit = (section) => {
    setError('');
    setFormData(profile);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setEditingSection(section);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Save Profile Updates (Email, Phone, Username, Address)
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');

    try {
      const res = await updateCustomerProfile({
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to update profile.');
      }

      await refetch();
      setEditingSection(null);
      toast.success('Profile updated successfully!');
      
      // If they changed their username, update local storage so the Navbar reflects it
      localStorage.setItem('customer_name', payload.data.username);

    } catch (err) {
      setError(err.message);
    } finally {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSaving(false);
    }
  };

  // 3. Save Password Update
  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const res = await updateCustomerPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to update password.');
      }

      setEditingSection(null);
      toast.success('Password changed successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_jwt');
    localStorage.removeItem('customer_user_id');
    localStorage.removeItem('customer_name');
    clearCart(); 
    navigate('/menu', { replace: true });
  };

  if (isLoading) {
    return (
      <CustomerPageShell maxWidth="max-w-3xl">
        <CustomerStateCard
          variant="loading"
          title="Loading your profile"
          description="We’re fetching your account details and loyalty information."
          className="mx-auto max-w-2xl"
        />
      </CustomerPageShell>
    );
  }

  return (
    <CustomerPageShell maxWidth="max-w-3xl">
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

        {/* Global Notifications */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Profile Card */}
        {profile && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] mb-4">
            <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col items-center">
              <BrandLogo />
              <h1 className="mt-3 text-3xl font-bold">My Account</h1>
            </div>

            {/* Account Summary */}
            <div className="border-b border-slate-200 px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xl font-bold text-slate-900">{profile.username}</p>
                  <p className="mt-1 text-xs text-slate-400">Member since {profile.memberSince}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div 
                    className="relative group cursor-pointer" 
                    onClick={handleAvatarClick}
                    title="Change profile picture"
                  >
                    <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-full bg-orange-100 border-2 border-transparent group-hover:border-orange-300 transition-all shadow-sm">
                      {isUploadingImage ? (
                         <Loader2 size={24} className="text-orange-500 animate-spin" />
                      ) : profile.profilePictureUrl ? (
                         <img src={profile.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                         <User size={28} className="text-orange-500" />
                      )}
                    </div>
                    
                    {/* Camera Icon Overlay on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {/* Remove button if picture exists */}
                  {profile.profilePictureUrl && !isUploadingImage && (
                    <button 
                      onClick={handleRemovePicture}
                      className="flex items-center gap-1 mt-1 mr-2 text-[10px] font-medium text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={10} /> Remove
                    </button>
                  )}
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
                    <p className="text-2xl font-bold text-slate-900">{profile.loyaltyPoints || 0}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
              
              <button 
                onClick={() => navigate('/statistics')}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <BarChart3 size={18} className="text-slate-500" />
                View Advanced Statistics
              </button>
            </div>

            {/* Static Email Section*/}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Mail size={18} className="text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</p>
                      <p className="mt-1 truncate text-sm text-slate-900 leading-relaxed">
                        {profile.email || 'No email linked'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-0 divide-y divide-slate-200">

              {/*EditableSections*/}

              <EditableSection
                icon={<Phone size={18} />}
                label="Phone Number"
                value={profile.phone}
                isEditing={editingSection === 'phone'}
                onEdit={() => handleEdit('phone')}
                onCancel={handleCancel}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                fieldName="phone"
                formValue={formData.phone}
                onChange={handleChange}
                type="tel"
              />

              <EditableSection
                icon={<User size={18} />}
                label="Username"
                value={`@${profile.username}`}
                isEditing={editingSection === 'username'}
                onEdit={() => handleEdit('username')}
                onCancel={handleCancel}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                fieldName="username"
                formValue={formData.username}
                onChange={handleChange}
                type="text"
              />

              <EditableSection
                icon={<MapPin size={18} />}
                label="Delivery Address"
                value={profile.address || 'No address provided'}
                isEditing={editingSection === 'address'}
                onEdit={() => handleEdit('address')}
                onCancel={handleCancel}
                onSave={handleSaveProfile}
                isSaving={isSaving}
                fieldName="address"
                formValue={formData.address}
                onChange={handleChange}
                type="text"
                isTextarea={true}
              />

              {/* Password Section */}
              <div className="px-6 py-4">
                {editingSection !== 'password' ? (
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
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                        <Lock size={18} className="text-orange-500" />
                      </div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Change Password</p>
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-lg border border-orange-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                    />
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className="flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-70"
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </CustomerPageShell>
  );
}