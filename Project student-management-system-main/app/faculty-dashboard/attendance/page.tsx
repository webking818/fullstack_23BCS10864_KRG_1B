"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [attendance, setAttendance] = useState<{ [key: string]: "present" | "absent" }>({})

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
      const { data: mappings } = await supabase
        .from("student_faculty_mapping")
        .select("student_id, course_name")
        .eq("faculty_id", session.user.id)

      if (mappings && mappings.length > 0) {
        const studentIds = [...new Set(mappings.map((m) => m.student_id))]
        const { data: studentData } = await supabase.from("students").select("id, name, email").in("id", studentIds)

        setStudents(studentData || [])

        const { data: attendanceData } = await supabase.from("attendance").select("*").eq("date", selectedDate)

        setRecords(attendanceData || [])
        const attendanceMap: { [key: string]: "present" | "absent" } = {}
        attendanceData?.forEach((record) => {
          attendanceMap[record.student_id] = record.status
        })
        setAttendance(attendanceMap)
      }
    }
    setLoading(false)
  }

  const handleSubmitAttendance = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      for (const [studentId, status] of Object.entries(attendance)) {
        if (studentId) {
          await supabase.from("attendance").insert({
            student_id: studentId,
            date: selectedDate,
            status: status,
            subject: selectedSubject,
          })
        }
      }
      alert("Attendance submitted successfully")
    }
  }

  return (
    <div className="p-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-2">Record student attendance for the day</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 my-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                fetchStudents()
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <Input
              type="text"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              placeholder="e.g., Mathematics"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-600">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAttendance({ ...attendance, [student.id]: "present" })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        attendance[student.id] === "present"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setAttendance({ ...attendance, [student.id]: "absent" })}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        attendance[student.id] === "absent"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleSubmitAttendance} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Submit Attendance
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
