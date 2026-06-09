import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SECTORS } from "@/lib/constants"

interface WorkspaceDetailsStepProps {
  formData: {
    workspaceName: string
    sector: string
    address: string
    contactName: string
    phone: string
  }
  onChange: (field: string, value: string) => void
}

export function WorkspaceDetailsStep({ formData, onChange }: WorkspaceDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Business name *</Label>
        <Input
          id="workspaceName"
          name="workspaceName"
          value={formData.workspaceName}
          onChange={(e) => onChange("workspaceName", e.target.value)}
          placeholder="e.g. Acme Hair Studio"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Sector *</Label>
        <Select
          value={formData.sector}
          onValueChange={(v) => onChange("sector", v)}
        >
          <SelectTrigger id="sector">
            <SelectValue placeholder="Select your sector" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 High Street, Town, Postcode"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactName">Contact name</Label>
        <Input
          id="contactName"
          name="contactName"
          value={formData.contactName}
          onChange={(e) => onChange("contactName", e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="07700 900000"
        />
      </div>
    </div>
  )
}
