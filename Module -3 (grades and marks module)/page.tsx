"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function MarksPage() {
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMarks = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data } = await supabase
          .from("marks")
          .select("*")
          .eq("student_id", session.user.id)
          .order("created_at", { ascending: false })

        setMarks(data || [])
      }
      setLoading(false)
    }

    fetchMarks()
  }, [])

  const getGrade = (score: number) => {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    return "F"
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800"
    if (score >= 80) return "bg-blue-100 text-blue-800"
    if (score >= 70) return "bg-yellow-100 text-yellow-800"
    if (score >= 60) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Marks & Grades</h1>
        <p className="text-gray-600 mt-2">View your academic performance</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : marks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-600 text-lg">No marks recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Subject</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Exam Type</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Score</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Grade</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 font-medium">{mark.subject}</td>
                  <td className="px-6 py-4 text-gray-700">{mark.exam_type}</td>
                  <td className="px-6 py-4 text-gray-900 font-bold">{mark.score}/100</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(mark.score)}`}>
                      {getGrade(mark.score)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{new Date(mark.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {marks.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Average Score</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {(marks.reduce((sum, m) => sum + m.score, 0) / marks.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Highest Score</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{Math.max(...marks.map((m) => m.score))}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Total Exams</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{marks.length}</p>
          </div>
        </div>
      )}
    </div>
  )
}
