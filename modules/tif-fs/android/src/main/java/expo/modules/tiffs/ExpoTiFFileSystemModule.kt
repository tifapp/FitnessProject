package expo.modules.tiffs

import android.content.Context
import expo.modules.core.utilities.FileUtilities.ensureDirExists
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.Serializable
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class ExpoTiFFileSystemModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ExpoTiFFileSystem")
    val logsZipArchivePath = "${context.filesDir}${File.separator}logs-archive.zip"
    Constants(
      "LOGS_ZIP_ARCHIVE_PATH" to logsZipArchivePath
    )

    Function("logsDatabaseInfo") {
      return@Function LogsDatabaseInfo(path = logsDatabasePath(), databaseName = "logs/logs.db")
    }

    AsyncFunction("zip") Coroutine { file: File, destination: File ->
      zip(file, destination)
    }
  }

  private suspend fun zip(file: File, outputZipFile: File) {
    withContext(Dispatchers.IO) {
      ZipOutputStream(FileOutputStream(outputZipFile)).use { zipOut ->
        FileInputStream(file).use { fis ->
          val zipEntry = ZipEntry(file.name)
          zipOut.putNextEntry(zipEntry)
          fis.copyTo(zipOut)
          zipOut.closeEntry()
        }
      }
    }
  }

  private fun logsDatabasePath(): String {
    val directory = File("${context.filesDir}${File.separator}SQLite/logs")
    ensureDirExists(directory)
    return "$directory${File.separator}logs.db"
  }
}

data class LogsDatabaseInfo(
  @Field var path: String,
  @Field var databaseName: String
): Record, Serializable
