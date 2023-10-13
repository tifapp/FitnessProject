// @ts-nocheck
import fetch, { Request, Response } from "node-fetch"

globalThis.fetch = fetch
globalThis.Request = Request
globalThis.Response = Response
