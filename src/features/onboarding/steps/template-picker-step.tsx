import { SECTORS } from "@/lib/constants"

interface Template {
  id: string
  name: string
  slug: string
  sector: string | null
  _count: { items: number }
}

interface TemplatePickerStepProps {
  templates: Template[]
  selected: string
  onChange: (slug: string) => void
}

export function TemplatePickerStep({ templates, selected, onChange }: TemplatePickerStepProps) {
  const bySector = SECTORS.map((s) => ({
    ...s,
    templates: templates.filter((t) => t.sector === s.value),
  })).filter((g) => g.templates.length > 0)

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Pick a pre-built checklist template to start with. You can customise tasks later.
      </p>
      {bySector.map((group) => (
        <div key={group.value}>
          <h3 className="mb-2 text-sm font-medium">{group.label}</h3>
          <div className="space-y-2">
            {group.templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChange(t.slug)}
                className={`w-full rounded-lg border p-4 text-left transition-all duration-200 hover:shadow-md ${
                  selected === t.slug
                    ? "border-accent bg-accent/5 ring-1 ring-accent"
                    : "hover:border-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t._count.items} tasks
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
