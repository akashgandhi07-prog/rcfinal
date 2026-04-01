"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  name?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Comprehensive list of all country codes - sorted alphabetically by country name
const COUNTRIES_RAW: { code: string; label: string; flag: string }[] = [
  { code: "+93", label: "Afghanistan", flag: "🇦🇫" },
  { code: "+355", label: "Albania", flag: "🇦🇱" },
  { code: "+213", label: "Algeria", flag: "🇩🇿" },
  { code: "+376", label: "Andorra", flag: "🇦🇩" },
  { code: "+244", label: "Angola", flag: "🇦🇴" },
  { code: "+54", label: "Argentina", flag: "🇦🇷" },
  { code: "+297", label: "Aruba", flag: "🇦🇼" },
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+672", label: "Australian External Territories", flag: "🇦🇶" },
  { code: "+43", label: "Austria", flag: "🇦🇹" },
  { code: "+994", label: "Azerbaijan", flag: "🇦🇿" },
  { code: "+973", label: "Bahrain", flag: "🇧🇭" },
  { code: "+880", label: "Bangladesh", flag: "🇧🇩" },
  { code: "+375", label: "Belarus", flag: "🇧🇾" },
  { code: "+32", label: "Belgium", flag: "🇧🇪" },
  { code: "+501", label: "Belize", flag: "🇧🇿" },
  { code: "+229", label: "Benin", flag: "🇧🇯" },
  { code: "+975", label: "Bhutan", flag: "🇧🇹" },
  { code: "+591", label: "Bolivia", flag: "🇧🇴" },
  { code: "+387", label: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "+267", label: "Botswana", flag: "🇧🇼" },
  { code: "+55", label: "Brazil", flag: "🇧🇷" },
  { code: "+673", label: "Brunei", flag: "🇧🇳" },
  { code: "+359", label: "Bulgaria", flag: "🇧🇬" },
  { code: "+226", label: "Burkina Faso", flag: "🇧🇫" },
  { code: "+257", label: "Burundi", flag: "🇧🇮" },
  { code: "+855", label: "Cambodia", flag: "🇰🇭" },
  { code: "+237", label: "Cameroon", flag: "🇨🇲" },
  { code: "+238", label: "Cape Verde", flag: "🇨🇻" },
  { code: "+236", label: "Central African Rep.", flag: "🇨🇫" },
  { code: "+235", label: "Chad", flag: "🇹🇩" },
  { code: "+56", label: "Chile", flag: "🇨🇱" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+57", label: "Colombia", flag: "🇨🇴" },
  { code: "+269", label: "Comoros", flag: "🇰🇲" },
  { code: "+242", label: "Congo", flag: "🇨🇬" },
  { code: "+243", label: "Dem. Rep. of the Congo", flag: "🇨🇩" },
  { code: "+506", label: "Costa Rica", flag: "🇨🇷" },
  { code: "+385", label: "Croatia", flag: "🇭🇷" },
  { code: "+53", label: "Cuba", flag: "🇨🇺" },
  { code: "+599", label: "Curaçao/Bonaire", flag: "🇨🇼" },
  { code: "+357", label: "Cyprus", flag: "🇨🇾" },
  { code: "+420", label: "Czech Republic", flag: "🇨🇿" },
  { code: "+45", label: "Denmark", flag: "🇩🇰" },
  { code: "+246", label: "Diego Garcia", flag: "🇮🇴" },
  { code: "+253", label: "Djibouti", flag: "🇩🇯" },
  { code: "+593", label: "Ecuador", flag: "🇪🇨" },
  { code: "+20", label: "Egypt", flag: "🇪🇬" },
  { code: "+503", label: "El Salvador", flag: "🇸🇻" },
  { code: "+240", label: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+291", label: "Eritrea", flag: "🇪🇷" },
  { code: "+372", label: "Estonia", flag: "🇪🇪" },
  { code: "+251", label: "Ethiopia", flag: "🇪🇹" },
  { code: "+500", label: "Falkland Islands", flag: "🇫🇰" },
  { code: "+298", label: "Faroe Islands", flag: "🇫🇴" },
  { code: "+679", label: "Fiji", flag: "🇫🇯" },
  { code: "+358", label: "Finland", flag: "🇫🇮" },
  { code: "+33", label: "France", flag: "🇫🇷" },
  { code: "+262", label: "French Indian Ocean", flag: "🇷🇪" },
  { code: "+594", label: "French Guiana", flag: "🇬🇫" },
  { code: "+689", label: "French Polynesia", flag: "🇵🇫" },
  { code: "+241", label: "Gabon", flag: "🇬🇦" },
  { code: "+220", label: "Gambia", flag: "🇬🇲" },
  { code: "+995", label: "Georgia", flag: "🇬🇪" },
  { code: "+49", label: "Germany", flag: "🇩🇪" },
  { code: "+233", label: "Ghana", flag: "🇬🇭" },
  { code: "+350", label: "Gibraltar", flag: "🇬🇮" },
  { code: "+30", label: "Greece", flag: "🇬🇷" },
  { code: "+299", label: "Greenland", flag: "🇬🇱" },
  { code: "+590", label: "Guadeloupe", flag: "🇬🇵" },
  { code: "+224", label: "Guinea", flag: "🇬🇳" },
  { code: "+245", label: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+592", label: "Guyana", flag: "🇬🇾" },
  { code: "+509", label: "Haiti", flag: "🇭🇹" },
  { code: "+504", label: "Honduras", flag: "🇭🇳" },
  { code: "+852", label: "Hong Kong", flag: "🇭🇰" },
  { code: "+36", label: "Hungary", flag: "🇭🇺" },
  { code: "+354", label: "Iceland", flag: "🇮🇸" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+62", label: "Indonesia", flag: "🇮🇩" },
  { code: "+98", label: "Iran", flag: "🇮🇷" },
  { code: "+964", label: "Iraq", flag: "🇮🇶" },
  { code: "+353", label: "Ireland", flag: "🇮🇪" },
  { code: "+972", label: "Israel", flag: "🇮🇱" },
  { code: "+39", label: "Italy", flag: "🇮🇹" },
  { code: "+225", label: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+962", label: "Jordan", flag: "🇯🇴" },
  { code: "+7", label: "Kazakhstan/Russia", flag: "🇰🇿" },
  { code: "+254", label: "Kenya", flag: "🇰🇪" },
  { code: "+686", label: "Kiribati", flag: "🇰🇮" },
  { code: "+383", label: "Kosovo", flag: "🇽🇰" },
  { code: "+965", label: "Kuwait", flag: "🇰🇼" },
  { code: "+996", label: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "+856", label: "Laos", flag: "🇱🇦" },
  { code: "+371", label: "Latvia", flag: "🇱🇻" },
  { code: "+961", label: "Lebanon", flag: "🇱🇧" },
  { code: "+266", label: "Lesotho", flag: "🇱🇸" },
  { code: "+231", label: "Liberia", flag: "🇱🇷" },
  { code: "+218", label: "Libya", flag: "🇱🇾" },
  { code: "+423", label: "Liechtenstein", flag: "🇱🇮" },
  { code: "+370", label: "Lithuania", flag: "🇱🇹" },
  { code: "+352", label: "Luxembourg", flag: "🇱🇺" },
  { code: "+853", label: "Macao", flag: "🇲🇴" },
  { code: "+261", label: "Madagascar", flag: "🇲🇬" },
  { code: "+265", label: "Malawi", flag: "🇲🇼" },
  { code: "+60", label: "Malaysia", flag: "🇲🇾" },
  { code: "+960", label: "Maldives", flag: "🇲🇻" },
  { code: "+223", label: "Mali", flag: "🇲🇱" },
  { code: "+356", label: "Malta", flag: "🇲🇹" },
  { code: "+692", label: "Marshall Islands", flag: "🇲🇭" },
  { code: "+596", label: "Martinique", flag: "🇲🇶" },
  { code: "+222", label: "Mauritania", flag: "🇲🇷" },
  { code: "+230", label: "Mauritius", flag: "🇲🇺" },
  { code: "+52", label: "Mexico", flag: "🇲🇽" },
  { code: "+691", label: "Micronesia", flag: "🇫🇲" },
  { code: "+373", label: "Moldova", flag: "🇲🇩" },
  { code: "+377", label: "Monaco", flag: "🇲🇨" },
  { code: "+976", label: "Mongolia", flag: "🇲🇳" },
  { code: "+382", label: "Montenegro", flag: "🇲🇪" },
  { code: "+212", label: "Morocco", flag: "🇲🇦" },
  { code: "+258", label: "Mozambique", flag: "🇲🇿" },
  { code: "+95", label: "Myanmar", flag: "🇲🇲" },
  { code: "+264", label: "Namibia", flag: "🇳🇦" },
  { code: "+674", label: "Nauru", flag: "🇳🇷" },
  { code: "+977", label: "Nepal", flag: "🇳🇵" },
  { code: "+31", label: "Netherlands", flag: "🇳🇱" },
  { code: "+687", label: "New Caledonia", flag: "🇳🇨" },
  { code: "+64", label: "New Zealand", flag: "🇳🇿" },
  { code: "+505", label: "Nicaragua", flag: "🇳🇮" },
  { code: "+227", label: "Niger", flag: "🇳🇪" },
  { code: "+234", label: "Nigeria", flag: "🇳🇬" },
  { code: "+683", label: "Niue", flag: "🇳🇺" },
  { code: "+850", label: "North Korea", flag: "🇰🇵" },
  { code: "+389", label: "North Macedonia", flag: "🇲🇰" },
  { code: "+47", label: "Norway", flag: "🇳🇴" },
  { code: "+968", label: "Oman", flag: "🇴🇲" },
  { code: "+92", label: "Pakistan", flag: "🇵🇰" },
  { code: "+680", label: "Palau", flag: "🇵🇼" },
  { code: "+970", label: "Palestine", flag: "🇵🇸" },
  { code: "+507", label: "Panama", flag: "🇵🇦" },
  { code: "+675", label: "Papua New Guinea", flag: "🇵🇬" },
  { code: "+595", label: "Paraguay", flag: "🇵🇾" },
  { code: "+51", label: "Peru", flag: "🇵🇪" },
  { code: "+63", label: "Philippines", flag: "🇵🇭" },
  { code: "+48", label: "Poland", flag: "🇵🇱" },
  { code: "+351", label: "Portugal", flag: "🇵🇹" },
  { code: "+974", label: "Qatar", flag: "🇶🇦" },
  { code: "+40", label: "Romania", flag: "🇷🇴" },
  { code: "+250", label: "Rwanda", flag: "🇷🇼" },
  { code: "+247", label: "Saint Helena (Ascension)", flag: "🇸🇭" },
  { code: "+290", label: "Saint Helena (Main)", flag: "🇸🇭" },
  { code: "+508", label: "Saint Pierre and Miquelon", flag: "🇵🇲" },
  { code: "+685", label: "Samoa", flag: "🇼🇸" },
  { code: "+378", label: "San Marino", flag: "🇸🇲" },
  { code: "+239", label: "Sao Tome and Principe", flag: "🇸🇹" },
  { code: "+966", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+221", label: "Senegal", flag: "🇸🇳" },
  { code: "+381", label: "Serbia", flag: "🇷🇸" },
  { code: "+248", label: "Seychelles", flag: "🇸🇨" },
  { code: "+232", label: "Sierra Leone", flag: "🇸🇱" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+421", label: "Slovakia", flag: "🇸🇰" },
  { code: "+386", label: "Slovenia", flag: "🇸🇮" },
  { code: "+677", label: "Solomon Islands", flag: "🇸🇧" },
  { code: "+252", label: "Somalia", flag: "🇸🇴" },
  { code: "+27", label: "South Africa", flag: "🇿🇦" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+34", label: "Spain", flag: "🇪🇸" },
  { code: "+94", label: "Sri Lanka", flag: "🇱🇰" },
  { code: "+249", label: "Sudan", flag: "🇸🇩" },
  { code: "+597", label: "Suriname", flag: "🇸🇷" },
  { code: "+268", label: "Eswatini", flag: "🇸🇿" },
  { code: "+46", label: "Sweden", flag: "🇸🇪" },
  { code: "+41", label: "Switzerland", flag: "🇨🇭" },
  { code: "+963", label: "Syria", flag: "🇸🇾" },
  { code: "+886", label: "Taiwan", flag: "🇹🇼" },
  { code: "+992", label: "Tajikistan", flag: "🇹🇯" },
  { code: "+255", label: "Tanzania", flag: "🇹🇿" },
  { code: "+66", label: "Thailand", flag: "🇹🇭" },
  { code: "+670", label: "Timor-Leste", flag: "🇹🇱" },
  { code: "+228", label: "Togo", flag: "🇹🇬" },
  { code: "+690", label: "Tokelau", flag: "🇹🇰" },
  { code: "+676", label: "Tonga", flag: "🇹🇴" },
  { code: "+216", label: "Tunisia", flag: "🇹🇳" },
  { code: "+90", label: "Turkey", flag: "🇹🇷" },
  { code: "+993", label: "Turkmenistan", flag: "🇹🇲" },
  { code: "+688", label: "Tuvalu", flag: "🇹🇻" },
  { code: "+256", label: "Uganda", flag: "🇺🇬" },
  { code: "+380", label: "Ukraine", flag: "🇺🇦" },
  { code: "+971", label: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+1-US", label: "United States", flag: "🇺🇸" },
  { code: "+1-CA", label: "Canada", flag: "🇨🇦" },
  { code: "+598", label: "Uruguay", flag: "🇺🇾" },
  { code: "+998", label: "Uzbekistan", flag: "🇺🇿" },
  { code: "+678", label: "Vanuatu", flag: "🇻🇺" },
  { code: "+379", label: "Vatican", flag: "🇻🇦" },
  { code: "+58", label: "Venezuela", flag: "🇻🇪" },
  { code: "+84", label: "Vietnam", flag: "🇻🇳" },
  { code: "+681", label: "Wallis and Futuna", flag: "🇼🇫" },
  { code: "+967", label: "Yemen", flag: "🇾🇪" },
  { code: "+260", label: "Zambia", flag: "🇿🇲" },
  { code: "+263", label: "Zimbabwe", flag: "🇿🇼" },
]

// Sort alphabetically by country name (label), without mutating the original array
const COUNTRIES = [...COUNTRIES_RAW].sort((a, b) => a.label.localeCompare(b.label))

// Returns the actual dial code (strips internal suffix used to disambiguate e.g. "+1-US" → "+1")
function toDialCode(code: string): string {
  return code.split("-")[0]
}

// Hoist default country outside component to avoid recalculating every render
const defaultCountry = COUNTRIES.find(c => c.code === "+44") ?? COUNTRIES[0]

export function PhoneInput({
  value,
  onChange,
  id,
  name,
  required,
  disabled,
  className,
}: PhoneInputProps) {
  const [countryCode, setCountryCode] = React.useState<string>(defaultCountry.code)
  const [localNumber, setLocalNumber] = React.useState<string>("")

  // Initialise from existing value if it already has a code
  React.useEffect(() => {
    if (!value) {
      setCountryCode(defaultCountry.code)
      setLocalNumber("")
      return
    }
    // Sort by dial code length (longest first) to match e.g. +351 before +3
    const sortedCountries = [...COUNTRIES].sort(
      (a, b) => toDialCode(b.code).length - toDialCode(a.code).length
    )
    const match = sortedCountries.find((c) => value.startsWith(toDialCode(c.code)))
    if (match) {
      setCountryCode(match.code)
      setLocalNumber(value.replace(toDialCode(match.code), "").trim())
    } else {
      setCountryCode(defaultCountry.code)
      setLocalNumber(value)
    }
  }, [value])

  const emitChange = (code: string, local: string) => {
    const trimmed = local.replace(/^0+/, "")
    const combined = trimmed ? `${toDialCode(code)} ${trimmed}` : ""
    onChange(combined)
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value
    setCountryCode(newCode)
    emitChange(newCode, localNumber)
  }

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setLocalNumber(next)
    emitChange(countryCode, next)
  }

  // Get the selected country for display
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode) || defaultCountry

  return (
    <div className={cn("flex gap-1.5 sm:gap-2 w-full min-w-0", className)}>
      <div className="flex-shrink-0 relative w-[85px] sm:w-[140px] md:w-[170px]">
        {/* Mobile display - shows code + flag */}
        <div className="absolute inset-0 pointer-events-none sm:hidden flex items-center justify-center text-xs text-slate-900 whitespace-nowrap z-10 pr-5">
          <span>{toDialCode(selectedCountry.code)} {selectedCountry.flag}</span>
        </div>
        <select
          className="h-10 rounded-lg border border-slate-300 bg-white pl-1.5 sm:pl-3 pr-6 sm:pr-10 text-xs sm:text-sm text-transparent sm:text-slate-900 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 w-full appearance-none bg-no-repeat bg-right relative cursor-pointer hover:border-slate-400 transition-colors"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.75rem center',
            backgroundSize: '0.75rem',
          }}
          value={countryCode}
          onChange={handleCountryChange}
          disabled={disabled}
          title={`${selectedCountry.flag} ${selectedCountry.label} (${toDialCode(selectedCountry.code)})`}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {toDialCode(c.code)} {c.flag} {c.label}
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        name={name}
        type="tel"
        required={required}
        disabled={disabled}
        value={localNumber}
        onChange={handleLocalChange}
        className="h-10 flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 hover:border-slate-400 transition-colors"
        placeholder="Mobile number"
      />
    </div>
  )
}
