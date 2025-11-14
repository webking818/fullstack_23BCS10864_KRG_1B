"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function EditStudentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const studentId = searchParams.get("id")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [student, setStudent] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    roll_number: "",
    grade: "",
    email: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const { data, error: fetchError } = await supabase.from("students").select("*").eq("id", studentId).single()

      if (fetchError) {
        setError("Failed to fetch student details")
        return
      }

      setStudent(data)
      setFormData({
        name: data.name || "",
        roll_number: data.roll_number || "",
        grade: data.grade || "",
        email: data.email || "",
      })
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const { error: updateError } = await supabase
        .from("students")
        .update({
          name: formData.name,
          roll_number: formData.roll_number,
          grade: formData.grade,
        })
        .eq("id", studentId)

      if (updateError) {
        setError(`Failed to update student: ${updateError.message}`)
        return
      }

      setSuccess("Student profile updated successfully! Changes will reflect in their account.")
      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Edit Student Profile</h1>
        <p className="text-gray-600 mt-2">
          Update student information. Changes will be visible in the student's account.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
          <Input type="email" value={formData.email} disabled className="bg-gray-50 text-gray-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter student name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number</label>
          <Input
            type="text"
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
            placeholder="e.g., CS-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade / Year</label>
          <Input
            type="text"
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            placeholder="e.g., B.Tech 2nd Year"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" onClick={() => router.back()} className="bg-gray-300 hover:bg-gray-400 text-gray-900">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
