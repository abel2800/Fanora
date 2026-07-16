import Flutter
import UIKit

@main
@objc class AppDelegate: FlutterAppDelegate, FlutterImplicitEngineDelegate {
  private static let captureShieldTag = 0xFA_1401
  private var screenCaptureChannel: FlutterMethodChannel?
  private var captureListening = false
  private var observersInstalled = false
  private var appIsInactive = false

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  func didInitializeImplicitFlutterEngine(_ engineBridge: FlutterImplicitEngineBridge) {
    GeneratedPluginRegistrant.register(with: engineBridge.pluginRegistry)
    guard let registrar = engineBridge.pluginRegistry.registrar(forPlugin: "FanoraScreenCapture") else {
      return
    }
    let channel = FlutterMethodChannel(
      name: "com.fanora.fanora/screen_capture",
      binaryMessenger: registrar.messenger()
    )
    screenCaptureChannel = channel
    channel.setMethodCallHandler { [weak self] call, result in
      switch call.method {
      case "isSupported":
        result(true)
      case "startListening":
        self?.captureListening = true
        result(nil)
      case "stopListening":
        self?.captureListening = false
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }

    installCaptureObserversIfNeeded()
    refreshCaptureShields()
  }

  private func installCaptureObserversIfNeeded() {
    guard !observersInstalled else { return }
    observersInstalled = true
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(userDidTakeScreenshot),
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(captureStateChanged),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(applicationWillResignActive),
      name: UIApplication.willResignActiveNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(applicationDidBecomeActive),
      name: UIApplication.didBecomeActiveNotification,
      object: nil
    )
  }

  @objc private func userDidTakeScreenshot() {
    guard captureListening else { return }
    screenCaptureChannel?.invokeMethod(
      "onCaptureEvent",
      arguments: ["type": "screenshot", "supportedRecording": true]
    )
  }

  @objc private func captureStateChanged() {
    let isCaptured = UIScreen.main.isCaptured
    refreshCaptureShields()
    if isCaptured && captureListening {
      screenCaptureChannel?.invokeMethod(
        "onCaptureEvent",
        arguments: ["type": "screen_recording", "supportedRecording": true]
      )
    }
  }

  @objc private func applicationWillResignActive() {
    appIsInactive = true
    refreshCaptureShields()
  }

  @objc private func applicationDidBecomeActive() {
    appIsInactive = false
    refreshCaptureShields()
  }

  private func refreshCaptureShields() {
    let shouldShield = appIsInactive || UIScreen.main.isCaptured
    for window in applicationWindows() {
      if shouldShield {
        installShield(on: window)
      } else {
        window.viewWithTag(Self.captureShieldTag)?.removeFromSuperview()
      }
    }
  }

  private func applicationWindows() -> [UIWindow] {
    let sceneWindows = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
    if let window, !sceneWindows.contains(where: { $0 === window }) {
      return sceneWindows + [window]
    }
    return sceneWindows
  }

  private func installShield(on window: UIWindow) {
    guard window.viewWithTag(Self.captureShieldTag) == nil else { return }
    let shield = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterialDark))
    shield.tag = Self.captureShieldTag
    shield.frame = window.bounds
    shield.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    shield.backgroundColor = .black
    shield.isUserInteractionEnabled = true
    window.addSubview(shield)
  }

  deinit {
    screenCaptureChannel?.setMethodCallHandler(nil)
    screenCaptureChannel = nil
    NotificationCenter.default.removeObserver(self)
  }
}
