;(() => {
    const $ = (s, r = document) => r.querySelector(s)
    const $$ = (s, r = document) => [...r.querySelectorAll(s)]
    const API = (window.STARNOVA_CONFIG || {}).API_BASE || ""
    let TOKEN = localStorage.getItem("snv_token") || ""
    let ME = null

    // Stars bg
    ;(function stars() {
        const c = $("#stars"),
            x = c.getContext("2d")
        let W, H, S
        function rs() {
            W = c.width = innerWidth
            H = c.height = innerHeight
            S = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.3, a: Math.random(), s: Math.random() * 0.02 + 0.004 }))
        }
        function loop() {
            x.clearRect(0, 0, W, H)
            for (const st of S) {
                st.a += st.s
                x.globalAlpha = 0.5 + Math.abs(Math.sin(st.a)) * 0.5
                x.fillStyle = "#dfe6ff"
                x.beginPath()
                x.arc(st.x, st.y, st.r, 0, 7)
                x.fill()
            }
            requestAnimationFrame(loop)
        }
        rs()
        addEventListener("resize", rs)
        loop()
    })()

    // API helper
    async function api(path, opt = {}) {
        const r = await fetch(API + path, {
            ...opt,
            headers: {
                "Content-Type": "application/json",
                ...(TOKEN ? { Authorization: "Bearer " + TOKEN } : {}),
                ...(opt.headers || {})
            }
        })
        const data = await r.json().catch(() => ({}))
        return { ok: r.ok, code: r.status, data }
    }

    let toastT
    function toast(m) {
        const t = $("#toast")
        t.textContent = m
        t.classList.add("show")
        clearTimeout(toastT)
        toastT = setTimeout(() => t.classList.remove("show"), 2600)
    }
    const rp = (n) => (n === 0 ? "Gratis" : "Rp " + Number(n || 0).toLocaleString("id-ID"))
    const timeAgo = (ts) => {
        if (!ts) return "-"
        const s = Math.floor((Date.now() - new Date(ts)) / 1000)
        if (s < 60) return "baru saja"
        if (s < 3600) return Math.floor(s / 60) + "m"
        if (s < 86400) return Math.floor(s / 3600) + "j"
        return Math.floor(s / 86400) + "h"
    }

    // ─── Auth screens ───
    $("#toRegister").onclick = () => {
        $("#loginForm").classList.add("hidden")
        $("#registerForm").classList.remove("hidden")
    }
    $("#toLogin").onclick = () => {
        $("#registerForm").classList.add("hidden")
        $("#loginForm").classList.remove("hidden")
    }
    $("#loginBtn").onclick = async () => {
        const email = $("#lEmail").value.trim(),
            password = $("#lPass").value
        const err = $("#loginErr")
        err.style.display = "none"
        const { ok, data } = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
        if (!ok) {
            err.textContent = data.message || "Login gagal."
            err.style.display = "block"
            return
        }
        TOKEN = data.result.token
        localStorage.setItem("snv_token", TOKEN)
        enterDash()
    }
    $("#regBtn").onclick = async () => {
        const name = $("#rName").value.trim(),
            email = $("#rEmail").value.trim(),
            password = $("#rPass").value
        const err = $("#regErr")
        err.style.display = "none"
        const { ok, data } = await api("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) })
        if (!ok) {
            err.textContent = data.message || "Gagal daftar."
            err.style.display = "block"
            return
        }
        TOKEN = data.result.token
        localStorage.setItem("snv_token", TOKEN)
        enterDash()
    }
    $("#logoutBtn").onclick = () => {
        localStorage.removeItem("snv_token")
        location.reload()
    }
    $("#lPass").addEventListener("keydown", (e) => e.key === "Enter" && $("#loginBtn").click())

    // ─── Tabs ───
    const TITLES = {
        overview: ["Dashboard", "Ringkasan penggunaan API kamu."],
        keys: ["API Keys", "Kelola API Key kamu."],
        usage: ["Usage", "Detail pemakaian per key."],
        analytics: ["Analytics", "Statistik aktivitas."],
        billing: ["Billing", "Paket & langganan."],
        settings: ["Settings", "Pengaturan akun."],
        admin: ["Admin", "Panel administrator."]
    }
    $$(".side-link[data-tab]").forEach((b) =>
        b.addEventListener("click", () => {
            $$(".side-link").forEach((x) => x.classList.remove("active"))
            b.classList.add("active")
            const tab = b.dataset.tab
            $$(".tab").forEach((t) => t.classList.remove("active"))
            $("#tab-" + tab).classList.add("active")
            $("#tabTitle").textContent = TITLES[tab][0]
            $("#tabSub").textContent = TITLES[tab][1]
            if (tab === "keys") loadKeys()
            if (tab === "usage") loadUsage()
            if (tab === "admin") loadAdmin()
        })
    )

    // ─── Enter dashboard ───
    async function enterDash() {
        const { ok, data } = await api("/api/dashboard/overview")
        if (!ok) {
            localStorage.removeItem("snv_token")
            return
        }
        ME = data.result.user
        $("#loginScreen").classList.add("hidden")
        $("#dash").classList.remove("hidden")
        $("#whoami").textContent = ME.email + " · " + (ME.plan || "free")
        $("#setName").value = ME.name || ""
        $("#setEmail").value = ME.email || ""
        $("#billPlan").textContent = "Paket kamu: " + (ME.plan || "free").toUpperCase()
        renderOverview(data.result)
        // cek admin
        const adm = await api("/api/admin/overview")
        if (adm.ok) $("#adminTabBtn").style.display = "flex"
    }

    function renderOverview(r) {
        $("#kpiGrid").innerHTML = [
            ["📡", (r.totalRequest || 0).toLocaleString("id-ID"), "Total Request"],
            ["🎯", (r.remaining || 0).toLocaleString("id-ID"), "Sisa Limit Harian"],
            ["🔑", r.keys || 0, "API Keys"],
            ["⏳", r.expiredDate ? new Date(r.expiredDate).toLocaleDateString("id-ID") : "∞", "Expired Terdekat"]
        ].map((k) => `<div class="glass kpi"><div class="kpi-ico">${k[0]}</div><div class="kpi-num">${k[1]}</div><div class="kpi-label">${k[2]}</div></div>`).join("")

        const chart = r.chart || []
        const max = Math.max(1, ...chart.map((c) => c.count))
        $("#chart").innerHTML = chart.length
            ? chart.map((c) => `<div class="bar" style="height:${(c.count / max) * 100}%"><span>${c.date.slice(5)}</span></div>`).join("")
            : `<p class="muted">Belum ada data request.</p>`

        $("#recentBody").innerHTML = (r.recent || []).length
            ? r.recent.map((x) => `<tr><td class="mono">${x.endpoint}</td><td>${x.method}</td><td>${x.status}</td><td>${x.responseTime}ms</td><td class="muted">${timeAgo(x.at)}</td></tr>`).join("")
            : `<tr><td colspan="5" class="muted">Belum ada request.</td></tr>`

        $("#topBody").innerHTML = (r.topEndpoint || []).length
            ? r.topEndpoint.map((x) => `<tr><td class="mono">${x.endpoint}</td><td>${x.count}</td></tr>`).join("")
            : `<tr><td colspan="2" class="muted">Belum ada data.</td></tr>`

        // analytics reuse
        $("#anaGrid").innerHTML = $("#kpiGrid").innerHTML
        $("#anaChart").innerHTML = $("#chart").innerHTML
    }

    // ─── Keys ───
    async function loadKeys() {
        const { data } = await api("/api/dashboard/keys")
        const keys = data.result || []
        $("#keysBody").innerHTML = keys.length
            ? keys.map((k) => `<tr>
                <td class="mono copy-key" data-copy="${k.key}" title="klik salin">${k.key.slice(0, 16)}…</td>
                <td>${k.plan}</td>
                <td><span class="tag ${k.status}">${k.status}</span></td>
                <td class="mono">${k.usageDaily}/${k.dailyLimit}</td>
                <td class="muted">${k.expiredAt ? new Date(k.expiredAt).toLocaleDateString("id-ID") : "∞"}</td>
                <td><div class="row-actions">
                    ${k.status === "active" ? `<button class="btn btn-ghost btn-sm" data-act="disable" data-key="${k.key}">Disable</button>` : `<button class="btn btn-ghost btn-sm" data-act="enable" data-key="${k.key}">Enable</button>`}
                    <button class="btn btn-ghost btn-sm" data-act="regenerate" data-key="${k.key}">Regen</button>
                    <button class="btn btn-danger btn-sm" data-act="delete" data-key="${k.key}">Hapus</button>
                </div></td></tr>`).join("")
            : `<tr><td colspan="6" class="muted">Belum ada API Key. Buat sekarang!</td></tr>`
        $$("#keysBody .copy-key").forEach((el) => el.addEventListener("click", () => { navigator.clipboard?.writeText(el.dataset.copy); toast("🔑 Key disalin!") }))
        $$("#keysBody [data-act]").forEach((b) =>
            b.addEventListener("click", async () => {
                const { act, key } = b.dataset
                if (act === "delete") {
                    if (!confirm("Hapus API Key ini?")) return
                    await api("/api/dashboard/keys/" + key, { method: "DELETE" })
                } else {
                    await api(`/api/dashboard/keys/${key}/${act}`, { method: "POST" })
                }
                toast("✅ " + act)
                loadKeys()
            })
        )
    }
    $("#newKeyBtn").onclick = async () => {
        const { ok, data } = await api("/api/dashboard/keys", { method: "POST", body: JSON.stringify({ name: "My Key" }) })
        if (ok) {
            toast("🎉 Key dibuat: " + data.result.key.slice(0, 16) + "…")
            loadKeys()
        } else toast("⚠️ " + (data.message || "Gagal"))
    }

    async function loadUsage() {
        const { data } = await api("/api/dashboard/usage")
        const keys = data.result?.keys || []
        $("#usageBody").innerHTML = keys.length
            ? keys.map((k) => `<tr><td class="mono">${k.key.slice(0, 14)}…</td><td>${k.usageDaily}/${k.dailyLimit}</td><td>${k.usageMonthly}/${k.monthlyLimit}</td><td>${k.usageTotal}</td><td class="muted">${timeAgo(k.lastUsed)}</td></tr>`).join("")
            : `<tr><td colspan="5" class="muted">Belum ada data.</td></tr>`
    }

    // ─── Admin ───
    async function loadAdmin() {
        const o = await api("/api/admin/overview")
        if (!o.ok) return
        const r = o.data.result
        $("#adminKpi").innerHTML = [
            ["👥", r.users, "Users"],
            ["🔑", r.apiKeys, "API Keys"],
            ["💳", r.paidPayments, "Paid"],
            ["💰", rp(r.revenue), "Revenue"]
        ].map((k) => `<div class="glass kpi"><div class="kpi-ico">${k[0]}</div><div class="kpi-num">${k[1]}</div><div class="kpi-label">${k[2]}</div></div>`).join("")
        $("#admAnnounce").value = r.announcement || ""

        const u = await api("/api/admin/users")
        const users = u.data.result || []
        $("#adminUsers").innerHTML = users.map((x) => `<tr>
            <td class="mono">${x.email}</td><td>${x.plan}</td><td>${x.role}</td>
            <td>${x.banned ? '<span class="tag disabled">banned</span>' : '<span class="tag active">active</span>'}</td>
            <td><div class="row-actions">
                ${x.banned ? `<button class="btn btn-ghost btn-sm" data-uact="unban" data-id="${x._id}">Unban</button>` : `<button class="btn btn-danger btn-sm" data-uact="ban" data-id="${x._id}">Ban</button>`}
            </div></td></tr>`).join("")
        $$("#adminUsers [data-uact]").forEach((b) =>
            b.addEventListener("click", async () => {
                await api(`/api/admin/users/${b.dataset.id}/${b.dataset.uact}`, { method: "POST", body: JSON.stringify({ reason: "admin action" }) })
                toast("✅ " + b.dataset.uact)
                loadAdmin()
            })
        )
    }
    $("#admSaveAnnounce").onclick = async () => { await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ announcement: $("#admAnnounce").value }) }); toast("✅ Announcement disimpan") }
    $("#admMaintOn").onclick = async () => { await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ maintenance: true }) }); toast("🛠️ Maintenance ON") }
    $("#admMaintOff").onclick = async () => { await api("/api/admin/settings", { method: "POST", body: JSON.stringify({ maintenance: false }) }); toast("✅ Maintenance OFF") }

    // Auto-login
    if (TOKEN) enterDash()
})()
