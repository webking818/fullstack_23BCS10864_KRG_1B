"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function FacultyDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    pendingSubmissions: 0,
    assignmentsCreated: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Fetch total students
        const { data: students } = await supabase
          .from("student_faculty_mapping")
          .select("student_id", { count: "exact" })
          .eq("faculty_id", session.user.id)

        // Fetch total courses
        const { data: courses } = await supabase
          .from("faculty_courses")
          .select("id", { count: "exact" })
          .eq("faculty_id", session.user.id)

        // Fetch pending submissions
        const { data: assignments } = await supabase.from("assignments").select("id").eq("faculty_id", session.user.id)

        const pendingCount = 0
        if (assignments && assignments.length > 0) {
          const { data: submissions, count } = await supabase
            .from("submissions")
            .select("id", { count: "exact" })
            .in(
              "assignment_id",
              assignments.map((a) => a.id),
            )
        }

        setStats({
          totalStudents: students?.length || 0,
          totalCourses: courses?.length || 0,
          pendingSubmissions: pendingCount,
          assignmentsCreated: assignments?.length || 0,
        })
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: "👥",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: "📚",
      color: "from-green-500 to-green-600",
    },
    {
      title: "Assignments",
      value: stats.assignmentsCreated,
      icon: "📋",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Pending Submissions",
      value: stats.pendingSubmissions,
      icon: "⏳",
      color: "from-orange-500 to-orange-600",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your courses, students, and assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{card.title}</p>
                <p className="text-4xl font-bold mt-2">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
