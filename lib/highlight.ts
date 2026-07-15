// JSON syntax highlight → HTML (dipakai di docs & playground).
export function hlJSON(obj: any): string {
    const json = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)
    return json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
            (m) => {
                let color = "#fcd34d" // num
                if (/^"/.test(m)) color = /:$/.test(m) ? "#93b4ff" : "#6ee7b7"
                else if (/true|false/.test(m)) color = "#c084fc"
                else if (/null/.test(m)) color = "#f87171"
                return `<span style="color:${color}">${m}</span>`
            }
        )
}
