import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit2, Save, Shield, Zap, Award } from 'lucide-react';

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    const displayName = user?.user_metadata?.full_name || 'Operator';
    const displayEmail = user?.email || 'unknown@grid.io';
    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';
    const energyId = `SG-${user?.id?.substring(0, 4).toUpperCase() || 'XXXX'}-${user?.id?.substring(4, 8).toUpperCase() || 'XXXX'}`;

    const [profile, setProfile] = useState({
        name: displayName,
        email: displayEmail,
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        accountType: 'Prosumer',
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 animate-enter max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-white">Operator Profile</h1>
                <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold rounded-md transition-all ${isEditing
                        ? 'bg-[var(--color-positive)] text-black hover:brightness-110'
                        : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]'
                        }`}
                    style={{ fontFamily: 'var(--font-mono)' }}
                >
                    {isEditing ? <><Save size={14} /> SAVE</> : <><Edit2 size={14} /> EDIT</>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <div className="card p-7 text-center">
                    <div className="w-24 h-24 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] mx-auto mb-5 flex items-center justify-center text-3xl font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-0.5">{profile.name}</h2>
                    <p className="text-[13px] text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>{profile.accountType.toUpperCase()}</p>

                    <div className="text-left space-y-3 text-sm border-t border-[var(--color-border)] mt-6 pt-6">
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-muted)]">Member Since</span>
                            <span className="text-white">{joinDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-muted)]">Energy ID</span>
                            <span className="text-white" style={{ fontFamily: 'var(--font-mono)' }}>{energyId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[var(--color-text-muted)]">Status</span>
                            <span className="badge badge-positive">Active</span>
                        </div>
                    </div>
                </div>


                <div className="card p-7 col-span-1 md:col-span-2">
                    <h3 className="text-base font-semibold text-white mb-6">Personal Information</h3>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Full Name</label>
                                <input
                                    disabled={!isEditing}
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    className={`input-field ${isEditing ? 'border-[var(--color-accent)]' : ''} ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Location</label>
                                <input
                                    disabled={!isEditing}
                                    value={profile.location}
                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                    className={`input-field ${isEditing ? 'border-[var(--color-accent)]' : ''} ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                disabled
                                value={profile.email}
                                className="input-field opacity-70 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-[var(--color-text-dim)] mt-1" style={{ fontFamily: 'var(--font-mono)' }}>Email is managed by Supabase Auth</p>
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Phone</label>
                            <input
                                type="tel"
                                disabled={!isEditing}
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                className={`input-field ${isEditing ? 'border-[var(--color-accent)]' : ''} ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {isEditing && (
                            <div className="flex items-start gap-3 p-4 bg-[var(--color-bg)] border-l-[3px] border-l-[var(--color-warning)] rounded-r-md mt-4">
                                <span className="text-[var(--color-warning)] text-sm">⚠</span>
                                <p className="text-[13px] text-[var(--color-text-muted)]">Changes will be verified on the blockchain before updating.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-[rgba(52,211,153,0.1)] flex items-center justify-center">
                        <Zap size={18} className="text-[var(--color-positive)]" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Energy Traded</p>
                        <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>1,247 <span className="text-xs font-normal text-[var(--color-text-dim)]">kWh</span></p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-[rgba(96,165,250,0.1)] flex items-center justify-center">
                        <Shield size={18} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Trust Score</p>
                        <p className="text-lg font-bold text-[var(--color-accent)]" style={{ fontFamily: 'var(--font-mono)' }}>98.5%</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
                        <Award size={18} className="text-[var(--color-warning)]" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Carbon Credits</p>
                        <p className="text-lg font-bold text-[var(--color-warning)]" style={{ fontFamily: 'var(--font-mono)' }}>450 <span className="text-xs font-normal text-[var(--color-text-dim)]">CC</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
