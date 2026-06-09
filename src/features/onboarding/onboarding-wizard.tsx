"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { onboardWorkspace } from "@/actions/onboarding"
import { WorkspaceDetailsStep } from "./steps/workspace-details-step"
import { TemplatePickerStep } from "./steps/template-picker-step"
import { CompleteStep } from "./steps/complete-step"

interface OnboardingWizardProps {
  templates: {
    id: string
    name: string
    slug: string
    sector: string | null
    _count: { items: number }
  }[]
}

const initialState = { error: null as string | null }

export function OnboardingWizard({ templates }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    workspaceName: "",
    sector: "",
    address: "",
    contactName: "",
    phone: "",
  })
  const [templateSlug, setTemplateSlug] = useState("")
  const [state, formAction, pending] = useActionState(onboardWorkspace, initialState)

  const selectedTemplate = templates.find((t) => t.slug === templateSlug)
  const canContinue = (() => {
    if (step === 1) return formData.workspaceName.trim() && formData.sector
    if (step === 2) return !!templateSlug
    return true
  })()

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (step === 4) {
    return (
      <CompleteStep
        workspaceName={formData.workspaceName}
        templateName={selectedTemplate?.name ?? ""}
        taskCount={selectedTemplate?._count.items ?? 0}
      />
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Set up your workspace</h1>
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-accent" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (step < 3) {
            setStep((s) => s + 1)
          } else {
            const fd = new FormData()
            fd.set("workspaceName", formData.workspaceName)
            fd.set("sector", formData.sector)
            fd.set("address", formData.address)
            fd.set("contactName", formData.contactName)
            fd.set("phone", formData.phone)
            fd.set("templateSlug", templateSlug)
            formAction(fd)
          }
        }}
        className="space-y-6"
      >
        {step === 1 && (
          <WorkspaceDetailsStep formData={formData} onChange={updateField} />
        )}

        {step === 2 && (
          <TemplatePickerStep
            templates={templates}
            selected={templateSlug}
            onChange={setTemplateSlug}
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <CompleteStep
              workspaceName={formData.workspaceName}
              templateName={selectedTemplate?.name ?? ""}
              taskCount={selectedTemplate?._count.items ?? 0}
            />
            {state?.error && (
              <p className="text-center text-sm text-destructive">{state.error}</p>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button type="submit" disabled={!canContinue}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Finish setup"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
