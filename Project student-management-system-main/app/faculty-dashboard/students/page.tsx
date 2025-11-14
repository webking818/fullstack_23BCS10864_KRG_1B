"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    studentEmail: "",
    studentName: "",
    rollNumber: "",
    grade: "",
    courseName: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data } = await supabase
        .from("student_faculty_mapping")
        .select("student_id, course_name")
        .eq("faculty_id", session.user.id)

      if (data) {
        const studentIds = [...new Set(data.map((d) => d.student_id))]
        const { data: studentData } = await supabase
          .from("students")
          .select("id, name, email, roll_number, grade")
          .in("id", studentIds)

        setStudents(studentData || [])
      }
    }
    setLoading(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError("Not authenticated. Please log in again.")
        setSubmitting(false)
        return
      }

      const { data: existingStudent, error: studentFetchError } = await supabase
        .from("students")
        .select("id, name, email, roll_number, grade")
        .eq("email", formData.studentEmail)
        .single()

      let studentId: string

      if (existingStudent) {
        const { error: updateError } = await supabase
          .from("students")
          .update({
            name: formData.studentName || existingStudent.name,
            roll_number: formData.rollNumber || existingStudent.roll_number,
            grade: formData.grade || existingStudent.grade,
          })
          .eq("id", existingStudent.id)

        if (updateError) {
          setError(`Failed to update student profile: ${updateError.message}`)
          setSubmitting(false)
          return
        }

        studentId = existingStudent.id
      } else {
        setError(
          "Student not found in system. Students must sign up first with their email. Once they create an account, you can add them to your courses.",
        )
        setSubmitting(false)
        return
      }

      const { error: mappingError } = await supabase.from("student_faculty_mapping").insert({
        faculty_id: session.user.id,
        student_id: studentId,
        course_name: formData.courseName,
      })

      if (mappingError) {
        if (mappingError.message.includes("duplicate")) {
          setError("This student is already added to your course.")
        } else {
          setError(`Failed to add student: ${mappingError.message}`)
        }
        setSubmitting(false)
        return
      }

      setFormData({
        studentEmail: "",
        studentName: "",
        rollNumber: "",
        grade: "",
        courseName: "",
      })
      setShowAddForm(false)
      await fetchStudents()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-600 mt-2">View and manage your enrolled students</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Student
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student Email *</label>
                <Input
                  type="email"
                  value={formData.studentEmail}
                  onChange={(e) => setFormData({ ...formData, studentEmail: e.target.value })}
                  placeholder="student@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Student must have already signed up with this email</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                <Input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="e.g., Data Structures"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (Optional)</label>
                <Input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Student name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number (Optional)</label>
                <Input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  placeholder="e.g., CS-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade (Optional)</label>
                <Input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., B.Tech 2nd Year"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
              >
                {submitting ? "Adding..." : "Add Student to Course"}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setError("")
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {students.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{student.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.roll_number || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.grade || "N/A"}</td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">View Profile</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">No students enrolled yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
