import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Mail, 
  User, 
  MessageSquare, 
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';
import LiquidChrome from '../components/LiquidChrome';

const STATUS_CONFIG = {
  new: { 
    label: 'New', 
    color: 'bg-blue-500', 
    icon: Clock,
    textColor: 'text-blue-500'
  },
  contacted: { 
    label: 'Contacted', 
    color: 'bg-amber-500', 
    icon: Clock,
    textColor: 'text-amber-500'
  },
  closed: { 
    label: 'Closed', 
    color: 'bg-emerald-500', 
    icon: CheckCircle2,
    textColor: 'text-emerald-500'
  }
};

const BUDGET_LABELS = {
  'under-5k': 'Under $5,000',
  '5k-10k': '$5,000 - $10,000',
  '10k-25k': '$10,000 - $25,000',
  '25k-50k': '$25,000 - $50,000',
  '50k-plus': '$50,000+'
};

const AdminDashboard = () => {
  const { user, signOut } = useAuthStore();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user is admin on mount
  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      // Check if user has admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (profile?.role === 'admin') {
        setIsAuthenticated(true);
        fetchLeads();
      } else {
        setIsAuthenticated(false);
        setLoginError('Access denied. Admin privileges required.');
      }
    } catch (err) {
      console.error('Error checking admin access:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) throw error;
      // checkAdminAccess will be called via useEffect when user changes
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
      
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <LiquidChrome intensity={0.3} speed={0.2} />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            <div className="glass-card p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-vivid flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-display text-2xl font-bold text-content mb-2">
                  Admin Login
                </h1>
                <p className="text-content-secondary">
                  Sign in to access the lead management dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-content mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-content mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="input-field"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {loginError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                >
                  Sign In
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Header */}
      <header className="glass-card border-b border-line/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-vivid flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-content">LeadDesk</h1>
                <p className="text-xs text-content-muted">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-content-secondary">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                className="btn-glow-outline px-4 py-2 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = leads.filter(l => l.status === status).length;
            const Icon = config.icon;
            return (
              <motion.div
                key={status}
                whileHover={{ y: -2 }}
                className="glass-card p-6 cursor-pointer"
                onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-content-muted text-sm mb-1">{config.label}</p>
                    <p className="text-3xl font-display font-bold text-content">{count}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${config.color}/20 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.textColor}`} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
              <input
                type="text"
                placeholder="Search leads by name, email, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field appearance-none cursor-pointer pr-10"
                style={{ backgroundPosition: 'right 1rem center' }}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
              </select>

              <button
                onClick={fetchLeads}
                disabled={loading}
                className="btn-glow-outline px-4 py-3 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin mx-auto mb-4" />
              <p className="text-content-secondary">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface/5 flex items-center justify-center">
                <Filter className="w-8 h-8 text-content-muted" />
              </div>
              <p className="text-content-secondary">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No leads match your filters' 
                  : 'No leads yet. They will appear here when submitted.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line/5">
              <AnimatePresence>
                {filteredLeads.map((lead) => {
                  const statusConfig = STATUS_CONFIG[lead.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 hover:bg-surface/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display font-semibold text-content truncate">
                              {lead.name}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}/10 ${statusConfig.textColor}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-content-secondary mb-2">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-4 h-4" />
                              {lead.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(lead.created_at)}
                            </span>
                          </div>

                          <p className="text-content-secondary text-sm line-clamp-2">
                            {lead.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-content-muted whitespace-nowrap">
                            {BUDGET_LABELS[lead.budget_range] || lead.budget_range}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLead(lead.id);
                            }}
                            className="p-2 rounded-lg hover:bg-error/10 text-content-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-line/10 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-content">
                    Lead Details
                  </h2>
                  <p className="text-sm text-content-muted">
                    Submitted on {formatDate(selectedLead.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-lg hover:bg-surface/10 text-content-muted hover:text-content"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Lead Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface/5">
                    <div className="flex items-center gap-2 text-content-muted mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm">Name</span>
                    </div>
                    <p className="font-medium text-content">{selectedLead.name}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/5">
                    <div className="flex items-center gap-2 text-content-muted mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <p className="font-medium text-content">{selectedLead.email}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/5">
                    <div className="flex items-center gap-2 text-content-muted mb-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Budget Range</span>
                    </div>
                    <p className="font-medium text-content">
                      {BUDGET_LABELS[selectedLead.budget_range] || selectedLead.budget_range}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/5">
                    <div className="flex items-center gap-2 text-content-muted mb-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">Status</span>
                    </div>
                    {(() => {
                      const StatusIcon = STATUS_CONFIG[selectedLead.status].icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[selectedLead.status].color}/10 ${STATUS_CONFIG[selectedLead.status].textColor}`}>
                          {StatusIcon && <StatusIcon className="w-4 h-4" />}
                          {STATUS_CONFIG[selectedLead.status].label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center gap-2 text-content-muted mb-3">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Message</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface/5 text-content whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="border-t border-line/10 pt-6">
                  <p className="text-sm font-medium text-content mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const isActive = selectedLead.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => updateLeadStatus(selectedLead.id, status)}
                          disabled={isActive || isUpdating}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            isActive
                              ? `${config.color} text-white`
                              : 'bg-surface/5 text-content-secondary hover:bg-surface/10'
                          } disabled:opacity-50`}
                        >
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t border-line/10">
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="btn-glow-outline px-6 py-3 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => deleteLead(selectedLead.id)}
                    className="px-6 py-3 flex items-center gap-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Lead
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
