import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import {
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
  PhotoIcon,
  FilmIcon,
  LockClosedIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export function CreateContentPage() {
  const [step, setStep] = useState(1)
  const [contentType, setContentType] = useState('photo')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    thumbnail: null,
    accessControl: 'free', // free, subscribers_only, pay_per_view
    price: '',
    tags: [],
    schedule: false,
    scheduleDate: '',
    allowComments: true,
    allowTips: true
  })
  const [preview, setPreview] = useState({
    file: null,
    thumbnail: null
  })

  const handleFileChange = (e, type = 'file') => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 500MB for video, 10MB for photo)
    const maxSize = contentType === 'video' ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error(`File is too large. Max size: ${contentType === 'video' ? '500MB' : '10MB'}`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === 'file') {
        setFormData({ ...formData, file })
        setPreview({ ...preview, file: e.target.result })
      } else {
        setFormData({ ...formData, thumbnail: file })
        setPreview({ ...preview, thumbnail: e.target.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      })
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    })
  }

  const handleNext = () => {
    if (step === 1 && !formData.file) {
      toast.error('Please upload a file')
      return
    }
    if (step === 2 && !formData.title) {
      toast.error('Please enter a title')
      return
    }
    if (step === 3 && formData.accessControl === 'pay_per_view' && !formData.price) {
      toast.error('Please set a price for pay-per-view content')
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = () => {
    toast.success('Content uploaded successfully!')
    // Reset form
    setStep(1)
    setFormData({
      title: '',
      description: '',
      file: null,
      thumbnail: null,
      accessControl: 'free',
      price: '',
      tags: [],
      schedule: false,
      scheduleDate: '',
      allowComments: true,
      allowTips: true
    })
    setPreview({ file: null, thumbnail: null })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Create Content</h1>
        <p className="text-gray-400 mt-2">
          Upload and publish exclusive content for your subscribers
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <button
                onClick={() => s < step && setStep(s)}
                className={`h-10 w-10 rounded-full font-semibold transition-all flex items-center justify-center ${
                  s < step
                    ? 'bg-green-500 text-white cursor-pointer'
                    : s === step
                    ? 'bg-primary-500 text-white'
                    : 'bg-charcoal-700 text-gray-400'
                }`}
              >
                {s < step ? <CheckIcon className="h-5 w-5" /> : s}
              </button>
              {s < 4 && (
                <div
                  className={`h-1 mt-2 mb-2 transition-all ${
                    s < step ? 'bg-green-500' : 'bg-charcoal-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Upload</span>
          <span>Details</span>
          <span>Access</span>
          <span>Review</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Choose Content Type</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setContentType('photo')}
              className={`p-6 rounded-lg border-2 transition-all text-center ${
                contentType === 'photo'
                  ? 'border-primary-500 bg-charcoal-700'
                  : 'border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <PhotoIcon className={`h-12 w-12 mx-auto mb-2 ${
                contentType === 'photo' ? 'text-primary-500' : 'text-gray-400'
              }`} />
              <p className="font-semibold text-gray-100">Photo</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG (Max 10MB)</p>
            </button>

            <button
              onClick={() => setContentType('video')}
              className={`p-6 rounded-lg border-2 transition-all text-center ${
                contentType === 'video'
                  ? 'border-primary-500 bg-charcoal-700'
                  : 'border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <FilmIcon className={`h-12 w-12 mx-auto mb-2 ${
                contentType === 'video' ? 'text-primary-500' : 'text-gray-400'
              }`} />
              <p className="font-semibold text-gray-100">Video</p>
              <p className="text-xs text-gray-400 mt-1">MP4, WebM (Max 500MB)</p>
            </button>
          </div>

          {/* File Upload */}
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Upload {contentType === 'photo' ? 'Photo' : 'Video'}</h3>
          <div className="mb-6">
            <label className="border-2 border-dashed border-charcoal-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors block">
              <input
                type="file"
                accept={contentType === 'photo' ? 'image/*' : 'video/*'}
                onChange={handleFileChange}
                className="hidden"
              />
              {preview.file ? (
                <div className="text-center">
                  {contentType === 'photo' ? (
                    <img src={preview.file} alt="Preview" className="h-32 mx-auto rounded-lg mb-4 object-cover" />
                  ) : (
                    <video src={preview.file} className="h-32 mx-auto rounded-lg mb-4 object-cover" controls />
                  )}
                  <Badge variant="success" className="text-xs">File selected</Badge>
                </div>
              ) : (
                <div>
                  <ArrowUpTrayIcon className="h-12 w-12 text-primary-500 mx-auto mb-3" />
                  <p className="font-semibold text-gray-100">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {contentType === 'photo' ? 'JPEG, PNG up to 10MB' : 'MP4, WebM up to 500MB'}
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Thumbnail */}
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Upload Thumbnail (Optional)</h3>
          <label className="border-2 border-dashed border-charcoal-700 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors block mb-8">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnail')}
              className="hidden"
            />
            {preview.thumbnail ? (
              <img src={preview.thumbnail} alt="Thumbnail preview" className="h-20 mx-auto rounded-lg object-cover" />
            ) : (
              <div>
                <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Upload thumbnail image</p>
              </div>
            )}
          </label>

          <Button variant="primary" onClick={handleNext} className="w-full">
            Continue →
          </Button>
        </Card>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Content Details</h2>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <Input
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                placeholder="Describe your content..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                className="w-full p-3 bg-charcoal-700 border border-charcoal-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-primary-500 focus:outline-none resize-none h-24"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="primary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)}>
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (music, tutorial, etc.)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e.target.value)
                    e.target.value = ''
                  }
                }}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-8 pb-8 border-b border-charcoal-700">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowComments}
                onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Allow comments</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowTips}
                onChange={(e) => setFormData({ ...formData, allowTips: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Allow tips</span>
            </label>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              ← Back
            </Button>
            <Button variant="primary" onClick={handleNext} className="flex-1">
              Continue →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Access Control */}
      {step === 3 && (
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Access Control</h2>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => setFormData({ ...formData, accessControl: 'free' })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.accessControl === 'free'
                  ? 'border-primary-500 bg-charcoal-700'
                  : 'border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <EyeIcon className="h-5 w-5 text-primary-500 inline mr-2" />
                  <p className="font-semibold text-gray-100">Public (Free)</p>
                  <p className="text-xs text-gray-400 mt-1">Everyone can see this content</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, accessControl: 'subscribers_only' })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.accessControl === 'subscribers_only'
                  ? 'border-primary-500 bg-charcoal-700'
                  : 'border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <StarIcon className="h-5 w-5 text-primary-500 inline mr-2" />
                  <p className="font-semibold text-gray-100">Subscribers Only</p>
                  <p className="text-xs text-gray-400 mt-1">Available to all subscribers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, accessControl: 'pay_per_view' })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.accessControl === 'pay_per_view'
                  ? 'border-primary-500 bg-charcoal-700'
                  : 'border-charcoal-700 hover:border-charcoal-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <LockClosedIcon className="h-5 w-5 text-primary-500 inline mr-2" />
                  <p className="font-semibold text-gray-100">Pay Per View</p>
                  <p className="text-xs text-gray-400 mt-1">Charge a one-time fee</p>
                </div>
              </div>
            </button>
          </div>

          {/* Price for Pay-Per-View */}
          {formData.accessControl === 'pay_per_view' && (
            <div className="mb-8 p-4 bg-charcoal-700 rounded-lg">
              <label className="block text-sm font-medium text-gray-300 mb-2">Set Price (ETB)</label>
              <Input
                type="number"
                min="1"
                placeholder="e.g., 199"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              ← Back
            </Button>
            <Button variant="primary" onClick={handleNext} className="flex-1">
              Review →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-6">Review & Publish</h2>

          {/* Preview */}
          <div className="mb-8">
            {preview.file && (
              <div className="mb-6">
                {contentType === 'photo' ? (
                  <img src={preview.file} alt="Preview" className="rounded-lg max-h-96 mx-auto" />
                ) : (
                  <video src={preview.file} className="rounded-lg max-h-96 mx-auto" controls />
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-4 pb-8 border-b border-charcoal-700">
            <div className="flex justify-between">
              <span className="text-gray-400">Title:</span>
              <span className="font-semibold text-gray-100">{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <Badge variant="primary" className="text-xs capitalize">{contentType}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Access:</span>
              <Badge variant={
                formData.accessControl === 'free' ? 'secondary' :
                formData.accessControl === 'subscribers_only' ? 'primary' :
                'warning'
              } className="text-xs">
                {formData.accessControl === 'pay_per_view' ? `PPV - ${formData.price} ETB` : formData.accessControl.replace('_', ' ')}
              </Badge>
            </div>
            {formData.tags.length > 0 && (
              <div>
                <span className="text-gray-400 block mb-2">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-8">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
              ← Back
            </Button>
            <Button variant="primary" onClick={handleSubmit} className="flex-1">
              <CheckIcon className="h-4 w-4 mr-2" />
              Publish Content
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

