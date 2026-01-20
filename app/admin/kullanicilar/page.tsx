'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Users, Shield, Edit2, Trash2, Mail } from 'lucide-react'
import { 
  LoadingState, 
  ErrorState, 
  DataTable, 
  ConfirmDialog,
  type Column 
} from '@/components/admin/ui'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'ADMIN' | 'AUTHOR' | 'USER'
  createdAt: string
  _count: {
    articles: number
    bookmarks: number
  }
}

const roleConfig: Record<string, { label: string; color: string }> = {
  ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  AUTHOR: { label: 'Yazar', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  USER: { label: 'Kullanıcı', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Rol düzenleme state
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  
  // Silme dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    userId: string | null
    userName: string
    isBulk: boolean
  }>({
    isOpen: false,
    userId: null,
    userName: '',
    isBulk: false,
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Kullanıcılar yüklenemedi')
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Rol güncellenemedi')
      }

      setUsers(users.map((user) =>
        user.id === userId ? { ...user, role: newRole as User['role'] } : user
      ))
      setEditingUserId(null)
      setSelectedRole('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Bir hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (deleteDialog.isBulk) {
      // Toplu silme
      try {
        await Promise.all(
          selectedUsers.map((id) =>
            fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
          )
        )
        setUsers(users.filter((u) => !selectedUsers.includes(u.id)))
        setSelectedUsers([])
      } catch {
        alert('Bazı kullanıcılar silinemedi')
      }
    } else if (deleteDialog.userId) {
      // Tekli silme
      try {
        const response = await fetch(`/api/admin/users/${deleteDialog.userId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Kullanıcı silinemedi')
        }
        setUsers(users.filter((u) => u.id !== deleteDialog.userId))
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Bir hata oluştu')
      }
    }
    setDeleteDialog({ isOpen: false, userId: null, userName: '', isBulk: false })
  }

  const openDeleteDialog = (userId: string, userName: string | null) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName: userName || 'Bu kullanıcı',
      isBulk: false,
    })
  }

  const openBulkDeleteDialog = () => {
    setDeleteDialog({
      isOpen: true,
      userId: null,
      userName: `${selectedUsers.length} kullanıcı`,
      isBulk: true,
    })
  }

  // İstatistikler
  const adminCount = users.filter((u) => u.role === 'ADMIN').length
  const authorCount = users.filter((u) => u.role === 'AUTHOR').length
  const userCount = users.filter((u) => u.role === 'USER').length

  // Tablo sütunları
  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Kullanıcı',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="ml-4">
            <div className="font-medium text-gray-900 dark:text-white">
              {user.name || 'İsimsiz'}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      sortable: true,
      render: (user) => (
        editingUserId === user.id ? (
          <select
            value={selectedRole || user.role}
            onChange={(e) => setSelectedRole(e.target.value)}
            onBlur={() => {
              if (selectedRole && selectedRole !== user.role) {
                handleRoleChange(user.id, selectedRole)
              } else {
                setEditingUserId(null)
                setSelectedRole('')
              }
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          >
            <option value="ADMIN">Admin</option>
            <option value="AUTHOR">Yazar</option>
            <option value="USER">Kullanıcı</option>
          </select>
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig[user.role].color}`}
          >
            <Shield className="w-3 h-3 mr-1" />
            {roleConfig[user.role].label}
          </span>
        )
      ),
    },
    {
      key: 'stats',
      header: 'İstatistikler',
      render: (user) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div>{user._count.articles} makale</div>
          <div>{user._count.bookmarks} kayıtlı</div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Kayıt Tarihi',
      sortable: true,
      render: (user) => (
        <span className="text-gray-500 dark:text-gray-400">
          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'İşlemler',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <a
            href={`mailto:${user.email}`}
            className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            title="E-posta Gönder"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setEditingUserId(user.id)
              setSelectedRole(user.role)
            }}
            className="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
            title="Rol Değiştir"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              openDeleteDialog(user.id, user.name)
            }}
            className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  if (loading) {
    return <LoadingState message="Kullanıcılar yükleniyor..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Yükleme Hatası"
        message={error}
        onRetry={fetchUsers}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
            <p className="text-sm text-gray-500">Toplam {users.length} kullanıcı</p>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedUsers.length > 0 && (
          <button
            onClick={openBulkDeleteDialog}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {selectedUsers.length} Kullanıcıyı Sil
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
              <p className="text-sm text-gray-500">Admin</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{authorCount}</p>
              <p className="text-sm text-gray-500">Yazar</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{userCount}</p>
              <p className="text-sm text-gray-500">Kullanıcı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        searchable
        searchPlaceholder="İsim veya e-posta ile ara..."
        paginated
        pageSize={10}
        selectable
        selectedItems={selectedUsers}
        onSelectionChange={setSelectedUsers}
        exportable
        exportFileName="kullanicilar"
        emptyTitle="Henüz kullanıcı yok"
        emptyDescription="Kullanıcılar sisteme kayıt oldukça burada görünecekler."
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ ...deleteDialog, isOpen: false })}
        onConfirm={handleDelete}
        title={deleteDialog.isBulk ? 'Kullanıcıları Sil' : 'Kullanıcıyı Sil'}
        description={
          deleteDialog.isBulk
            ? `${selectedUsers.length} kullanıcı kalıcı olarak silinecek. Bu işlem geri alınamaz.`
            : `"${deleteDialog.userName}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`
        }
        variant="danger"
        confirmText="Sil"
      />
    </div>
  )
}
