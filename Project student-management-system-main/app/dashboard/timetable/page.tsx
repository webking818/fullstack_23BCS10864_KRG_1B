"use client"

import { useState } from "react"

export default function TimetablePage() {
  const [weekDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])

  const timetable: Record<string, Array<{ time: string; subject: string; room: string }>> = {
    Monday: [
      { time: "09:00 - 10:00", subject: "Mathematics", room: "Room 101" },
      { time: "10:15 - 11:15", subject: "Physics", room: "Lab A" },
      { time: "11:30 - 12:30", subject: "English", room: "Room 205" },
      { time: "01:30 - 02:30", subject: "History", room: "Room 301" },
    ],
    Tuesday: [
      { time: "09:00 - 10:00", subject: "Chemistry", room: "Lab B" },
      { time: "10:15 - 11:15", subject: "Computer Science", room: "Lab C" },
      { time: "11:30 - 12:30", subject: "Biology", room: "Lab D" },
      { time: "01:30 - 02:30", subject: "Economics", room: "Room 102" },
    ],
    Wednesday: [
      { time: "09:00 - 10:00", subject: "Mathematics", room: "Room 101" },
      { time: "10:15 - 11:15", subject: "Geography", room: "Room 202" },
      { time: "11:30 - 12:30", subject: "Art", room: "Art Studio" },
      { time: "01:30 - 02:30", subject: "Music", room: "Music Room" },
    ],
    Thursday: [
      { time: "09:00 - 10:00", subject: "Physics", room: "Lab A" },
      { time: "10:15 - 11:15", subject: "English", room: "Room 205" },
      { time: "11:30 - 12:30", subject: "Physical Education", room: "Gym" },
      { time: "01:30 - 02:30", subject: "Chemistry", room: "Lab B" },
    ],
    Friday: [
      { time: "09:00 - 10:00", subject: "Computer Science", room: "Lab C" },
      { time: "10:15 - 11:15", subject: "Mathematics", room: "Room 101" },
      { time: "11:30 - 12:30", subject: "Biology", room: "Lab D" },
      { time: "01:30 - 02:30", subject: "Assembly", room: "Main Hall" },
    ],
  }

  const colors = [
    "from-blue-500 to-blue-600",
    "from-purple-500 to-purple-600",
    "from-pink-500 to-pink-600",
    "from-green-500 to-green-600",
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Timetable</h1>
        <p className="text-gray-600 mt-2">Your weekly schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {weekDays.map((day) => (
          <div key={day} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{day}</h3>
            </div>
            <div className="p-4 space-y-3">
              {timetable[day].map((cls, idx) => (
                <div key={idx} className={`bg-gradient-to-r ${colors[idx]} rounded-lg p-4 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{cls.subject}</p>
                      <p className="text-white/80 text-sm mt-1">{cls.time}</p>
                      <p className="text-white/80 text-sm mt-1">📍 {cls.room}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
