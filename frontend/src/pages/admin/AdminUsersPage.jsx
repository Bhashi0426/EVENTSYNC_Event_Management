import { useEffect, useState, useCallback } from 'react';
import { Search, ShieldCheck, Ban, CircleCheck } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import userService from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { ROLE_LABELS } from '../../utils/constants';
import useDebounce from '../../hooks/useDebounce';

const ROLE_TONE = { admin: 'red', organizer: 'blue', participant: 'gray' };

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ users: [], pagination: { totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [roleTarget, setRoleTarget] = useState(null); // user being edited
  const [newRole, setNewRole] = useState('participant');
  const [savingRole, setSavingRole] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      const result = await userService.list(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  function openRoleModal(u) {
    setRoleTarget(u);
    setNewRole(u.role === 'organizer' ? 'organizer' : 'participant');
  }

  async function saveRole() {
    setSavingRole(true);
    try {
      await userService.changeRole(roleTarget._id, newRole);
      toast.success('Role updated successfully.');
      setRoleTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update role.'));
    } finally {
      setSavingRole(false);
    }
  }

  async function toggleStatus() {
    setSavingStatus(true);
    const next = statusTarget.status === 'active' ? 'disabled' : 'active';
    try {
      await userService.changeStatus(statusTarget._id, next);
      toast.success(`User ${next === 'disabled' ? 'disabled' : 'enabled'}.`);
      setStatusTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to update status.'));
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-1">User Management</h1>
      <p className="text-muted text-sm mb-6">Manage roles and account status.</p>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          placeholder="All roles"
          options={[
            { value: 'participant', label: 'Participant' },
            { value: 'organizer', label: 'Organizer' },
            { value: 'admin', label: 'Admin' },
          ]}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      {loading ? (
        <Spinner label="Loading users…" className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-muted text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => {
                    const isSelf = u._id === me._id;
                    const isAdmin = u.role === 'admin';
                    return (
                      <tr key={u._id} className="border-t border-line">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={u.name} src={u.avatar} size="sm" />
                            <span className="font-medium text-ink">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted hidden md:table-cell">{u.email}</td>
                        <td className="px-4 py-3">
                          <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={u.status === 'active' ? 'green' : 'red'}>
                            {u.status === 'active' ? 'Active' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              disabled={isAdmin}
                              onClick={() => openRoleModal(u)}
                              className="!px-2"
                              title="Change role"
                            >
                              <ShieldCheck size={16} /> Role
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={isAdmin || isSelf}
                              onClick={() => setStatusTarget(u)}
                              className={`!px-2 ${u.status === 'active' ? 'text-danger' : 'text-success'}`}
                              title={u.status === 'active' ? 'Disable' : 'Enable'}
                            >
                              {u.status === 'active' ? <Ban size={16} /> : <CircleCheck size={16} />}
                              {u.status === 'active' ? 'Disable' : 'Enable'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}

      {/* Role modal — admin is intentionally NOT an assignable option */}
      <Modal
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        title="Change Role"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={saveRole} loading={savingRole}>
              Save
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted mb-4">
          Update the role for <span className="font-medium text-ink">{roleTarget?.name}</span>.
        </p>
        <Select
          label="Role"
          options={[
            { value: 'participant', label: 'Participant' },
            { value: 'organizer', label: 'Organizer' },
          ]}
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
        />
      </Modal>

      <ConfirmDialog
        open={!!statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={toggleStatus}
        title={statusTarget?.status === 'active' ? 'Disable user?' : 'Enable user?'}
        message={
          statusTarget?.status === 'active'
            ? `${statusTarget?.name} will no longer be able to sign in.`
            : `${statusTarget?.name} will be able to sign in again.`
        }
        confirmLabel={statusTarget?.status === 'active' ? 'Disable' : 'Enable'}
        danger={statusTarget?.status === 'active'}
        loading={savingStatus}
      />
    </div>
  );
}
