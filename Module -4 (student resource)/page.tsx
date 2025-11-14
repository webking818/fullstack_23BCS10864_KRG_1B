"use client"

import { useState } from "react"

export default function ResourcesPage() {
  const [resources] = useState([
    {
      id: 1,
      title: "Physics Fundamentals",
      type: "Book",
      subject: "Physics",
      icon: "📚",
      description: "Complete guide to physics concepts",
    },
    {
      id: 2,
      title: "Math Problem Set",
      type: "PDF",
      subject: "Mathematics",
      icon: "📄",
      description: "100 solved math problems with solutions",
    },
    {
      id: 3,
      title: "Chemistry Lab Notes",
      type: "Document",
      subject: "Chemistry",
      icon: "📝",
      description: "Detailed lab procedures and observations",
    },
    {
      id: 4,
      title: "English Literature",
      type: "Video",
      subject: "English",
      icon: "🎥",
      description: "Introduction to classic literature",
    },
    {
      id: 5,
      title: "Computer Science Algorithms",
      type: "Code",
      subject: "Computer Science",
      icon: "💻",
      description: "Common algorithms with implementations",
    },
    {
      id: 6,
      title: "History Timeline",
      type: "Interactive",
      subject: "History",
      icon: "🗂️",
      description: "Interactive historical timeline",
    },
  ])

  const subjects = ["All", "Physics", "Mathematics", "Chemistry", "English", "Computer Science", "History"]
  const [selectedSubject, setSelectedSubject] = useState("All")

  const filteredResources =
    selectedSubject === "All" ? resources : resources.filter((r) => r.subject === selectedSubject)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600 mt-2">Access study materials and course resources</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubject === subject ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{resource.type}</p>
                <h3 className="text-xl font-bold mt-1">{resource.title}</h3>
              </div>
              <span className="text-4xl">{resource.icon}</span>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
