'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { UserPlus, User, Shield, Trash2, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserManagementPage() {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('contributor');
  const [showForm, setShowForm] = useState(false);

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (currentUserProfile) {
      const currentUserRole = currentUserProfile?.role?.toString().trim().toLowerCase();
      const isAdmin = currentUserRole === 'admin' || currentUserRole === 'administrator';
      console.log('User Mgmt Diagnostic:', { profileRole: currentUserProfile.role, currentUserRole, isAdmin });
    }
  }, [currentUserProfile]);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setCurrentUserProfile(profile);
    }
    await fetchProfiles();
  };

  const fetchProfiles = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProfiles(data);
    }

    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

      // We use a temporary client so it doesn't overwrite the current admin's session
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
      const tempClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // 1. Create Auth Account
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) throw authError;

      const newUser = authData.user;
      if (!newUser) throw new Error('Failed to create user account');

      // 2. Insert Profile (Fallback in case trigger doesn't exist)
      // We use the MAIN admin client to do this insert
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: newUser.id,
          full_name: fullName,
          role: role,
          is_active: true
        });

      if (profileError) {
        console.warn('Manual profile insert failed (Already created by trigger?):', profileError);
      }

      alert('Successfully created user: ' + fullName);
      setShowForm(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('contributor');

      fetchInitialData();
    } catch (error: any) {
      console.error('User creation failed:', error);
      alert(error.message || 'An error occurred during user creation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUserProfile?.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${name}? This will remove their profile and all access.`)) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete_user', {
        body: { user_id: id },
      });

      if (error) throw error;

      alert('User deleted successfully!');
      fetchProfiles();
    } catch (error: any) {
      console.error('Delete error:', error);
      const { error: directError } = await supabase.from('profiles').delete().eq('id', id);
      if (directError) {
        alert(`Error deleting user: ${error.message || directError.message}`);
      } else {
        alert('User profile deleted. Note: Auth record might still exist if delete_user function failed.');
        fetchProfiles();
      }
    } finally {
      setLoading(false);
    }
  };

  // Robust Role Check
  const userRole = currentUserProfile?.role?.toString()?.toLowerCase()?.trim();
  const isAdmin = userRole === 'admin' || userRole === 'administrator';

  // If we're not loading BUT we don't have a profile yet, we are still "Identifying" 
  // rather than "Restricted"
  if (loading || !currentUserProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating Profile...</p>
      </div>
    );
  }

  // ONLY Show access restricted if loading is finished AND we explicitly have a non-admin role
  if (!isAdmin && !loading) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <Shield size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Access Restricted</h2>
        <p className="text-slate-500 text-lg mb-8">Only administrators have permission to manage firm users and access levels. Current role: {userRole || 'Loading...'}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
          >
            Go Back
          </button>
          <button
            onClick={fetchInitialData}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
          >
            Re-verify Admin Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-light">
            Oversee firm access, manage permissions, and invite new collaborators.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all active:scale-95 shadow-xl",
            showForm
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
          )}
        >
          {showForm ? <Loader2 size={20} className="rotate-45" /> : <UserPlus size={20} />}
          {showForm ? 'Cancel Creation' : 'Add New Member'}
        </button>
      </header>

      {showForm && (
        <section className="bg-white p-10 rounded-[2.5rem] border border-blue-50 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                New User Account
              </h2>
              <p className="text-slate-400 text-sm">Fill in the credentials to create a new profile.</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">
                Full Name
              </label>
              <input
                required
                placeholder="e.g. Satish Paliwal"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium text-black"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="name@jivansecure.com"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">
                Initial Password
              </label>
              <input
                required
                type="password"
                placeholder="Minimum 8 characters"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium font-mono text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest pl-1">
                Assign Role
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-black appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="contributor">Contributor (Post only)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>



            <div className="md:col-span-2 pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Check size={24} />
                )}
                Initialize User Profile
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-10 py-5 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
              >
                Dismiss
              </button>
            </div>
          </form>
        </section>
      )
      }

      <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Current Members</h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {profiles.length} Total Users
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  User Identification
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authorization</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Member Since</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {profiles.map((profile) => (
                <tr key={profile.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-lg">
                        {profile.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 mb-0.5">{profile.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium">Verified Active Profile</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 font-black uppercase text-[10px] px-4 py-2 rounded-xl border',
                        (profile.role?.trim().toLowerCase() === 'admin' || profile.role?.trim().toLowerCase() === 'administrator')
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          : profile.role?.trim().toLowerCase() === 'editor'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                      )}
                    >
                      <Shield size={12} />
                      {profile.role}
                    </span>
                  </td>

                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-600">
                      {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => handleDeleteUser(profile.id, profile.full_name)}
                      disabled={profile.id === currentUserProfile?.id}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-0"
                      title="Delete User"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div >
  );
}
