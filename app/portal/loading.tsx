export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300 font-light">Loading...</p>
      </div>
    </div>
  )
}


