import { requireOptionalNativeModule } from "expo"

export interface ExpoTiFFileSystemModule {
  LOGS_ZIP_ARCHIVE_PATH: string
  logsDatabaseInfo(): {
    path: string
    databaseName: string
  } | null
  zip(filePath: string, destination: string): Promise<void>
}

export const ExpoTiFFileSystem =
  requireOptionalNativeModule<ExpoTiFFileSystemModule>("ExpoTiFFileSystem")
