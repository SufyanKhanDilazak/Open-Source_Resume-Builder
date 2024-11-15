'use client'

import React, { useState, useCallback, useReducer, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { CalendarIcon, Plus, Trash2, GripVertical, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Palette, Undo2, Redo2, Menu, ImageIcon, X, Download } from 'lucide-react'
import { format } from "date-fns"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { debounce } from 'lodash'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type StyleOptions = {
  fontSize: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  textAlign: 'left' | 'center' | 'right' | 'justify'
  color: string
}

type ContentItem = {
  id: string
  title: string
  subheading: string
  details: string
  startDate?: Date
  endDate?: Date
  titleStyle: StyleOptions
  subheadingStyle: StyleOptions
  detailsStyle: StyleOptions
  dateStyle: StyleOptions
}

type Section = {
  id: string
  title: string
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'social' | 'custom'
  content: ContentItem[]
  headingStyle: StyleOptions
}

type ResumeState = {
  sections: Section[]
  theme: {
    backgroundColor: string
    textColor: string
    accentColor: string
  }
  personalImage?: string
  personalImagePosition: 'left' | 'center' | 'right'
}

function defaultStyleOptions(): StyleOptions {
  return {
    fontSize: '14px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000'
  }
}

function defaultHeadingStyle(): StyleOptions {
  return {
    fontSize: '20px',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000'
  }
}

const initialResumeState: ResumeState = {
  sections: [
    {
      id: '1',
      title: 'Personal Information',
      type: 'personal',
      content: [{
        id: '1',
        title: 'Contact',
        subheading: '',
        details: 'Your Name\nEmail: your.email@example.com\nPhone: (123) 456-7890\nLocation: Your City, State',
        titleStyle: defaultStyleOptions(),
        subheadingStyle: defaultStyleOptions(),
        detailsStyle: defaultStyleOptions(),
        dateStyle: defaultStyleOptions()
      }],
      headingStyle: defaultHeadingStyle()
    },
    {
      id: '2',
      title: 'Professional Summary',
      type: 'summary',
      content: [{
        id: '1',
        title: '',
        subheading: '',
        details: 'Your professional summary goes here. Highlight your key skills and experiences.',
        titleStyle: defaultStyleOptions(),
        subheadingStyle: defaultStyleOptions(),
        detailsStyle: defaultStyleOptions(),
        dateStyle: defaultStyleOptions()
      }],
      headingStyle: defaultHeadingStyle()
    },
    {
      id: '3',
      title: 'Work Experience',
      type: 'experience',
      content: [{
        id: '1',
        title: 'Job Title',
        subheading: 'Company Name',
        details: '• Responsibility or achievement\n• Another responsibility or achievement\n• One more key point about your role',
        startDate: new Date(2020, 0, 1),
        endDate: new Date(),
        titleStyle: defaultStyleOptions(),
        subheadingStyle: defaultStyleOptions(),
        detailsStyle: defaultStyleOptions(),
        dateStyle: defaultStyleOptions()
      }],
      headingStyle: defaultHeadingStyle()
    },
    {
      id: '4',
      title: 'Education',
      type: 'education',
      content: [{
        id: '1',
        title: 'Degree Name',
        subheading: 'University Name',
        details: 'Relevant coursework or achievements',
        startDate: new Date(2016, 8, 1),
        endDate: new Date(2020, 5, 1),
        titleStyle: defaultStyleOptions(),
        subheadingStyle: defaultStyleOptions(),
        detailsStyle: defaultStyleOptions(),
        dateStyle: defaultStyleOptions()
      }],
      headingStyle: defaultHeadingStyle()
    },
    {
      id: '5',
      title: 'Skills',
      type: 'skills',
      content: [{
        id: '1',
        title: 'Skills',
        subheading: '',
        details: '• Skill 1\n• Skill 2\n• Skill 3\n• Skill 4',
        titleStyle: defaultStyleOptions(),
        subheadingStyle: defaultStyleOptions(),
        detailsStyle: defaultStyleOptions(),
        dateStyle: defaultStyleOptions()
      }],
      headingStyle: defaultHeadingStyle()
    }
  ],
  theme: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#0ea5e9'
  },
  personalImagePosition: 'left'
}

type Action =
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; updates: Partial<Section> } }
  | { type: 'ADD_SUBSECTION'; payload: { sectionId: string } }
  | { type: 'UPDATE_SUBSECTION'; payload: { sectionId: string; subsectionId: string; updates: Partial<ContentItem> } }
  | { type: 'DELETE_SUBSECTION'; payload: { sectionId: string; subsectionId: string } }
  | { type: 'REORDER_SUBSECTIONS'; payload: { sectionId: string; startIndex: number; endIndex: number } }
  | { type: 'ADD_SECTION'; payload: { type: Section['type'] } }
  | { type: 'SET_STATE'; payload: ResumeState }
  | { type: 'UPDATE_PERSONAL_IMAGE'; payload: { image: string; position: 'left' | 'center' | 'right' } }

function resumeReducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId ? { ...section, ...action.payload.updates } : section
        )
      }
    case 'ADD_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                content: [
                  ...section.content,
                  {
                    id: Date.now().toString(),
                    title: `New ${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Entry`,
                    subheading: '',
                    details: '',
                    titleStyle: defaultStyleOptions(),
                    subheadingStyle: defaultStyleOptions(),
                    detailsStyle: defaultStyleOptions(),
                    dateStyle: defaultStyleOptions()
                  }
                ]
              }
            : section
        )
      }
    case 'UPDATE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                content: section.content.map(item =>
                  item.id === action.payload.subsectionId
                    ? { ...item, ...action.payload.updates }
                    : item
                )
              }
            : section
        )
      }
    case 'DELETE_SUBSECTION':
      return {
        ...state,
        sections: state.sections.map(section =>
          section.id === action.payload.sectionId
            ? {
                ...section,
                content: section.content.filter(item => item.id !== action.payload.subsectionId)
              }
            : section
        )
      }
    case 'REORDER_SUBSECTIONS':
      return {
        ...state,
        sections: state.sections.map(section => {
          if (section.id === action.payload.sectionId) {
            const newContent = Array.from(section.content)
            const [reorderedItem] = newContent.splice(action.payload.startIndex, 1)
            newContent.splice(action.payload.endIndex, 0, reorderedItem)
            return { ...section, content: newContent }
          }
          return section
        })
      }
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [
          ...state.sections,
          {
            id: Date.now().toString(),
            title: `New ${action.payload.type.charAt(0).toUpperCase() + action.payload.type.slice(1)} Section`,
            type: action.payload.type,
            content: [],
            headingStyle: defaultHeadingStyle()
          }
        ]
      }
    case 'SET_STATE':
      return action.payload
    case 'UPDATE_PERSONAL_IMAGE':
      return {
        ...state,
        personalImage: action.payload.image,
        personalImagePosition: action.payload.position
      }
    default:
      return state
  }
}

export default function ProfessionalResumeBuilder() {
  const [resumeState, dispatch] = useReducer(resumeReducer, initialResumeState)
  const [history, setHistory] = useState<ResumeState[]>([initialResumeState])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [editingSection, setEditingSection] = useState<Section | null>(null)

  useEffect(() => {
    if (JSON.stringify(resumeState) !== JSON.stringify(history[historyIndex])) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), resumeState])
      setHistoryIndex(prev => prev + 1)
    }
  }, [resumeState, history, historyIndex])

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, updates } })
  }, [])

  const addSubsection = useCallback((sectionId: string) => {
    dispatch({ type: 'ADD_SUBSECTION', payload: { sectionId } })
  }, [])

  const updateSubsection = useCallback((
    sectionId: string,
    subsectionId: string,
    updates: Partial<ContentItem>
  ) => {
    dispatch({ type: 'UPDATE_SUBSECTION', payload: { sectionId, subsectionId, updates } })
  }, [])

  const deleteSubsection = useCallback((sectionId: string, subsectionId: string) => {
    dispatch({ type: 'DELETE_SUBSECTION', payload: { sectionId, subsectionId } })
  }, [])

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const sectionId = source.droppableId

    dispatch({
      type: 'REORDER_SUBSECTIONS',
      payload: {
        sectionId,
        startIndex: source.index,
        endIndex: destination.index
      }
    })
  }, [])

  const addSection = useCallback((type: Section['type']) => {
    dispatch({ type: 'ADD_SECTION', payload: { type } })
  }, [])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      dispatch({ type: 'SET_STATE', payload: history[historyIndex - 1] })
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      dispatch({ type: 'SET_STATE', payload: history[historyIndex + 1] })
    }
  }, [history, historyIndex])

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        dispatch({
          type: 'UPDATE_PERSONAL_IMAGE',
          payload: { image: reader.result as string, position: resumeState.personalImagePosition }
        })
      }
      reader.readAsDataURL(file)
    }
  }, [resumeState.personalImagePosition])

  const handleImagePositionChange = useCallback((position: 'left' | 'center' | 'right') => {
    dispatch({
      type: 'UPDATE_PERSONAL_IMAGE',
      payload: { image: resumeState.personalImage || '', position }
    })
  }, [resumeState.personalImage])

  const removeImage = useCallback(() => {
    dispatch({
      type: 'UPDATE_PERSONAL_IMAGE',
      payload: { image: '', position: resumeState.personalImagePosition }
    })
  }, [resumeState.personalImagePosition])

  const downloadPDF = useCallback(() => {
    const input = document.getElementById('resume-preview')
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 30
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
        pdf.save('resume.pdf')
      })
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold mr-4">Resume Builder</h1>
              <Button onClick={() => addSection('custom')} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {resumeState.sections.map((section) => (
                    <DropdownMenuItem key={section.id} onSelect={() => setEditingSection(section)}>
                      {section.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <ResumePreview
            resumeState={resumeState}
            onSectionClick={setEditingSection}
            onImageUpload={handleImageUpload}
            onImagePositionChange={handleImagePositionChange}
            onImageRemove={removeImage}
          />
        </div>
      </main>

      <EditingSidebar
        section={editingSection}
        onClose={() => setEditingSection(null)}
        updateSection={updateSection}
        addSubsection={addSubsection}
        updateSubsection={updateSubsection}
        deleteSubsection={deleteSubsection}
        onDragEnd={onDragEnd}
        undo={undo}
        redo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
    </div>
  )
}

type StyleControlsProps = {
  style: StyleOptions
  onChange: (updates: Partial<StyleOptions>) => void
}

function StyleControls({ style, onChange }: StyleControlsProps) {
  const debouncedOnChange = useMemo(
    () => debounce(onChange, 300),
    [onChange]
  )

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Select
        value={style.fontSize}
        onValueChange={(value) => debouncedOnChange({ fontSize: value })}
      >
        <SelectTrigger className="w-24">
          <Type className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {['12px', '14px', '16px', '18px', '20px', '24px'].map(size => (
            <SelectItem key={size} value={size}>{size}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Toggle
        pressed={style.fontWeight === 'bold'}
        onPressedChange={(pressed) => debouncedOnChange({ fontWeight: pressed ? 'bold' : 'normal' })}
        aria-label="Toggle bold"
      >
        <Bold className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.fontStyle === 'italic'}
        onPressedChange={(pressed) => debouncedOnChange({ fontStyle: pressed ? 'italic' : 'normal' })}
        aria-label="Toggle italic"
      >
        <Italic className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.textDecoration === 'underline'}
        onPressedChange={(pressed) => debouncedOnChange({ textDecoration: pressed ? 'underline' : 'none' })}
        aria-label="Toggle underline"
      >
        <Underline className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.textAlign === 'left'}
        onPressedChange={() => debouncedOnChange({ textAlign: 'left' })}
        aria-label="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.textAlign === 'center'}
        onPressedChange={() => debouncedOnChange({ textAlign: 'center' })}
        aria-label="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.textAlign === 'right'}
        onPressedChange={() => debouncedOnChange({ textAlign: 'right' })}
        aria-label="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </Toggle>
      <Toggle
        pressed={style.textAlign === 'justify'}
        onPressedChange={() => debouncedOnChange({ textAlign: 'justify' })}
        aria-label="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </Toggle>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center bg-white rounded-md p-2">
              <Label htmlFor="color-picker" className="sr-only">Color</Label>
              <Palette className="w-4 h-4 mr-2" />
              <Input
                id="color-picker"
                type="color"
                value={style.color}
                onChange={(e) => debouncedOnChange({ color: e.target.value })}
                className="w-6 h-6 p-0 border-none"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change color</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function ResumePreview({
  resumeState,
  onSectionClick,
  onImageUpload,
  onImagePositionChange,
  onImageRemove
}: {
  resumeState: ResumeState;
  onSectionClick: (section: Section) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImagePositionChange: (position: 'left' | 'center' | 'right') => void;
  onImageRemove: () => void;
}) {
  return (
    <div id="resume-preview" className="space-y-6 bg-white p-8 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        {resumeState.personalImage ? (
          <div className={`flex items-center justify-${resumeState.personalImagePosition}`}>
            <Avatar className="w-32 h-32">
              <AvatarImage src={resumeState.personalImage} alt="Personal Image" />
              <AvatarFallback>PI</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <Button variant="outline" size="sm" onClick={onImageRemove}>
                <X className="w-4 h-4 mr-2" />
                Remove Image
              </Button>
              <Select
                value={resumeState.personalImagePosition}
                onValueChange={(value: 'left' | 'center' | 'right') => onImagePositionChange(value)}
              >
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Image Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Image
                </span>
              </Button>
            </Label>
          </div>
        )}
      </div>
      {resumeState.sections.map((section) => (
        <div key={section.id} className="space-y-4 cursor-pointer" onClick={() => onSectionClick(section)}>
          <h2 style={{...section.headingStyle}} className="border-b pb-2">{section.title}</h2>
          {section.content.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 style={{...item.titleStyle}}>{item.title}</h3>
                {(section.type === 'experience' || section.type === 'education') && (
                  <span style={{...item.dateStyle}}>
                    {item.startDate && format(item.startDate, "MMMM yyyy")}
                    {item.startDate && item.endDate && " - "}
                    {item.endDate && format(item.endDate, "MMMM yyyy")}
                  </span>
                )}
              </div>
              {item.subheading && (
                <h4 style={{...item.subheadingStyle}}>{item.subheading}</h4>
              )}
              <p style={{...item.detailsStyle}} className="whitespace-pre-wrap">{item.details}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function EditingSidebar({ 
  section, 
  onClose, 
  updateSection, 
  addSubsection, 
  updateSubsection, 
  deleteSubsection, 
  onDragEnd,
  undo,
  redo,
  canUndo,
  canRedo
}: {
  section: Section | null;
  onClose: () => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  addSubsection: (sectionId: string) => void;
  updateSubsection: (sectionId: string, subsectionId: string, updates: Partial<ContentItem>) => void;
  deleteSubsection: (sectionId: string, subsectionId: string) => void;
  onDragEnd: (result: DropResult) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  if (!section) return null;

  return (
    <Sheet open={!!section} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>
            <Input
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              className="text-xl font-bold"
            />
          </SheetTitle>
          <SheetDescription>Make changes to your resume section here.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <Button onClick={undo} disabled={!canUndo} variant="outline" size="icon">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button onClick={redo} disabled={!canRedo} variant="outline" size="icon">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
            <StyleControls
              style={section.headingStyle}
              onChange={(updates) => updateSection(section.id, { headingStyle: { ...section.headingStyle, ...updates } })}
            />
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={section.id}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {section.content.map((subsection, index) => (
                      <Draggable key={subsection.id} draggableId={subsection.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="mb-4 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="text-gray-400" />
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteSubsection(section.id, subsection.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <Label>Title</Label>
                                <Input
                                  value={subsection.title}
                                  onChange={(e) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { title: e.target.value }
                                  )}
                                />
                                <StyleControls
                                  style={subsection.titleStyle}
                                  onChange={(updates) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { titleStyle: { ...subsection.titleStyle, ...updates } }
                                  )}
                                />
                              </div>
                              <div>
                                <Label>Subheading</Label>
                                <Input
                                  value={subsection.subheading}
                                  onChange={(e) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { subheading: e.target.value }
                                  )}
                                />
                                <StyleControls
                                  style={subsection.subheadingStyle}
                                  onChange={(updates) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { subheadingStyle: { ...subsection.subheadingStyle, ...updates } }
                                  )}
                                />
                              </div>
                              {(section.type === 'experience' || section.type === 'education') && (
                                <div className="flex space-x-2">
                                  <div className="flex-1">
                                    <Label>Start Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={`w-full justify-start text-left font-normal ${!subsection.startDate && "text-muted-foreground"}`}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {subsection.startDate ? (
                                            format(subsection.startDate, "MMMM yyyy")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={subsection.startDate}
                                          onSelect={(date) => updateSubsection(
                                            section.id,
                                            subsection.id,
                                            { startDate: date }
                                          )}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                  <div className="flex-1">
                                    <Label>End Date</Label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={`w-full justify-start text-left font-normal ${!subsection.endDate && "text-muted-foreground"}`}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {subsection.endDate ? (
                                            format(subsection.endDate, "MMMM yyyy")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={subsection.endDate}
                                          onSelect={(date) => updateSubsection(
                                            section.id,
                                            subsection.id,
                                            { endDate: date }
                                          )}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              )}
                              <StyleControls
                                style={subsection.dateStyle}
                                onChange={(updates) => updateSubsection(
                                  section.id,
                                  subsection.id,
                                  { dateStyle: { ...subsection.dateStyle, ...updates } }
                                )}
                              />
                              <div>
                                <Label>Details</Label>
                                <Textarea
                                  value={subsection.details}
                                  onChange={(e) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { details: e.target.value }
                                  )}
                                  rows={4}
                                />
                                <StyleControls
                                  style={subsection.detailsStyle}
                                  onChange={(updates) => updateSubsection(
                                    section.id,
                                    subsection.id,
                                    { detailsStyle: { ...subsection.detailsStyle, ...updates } }
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button onClick={() => addSubsection(section.id)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
            </Button>
          </div>
        </div>
        <SheetClose asChild>
          <Button className="mt-4">Save changes</Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}