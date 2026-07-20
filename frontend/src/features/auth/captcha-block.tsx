import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CaptchaChallenge } from '@/types/api'

interface CaptchaBlockProps {
  challenge: CaptchaChallenge | null | undefined
  disabled?: boolean
  value: string
  onChange: (value: string) => void
  onRefresh: () => void
}

export function CaptchaBlock({
  challenge,
  disabled = false,
  value,
  onChange,
  onRefresh,
}: CaptchaBlockProps) {
  return (
    <div className="space-y-3 rounded-[24px] border border-app-border bg-white/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-app-foreground">Security CAPTCHA</p>
          <p className="text-xs leading-5 text-app-muted-foreground">
            Masukkan huruf dan angka persis seperti yang terlihat.
          </p>
        </div>
        <Button
          disabled={disabled}
          onClick={onRefresh}
          size="sm"
          type="button"
          variant="secondary"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-[20px] border border-app-border bg-[#fff8ef] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        {challenge ? (
          <img
            alt="Security CAPTCHA"
            className="h-16 w-full rounded-[14px] object-cover"
            src={challenge.image}
          />
        ) : (
          <div className="h-16 animate-pulse rounded-[14px] bg-app-muted" />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="captcha-answer">CAPTCHA Answer</Label>
        <Input
          autoCapitalize="characters"
          autoComplete="off"
          disabled={disabled}
          id="captcha-answer"
          placeholder="Masukkan kode CAPTCHA"
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
        />
      </div>
    </div>
  )
}
