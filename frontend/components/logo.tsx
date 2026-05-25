import React from "react"

interface LogoProps {
    className?: string
    size?: "sm" | "md" | "lg"
    invert?: boolean
}

export function Logo({ className = "", size = "md", invert = false }: LogoProps) {
    // Size dimensions
    const dimensions = {
        sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", title: "text-base", badge: "text-[9px] px-1.5 py-0.5" },
        md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", title: "text-lg md:text-xl", badge: "text-[10px] px-2 py-0.5" },
        lg: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7", title: "text-2xl md:text-3xl", badge: "text-xs px-2.5 py-1" }
    }[size]

    return (
        <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
            {/* Logo Mark */}
            <div className={`${dimensions.box} bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-md shadow-primary/25 group-hover:shadow-lg group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden shrink-0`}>
                {/* Subtle glassmorphism glow inside logo */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Custom Professional SVG combining Culinary (Fork/Spoon) + IPB Agriculture (Leaf/Sprout) */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${dimensions.icon} text-white transition-transform duration-300 group-hover:rotate-6`}
                >
                    {/* Outer Cloche / Food Dome Arch */}
                    <path
                        d="M3 17C3 10.9249 7.92487 6 14 6C18.2525 6 21.9398 8.41144 23.5 12"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                    />
                    {/* Top Cloche Handle / Sprout Dot */}
                    <circle cx="14" cy="3" r="1.5" fill="currentColor" />

                    {/* Stylized Fork */}
                    <path
                        d="M7 11V14C7 15.6569 8.34315 17 10 17V21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path d="M7 11L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 11L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M13 11L13 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                    {/* Stylized Leaf / Sprout representing IPB Agriculture */}
                    <path
                        d="M16 14C16 14 18 10 21 10C21 10 21 13 18 15C16.5 16 16 14 16 14Z"
                        fill="currentColor"
                    />
                    {/* Base Platter Line */}
                    <path d="M2 18H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </div>

            {/* Typography & Badge */}
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <span className={`font-extrabold tracking-tight leading-none ${dimensions.title} ${invert ? "text-background" : "text-foreground"}`}>
                        UMKM IPB
                    </span>
                </div>
                <div className="flex items-center mt-1.5">
                    <span className={`font-bold rounded-full tracking-wider uppercase leading-none ${dimensions.badge} backdrop-blur-sm shadow-2xs ${invert ? "text-white bg-white/15 border border-white/25" : "text-primary bg-primary/10 border border-primary/20"}`}>
                        Food Ecosystem
                    </span>
                </div>
            </div>
        </div>
    )
}
