'use client'
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Experience {
  position: string
  company: string
  startDate: string
  endDate: string
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
  address: string
  phoneNumber: string
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  certifications: string[]
  languages: string[]
  githubLink: string
  linkedinLink: string
  portfolioLink: string
}

interface ResumeFormProps {
  onSubmit: (data: ResumeData, image: string) => void
}

export default function ResumeForm({ onSubmit }: ResumeFormProps) {
  const [formData, setFormData] = useState<ResumeData>({
    fullName: '',
    email: '',
    address: '',
    phoneNumber: '',
    summary: '',
    experience: [
      {
        position: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ],
    education: [
      {
        degree: '',
        institution: '',
        startDate: '',
        endDate: ''
      }
    ],
    skills: [''],
    certifications: [''],
    languages: [''],
    githubLink: '',
    linkedinLink: '',
    portfolioLink: ''
  })

  const [profileImage, setProfileImage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageError, setImageError] = useState<string>('')

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setImageError('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
        setImageError('')
      }
      reader.onerror = () => {
        setImageError('Error reading file')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const newExperience = [...formData.experience]
    newExperience[index] = { ...newExperience[index], [field]: value }
    setFormData({ ...formData, experience: newExperience })
  }

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...formData.education]
    newEducation[index] = { ...newEducation[index], [field]: value }
    setFormData({ ...formData, education: newEducation })
  }

  const handleArrayFieldChange = (index: number, value: string, field: keyof Pick<ResumeData, 'skills' | 'certifications' | 'languages'>) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({ ...formData, [field]: newArray })
  }

  const addArrayField = (field: keyof Pick<ResumeData, 'skills' | 'certifications' | 'languages'>) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    })
  }

  const removeArrayField = (index: number, field: keyof Pick<ResumeData, 'skills' | 'certifications' | 'languages'>) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index)
      setFormData({ ...formData, [field]: newArray })
    }
  }

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { position: '', company: '', startDate: '', endDate: '', description: '' }
      ]
    })
  }

  const removeExperience = (index: number) => {
    if (formData.experience.length > 1) {
      const newExperience = formData.experience.filter((_, i) => i !== index)
      setFormData({ ...formData, experience: newExperience })
    }
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { degree: '', institution: '', startDate: '', endDate: '' }
      ]
    })
  }

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      const newEducation = formData.education.filter((_, i) => i !== index)
      setFormData({ ...formData, education: newEducation })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, profileImage)
  }


  return (
    <Card className="max-w-4xl mx-auto bg-white shadow-xl">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          {/* Profile Picture Upload */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Profile Picture (Optional)</h3>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24 border-2 border-gray-200">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback>Upload</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Upload Photo
                </Button>
                {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
                <p className="text-sm text-gray-500">Maximum size: 5MB</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-lg">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="text-lg p-3"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-lg p-3"
                  placeholder="johndoe@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-lg">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="text-lg p-3"
                
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-lg">Location</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="text-lg p-3"
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-lg">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="h-40 text-lg p-3"
              
              />
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Experience</h3>
            {formData.experience.map((exp, index) => (
              <div key={index} className="space-y-4 p-6 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-700">Experience {index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Remove</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Experience</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this experience? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeExperience(index)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                <Input
                  placeholder="Position Title"
                  value={exp.position}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  className="text-lg p-3"
                  required
                />
                <Input
                  placeholder="Company Name"
                  value={exp.company}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  className="text-lg p-3"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Start Date</Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="text-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End Date</Label>
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="text-lg p-3"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="h-40 text-lg p-3"
                    required
                  />
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              onClick={addExperience} 
              variant="outline"
              className="w-full py-2 text-lg"
            >
              Add Another Experience
            </Button>
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Education</h3>
            {formData.education.map((edu, index) => (
              <div key={index} className="space-y-4 p-6 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-semibold text-gray-700">Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Remove</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Education</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this education entry? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeEducation(index)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <Input
                  placeholder="Degree / Certification"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                  className="text-lg p-3"
                  required
                />
                <Input
                  placeholder="Institution Name"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                  className="text-lg p-3"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Start Date</Label>
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                      className="text-lg p-3"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">End Date</Label>
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                      className="text-lg p-3"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button 
              type="button" 
              onClick={addEducation}
              variant="outline"
              className="w-full py-2 text-lg"
            >
              Add Another Education
            </Button>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Skills</h3>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
                
                  value={skill}
                  onChange={(e) => handleArrayFieldChange(index, e.target.value, 'skills')}
                  className="text-lg p-3"
                />
                {formData.skills.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayField(index, 'skills')}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              onClick={() => addArrayField('skills')}
              variant="outline"
              className="w-full py-2 text-lg"
            >
              Add Another Skill
            </Button>
          </div>

          {/* Certifications Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Certifications (Optional)</h3>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
                
                  value={cert}
                  onChange={(e) => handleArrayFieldChange(index, e.target.value, 'certifications')}
                  className="text-lg p-3"
                />
                {formData.certifications.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayField(index, 'certifications')}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              onClick={() => addArrayField('certifications')}
              variant="outline"
              className="w-full py-2 text-lg"
            >
              Add Another Certification
            </Button>
          </div>

          {/* Languages Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Languages (Optional)</h3>
            {formData.languages.map((language, index) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
               
                  value={language}
                  onChange={(e) => handleArrayFieldChange(index, e.target.value, 'languages')}
                  className="text-lg p-3"
                />
                {formData.languages.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayField(index, 'languages')}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              onClick={() => addArrayField('languages')}
              variant="outline"
              className="w-full py-2 text-lg"
            >
              Add Another Language
            </Button>
          </div>

          {/* Professional Links */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">Social Media Links (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinLink" className="text-lg">LinkedIn Profile</Label>
                <Input
                  id="linkedinLink"
                  type="url"
                  value={formData.linkedinLink}
                  onChange={(e) => setFormData({ ...formData, linkedinLink: e.target.value })}
                  className="text-lg p-3"
                 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubLink" className="text-lg">GitHub Profile</Label>
                <Input
                  id="githubLink"
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  className="text-lg p-3"
                 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolioLink" className="text-lg">Portfolio Website</Label>
                <Input
                  id="portfolioLink"
                  type="url"
                  value={formData.portfolioLink}
                  onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                  className="text-lg p-3"
                  
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              Generate Resume
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}