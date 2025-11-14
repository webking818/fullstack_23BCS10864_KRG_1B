"use client"

import { useState } from "react"

export default function AttendancePage() {
  const [attendanceData] = useState({
    present: 45,
    absent: 5,
    leave: 3,
    total: 53,
  })

  const attendancePercentage = ((attendanceData.present / attendanceData.total) * 100).toFixed(1)

  const monthlyData = [
    { month: "August", percentage: 92 },
    { month: "September", percentage: 88 },
    { month: "October", percentage: 95 },
    { month: "November", percentage: 90 },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-2">Monitor your attendance record</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Present</p>
          <p className="text-4xl font-bold mt-2">{attendanceData.present}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Absent</p>
          <p className="text-4xl font-bold mt-2">{attendanceData.absent}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Leave</p>
          <p className="text-4xl font-bold mt-2">{attendanceData.leave}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <p className="text-white/80 text-sm font-medium">Attendance %</p>
          <p className="text-4xl font-bold mt-2">{attendancePercentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Attendance</h3>
        <div className="space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium text-gray-700">{month.month}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${month.percentage}%` }}
                ></div>
              </div>
              <span className="w-12 text-right text-sm font-bold text-gray-900">{month.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
