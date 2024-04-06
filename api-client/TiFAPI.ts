import { TiFAPI } from "TiFShared/api"
import { awsTiFAPITransport } from "./AWS"
import { API_URL } from "@env"

declare module "TiFShared/api" {
  export interface TiFAPIConstructor {
    productionInstance: TiFAPI
  }
}

TiFAPI.productionInstance = new TiFAPI(awsTiFAPITransport(new URL(API_URL)))
