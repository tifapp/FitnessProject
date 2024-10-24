package expo.modules.tifweblinks

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.ResolveInfo
import android.net.Uri
import android.os.Build
import androidx.browser.customtabs.CustomTabsIntent
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.collections.List

class ExpoTiFWeblinksModule : Module() {
    private val context: Context
        get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

    override fun definition() = ModuleDefinition {
        Name("ExpoTiFWeblinks")

        // NB: The 3rd parameter is only used on iOS, but it needs to be specified here. Otherwise,
        // an exception is thrown.
        AsyncFunction("openWeblink") { uri: Uri, shouldUseInAppBrowser: Boolean, _: Boolean ->
            if (!shouldUseInAppBrowser) {
                return@AsyncFunction openURL(context, uri)
            }
            val didDeeplink = openWithUniversalDeeplinking(context, uri)
            if (didDeeplink) return@AsyncFunction true
            openInCustomTab(context, uri)
            true
        }
    }

    private fun openURL(context: Context, uri: Uri): Boolean {
        val intent =
                Intent(Intent.ACTION_VIEW, uri).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
        return try {
            context.startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            false
        }
    }

    private fun openInCustomTab(context: Context, uri: Uri) {
        val intent =
                CustomTabsIntent.Builder().build().intent.apply {
                    data = uri
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
        context.startActivity(intent)
    }

    // Ported From:
    // https://github.com/aeharding/capacitor-launch-native/blob/main/android/src/main/java/dev/harding/plugins/launchnative/LaunchNative.java

    private fun openWithUniversalDeeplinking(context: Context, uri: Uri): Boolean {
        return if (Build.VERSION.SDK_INT >= 30) {
            launchNativeApi30(context, uri)
        } else {
            launchNativeBeforeApi30(context, uri)
        }
    }

    private fun launchNativeApi30(context: Context, uri: Uri): Boolean {
        val nativeAppIntent =
                Intent(Intent.ACTION_VIEW, uri).apply {
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(
                            Intent.FLAG_ACTIVITY_NEW_TASK or
                                    Intent.FLAG_ACTIVITY_REQUIRE_NON_BROWSER
                    )
                }
        return try {
            context.startActivity(nativeAppIntent)
            true
        } catch (ex: ActivityNotFoundException) {
            false
        }
    }

    private fun launchNativeBeforeApi30(context: Context, uri: Uri): Boolean {
        val pm = context.packageManager
        val browserActivityIntent =
                Intent().apply {
                    action = Intent.ACTION_VIEW
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    data = Uri.fromParts("http", "", null)
                }
        val genericResolvedList =
                extractPackageNames(pm.queryIntentActivities(browserActivityIntent, 0))
        val specializedActivityIntent =
                Intent(Intent.ACTION_VIEW, uri).apply { addCategory(Intent.CATEGORY_BROWSABLE) }
        val resolvedSpecializedList =
                extractPackageNames(pm.queryIntentActivities(specializedActivityIntent, 0))
        resolvedSpecializedList.removeAll(genericResolvedList)
        if (resolvedSpecializedList.isEmpty()) {
            return false
        }
        specializedActivityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(specializedActivityIntent)
        return true
    }

    private fun extractPackageNames(resolveInfoList: List<ResolveInfo>?): MutableSet<String> {
        val packageNames = mutableSetOf<String>()
        resolveInfoList?.forEach { resolveInfo ->
            resolveInfo.activityInfo?.packageName?.let { packageNames.add(it) }
        }
        return packageNames
    }
}
