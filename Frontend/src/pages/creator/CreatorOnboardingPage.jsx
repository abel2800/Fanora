import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { creatorOnboardingAPI, uploadAPI } from '../../services/api'
import { useI18n } from '../../contexts/I18nContext'
import toast from 'react-hot-toast'

const STEPS = ['identity', 'payout', 'guidelines']
const CHALLENGE_STEPS = [
  { key: 'neutral', titleKey: 'kycNeutralFrame', hintKey: 'kycNeutralHint' },
  { key: 'blink', titleKey: 'kycBlinkFrame', hintKey: 'kycBlinkHint' },
  { key: 'turn', titleKey: 'kycTurnFrame', hintKey: 'kycTurnHint' },
]

const valueOf = (value) => {
  if (value && typeof value === 'object') return value.value ?? value.text ?? value.result ?? ''
  return value ?? ''
}

const checkState = (check) => {
  if (check === true) return 'pass'
  if (check === false) return 'review'
  const status = String(check?.status ?? check?.result ?? check ?? '').toLowerCase()
  return ['pass', 'passed', 'success', 'verified', 'complete', 'completed'].includes(status) ? 'pass' : 'review'
}

function CheckBadge({ state, t }) {
  return (
    <Badge variant={state === 'pass' ? 'success' : 'warning'}>
      {state === 'pass' ? t('kycPass') : t('kycNeedsReview')}
    </Badge>
  )
}

export function CreatorOnboardingPage() {
  const { t } = useI18n()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [identity, setIdentity] = useState({
    idType: 'fayda',
    idFrontUrl: '',
    idBackUrl: '',
    selfieUrl: '',
    frameUrls: ['', '', ''],
  })
  const [payout, setPayout] = useState({ payoutMethod: 'telebirr', accountName: '', accountNumber: '', phone: '' })
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [cameraState, setCameraState] = useState('idle')
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const onboardingHydratedRef = useRef(false)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraState('idle')
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    if (step !== 0) stopCamera()
  }, [step])

  const { data: verification, isLoading } = useQuery(
    ['creator-onboarding'],
    () => creatorOnboardingAPI.get(),
    {
      select: (res) => res.data?.data,
      onSuccess: (data) => {
        if (!onboardingHydratedRef.current && data?.currentStep) {
          setStep(Math.min(STEPS.length - 1, Math.max(0, data.currentStep - 1)))
        }
        onboardingHydratedRef.current = true
        if (data?.idType) {
          setIdentity({
            idType: data.idType || 'fayda',
            idFrontUrl: data.idFrontUrl || '',
            idBackUrl: data.idBackUrl || '',
            selfieUrl: data.selfieUrl || '',
            frameUrls: data.livenessChallenge?.frameUrls?.length === 3
              ? data.livenessChallenge.frameUrls
              : ['', '', ''],
          })
        }
        if (data?.payoutMethod) {
          setPayout({
            payoutMethod: data.payoutMethod,
            accountName: data.payoutDetails?.accountName || '',
            accountNumber: data.payoutDetails?.accountNumber || '',
            phone: data.payoutDetails?.phone || '',
          })
        }
      },
    }
  )

  const identityMutation = useMutation(
    async (data) => {
      await creatorOnboardingAPI.updateIdentity(data)
      return creatorOnboardingAPI.analyze()
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['creator-onboarding'])
        toast.success(t('kycAnalysisComplete'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  const analyzeMutation = useMutation(
    () => creatorOnboardingAPI.analyze(),
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(['creator-onboarding'])
        toast.success(t('kycAnalysisComplete'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  const payoutMutation = useMutation(
    (data) => creatorOnboardingAPI.updatePayout(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['creator-onboarding'])
        setStep(2)
        toast.success(t('payoutSaved'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  const submitMutation = useMutation(
    (data) => creatorOnboardingAPI.submit(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['creator-onboarding'])
        toast.success(t('submittedForReview'))
      },
      onError: (err) => toast.error(err.response?.data?.message || t('failed')),
    }
  )

  const uploadFile = async (file, field, frameIndex = null) => {
    if (!file) return
    const uploadKey = frameIndex === null ? field : `frame-${frameIndex}`
    setUploading(uploadKey)
    try {
      const res = await uploadAPI.uploadFile(file, 'kyc')
      const url = res.data?.data?.url || res.data?.url
      if (!url) throw new Error('No URL')
      setIdentity((prev) => {
        if (frameIndex === null) return { ...prev, [field]: url }
        const frameUrls = [...prev.frameUrls]
        frameUrls[frameIndex] = url
        return { ...prev, frameUrls }
      })
      toast.success(t('uploaded'))
      return url
    } catch {
      toast.error(t('uploadFailed'))
    } finally {
      setUploading(null)
    }
  }

  const startCamera = async () => {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported')
      setCameraError(t('kycCameraUnsupported'))
      return
    }
    setCameraState('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('active')
    } catch {
      setCameraState('denied')
      setCameraError(t('kycCameraDenied'))
    }
  }

  const captureTarget = useMemo(() => {
    if (!identity.selfieUrl) return { field: 'selfieUrl', label: t('verificationSelfie') }
    const frameIndex = identity.frameUrls.findIndex((url) => !url)
    if (frameIndex >= 0) return {
      field: 'frameUrls',
      frameIndex,
      label: t(CHALLENGE_STEPS[frameIndex].titleKey),
    }
    return null
  }, [identity.frameUrls, identity.selfieUrl, t])

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video || !captureTarget || video.readyState < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!blob) return toast.error(t('kycCaptureFailed'))
    const file = new File([blob], `kyc-${Date.now()}.jpg`, { type: 'image/jpeg' })
    await uploadFile(file, captureTarget.field, captureTarget.frameIndex ?? null)
  }

  if (isLoading) return <PageSkeleton />

  const status = verification?.status || 'draft'
  const analysisStatus = String(verification?.analysisStatus || 'not_started').toLowerCase()
  const analysisComplete = ['complete', 'completed', 'succeeded', 'success', 'passed'].includes(analysisStatus)
    || Boolean(verification?.analysisCompletedAt)
  const fallbackAllowed = verification?.analysisRequired === false
    || verification?.allowAnalysisFallback === true
    || verification?.automatedChecks?.fallbackAllowed === true
  const canSubmit = analysisComplete || fallbackAllowed
  const automatedChecks = verification?.automatedChecks || {}
  const ocrSource = automatedChecks.ocr?.fields
    || automatedChecks.ocrFields
    || automatedChecks.document?.fields
    || verification?.ocrFields
    || {}
  const ocrFields = [
    ['fullName', t('kycFullName')],
    ['documentNumber', t('kycDocumentNumber')],
    ['dateOfBirth', t('dateOfBirth')],
    ['expiryDate', t('kycExpiryDate')],
    ['nationality', t('kycNationality')],
  ].map(([key, label]) => [label, valueOf(ocrSource[key] ?? ocrSource[key === 'documentNumber' ? 'idNumber' : key])])
    .filter(([, value]) => value !== '')
  const faceSimilarity = verification?.faceSimilarity ?? automatedChecks.face?.similarity ?? automatedChecks.faceMatch?.similarity
  const livenessScore = verification?.livenessScore ?? automatedChecks.liveness?.score
  const formatScore = (score) => {
    const number = Number(score)
    if (!Number.isFinite(number)) return t('notSet')
    return `${Math.round((number <= 1 ? number * 100 : number) * 10) / 10}%`
  }
  const identityReady = identity.idFrontUrl && identity.idBackUrl && identity.selfieUrl
    && identity.frameUrls.every(Boolean)
  const analysisBusy = identityMutation.isLoading || analyzeMutation.isLoading
    || ['queued', 'pending', 'processing', 'analyzing'].includes(analysisStatus)

  return (
    <div className="min-h-screen bg-charcoal-900 pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 rounded-2xl border border-primary-500/20 bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-6 shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-500">{t('kycTrustLabel')}</p>
          <h1 className="text-3xl font-display font-bold text-gray-100">{t('onboarding')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">{t('kycIntro')}</p>
          <p className="text-gray-400 mt-4 flex items-center gap-2">
            {t('verificationStatus')}:
            <Badge variant={status === 'approved' ? 'success' : status === 'submitted' ? 'warning' : 'secondary'}>
              {status === 'submitted' ? t('underReview') : t(status) || status}
            </Badge>
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(i)}
              className={`flex-1 py-2 rounded-pill text-sm font-medium transition ${
                step === i
                  ? 'bg-primary-500 text-charcoal-900'
                  : 'bg-charcoal-800 text-gray-400 border border-charcoal-600'
              }`}
            >
              {t(s)}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <Card className="p-6 space-y-5 border border-charcoal-600">
              <div>
                <p className="text-lg font-semibold text-gray-100">1. {t('kycIdentityDocuments')}</p>
                <p className="mt-1 text-sm text-gray-400">{t('kycDocumentHint')}</p>
              </div>
              <label className="block text-sm text-gray-400">
                {t('idType')}
                <select
                  value={identity.idType}
                  onChange={(e) => setIdentity((p) => ({ ...p, idType: e.target.value }))}
                  className="mt-1 w-full bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-gray-100 focus:border-primary-500 focus:outline-none"
                >
                  <option value="fayda">{t('faydaId')}</option>
                  <option value="kebele">{t('kebeleId')}</option>
                  <option value="passport">{t('passport')}</option>
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { field: 'idFrontUrl', label: t('idFront') },
                  { field: 'idBackUrl', label: t('idBack') },
                ].map(({ field, label }) => (
                  <label key={field} className="rounded-xl border border-dashed border-charcoal-600 bg-charcoal-800/60 p-4">
                    <span className="mb-2 block text-sm font-medium text-gray-200">{label}</span>
                    <span className={`mb-3 block text-xs ${identity[field] ? 'text-success-500' : 'text-gray-500'}`}>
                      {identity[field] ? t('uploadedCheck') : t('kycJpgPngHint')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading === field}
                      onChange={(e) => uploadFile(e.target.files?.[0], field)}
                      className="block w-full text-xs text-gray-400 file:mr-3 file:rounded-pill file:border-0 file:bg-primary-500 file:px-3 file:py-2 file:font-semibold file:text-charcoal-900"
                    />
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-5 border border-charcoal-600">
              <div>
                <p className="text-lg font-semibold text-gray-100">2. {t('kycFaceVerification')}</p>
                <p className="mt-1 text-sm text-gray-400">{t('kycFaceHint')}</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-charcoal-600 bg-black">
                <div className="relative aspect-video">
                  <video ref={videoRef} muted playsInline className="h-full w-full object-cover -scale-x-100" />
                  {cameraState !== 'active' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-charcoal-900/95 px-6 text-center">
                      <span className="text-4xl" aria-hidden="true">◎</span>
                      <p className="text-sm text-gray-300">{t('kycCameraConsent')}</p>
                      <Button type="button" onClick={startCamera} loading={cameraState === 'requesting'}>
                        {t('kycEnableCamera')}
                      </Button>
                    </div>
                  )}
                  {cameraState === 'active' && captureTarget && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-center">
                      <p className="mb-3 text-sm font-medium text-white">{t('kycCaptureNow')}: {captureTarget.label}</p>
                      <Button type="button" onClick={capturePhoto} disabled={Boolean(uploading)}>
                        {uploading ? t('uploading') : t('kycCaptureFrame')}
                      </Button>
                    </div>
                  )}
                  {cameraState === 'active' && !captureTarget && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 p-3 text-center text-sm text-success-500">
                      {t('kycAllFramesReady')}
                    </div>
                  )}
                </div>
              </div>
              {cameraError && <p className="text-sm text-warning-500">{cameraError}</p>}
              {cameraState === 'active' && (
                <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>{t('kycTurnOffCamera')}</Button>
              )}

              <div className="rounded-xl border border-charcoal-600 bg-charcoal-800/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-100">{t('verificationSelfie')}</p>
                    <p className="text-xs text-gray-500">{t('kycSelfieHint')}</p>
                  </div>
                  {identity.selfieUrl && <CheckBadge state="pass" t={t} />}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  disabled={uploading === 'selfieUrl'}
                  onChange={(e) => uploadFile(e.target.files?.[0], 'selfieUrl')}
                  className="block w-full text-xs text-gray-400 file:mr-3 file:rounded-pill file:border-0 file:bg-charcoal-600 file:px-3 file:py-2 file:text-gray-100"
                />
              </div>

              <div>
                <p className="text-base font-semibold text-gray-100">3. {t('kycLivenessChallenge')}</p>
                <p className="mt-1 text-sm text-gray-400">{t('kycLivenessHint')}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {CHALLENGE_STEPS.map((challenge, index) => (
                  <div key={challenge.key} className={`rounded-xl border p-4 ${identity.frameUrls[index] ? 'border-success-500/40 bg-success-500/5' : 'border-charcoal-600 bg-charcoal-800/50'}`}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-100">{index + 1}. {t(challenge.titleKey)}</span>
                      {identity.frameUrls[index] && <CheckBadge state="pass" t={t} />}
                    </div>
                    <p className="mb-3 min-h-[40px] text-xs leading-relaxed text-gray-500">{t(challenge.hintKey)}</p>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      disabled={uploading === `frame-${index}`}
                      onChange={(e) => uploadFile(e.target.files?.[0], 'frameUrls', index)}
                      className="block w-full text-[11px] text-gray-500 file:mb-2 file:mr-2 file:rounded-pill file:border-0 file:bg-charcoal-600 file:px-2 file:py-1.5 file:text-gray-100"
                    />
                    {identity.frameUrls[index] && (
                      <button
                        type="button"
                        onClick={() => setIdentity((prev) => ({
                          ...prev,
                          frameUrls: prev.frameUrls.map((url, i) => i === index ? '' : url),
                        }))}
                        className="mt-2 text-xs text-primary-500 hover:text-primary-400"
                      >
                        {t('kycRetake')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border border-primary-500/20 bg-primary-500/5 p-5">
              <p className="text-sm font-semibold text-primary-500">{t('kycAdvisoryTitle')}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">{t('kycAdvisoryNotice')}</p>
            </Card>

            {analysisBusy && (
              <Card className="p-6 text-center border border-primary-500/30">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-charcoal-600 border-t-primary-500" />
                <p className="font-semibold text-gray-100">{t('kycAnalyzing')}</p>
                <p className="mt-1 text-sm text-gray-400">{t('kycAnalyzingHint')}</p>
              </Card>
            )}

            {(analysisComplete || verification?.automatedChecks) && !analysisBusy && (
              <Card className="p-6 space-y-5 border border-charcoal-600">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-100">{t('kycCheckSummary')}</p>
                    <p className="text-sm text-gray-400">{t('kycManualReviewStillRequired')}</p>
                  </div>
                  <CheckBadge state={analysisComplete ? 'pass' : 'review'} t={t} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-charcoal-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('kycFaceSimilarity')}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-100">{formatScore(faceSimilarity)}</p>
                    <div className="mt-2"><CheckBadge state={checkState(automatedChecks.face ?? automatedChecks.faceMatch)} t={t} /></div>
                  </div>
                  <div className="rounded-xl bg-charcoal-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500">{t('kycLivenessScore')}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-100">{formatScore(livenessScore)}</p>
                    <div className="mt-2"><CheckBadge state={checkState(automatedChecks.liveness)} t={t} /></div>
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-200">{t('kycOcrSummary')}</p>
                    <CheckBadge state={checkState(automatedChecks.ocr ?? automatedChecks.document)} t={t} />
                  </div>
                  {ocrFields.length ? (
                    <dl className="grid gap-3 rounded-xl bg-charcoal-800 p-4 sm:grid-cols-2">
                      {ocrFields.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-gray-500">{label}</dt>
                          <dd className="mt-0.5 text-sm text-gray-200">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="rounded-xl bg-charcoal-800 p-4 text-sm text-gray-500">{t('kycNoOcrFields')}</p>
                  )}
                </div>
                <div className="flex flex-wrap justify-between gap-3">
                  <Button type="button" variant="outline" onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isLoading}>
                    {t('kycRetryAnalysis')}
                  </Button>
                  <Button type="button" onClick={() => setStep(1)} disabled={!canSubmit}>
                    {t('continue')}
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="primary"
                loading={identityMutation.isLoading}
                disabled={!identityReady || analysisBusy}
                onClick={() => identityMutation.mutate({
                  idType: identity.idType,
                  idFrontUrl: identity.idFrontUrl,
                  idBackUrl: identity.idBackUrl,
                  selfieUrl: identity.selfieUrl,
                  livenessChallenge: {
                    type: 'blink_turn',
                    frameUrls: identity.frameUrls,
                  },
                })}
              >
                {t('kycSaveAndAnalyze')}
              </Button>
            </div>
            <p className="text-center text-xs leading-relaxed text-gray-500">{t('kycPrivacyNotice')}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="p-6 space-y-4">
            <label className="block text-sm text-gray-400">
              {t('payoutMethod')}
              <select
                value={payout.payoutMethod}
                onChange={(e) => setPayout((p) => ({ ...p, payoutMethod: e.target.value }))}
                className="mt-1 w-full bg-charcoal-800 border border-charcoal-600 rounded-lg px-3 py-2 text-gray-100"
              >
                <option value="telebirr">{t('telebirr')}</option>
                <option value="cbe">{t('cbeBirr')}</option>
                <option value="hellocash">HelloCash</option>
              </select>
            </label>
            <Input
              placeholder={t('accountName')}
              value={payout.accountName}
              onChange={(e) => setPayout((p) => ({ ...p, accountName: e.target.value }))}
            />
            <Input
              placeholder={t('accountNumber')}
              value={payout.accountNumber}
              onChange={(e) => setPayout((p) => ({ ...p, accountNumber: e.target.value }))}
            />
            <Input
              placeholder={t('phoneNumber')}
              value={payout.phone}
              onChange={(e) => setPayout((p) => ({ ...p, phone: e.target.value }))}
            />
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>{t('back')}</Button>
              <Button
                variant="primary"
                disabled={payoutMutation.isLoading}
                onClick={() => payoutMutation.mutate({
                  payoutMethod: payout.payoutMethod,
                  payoutDetails: {
                    accountName: payout.accountName,
                    accountNumber: payout.accountNumber,
                    phone: payout.phone,
                  },
                })}
              >
                {t('next')}
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 space-y-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('guidelinesText')}
            </p>
            <label className="flex items-start gap-3 text-gray-200">
              <input
                type="checkbox"
                checked={guidelinesAccepted}
                onChange={(e) => setGuidelinesAccepted(e.target.checked)}
                className="mt-1 rounded border-charcoal-600 bg-charcoal-800 text-primary-500"
              />
              <span className="text-sm">{t('acceptGuidelines')}</span>
            </label>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>{t('back')}</Button>
              <Button
                variant="primary"
                disabled={!guidelinesAccepted || !canSubmit || submitMutation.isLoading || status === 'submitted'}
                onClick={() => submitMutation.mutate({ guidelinesAccepted: true })}
              >
                {t('submit')}
              </Button>
            </div>
            {!canSubmit && (
              <p className="text-xs text-warning-500">{t('kycCompleteAnalysisBeforeSubmit')}</p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
