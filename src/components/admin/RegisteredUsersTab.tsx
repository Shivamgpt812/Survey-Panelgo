import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Mail,
  Shield,
  Briefcase,
  MapPin,
  Coins,
  CheckCircle2,
  Calendar,
  Search,
  Award,
  Layers,
  Eye,
  X,
  RefreshCw,
  Phone,
} from 'lucide-react';
import { PlayfulButton, PlayfulCard, PlayfulBadge } from '@/components/ui/playful';
import { IconCircle } from '@/components/decorations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiGet } from '@/lib/api';

export interface FullUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  panelType?: string;
  points?: number;
  surveysCompleted?: number;
  memberSince?: string;
  onboardingCompleted?: boolean;
  employmentStatus?: string;
  industry?: string;
  roleTitle?: string;
  department?: string;
  country?: string;
  revenue?: string;
  area?: string;
  city?: string;
  pincode?: string;
  rewardsRedeemed?: number;
  lastRedemption?: string;
  createdAt?: string;
}

const panelLabels: Record<string, string> = {
  b2b: 'B2B Enterprise',
  b2c: 'B2C Consumer',
  'patients-carers': 'Patients & Carers',
  'healthcare-professionals': 'Healthcare Professionals',
  general: 'General / Main Software',
};

export const RegisteredUsersTab: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<FullUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [panelFilter, setPanelFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<FullUser | null>(null);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGet<{ users: FullUser[] }>('/api/users', token);
      setUsers(res.users);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.roleTitle && u.roleTitle.toLowerCase().includes(q)) ||
        (u.industry && u.industry.toLowerCase().includes(q)) ||
        (u.country && u.country.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.panelType && u.panelType.toLowerCase().includes(q));

      const matchesPanel =
        panelFilter === 'all' ||
        (panelFilter === 'general' ? !u.panelType || u.panelType === 'general' : u.panelType === panelFilter);

      const matchesRole =
        roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesPanel && matchesRole;
    });
  }, [users, searchQuery, panelFilter, roleFilter]);

  const getPanelBadgeVariant = (p?: string) => {
    switch (p) {
      case 'b2b':
        return 'violet';
      case 'healthcare-professionals':
        return 'green';
      case 'patients-carers':
        return 'yellow';
      case 'b2c':
        return 'pink';
      default:
        return 'violet';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl text-navy mb-1 flex items-center gap-3">
            Registered Users & Panelists
          </h1>
          <p className="font-jakarta text-navy-light text-sm">
            Complete database profile records, demographics, panel affiliations, and rewards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PlayfulBadge variant="violet" size="md" leftIcon={<Users className="w-4 h-4" />}>
            {users.length} Total Accounts
          </PlayfulBadge>
          <PlayfulButton
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </PlayfulButton>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <PlayfulCard className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-light" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, industry, country..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-navy/20 focus:border-violet rounded-xl font-jakarta text-sm text-navy placeholder:text-navy-light/60 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-light hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel Type Filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-navy uppercase font-jakarta">
              <Layers className="w-3.5 h-3.5 text-violet" /> Panel Type
            </div>
            <select
              value={panelFilter}
              onChange={(e) => setPanelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-navy/20 focus:border-violet rounded-xl font-jakarta text-sm text-navy outline-none cursor-pointer"
            >
              <option value="all">All Panels & Portals</option>
              <option value="b2b">B2B Panel</option>
              <option value="b2c">B2C Panel</option>
              <option value="patients-carers">Patients & Carers</option>
              <option value="healthcare-professionals">Healthcare Professionals</option>
              <option value="general">General Users / Admins</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-navy uppercase font-jakarta">
              <Shield className="w-3.5 h-3.5 text-violet" /> Account Role
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-navy/20 focus:border-violet rounded-xl font-jakarta text-sm text-navy outline-none cursor-pointer"
            >
              <option value="all">All Roles (Admins & Users)</option>
              <option value="user">Panelists & Regular Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>
      </PlayfulCard>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-jakarta text-sm text-navy-light">Loading user records from database...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <PlayfulCard className="p-10 text-center">
          <IconCircle variant="yellow" size="xl" className="mx-auto mb-4">
            <Users className="w-8 h-8" />
          </IconCircle>
          <h3 className="font-outfit font-bold text-xl text-navy mb-2">No matching users found</h3>
          <p className="font-jakarta text-navy-light max-w-md mx-auto mb-5 text-sm">
            {searchQuery || panelFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your search criteria or filter options to find user records.'
              : 'No users have registered yet. New user and panelist accounts will appear here automatically.'}
          </p>
          {(searchQuery || panelFilter !== 'all' || roleFilter !== 'all') && (
            <PlayfulButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setPanelFilter('all');
                setRoleFilter('all');
              }}
            >
              Reset All Filters
            </PlayfulButton>
          )}
        </PlayfulCard>
      )}

      {/* Users Grid */}
      {!loading && filteredUsers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-navy font-semibold uppercase px-2 font-jakarta">
            <span>Showing {filteredUsers.length} of {users.length} total accounts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => {
              const isAdmin = u.role === 'admin';
              const panelName = panelLabels[u.panelType || 'general'] || u.panelType || 'General';
              const panelBadgeColor = getPanelBadgeVariant(u.panelType);

              return (
                <PlayfulCard
                  key={u.id}
                  className="p-5 flex flex-col justify-between hover:shadow-hard transition-all cursor-pointer group border-2 border-navy/15 hover:border-navy"
                  onClick={() => setSelectedUser(u)}
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-2xl border-2 border-navy flex items-center justify-center font-outfit font-bold text-lg shrink-0 ${
                            isAdmin ? 'bg-pink text-navy' : 'bg-violet text-white'
                          }`}
                        >
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-outfit font-bold text-base text-navy truncate group-hover:text-violet transition-colors">
                            {u.name}
                          </h3>
                          <p className="font-jakarta text-xs text-navy-light flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 shrink-0 text-navy/50" />
                            <span className="truncate">{u.email}</span>
                          </p>
                          {u.phone && (
                            <p className="font-jakarta text-xs text-navy/70 flex items-center gap-1.5 truncate mt-0.5">
                              <Phone className="w-3.5 h-3.5 shrink-0 text-violet" />
                              <span className="truncate font-mono">{u.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {isAdmin ? (
                        <PlayfulBadge variant="pink" size="sm" leftIcon={<Shield className="w-3 h-3" />}>
                          Admin
                        </PlayfulBadge>
                      ) : (
                        <PlayfulBadge variant={panelBadgeColor as any} size="sm" leftIcon={<Layers className="w-3 h-3" />}>
                          {panelName}
                        </PlayfulBadge>
                      )}
                      {u.onboardingCompleted && (
                        <PlayfulBadge variant="green" size="sm" leftIcon={<CheckCircle2 className="w-3 h-3" />}>
                          Profile Complete
                        </PlayfulBadge>
                      )}
                    </div>

                    {/* User Info Snippets */}
                    <div className="space-y-2 py-3 border-y border-navy/10 text-xs font-jakarta">
                      {(u.roleTitle || u.industry) && (
                        <div className="flex items-center justify-between gap-2 text-navy">
                          <span className="text-navy-light flex items-center gap-1.5 shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-navy/60" /> Role & Industry:
                          </span>
                          <span className="font-semibold text-right truncate">
                            {[u.roleTitle, u.industry].filter(Boolean).join(' • ')}
                          </span>
                        </div>
                      )}

                      {(u.city || u.country) && (
                        <div className="flex items-center justify-between gap-2 text-navy">
                          <span className="text-navy-light flex items-center gap-1.5 shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-navy/60" /> Location:
                          </span>
                          <span className="font-semibold text-right truncate">
                            {[u.city, u.country].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 text-navy">
                        <span className="text-navy-light flex items-center gap-1.5 shrink-0">
                          <Coins className="w-3.5 h-3.5 text-yellow-600" /> Reward Balance:
                        </span>
                        <span className="font-bold font-mono text-violet">
                          {(u.points || 0).toLocaleString()} pts (₹{((u.points || 0) / 2).toFixed(0)})
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-navy">
                        <span className="text-navy-light flex items-center gap-1.5 shrink-0">
                          <Award className="w-3.5 h-3.5 text-green-600" /> Surveys Completed:
                        </span>
                        <span className="font-bold font-mono text-navy">
                          {u.surveysCompleted || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 mt-1 text-xs text-navy font-semibold font-jakarta">
                    <span className="text-navy-light font-normal text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Joined: {u.memberSince || 'Recent'}
                    </span>
                    <span className="text-violet flex items-center gap-1 group-hover:underline">
                      <Eye className="w-3.5 h-3.5" /> Full Details
                    </span>
                  </div>
                </PlayfulCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl bg-white border-2 border-navy rounded-3xl shadow-hard-lg overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-violet/10 via-pink/10 to-yellow/10 border-b-2 border-navy/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl border-2 border-navy flex items-center justify-center font-outfit font-bold text-xl ${
                    selectedUser.role === 'admin' ? 'bg-pink text-navy' : 'bg-violet text-white'
                  }`}
                >
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="font-outfit font-bold text-2xl text-navy">{selectedUser.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                    <p className="font-jakarta text-xs text-navy-light flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {selectedUser.email}
                    </p>
                    {selectedUser.phone && (
                      <p className="font-jakarta text-xs text-navy font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-violet" /> <span className="font-mono">{selectedUser.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 bg-white border-2 border-navy rounded-full hover:bg-periwinkle transition-colors text-navy"
                aria-label="Close user modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with All Data */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 font-jakarta text-sm">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <PlayfulBadge
                  variant={selectedUser.role === 'admin' ? 'pink' : (getPanelBadgeVariant(selectedUser.panelType) as any)}
                  size="md"
                  leftIcon={<Shield className="w-3.5 h-3.5" />}
                >
                  Role: {selectedUser.role.toUpperCase()}
                </PlayfulBadge>
                <PlayfulBadge variant="violet" size="md" leftIcon={<Layers className="w-3.5 h-3.5" />}>
                  Panel: {panelLabels[selectedUser.panelType || 'general'] || selectedUser.panelType || 'General'}
                </PlayfulBadge>
                <PlayfulBadge
                  variant={selectedUser.onboardingCompleted ? 'green' : 'yellow'}
                  size="md"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Onboarding: {selectedUser.onboardingCompleted ? 'Completed' : 'Pending'}
                </PlayfulBadge>
              </div>

              {/* Account & Activity Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-2xl text-center">
                  <p className="text-xs text-navy-light mb-1">Total Points</p>
                  <p className="font-outfit font-bold text-xl text-violet">{(selectedUser.points || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-navy-light font-mono">₹{((selectedUser.points || 0) / 2).toFixed(0)}</p>
                </div>
                <div className="p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-2xl text-center">
                  <p className="text-xs text-navy-light mb-1">Surveys Done</p>
                  <p className="font-outfit font-bold text-xl text-green-700">{selectedUser.surveysCompleted || 0}</p>
                </div>
                <div className="p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-2xl text-center">
                  <p className="text-xs text-navy-light mb-1">Redemptions</p>
                  <p className="font-outfit font-bold text-xl text-pink-700">{selectedUser.rewardsRedeemed || 0}</p>
                </div>
                <div className="p-3 bg-periwinkle/30 border-2 border-navy/10 rounded-2xl text-center">
                  <p className="text-xs text-navy-light mb-1">Joined Date</p>
                  <p className="font-outfit font-bold text-sm text-navy mt-1">{selectedUser.memberSince || 'N/A'}</p>
                </div>
              </div>

              {/* Professional & Work Details */}
              <div>
                <h3 className="font-outfit font-bold text-base text-navy mb-3 flex items-center gap-2 border-b border-navy/10 pb-2">
                  <Briefcase className="w-4 h-4 text-violet" /> Professional Profile & Demographics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Job Title / Role</span>
                    <span className="font-bold text-navy">{selectedUser.roleTitle || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Industry Sector</span>
                    <span className="font-bold text-navy">{selectedUser.industry || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Employment Status</span>
                    <span className="font-bold text-navy capitalize">{selectedUser.employmentStatus || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Department / Function</span>
                    <span className="font-bold text-navy">{selectedUser.department || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl sm:col-span-2">
                    <span className="text-xs text-navy-light block mb-0.5">Company Annual Revenue Bracket</span>
                    <span className="font-bold text-navy">{selectedUser.revenue || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Geographic & Location Details */}
              <div>
                <h3 className="font-outfit font-bold text-base text-navy mb-3 flex items-center gap-2 border-b border-navy/10 pb-2">
                  <MapPin className="w-4 h-4 text-violet" /> Geographic & Location Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Country</span>
                    <span className="font-bold text-navy">{selectedUser.country || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">City / State</span>
                    <span className="font-bold text-navy">{selectedUser.city || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">Area / Region</span>
                    <span className="font-bold text-navy">{selectedUser.area || '—'}</span>
                  </div>
                  <div className="p-3 bg-white border-2 border-navy/10 rounded-xl">
                    <span className="text-xs text-navy-light block mb-0.5">PIN / Postal Code</span>
                    <span className="font-mono font-bold text-navy">{selectedUser.pincode || '—'}</span>
                  </div>
                </div>
              </div>

              {/* System & ID Info */}
              <div className="p-3 bg-navy/5 border border-navy/10 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-navy-light font-mono">User Database ID:</span>
                  <span className="font-mono text-navy font-bold">{selectedUser.id}</span>
                </div>
                {selectedUser.lastRedemption && (
                  <div className="flex justify-between">
                    <span className="text-navy-light">Last Redeemed Reward:</span>
                    <span className="font-bold text-violet">{selectedUser.lastRedemption}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-periwinkle/30 border-t-2 border-navy/10 flex justify-end">
              <PlayfulButton variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close Profile
              </PlayfulButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredUsersTab;
