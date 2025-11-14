"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"

export function DashboardOverview() {
  const [stats, setStats] = useState({
    averageMarks: 0,
    completedAssignments: 0,
    attendancePercentage: 0,
    upcomingClasses: 0,
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
        // Fetch marks
        const { data: marks } = await supabase.from("marks").select("score").eq("student_id", session.user.id)

        const avgMarks =
          marks && marks.length > 0 ? (marks.reduce((sum, m) => sum + m.score, 0) / marks.length).toFixed(1) : 0

        // Fetch assignments
        const { data: assignments } = await supabase.from("assignments").select("id").eq("student_id", session.user.id)

        setStats({
          averageMarks: Number(avgMarks),
          completedAssignments: assignments?.length || 0,
          attendancePercentage: 85,
          upcomingClasses: 4,
        })
      }
    }

    fetchStats()
  }, [])

  const cards = [
    {
      title: "Average Marks",
      value: stats.averageMarks.toFixed(1),
      icon: "📈",
      color: "from-blue-500 to-blue-600",
      suffix: "%",
    },
    {
      title: "Completed Assignments",
      value: stats.completedAssignments,
      icon: "✓",
      color: "from-green-500 to-green-600",
      suffix: "",
    },
    {
      title: "Attendance",
      value: stats.attendancePercentage,
      icon: "📅",
      color: "from-purple-500 to-purple-600",
      suffix: "%",
    },
    {
      title: "Upcoming Classes",
      value: stats.upcomingClasses,
      icon: "⏰",
      color: "from-orange-500 to-orange-600",
      suffix: "",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.title} className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{card.title}</p>
                <p className="text-4xl font-bold mt-2">
                  {card.value}
                  {card.suffix}
                </p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time: "09:00 AM", class: "Mathematics" },
              { time: "10:30 AM", class: "Physics" },
              { time: "01:00 PM", class: "English" },
              { time: "02:30 PM", class: "Computer Science" },
            ].map((item) => (
              <div key={item.time} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-blue-600 font-mono font-bold">{item.time}</span>
                <span className="text-gray-700">{item.class}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {[
              { title: "Physics Project", due: "Due tomorrow" },
              { title: "Math Assignment", due: "Due in 3 days" },
              { title: "English Essay", due: "Due in 5 days" },
              { title: "History Quiz", due: "Due next week" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.due}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
