'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './auth-provider';
import { Shield, Info, AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export default function AdminRoles() {
  const { user, userProfile } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoles, setNewRoles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<UserRecord | null>(null);
  const [confirmRole, setConfirmRole] = useState<string>('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const list: UserRecord[] = (data.users || []).map((u: Record<string, unknown>) => ({
        id: u.id,
        email: u.email || '',
        displayName: u.displayName || '',
        role: u.role || 'user',
      }));
      // Sort: owners first, then admins, then users
      const roleOrder: Record<string, number> = { owner: 0, admin: 1, user: 2 };
      list.sort((a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3));
      setUsers(list);
      const roles: Record<string, string> = {};
      list.forEach((u) => { roles[u.id] = u.role; });
      setNewRoles(roles);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (userId: string) => {
    const newRole = newRoles[userId];
    if (!newRole) return;

    // For owner role assignment, show confirmation dialog
    if (newRole === 'owner') {
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser) {
        setConfirmTarget(targetUser);
        setConfirmRole(newRole);
        return;
      }
    }

    await executeRoleUpdate(userId, newRole);
  };

  const executeRoleUpdate = async (userId: string, newRole: string) => {
    setSaving(userId);
    try {
      // Get the Firebase ID token for server-side auth
      if (!user) {
        toast.error('Authentication error — please re-login');
        setSaving(null);
        return;
      }
      const idToken = await user.getIdToken();

      const res = await fetch('/api/admin/users/update-role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the specific error message from the API
        const errMsg = data.error || 'Failed to update role';
        toast.error(errMsg);
        console.error('[admin-roles] Role update failed:', errMsg);
        return;
      }

      toast.success(
        newRole === 'owner'
          ? `Owner access granted to ${data.userId ? users.find(u => u.id === userId)?.email : 'user'}`
          : `Role updated to ${newRole} successfully`
      );
      fetchUsers();
    } catch {
      toast.error('Failed to update role — network error');
    } finally {
      setSaving(null);
    }
  };

  const handleConfirmOwner = async () => {
    if (!confirmTarget) return;
    setConfirmTarget(null);
    await executeRoleUpdate(confirmTarget.id, 'owner');
  };

  if (userProfile?.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Shield className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-zinc-400">Only owners can manage roles.</p>
      </div>
    );
  }

  const ownerCount = users.filter((u) => u.role === 'owner').length;
  const isCurrentUser = (uid: string) => uid === user?.uid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Role Management</h1>
        <p className="text-zinc-400 mt-1">Assign and manage user roles</p>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Info className="h-4 w-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-300">Only owners can manage roles. Your account cannot be modified.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md">
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{ownerCount}</p>
          <p className="text-xs text-zinc-500 mt-1">Owners</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-xs text-zinc-500 mt-1">Admins</p>
        </div>
        <div className="bg-zinc-500/10 border border-zinc-500/20 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-zinc-400">{users.filter(u => u.role === 'user').length}</p>
          <p className="text-xs text-zinc-500 mt-1">Users</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800/50 hover:bg-transparent">
                <TableHead className="text-zinc-400">User Name</TableHead>
                <TableHead className="text-zinc-400">Email</TableHead>
                <TableHead className="text-zinc-400">Current Role</TableHead>
                <TableHead className="text-zinc-400">New Role</TableHead>
                <TableHead className="text-zinc-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-zinc-800/50 hover:bg-transparent">
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full bg-zinc-800/50" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                users.map((userRecord) => {
                  const isOwner = userRecord.role === 'owner';
                  const isSelf = isCurrentUser(userRecord.id);
                  const roleChanged = newRoles[userRecord.id] !== userRecord.role;
                  return (
                    <TableRow key={userRecord.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                      <TableCell className="text-sm text-white font-medium">
                        <div className="flex items-center gap-2">
                          {isOwner && <Crown className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                          {userRecord.displayName || 'Unknown'}
                          {isSelf && <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">You</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">{userRecord.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isOwner
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                              : userRecord.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
                          }
                        >
                          {userRecord.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isOwner || isSelf ? (
                          <span className="text-sm text-zinc-500">{isSelf ? '— (you)' : '— (protected)'}</span>
                        ) : (
                          <Select
                            value={newRoles[userRecord.id] || userRecord.role}
                            onValueChange={(v) =>
                              setNewRoles((prev) => ({ ...prev, [userRecord.id]: v }))
                            }
                          >
                            <SelectTrigger size="sm" className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isOwner || isSelf ? (
                          <span className="text-xs text-zinc-600">
                            {isSelf ? 'Your account' : 'Protected'}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            disabled={!roleChanged || saving === userRecord.id}
                            onClick={() => handleSave(userRecord.id)}
                          >
                            {saving === userRecord.id ? 'Saving...' : 'Save'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Owner Assignment Confirmation Dialog */}
      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
      >
        <AlertDialogContent className="bg-[#12121a] border-zinc-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-400" />
              Grant Owner Access
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              You are about to grant <strong className="text-white">{confirmTarget?.email}</strong> full owner
              privileges. Owners have unrestricted access to all settings, user management, and role assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-start gap-3 bg-amber-500/[0.08] border border-amber-500/[0.15] rounded-lg p-3 my-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300/80 leading-relaxed">
              This action grants full administrative control. The new owner will be able to manage all roles
              (including granting owner access to others) and access all site settings.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmOwner}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Confirm — Grant Owner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}