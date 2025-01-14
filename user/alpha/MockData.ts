import { UserHandle } from "TiFShared/domain-models/User"

export namespace AlphaUserMocks {
  export const Blob = {
    id: "01938e5d-7743-725c-8e19-c68092b598d3",
    handle: UserHandle.optionalParse("blob0952")!,
    name: "Blob",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTM4ZTVkLTc3NDMtNzI1Yy04ZTE5LWM2ODA5MmI1OThkMyIsImhhbmRsZSI6ImJsb2IwOTUyIiwibmFtZSI6IkJsb2IiLCJpYXQiOjE3MzMyNjAzMTB9.AS0z0zckPcCGoGQW3DgZcXDllmGWYtnYkaxbGXXHXlU"
  }

  export const TheDarkLord = {
    id: "01938e5f-10de-767d-9bb9-36d34ba77971",
    handle: UserHandle.optionalParse("thedarklord2420")!,
    name: "The Dark Lord",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTM4ZTVmLTEwZGUtNzY3ZC05YmI5LTM2ZDM0YmE3Nzk3MSIsImhhbmRsZSI6InRoZWRhcmtsb3JkMjQyMCIsIm5hbWUiOiJUaGUgRGFyayBMb3JkIiwiaWF0IjoxNzMzMjYwNDE1fQ.WSWI-HXnLPRXqA64-OsX8cGL4-KV53hqqVKMVDD4RGs"
  }
}
