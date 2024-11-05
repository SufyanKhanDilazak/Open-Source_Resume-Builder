'use client'
import { useState } from 'react'
import ResumeForm from '../app/components/resume-form'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface Experience {
  position: string
  company: string
  startDate: string
  endDate?: string
  description: string
}

interface Education {
  degree: string
  institution: string
  startDate: string
  endDate: string
}

interface ResumeData {
  fullName: string
  email: string
  address?: string
  summary?: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  linkedinLink?: string
  githubLink?: string
}

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [profileImage, setProfileImage] = useState<string>('')
  
  const handleSubmit = (data: ResumeData, image: string) => {
    setResumeData(data)
    setProfileImage(image)
  }

  const downloadPDF = async () => {
    const resumeElement = document.getElementById('resume')
    if (resumeElement) {
      const scale = 5 // Increased for even better quality
      const options = {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
        letterRendering: true,
        windowWidth: resumeElement.scrollWidth * 2,
        windowHeight: resumeElement.scrollHeight * 2
      }

      try {
        const canvas = await html2canvas(resumeElement, options)
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: false,
          hotfixes: ['px_scaling']
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width / scale
        const imgHeight = canvas.height / scale
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 0

        pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio, '', 'FAST')
        pdf.save(`${resumeData?.fullName.replace(/\s+/g, '_')}_Resume.pdf`)
      } catch (error) {
        console.error('Error generating PDF:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 pt-8">Professional Resume Builder</h1>
        {!resumeData ? (
          <ResumeForm onSubmit={handleSubmit} />
        ) : (
          <div>
            <Card id="resume" className="mb-8 max-w-4xl mx-auto bg-white shadow-2xl">
              <CardContent className="p-10">
                {/* Header Section with Optional Profile Picture */}
                <header className="mb-8 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <h2 className="text-4xl font-bold mb-3 text-gray-800">{resumeData.fullName}</h2>
                      <div className="text-lg text-gray-600 space-y-1">
                        <p>{resumeData.email}</p>
                        {resumeData.address && <p>{resumeData.address}</p>}
                      </div>
                    </div>
                    {profileImage && (
                      <Avatar className="w-24 h-24 rounded-full border-4 border-gray-200">
                        <AvatarImage src={profileImage} alt={resumeData.fullName} />
                        <AvatarFallback>{resumeData.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </header>

                {/* Professional Summary */}
                {resumeData.summary && (
                  <section className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Professional Summary</h3>
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {resumeData.summary}
                    </p>
                  </section>
                )}

                {/* Work Experience */}
                <section className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Professional Experience</h3>
                  {resumeData.experience.map((exp: Experience, index: number) => (
                    <div key={index} className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-800">{exp.position}</h4>
                          <p className="text-lg font-medium text-gray-700">{exp.company}</p>
                        </div>
                        <p className="text-gray-600 whitespace-nowrap">
                          {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                          {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                        </p>
                      </div>
                      <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
                        {exp.description.split('\n').map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>

                {/* Education */}
                <section className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Education</h3>
                  {resumeData.education.map((edu: Education, index: number) => (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-semibold text-gray-800">{edu.degree}</p>
                          <p className="text-lg text-gray-700">{edu.institution}</p>
                        </div>
                        <p className="text-gray-600 whitespace-nowrap">
                          {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                          {new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </section>

                {/* Skills */}
                <section className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 pb-2">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill: string, index: number) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Professional Links */}
                <section className="mt-8 pt-6 border-t-2 border-gray-200">
                  <div className="flex justify-center space-x-6">
                    {resumeData.linkedinLink && (
                      <a 
                        href={resumeData.linkedinLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {resumeData.githubLink && (
                      <a 
                        href={resumeData.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        GitHub Profile
                      </a>
                    )}
                  </div>
                </section>
              </CardContent>
            </Card>

            <div className="text-center mb-12">
              <Button 
                onClick={downloadPDF} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Download Resume PDF
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}