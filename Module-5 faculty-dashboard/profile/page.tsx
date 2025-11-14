"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FacultyProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    phone: "",
    officeRoom: "",
    specialization: "",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data } = await supabase.from("faculty").select("*").eq("id", session.user.id).single()

      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || "",
          department: data.department || "",
          phone: data.phone || "",
          officeRoom: data.office_room || "",
          specialization: data.specialization || "",
        })
      }
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { error } = await supabase
        .from("faculty")
        .update({
          name: formData.name,
          department: formData.department,
          phone: formData.phone,
          office_room: formData.officeRoom,
          specialization: formData.specialization,
        })
        .eq("id", session.user.id)

      if (!error) {
        fetchProfile()
        setEditing(false)
        alert("Profile updated successfully")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mt-4">{profile?.email}</p>
        </div>

        {!editing ? (
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-xs text-gray-600 mb-1">Name</p>
              <p className="text-lg font-medium text-gray-900">{profile?.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Department</p>
              <p className="text-lg font-medium text-gray-900">{profile?.department || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Specialization</p>
              <p className="text-lg font-medium text-gray-900">{profile?.specialization || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Phone</p>
              <p className="text-lg font-medium text-gray-900">{profile?.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Office Room</p>
              <p className="text-lg font-medium text-gray-900">{profile?.office_room || "Not provided"}</p>
            </div>

            <Button onClick={() => setEditing(true)} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
              Edit Profile
            </Button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
              <Input
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office Room</label>
              <Input
                value={formData.officeRoom}
                onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
