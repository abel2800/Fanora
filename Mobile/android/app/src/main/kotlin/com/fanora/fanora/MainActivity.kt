package com.fanora.fanora

import android.app.Activity
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "com.fanora.fanora/screen_capture"
    private var methodChannel: MethodChannel? = null
    private var screenCaptureCallback: Activity.ScreenCaptureCallback? = null
    private var listening = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            Toast.makeText(
                applicationContext,
                "Fanora requires Android 14 or newer.",
                Toast.LENGTH_LONG,
            ).show()
            finish()
            return
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        methodChannel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
        methodChannel?.setMethodCallHandler { call, result ->
            when (call.method) {
                "isSupported" -> {
                    result.success(Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
                }
                "startListening" -> {
                    startCaptureListening()
                    result.success(null)
                }
                "stopListening" -> {
                    stopCaptureListening()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun startCaptureListening() {
        if (listening) return
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return

        val callback = Activity.ScreenCaptureCallback {
            // API 34 ScreenCaptureCallback reports screenshots.
            // Do not claim screen-recording support via this callback.
            methodChannel?.invokeMethod(
                "onCaptureEvent",
                mapOf("type" to "screenshot", "supportedRecording" to false),
            )
        }
        screenCaptureCallback = callback
        try {
            registerScreenCaptureCallback(mainExecutor, callback)
            listening = true
        } catch (_: Exception) {
            listening = false
            screenCaptureCallback = null
        }
    }

    private fun stopCaptureListening() {
        val callback = screenCaptureCallback ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            try {
                unregisterScreenCaptureCallback(callback)
            } catch (_: Exception) {
            }
        }
        screenCaptureCallback = null
        listening = false
    }

    override fun onDestroy() {
        stopCaptureListening()
        methodChannel?.setMethodCallHandler(null)
        methodChannel = null
        super.onDestroy()
    }
}
