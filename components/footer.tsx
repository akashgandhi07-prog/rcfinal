export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/20 bg-slate-950 py-16 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        <div className="mb-12 text-center overflow-hidden">
          <h2 className="font-serif text-[15vw] sm:text-[12vw] md:text-[10vw] text-white/5 tracking-tight leading-none max-w-full">REGENT&apos;S</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left border-t border-white/10 pt-8">
          {/* Address */}
          <div className="text-slate-500 text-xs font-light">
            <p>128 City Road</p>
            <p>London, EC1V 2NX</p>
          </div>

          {/* Contact */}
          <div className="text-slate-500 text-xs font-light">
            <a href="mailto:info@regentsconsultancy.co.uk" className="hover:text-amber-400 transition-colors">
              info@regentsconsultancy.co.uk
            </a>
          </div>

          {/* Legal */}
          <div className="text-slate-500 text-xs font-light">
            <p>Reg. England & Wales</p>
            <p>No. 13554392</p>
          </div>

          {/* Links */}
          <div className="flex flex-col md:flex-row gap-4 md:justify-end items-center text-xs font-light">
            <button className="text-slate-500 hover:text-amber-400 transition-colors">Privacy</button>
            <button className="text-slate-500 hover:text-amber-400 transition-colors">Terms of Engagement</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
