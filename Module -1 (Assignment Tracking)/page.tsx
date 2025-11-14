"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        const { data } = await supabase
          .from("assignments")
          .select("*")
          .eq("student_id", session.user.id)
          .order("due_date", { ascending: true })

        setAssignments(data || [])
      }
      setLoading(false)
    }

    fetchAssignments()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const mockAssignments = [
    { id: 1, title: "Physics Project", subject: "Physics", due_date: "2025-11-10", status: "pending", score: null },
    { id: 2, title: "Math Homework", subject: "Mathematics", due_date: "2025-11-06", status: "submitted", score: 95 },
    { id: 3, title: "English Essay", subject: "English", due_date: "2025-11-12", status: "pending", score: null },
    {
      id: 4,
      title: "Chemistry Lab Report",
      subject: "Chemistry",
      due_date: "2025-11-08",
      status: "overdue",
      score: null,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-600 mt-2">Track your assignments and submissions</p>
      </div>

      <div className="space-y-4">
        {mockAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(assignment.status)}`}>
                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{assignment.subject}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📅 Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  {assignment.score && <span>⭐ Score: {assignment.score}/100</span>}
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                {assignment.status === "submitted" ? "View" : "Submit"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
