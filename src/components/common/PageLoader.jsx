import { Loader2 } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Soft glowing ambient pulse */}
        <div className="absolute -inset-4 rounded-full bg-orange-500/10 blur-xl animate-pulse" />

        {/* Spinner Container */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100/80 bg-orange-50 shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
        </div>
      </div>
    </div>
  )
}
