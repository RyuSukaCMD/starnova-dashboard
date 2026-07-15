import config from "./config"

export function buildUrl(ep: any) {
    const q = (ep.params || [])
        .filter((p: any) => p.required)
        .map((p: any) => `${p.name}=${encodeURIComponent(p.example ?? "value")}`)
        .join("&")
    return `${config.siteUrl}${ep.path}${q ? "?" + q : ""}`
}

export function codeSamples(ep: any): Record<string, string> {
    const url = buildUrl(ep)
    const key = "snv_YOUR_API_KEY"
    return {
        cURL: `curl "${url}" \\\n  -H "apikey: ${key}"`,
        NodeJS: `import axios from "axios"\nconst { data } = await axios.get("${url}", {\n  headers: { apikey: "${key}" }\n})\nconsole.log(data)`,
        "JS Fetch": `const res = await fetch("${url}", {\n  headers: { apikey: "${key}" }\n})\nconsole.log(await res.json())`,
        Axios: `axios.get("${url}", { headers: { apikey: "${key}" } })\n  .then(r => console.log(r.data))`,
        Python: `import requests\nr = requests.get("${url}", headers={"apikey": "${key}"})\nprint(r.json())`,
        PHP: `<?php\n$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["apikey: ${key}"]);\necho curl_exec($ch);`,
        Go: `req, _ := http.NewRequest("GET", "${url}", nil)\nreq.Header.Set("apikey", "${key}")\nres, _ := http.DefaultClient.Do(req)\nb, _ := io.ReadAll(res.Body)\nfmt.Println(string(b))`,
        Java: `HttpRequest req = HttpRequest.newBuilder()\n  .uri(URI.create("${url}"))\n  .header("apikey", "${key}").build();\nvar res = HttpClient.newHttpClient()\n  .send(req, HttpResponse.BodyHandlers.ofString());\nSystem.out.println(res.body());`,
        "C#": `using var http = new HttpClient();\nhttp.DefaultRequestHeaders.Add("apikey", "${key}");\nvar json = await http.GetStringAsync("${url}");\nConsole.WriteLine(json);`,
        Ruby: `require "net/http"\nuri = URI("${url}")\nreq = Net::HTTP::Get.new(uri)\nreq["apikey"] = "${key}"\nres = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |h| h.request(req) }\nputs res.body`,
        Rust: `let res = reqwest::Client::new()\n  .get("${url}")\n  .header("apikey", "${key}")\n  .send().await?.text().await?;\nprintln!("{}", res);`
    }
}
