import { useState } from 'react';
import Avatar from '../../components/common/Avatar';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { ROLE_LABELS } from '../../utils/constants';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({ name: user.name, avatar: user.avatar || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [savingPwd, setSavingPwd] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await userService.update(user._id, { name: profile.name.trim(), avatar: profile.avatar });
      updateUser({ name: updated.name, avatar: updated.avatar });
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update profile.'));
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    const errs = {};
    if (!pwd.currentPassword) errs.currentPassword = 'Current password is required.';
    if (!pwd.newPassword || pwd.newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters.';
    if (pwd.newPassword !== pwd.confirm) errs.confirm = 'Passwords do not match.';
    setPwdErrors(errs);
    if (Object.keys(errs).length) return;

    setSavingPwd(true);
    try {
      await userService.update(user._id, {
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      toast.success('Password changed.');
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to change password.'));
    } finally {
      setSavingPwd(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Profile</h1>

      {/* Identity */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} src={user.avatar} size="lg" />
          <div>
            <p className="font-semibold text-ink text-lg">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <Badge tone="blue" className="mt-1">
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </div>
      </div>

      {/* Update profile */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-ink mb-4">Update Profile</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input
            label="Avatar URL (optional)"
            placeholder="https://…"
            value={profile.avatar}
            onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
          />
          <Input label="Email" value={user.email} disabled />
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-ink mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <Input
            type="password"
            label="Current Password"
            value={pwd.currentPassword}
            onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
            error={pwdErrors.currentPassword}
            autoComplete="current-password"
          />
          <Input
            type="password"
            label="New Password"
            value={pwd.newPassword}
            onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
            error={pwdErrors.newPassword}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Confirm New Password"
            value={pwd.confirm}
            onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            error={pwdErrors.confirm}
            autoComplete="new-password"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={savingPwd}>
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
