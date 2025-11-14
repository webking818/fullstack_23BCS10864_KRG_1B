"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function UploadMarksPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [marks, setMarks] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    subject: "",
    examType: "midterm",
    score: "",
    totalMarks: "100",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { data: mappings } = await supabase
        .from("student_faculty_mapping")
        .select("student_id")
        .eq("faculty_id", session.user.id)

      if (mappings && mappings.length > 0) {
        const studentIds = mappings.map((m) => m.student_id)
        const { data: studentData } = await supabase.from("students").select("id, name, email").in("id", studentIds)

        setStudents(studentData || [])

        const { data: marksData } = await supabase.from("marks").select("*").eq("faculty_id", session.user.id)

        setMarks(marksData || [])
      }
    }
    setLoading(false)
  }

  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const { error } = await supabase.from("marks").insert({
        faculty_id: session.user.id,
        student_id: formData.studentId,
        subject: formData.subject,
        exam_type: formData.examType,
        score: Number.parseFloat(formData.score),
        total_marks: Number.parseInt(formData.totalMarks),
      })

      if (!error) {
        setFormData({ studentId: "", subject: "", examType: "midterm", score: "", totalMarks: "100" })
        setShowForm(false)
        fetchData()
      }
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Upload Marks</h1>
          <p className="text-gray-600 mt-2">Record student examination marks</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white">
          Add Marks
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmitMarks} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                <Input
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  placeholder="e.g., 85"
                  required
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Submit Marks
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
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
          {marks.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Exam Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{mark.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{mark.exam_type}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">{mark.score}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mark.total_marks}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {((mark.score / mark.total_marks) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">No marks recorded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
