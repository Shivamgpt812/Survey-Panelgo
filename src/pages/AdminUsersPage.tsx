import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, User } from 'lucide-react';
import { PlayfulButton, PlayfulCard } from '@/components/ui/playful';
import { DecorativeBlob, DotGrid, IconCircle } from '@/components/decorations';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiGet } from '@/lib/api';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface PanelUser {
  id: string;
  name: string;
  email: string;
}

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const { addToast } = useToast();
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void apiGet<{ users: PanelUser[] }>('/api/users', token)
      .then((d) => setUsers(d.users))
      .catch((e) => {
        addToast(e instanceof Error ? e.message : 'Failed to load users', 'error');
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, [token, addToast]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully!', 'info');
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-periwinkle">
      <DotGrid className="fixed inset-0" />
      <DecorativeBlob variant="violet" size="md" className="right-[5%] top-[10%] opacity-30" />
      <DecorativeBlob variant="yellow" size="md" className="left-[5%] bottom-[15%] opacity-30" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-violet rounded-xl"
            aria-label="Survey Panel Go home"
          >
            <BrandLogo size="sm" className="max-h-10 sm:max-h-11" />
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-navy rounded-pill shadow-hard-sm hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-navy" />
            <span className="font-jakarta font-medium text-sm text-navy">Back to dashboard</span>
          </button>
          <PlayfulButton variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </PlayfulButton>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <IconCircle variant="yellow" size="lg">
            <Users className="w-7 h-7" />
          </IconCircle>
          <div>
            <h1 className="font-outfit font-bold text-2xl sm:text-3xl text-navy">Panel users</h1>
            <p className="font-jakarta text-navy-light text-sm">
              Name and email for every registered panel account (same as the dashboard’s
              &quot;Total Users&quot; count).
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-violet border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && users.length === 0 && (
          <PlayfulCard variant="static" className="p-8 text-center">
            <p className="font-jakarta text-navy-light">No panel users yet. They will appear here when people register.</p>
          </PlayfulCard>
        )}
        {!loading && users.length > 0 && (
          <ul className="space-y-3">
            {users.map((u) => (
              <li key={u.id}>
                <PlayfulCard variant="static" className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-violet border-2 border-navy rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-outfit font-bold text-navy truncate">{u.name}</p>
                      <p className="font-jakarta text-sm text-navy-light flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </p>
                    </div>
                  </div>
                </PlayfulCard>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
