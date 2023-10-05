import { TiFAPIFetch } from "./client"

/**
 * A high-level client for the TiF API.
 */
export class TiFAPI {
  private readonly apiFetch: TiFAPIFetch

  constructor (apiFetch: TiFAPIFetch) {
    this.apiFetch = apiFetch
  }
}
