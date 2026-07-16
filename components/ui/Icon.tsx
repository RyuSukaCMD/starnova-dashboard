// Inline SVG icons (line style, sumber gaya svgrepo.com — MIT).
// Dipakai menggantikan emoji agar konsisten & tajam di semua device.
// currentColor mengikuti warna teks; ukuran via prop `size`.
type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number }
export type IconName =
    | "spark"
    | "rocket"
    | "bot"
    | "download"
    | "search"
    | "wrench"
    | "image"
    | "text"
    | "bolt"
    | "target"
    | "key"
    | "clock"
    | "signal"
    | "chart"
    | "fire"
    | "satellite"
    | "globe"
    | "activity"
    | "server"
    | "shield"
    | "database"
    | "cpu"
    | "arrow-right"
    | "copy"
    | "check"
    | "user"
    | "wave"
    | "star"

const P: Record<IconName, JSX.Element> = {
    spark: (
        <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.36-6.36-2.83 2.83M9.46 14.54l-2.83 2.83m0-11.32 2.83 2.83m5.07 5.07 2.83 2.83" />
    ),
    rocket: (
        <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.83-.83.83-2.17 0-3s-2.17-.83-3 0Zm10-4a8 8 0 0 0-6 3l-3 3 3 3 3-3a8 8 0 0 0 3-6 8 8 0 0 0-3-6 8 8 0 0 0-6 3M14 6l4 4" />
    ),
    bot: (
        <>
            <rect x="4" y="8" width="16" height="11" rx="2" />
            <path d="M12 8V4m-4 8h.01M16 12h.01M9 16h6" />
        </>
    ),
    download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />,
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
        </>
    ),
    wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5L3 17.6 6.4 21l6.3-6.3a4 4 0 0 0 5-5.4l-2.6 2.6-2.1-2.1 2.6-2.6Z" />,
    image: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="m21 16-5-5-9 9" />
        </>
    ),
    text: <path d="M4 7V5h16v2M9 5v14m-2 0h4m5-9v9m-1.5 0h3" />,
    bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
    target: (
        <>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    key: (
        <>
            <circle cx="7.5" cy="15.5" r="4" />
            <path d="m10.5 12.5 8-8m-2 2 2 2m-4 0 2 2" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" />
        </>
    ),
    signal: <path d="M4 20v-4m5 4V11m5 9V7m5 13V4" />,
    chart: <path d="M4 4v16h16M8 16v-4m4 4V8m4 8v-6" />,
    fire: <path d="M12 3s5 3.5 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2c1 0 1.5-1 1.5-2 0-3-1-5 0-6Z" />,
    satellite: <path d="m9 15-3 3m1.5-7.5L5 13l3 3 2.5-2.5M13 5l6 6-3 3-6-6 3-3Zm3 9a4 4 0 0 1-4 4m6-6a6 6 0 0 1-6 6" />,
    globe: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
        </>
    ),
    activity: <path d="M3 12h4l3 8 4-16 3 8h4" />,
    server: (
        <>
            <rect x="3" y="4" width="18" height="7" rx="2" />
            <rect x="3" y="13" width="18" height="7" rx="2" />
            <path d="M7 7.5h.01M7 16.5h.01" />
        </>
    ),
    shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />,
    database: (
        <>
            <ellipse cx="12" cy="6" rx="8" ry="3" />
            <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
        </>
    ),
    cpu: (
        <>
            <rect x="7" y="7" width="10" height="10" rx="1.5" />
            <path d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2" />
        </>
    ),
    "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
    copy: (
        <>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </>
    ),
    check: <path d="M4 12l5 5L20 6" />,
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </>
    ),
    wave: <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />,
    star: <path d="M12 2c.6 5.5 4 8.9 9.5 9.5-5.5.6-8.9 4-9.5 9.5-.6-5.5-4-8.9-9.5-9.5C8 10.9 11.4 7.5 12 2Z" fill="currentColor" stroke="none" />
}

export default function Icon({ name, size = 20, className = "", strokeWidth = 1.7 }: Props) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {P[name]}
        </svg>
    )
}
