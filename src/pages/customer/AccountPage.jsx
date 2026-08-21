import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Zap,
  Save,
  X,
  LogOut,
  Loader2,
  Camera,
  Trash2,
  BarChart3,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import EditableSection from '../../components/customer/EditableSection';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import { useCart } from '../../context/CartContext';
import {
  getCustomerProfile,
  updateCustomerPassword,
  updateCustomerProfile,
  createProfilePicturePresignUrl,
  updateProfilePictureKey,
  removeProfilePicture,
  requestEmailVerification
} from '../../apis/customer/profile';
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
  const [isSendingVerification, setIsSendingVerification] = useState(false);

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

  const handleRequestVerification = async () => {
    setIsSendingVerification(true);
    try {
      const res = await requestEmailVerification();
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || 'Failed to send verification email.');
      toast.success(payload?.message || 'Verification email sent successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to send verification email.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const SRI_LANKAN_PHONE_REGEX = /^(?:\+94|94|0)?7[0-9]{8}$/;

  const normalizePhone = (rawPhone) => {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/[\s\-]/g, '').trim();
    if (cleaned.startsWith('+94')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('94')) {
      cleaned = '0' + cleaned.substring(2);
    }
    return cleaned;
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
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // 2. Save Profile Updates (Email, Phone, Username, Address)
  const handleSaveProfile = async () => {
    setError('');

    // Specific client-side validation for Phone Number
    if (editingSection === 'phone') {
      const rawPhone = formData.phone?.trim() || '';
      if (!rawPhone) {
        setError('Phone number is required.');
        return;
      }
      const cleaned = rawPhone.replace(/[\s\-]/g, '');
      if (!SRI_LANKAN_PHONE_REGEX.test(cleaned)) {
        setError('Please enter a valid 10-digit Sri Lankan mobile number starting with 07 (e.g., 0712345678 or +94712345678).');
        return;
      }
    }

    // Specific client-side validation for Username
    if (editingSection === 'username') {
      const rawUsername = formData.username?.trim() || '';
      if (!rawUsername) {
        setError('Username cannot be empty.');
        return;
      }
    }

    setIsSaving(true);

    try {
      const normalizedPhone = normalizePhone(formData.phone);
      const res = await updateCustomerProfile({
        username: formData.username?.trim(),
        phone: normalizedPhone,
        address: formData.address?.trim(),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to update profile.');
      }

      await refetch();
      setEditingSection(null);
      toast.success('Profile updated successfully!');

      // If they changed their username, update local storage so the Navbar reflects it
      if (payload?.data?.username) {
        localStorage.setItem('customer_name', payload.data.username);
      }

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
            {/* Top Brand Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col items-center">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
              <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
              <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
                <BrandLogo />
              </div>
              <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">My Account</h1>
              <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium">Manage your profile, preferences, and security</p>
            </div>

            {/* Account Summary */}
            <div className="border-b border-slate-200/80 px-6 py-6 bg-slate-50/40">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar with Ring & Camera Button */}
                  <div
                    className="relative group cursor-pointer shrink-0"
                    onClick={handleAvatarClick}
                    title="Change profile picture"
                  >
                    <div className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-2xl bg-orange-100 border-2 border-white shadow-md group-hover:ring-2 group-hover:ring-orange-400 transition-all">
                      {isUploadingImage ? (
                        <Loader2 size={24} className="text-orange-500 animate-spin" />
                      ) : profile.profilePictureUrl ? (
                        <img src={profile.profilePictureUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User size={28} className="text-orange-500" />
                      )}
                    </div>
                    {/* Camera overlay icon */}
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={18} className="text-white" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Name & Handle */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-lg font-bold text-slate-900 truncate">{profile.username}</p>
                      {profile.emailVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 font-medium">Member since {profile.memberSince || '—'}</p>

                    {profile.profilePictureUrl && !isUploadingImage && (
                      <button
                        onClick={handleRemovePicture}
                        className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={11} /> Remove photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points Section */}
            <div className="border-b border-slate-200/80 px-6 py-5">
              <div className="flex items-center justify-between rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/40 p-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
                    <Zap size={22} className="fill-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600">Loyalty Points</p>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{profile.loyaltyPoints || 0}</p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-200/60 shadow-xs">
                  Active
                </span>
              </div>

              <button
                onClick={() => navigate('/statistics')}
                className="group mt-3.5 w-full flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-orange-50/70 hover:border-orange-200 px-4 py-2.5 transition-all shadow-xs hover:shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200/80 text-orange-500 shadow-xs group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all">
                    <BarChart3 size={15} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-orange-950 transition-colors">View Dining Insights</p>
                    <p className="text-[10px] text-slate-400 font-medium">Orders, spending & favorites</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                  <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </button>
            </div>

            {/* Static Email Section*/}
            <div className="px-6 py-4 transition-colors hover:bg-slate-50/50">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3.5">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 border border-slate-200/60 shadow-xs">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                      {profile.email && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md border ${profile.emailVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-red-50 text-red-700 border-red-200/80'}`}>
                          {profile.emailVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm font-medium text-slate-900 leading-normal">
                      {profile.email || 'No email linked'}
                    </p>
                  </div>
                </div>

                {profile.email && !profile.emailVerified && (
                  <button
                    onClick={handleRequestVerification}
                    disabled={isSendingVerification}
                    className="ml-3 flex-shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSendingVerification ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-0 divide-y divide-slate-200/70">

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
                placeholder="e.g. 0712345678"
                helperText="10 digits starting with 07"
                error={editingSection === 'phone' ? error : ''}
                maxLength={12}
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
              <div className="px-6 py-4 transition-colors hover:bg-slate-50/50">
                {editingSection !== 'password' ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-start gap-3.5">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 border border-slate-200/60 shadow-xs">
                        <Lock size={18} />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Password</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">••••••••••••</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit('password')}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 active:scale-95"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 rounded-2xl bg-orange-50/40 p-4 border border-orange-200/70">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                        <Lock size={16} />
                      </div>
                      <p className="text-xs font-bold text-orange-950 uppercase tracking-wider">Change Password</p>
                    </div>
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-100 placeholder:text-slate-400 shadow-xs"
                    />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-100 placeholder:text-slate-400 shadow-xs"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full rounded-xl border border-orange-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-orange-500 focus:ring-3 focus:ring-orange-100 placeholder:text-slate-400 shadow-xs"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-xs transition-colors hover:bg-slate-100 disabled:opacity-50"
                      >
                        <X size={13} /> Cancel
                      </button>
                      <button
                        onClick={handleSavePassword}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-70"
                      >
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
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
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/70 px-4 py-3.5 text-sm font-bold text-red-600 shadow-xs transition-all hover:bg-red-100 hover:border-red-300 active:scale-[0.99]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </CustomerPageShell>
  );
}