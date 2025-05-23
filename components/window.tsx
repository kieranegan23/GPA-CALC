"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Plus, GraduationCap, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClassEntry {
  id: number
  name: string
  grade: string
  credits: number
  semester?: string
}

interface WindowProps {
  title: string
  width: number
  height: number
  children?: React.ReactNode
}

export function Window({ title, width, height, children }: WindowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [classes, setClasses] = useState<ClassEntry[]>([])
  const [currentClass, setCurrentClass] = useState<Partial<ClassEntry>>({
    name: "",
    grade: "",
    credits: undefined,
    semester: "",
  })
  const [term, setTerm] = useState<string>("")
  const [year, setYear] = useState<string>("")

  // Generate years from 00 to 99
  const years = Array.from({ length: 100 }, (_, i) => {
    const yearNum = i
    return yearNum < 10 ? `0${yearNum}` : `${yearNum}`
  })

  // Function to convert full term names to abbreviations
  const getTermAbbreviation = (fullTerm: string) => {
    switch (fullTerm) {
      case "Spring":
        return "SP"
      case "Fall":
        return "FA"
      case "Summer":
        return "SM"
      case "Winter":
        return "WN"
      default:
        return fullTerm
    }
  }

  // Function to convert abbreviations back to full term names
  const getFullTermName = (abbreviation: string) => {
    switch (abbreviation) {
      case "SP":
        return "Spring"
      case "FA":
        return "Fall"
      case "SM":
        return "Summer"
      case "WN":
        return "Winter"
      default:
        return abbreviation
    }
  }

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedClasses = localStorage.getItem("gpa-calculator-classes")
    if (savedClasses) {
      try {
        const parsedClasses = JSON.parse(savedClasses)
        setClasses(parsedClasses)
      } catch (error) {
        console.error("Error loading saved classes:", error)
        setClasses([])
      }
    }
  }, [])

  // Auto-save whenever classes change
  useEffect(() => {
    if (classes.length > 0) {
      localStorage.setItem("gpa-calculator-classes", JSON.stringify(classes))
    }
  }, [classes])

  // Get grade color based on grade
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "bg-green-100 text-green-800"
      case "A-":
        return "bg-green-200 text-green-800"
      case "B+":
        return "bg-yellow-100 text-yellow-800"
      case "B":
        return "bg-yellow-200 text-yellow-800"
      case "B-":
        return "bg-orange-100 text-orange-800"
      case "C+":
        return "bg-orange-200 text-orange-800"
      case "C":
        return "bg-orange-300 text-orange-900"
      case "C-":
        return "bg-red-100 text-red-800"
      case "D":
        return "bg-red-200 text-red-800"
      case "F":
        return "bg-red-300 text-red-900"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate GPA and total credits
  const calculateGPA = () => {
    if (classes.length === 0) return "0"

    const gradePoints: Record<string, number> = {
      A: 4.0,
      "A-": 3.67,
      "B+": 3.33,
      B: 3.0,
      "B-": 2.67,
      "C+": 2.33,
      C: 2.0,
      "C-": 1.67,
      D: 1.0,
      F: 0.0,
    }

    let totalPoints = 0
    let totalCredits = 0

    classes.forEach((cls) => {
      if (cls.grade && cls.credits) {
        totalPoints += gradePoints[cls.grade] * cls.credits
        totalCredits += cls.credits
      }
    })

    if (totalCredits === 0) return "0"

    const gpa = totalPoints / totalCredits

    // Format GPA to show 3 decimal places only when needed
    if (gpa === Math.floor(gpa)) {
      return gpa.toString()
    } else if (gpa * 10 === Math.floor(gpa * 10)) {
      return gpa.toFixed(1)
    } else if (gpa * 100 === Math.floor(gpa * 100)) {
      return gpa.toFixed(2)
    } else {
      return gpa.toFixed(3)
    }
  }

  const getTotalCredits = () => {
    return classes.reduce((sum, cls) => sum + (cls.credits || 0), 0)
  }

  const handleOpenAddModal = () => {
    setIsEditMode(false)
    setCurrentClass({
      name: "",
      grade: "",
      credits: undefined,
      semester: "",
    })
    setTerm("")
    setYear("")
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (cls: ClassEntry) => {
    setIsEditMode(true)
    setCurrentClass({ ...cls })

    // Parse semester if it exists
    if (cls.semester) {
      const parts = cls.semester.split(" ")
      if (parts.length === 2) {
        const fullTermName = getFullTermName(parts[0])
        setTerm(fullTermName)
        setYear(parts[1])
      }
    } else {
      setTerm("")
      setYear("")
    }

    setIsModalOpen(true)
  }

  const handleSaveClass = () => {
    // Check if all required fields are filled
    if (!currentClass.name || !currentClass.grade || !currentClass.credits || !term || !year) {
      return
    }

    // Combine term and year to create semester with abbreviation
    let semester = ""
    if (term && year) {
      const termAbbr = getTermAbbreviation(term)
      semester = `${termAbbr} ${year}`
    }

    if (isEditMode && currentClass.id) {
      // Update existing class
      setClasses(
        classes.map((cls) => (cls.id === currentClass.id ? ({ ...currentClass, semester } as ClassEntry) : cls)),
      )
    } else {
      // Add new class
      const classToAdd: ClassEntry = {
        id: Date.now(),
        name: currentClass.name,
        grade: currentClass.grade,
        credits: currentClass.credits,
        semester,
      }
      setClasses([...classes, classToAdd])
    }

    // Reset form and close modal
    setCurrentClass({ name: "", grade: "", credits: undefined, semester: "" })
    setTerm("")
    setYear("")
    setIsModalOpen(false)
  }

  const handleDeleteClass = (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Prevent opening edit modal when clicking delete
    setClasses(classes.filter((cls) => cls.id !== id))
  }

  const handleSave = () => {
    localStorage.setItem("gpa-calculator-classes", JSON.stringify(classes))
    alert("Data saved successfully!")
  }

  // Check if all required fields are filled
  const isFormValid = () => {
    return !!(currentClass.name && currentClass.grade && currentClass.credits && term && year)
  }

  return (
    <>
      <div
        className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Title bar */}
        <div className="flex h-9 items-center justify-center bg-gray-100 px-3">
          <div className="text-sm font-medium text-gray-700">{title}</div>
        </div>

        {/* GPA and Credits section */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-700">
              <span className="font-medium">My GPA:</span> <span className="text-gray-900">{calculateGPA()}</span>
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Credits:</span> <span className="text-gray-900">{getTotalCredits()}</span>
            </div>
          </div>
        </div>

        {/* Window content - Class list */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {classes.length === 0 ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-gray-400">
                <GraduationCap className="mb-2 h-10 w-10 text-gray-300" />
                <p>No classes added yet</p>
                <p className="text-sm">Click the Add button to get started</p>
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-md border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleOpenEditModal(cls)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{cls.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>
                          {cls.credits} credit{cls.credits !== 1 ? "s" : ""}
                        </span>
                        {cls.semester && (
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{cls.semester}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-2">
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => handleDeleteClass(e, cls.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${getGradeColor(cls.grade)}`}
                      >
                        {cls.grade}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer with buttons */}
        <div className="flex items-center justify-between border-t border-gray-200 p-3">
          <button
            className="flex h-9 items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 min-w-[100px]"
            onClick={handleOpenAddModal}
          >
            <Plus className="h-5 w-5 mr-1" />
            <span>Add</span>
          </button>
          <button
            className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 min-w-[100px]"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Class" : "Add New Class"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="className">Class Name *</Label>
              <Input
                id="className"
                placeholder="Enter class name"
                value={currentClass.name || ""}
                onChange={(e) => setCurrentClass({ ...currentClass, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade Received *</Label>
              <Select
                value={currentClass.grade}
                onValueChange={(value) => setCurrentClass({ ...currentClass, grade: value })}
                required
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="C+">C+</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="C-">C-</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credits">Credits *</Label>
              <Select
                value={currentClass.credits?.toString()}
                onValueChange={(value) => setCurrentClass({ ...currentClass, credits: Number.parseInt(value) })}
                required
              >
                <SelectTrigger id="credits">
                  <SelectValue placeholder="Select credits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Semester *</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={term} onValueChange={setTerm} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                    <SelectItem value="Winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClass} disabled={!isFormValid()}>
              {isEditMode ? "Update" : "Add"} Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
