import { MongoMemoryServer } from "mongodb-memory-server"
import fs from "fs"
const s=await MongoMemoryServer.create(); fs.writeFileSync("/tmp/uri.txt",s.getUri()); console.log("up"); await new Promise(r=>setTimeout(r,90000))
