import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

class AppLocalizations {
  AppLocalizations(this.locale);

  final Locale locale;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const supportedLocales = [Locale('en'), Locale('am')];

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'appName': 'Fanora',
      'home': 'Home',
      'explore': 'Explore',
      'create': 'Create',
      'messages': 'Messages',
      'profile': 'Profile',
      'login': 'Login',
      'register': 'Create account',
      'email': 'Email',
      'password': 'Password',
      'phone': 'Phone',
      'otp': 'OTP code',
      'sendOtp': 'Send OTP',
      'verifyOtp': 'Verify OTP',
      'verify': 'Verify',
      'resendOtp': 'Resend OTP',
      'forgotPassword': 'Forgot password?',
      'forgotPasswordTitle': 'Forgot password',
      'resetPassword': 'Reset password',
      'logout': 'Logout',
      'settings': 'Settings',
      'notifications': 'Notifications',
      'language': 'Language',
      'english': 'English',
      'amharic': 'Amharic',
      'dataSaver': 'Data saver',
      'dataSaverHint': 'Do not autoplay video; tap to load',
      'privacy': 'Privacy',
      'preferences': 'Preferences',
      'pushNotifications': 'Push notifications',
      'privateProfile': 'Private profile',
      'incognitoMode': 'Incognito mode',
      'hideFromSearch': 'Hide from subscriber search',
      'trustSafety': 'Trust & safety',
      'changePassword': 'Change password',
      'wallet': 'Wallet',
      'subscriptions': 'My subscriptions',
      'following': 'Following',
      'followers': 'Followers',
      'forYou': 'For You',
      'tips': 'Tips',
      'editProfile': 'Edit profile',
      'creatorDashboard': 'Creator dashboard',
      'goLive': 'Go live',
      'live': 'Live',
      'liveBadge': 'LIVE',
      'search': 'Search',
      'markAllRead': 'Mark all read',
      'noNotifications': 'No notifications',
      'save': 'Save',
      'cancel': 'Cancel',
      'submit': 'Submit',
      'retry': 'Retry',
      'tryAgain': 'Try again',
      'continueLabel': 'Continue',
      'loading': 'Loading...',
      'unlock': 'Unlock',
      'subscribe': 'Subscribe',
      'tapToLoadVideo': 'Tap to load video',
      'paidMessage': 'Paid message',
      'unlockMessage': 'Unlock message',
      'customRequests': 'Custom requests',
      'requestInbox': 'Request inbox',
      'newRequest': 'New request',
      'contentCalendar': 'Content calendar',
      'creatorOnboarding': 'Creator verification',
      'giftSubscriptions': 'Gift subscriptions',
      'redeemGift': 'Redeem gift',
      'myGifts': 'My gifts',
      'month': 'Month',
      'week': 'Week',
      'rising': 'Rising',
      'creators': 'Creators',
      'trending': 'Trending',
      'all': 'All',
      'videos': 'Videos',
      'images': 'Images',
      'content': 'Content',
      'rtmpIngest': 'RTMP ingest',
      'playbackUrl': 'Playback URL',
      'streamKey': 'Stream key',
      'copy': 'Copy',
      'endStream': 'End stream',
      'startStreaming': 'Start streaming',
      'settingsSaved': 'Settings saved',
      'typeMessage': 'Type a message...',
      'comments': 'Comments',
      'addComment': 'Add comment',
      'noContent': 'No content yet. Follow creators to see more!',
      'noContentYet': 'No content yet',
      'accept': 'Accept',
      'decline': 'Decline',
      'counter': 'Counter',
      'deliver': 'Deliver',
      'offeredPrice': 'Offered price',
      'description': 'Description',
      'identity': 'Identity',
      'payout': 'Payout',
      'guidelines': 'Guidelines',
      'status': 'Status',
      'redeem': 'Redeem',
      'createGift': 'Create gift',
      'giftCode': 'Gift code',
      'recipientPhone': 'Recipient phone',
      'plan': 'Plan',
      'planId': 'Plan ID',
      'studio': 'Live studio',
      'watchLive': 'Watch live',
      'unsupportedCapture':
          'Screenshot detection is not available on this device',
      'required': 'Required',
      'min6Chars': 'Min 6 characters',
      'enterOtp': 'Enter OTP',
      'enterPhone': 'Enter phone number',
      'otpSent': 'OTP sent',
      'failedSendOtp': 'Failed to send OTP',
      'loginFailed': 'Login failed',
      'otpLoginFailed': 'OTP login failed',
      'otpVerifyFailed': 'OTP verification failed',
      'mustBe18': 'You must be at least 18 years old',
      'mustBe18Hint': 'You must be 18 or older to use Fanora',
      'fillAllFields': 'Fill all fields correctly',
      'registrationFailed': 'Registration failed',
      'step1Phone': 'Step 1: Phone number',
      'step2Otp': 'Step 2: Verify OTP',
      'step3Dob': 'Step 3: Date of birth',
      'step4Account': 'Step 4: Account details',
      'phoneHint251': 'Phone (+251...)',
      'selectDob': 'Select date of birth',
      'firstName': 'First name',
      'lastName': 'Last name',
      'username': 'Username',
      'bio': 'Bio',
      'checkEmailReset': 'Check your email for reset instructions.',
      'backToLogin': 'Back to login',
      'enterEmailReset': 'Enter your email to receive a reset link.',
      'sendResetLink': 'Send reset link',
      'passwordResetSuccess': 'Password reset successfully',
      'newPassword': 'New password',
      'currentPassword': 'Current password',
      'updatePassword': 'Update password',
      'passwordChanged': 'Password changed',
      'verifyEmail': 'Verify email',
      'emailVerified': 'Email verified!',
      'verificationFailed': 'Verification failed',
      'failed': 'Failed',
      'emailNotVerified': 'Email not verified',
      'verificationEmailSent': 'Verification email sent',
      'profileUpdated': 'Profile updated',
      'reportSubmitted': 'Report submitted',
      'submitReport': 'Submit a report',
      'submitReportAction': 'Submit report',
      'type': 'Type',
      'reason': 'Reason',
      'spam': 'Spam',
      'harassment': 'Harassment',
      'scam': 'Scam',
      'other': 'Other',
      'blockedUsers': 'Blocked users',
      'noBlockedUsers': 'No blocked users',
      'unblock': 'Unblock',
      'myReports': 'My reports',
      'noReports': 'No reports',
      'searchHint': 'Search creators or content...',
      'searchEmpty': 'Search for creators and content',
      'noResults': 'No results found',
      'notFollowingYet': 'Not following anyone yet',
      'noConversations': 'No conversations yet',
      'unknown': 'Unknown',
      'pin': 'PIN',
      'noLiveStreams': 'No live streams right now',
      'liveStream': 'Live stream',
      'streamTitle': 'Stream title',
      'rtmpHint':
          'Use an RTMP encoder (OBS, etc.) with the ingest URL above. Fans watch via HLS playback.',
      'hlsUnavailable': 'HLS playback URL is not available yet.',
      'availableBalance': 'Available balance',
      'telebirr': 'Telebirr',
      'cbe': 'CBE',
      'walletPin': 'Wallet PIN',
      'pinIsSet': 'PIN is set',
      'setYourPin': 'Set your PIN',
      'linkAccounts': 'Link accounts',
      'transactions': 'Transactions',
      'recent': 'Recent',
      'pinSet': 'PIN set',
      'setWalletPin': 'Set wallet PIN',
      'confirmPin': 'Confirm PIN',
      'savePin': 'Save PIN',
      'telebirrLinked': 'Telebirr linked',
      'cbeLinked': 'CBE linked',
      'phoneNumber': 'Phone number',
      'linkTelebirr': 'Link Telebirr',
      'accountNumber': 'Account number',
      'linkCbe': 'Link CBE',
      'enterWalletPin': 'Enter your 4-digit wallet PIN',
      'topupTelebirr': 'Top up via Telebirr',
      'topupCbe': 'Top up via CBE',
      'amountEtb': 'Amount (ETB)',
      'confirmTopup': 'Confirm top-up',
      'topupConfirmed': 'Top-up confirmed!',
      'goToWallet': 'Go to wallet',
      'completePaymentHint': 'Complete payment in your app, then confirm here.',
      'confirmPayment': 'Confirm payment',
      'noTransactions': 'No transactions',
      'subscriptionPaused': 'Subscription paused',
      'noActiveSubscriptions': 'No active subscriptions',
      'subscription': 'Subscription',
      'pause': 'Pause',
      'sent': 'Sent',
      'received': 'Received',
      'noTipsSent': 'No tips sent',
      'noTipsReceived': 'No tips received',
      'giftRedeemed': 'Gift redeemed',
      'requestPaymentDone': 'Request payment completed',
      'pay': 'Pay',
      'creatorId': 'Creator ID',
      'contentId': 'Content ID',
      'totalEarnings': 'Total earnings',
      'contentViews': 'Content views',
      'createContent': 'Create content',
      'manageContent': 'Manage content',
      'subscribers': 'Subscribers',
      'subscriptionPlans': 'Subscription plans',
      'earnings': 'Earnings',
      'massMessage': 'Mass message',
      'contentBundles': 'Content bundles',
      'audienceInsights': 'Audience insights',
      'referralProgram': 'Referral program',
      'unfollow': 'Unfollow',
      'follow': 'Follow',
      'message': 'Message',
      'customRequest': 'Custom request',
      'subscribed': 'Subscribed!',
      'contentCreated': 'Content created',
      'becomeCreator': 'Become a creator to post content',
      'applicationSubmitted': 'Application submitted',
      'applyCreator': 'Apply to be creator',
      'title': 'Title',
      'image': 'Image',
      'video': 'Video',
      'audio': 'Audio',
      'access': 'Access',
      'free': 'Free',
      'payPerView': 'Pay per view',
      'subscribersOnly': 'Subscribers only',
      'priceEtb': 'Price (ETB)',
      'attachMedia': 'Attach media',
      'fileSelected': 'File selected',
      'publish': 'Publish',
      'noSubscribersYet': 'No subscribers yet',
      'subscriber': 'Subscriber',
      'newPlan': 'New plan',
      'name': 'Name',
      'noPlansYet': 'No plans yet',
      'thisMonth': 'This month',
      'tipsReceived': 'Tips received',
      'enterMessageContent': 'Enter message content',
      'messageSent': 'Message sent',
      'sendToSubscribers': 'Send a message to your subscribers',
      'messageLabel': 'Message',
      'writeMessageHint': 'Write your message...',
      'priceOptional': 'Price (optional)',
      'freeMessageHint': '0 = free message',
      'audience': 'Audience',
      'allSubscribers': 'All subscribers',
      'newSubscribers': 'New (last 7 days)',
      'loyalSubscribers': 'Loyal (3+ months)',
      'sendBlast': 'Send blast',
      'newBundle': 'New bundle',
      'contentIdsHint': 'Content IDs (comma-separated)',
      'deleteBundle': 'Delete bundle?',
      'delete': 'Delete',
      'noBundlesYet': 'No bundles yet',
      'items': 'items',
      'sales': 'sales',
      'activeSubscribers': 'Active subscribers',
      'tipsRevenue30d': 'Tips revenue (30d)',
      'bestContentType': 'Best content type',
      'topContent': 'Top content',
      'views': 'views',
      'churnReasons': 'Churn reasons',
      'copied': 'Copied',
      'yourReferralCode': 'Your referral code',
      'copyReferralLink': 'Copy referral link',
      'totalBonus': 'Total bonus',
      'qualifiedReferrals': 'Qualified referrals',
      'referrals': 'Referrals',
      'creator': 'Creator',
      'idType': 'ID type',
      'idFrontUrl': 'ID front URL',
      'idBackUrl': 'ID back URL',
      'selfieUrl': 'Selfie URL',
      'method': 'Method',
      'account': 'Account',
      'acceptGuidelines': 'I accept creator guidelines',
      'add': 'Add',
      'createStory': 'Create story',
      'selectImage': 'Select image',
      'imageUploaded': 'Image uploaded',
      'caption': 'Caption',
      'postStory': 'Post story',
      'noTrendingContent': 'No trending content',
      'lockedContent': 'Locked content',
      'insufficientBalance': 'Insufficient wallet balance',
      'unlocked': 'Unlocked!',
      'unlockBundle': 'Unlock bundle',
      'unlockContent': 'Unlock content',
      'cancelAnytime': 'cancel or pause anytime',
      'oneTimeUnlock': 'One-time unlock — yours forever',
      'fanoraWallet': 'Fanora Wallet',
      'payFromBalance': 'Pay from balance',
      'securePayment': 'Secure payment · Platform fee shown upfront',
      'confirm': 'Confirm',
      'fan': 'Fan',
      'wishlist': 'Wishlist',
      'wishlistEmpty': 'No saved content yet',
      'uploaded': 'Uploaded',
      'tapToUpload': 'Tap to upload',
      'idFront': 'ID front',
      'idBackOptional': 'ID back (optional)',
      'verificationSelfie': 'Verification selfie',
      'faydaId': 'Fayda ID',
      'kebeleId': 'Kebele ID',
      'passport': 'Passport',
      'idBack': 'ID back',
      'neutralSelfie': 'Neutral selfie',
      'livenessChallenge': 'Guided face movement check',
      'livenessAdvisory':
          'Take three clear photos in order. This check supports review but is not perfect anti-spoofing or government document authentication.',
      'lookStraight': 'Look straight with a neutral expression',
      'blinkNaturally': 'Blink naturally',
      'turnHead': 'Turn your head to one side',
      'startChallenge': 'Start three-photo check',
      'retryChallenge': 'Retake all three photos',
      'challengeCancelled': 'The photo check was cancelled. Please retry.',
      'uploadFailed': 'Image upload failed',
      'completeIdentityImages':
          'Upload both ID sides, a neutral selfie, and all three guided photos.',
      'saveAndAnalyze': 'Save identity and analyze',
      'automatedAnalysis': 'Automated analysis',
      'faceSimilarity': 'Face similarity',
      'livenessScore': 'Liveness score',
      'ocrSummary': 'Advisory ID text summary',
      'automatedChecks': 'Automated checks',
      'analysisAdvisory':
          'These automated results are advisory and may be inaccurate.',
      'manualReviewNotice':
          'Your identity information may still require manual review.',
      'retryAnalysis': 'Retry analysis',
      'analysisRequired':
          'Complete automated analysis before submitting, unless manual fallback is approved.',
    },
    'am': {
      'appName': 'ፋኖራ',
      'home': 'መነሻ',
      'explore': 'አስስ',
      'create': 'ፍጠር',
      'messages': 'መልዕክቶች',
      'profile': 'መገለጫ',
      'login': 'ግባ',
      'register': 'መለያ ፍጠር',
      'email': 'ኢሜይል',
      'password': 'የይለፍ ቃል',
      'phone': 'ስልክ',
      'otp': 'የOTP ኮድ',
      'sendOtp': 'OTP ላክ',
      'verifyOtp': 'OTP አረጋግጥ',
      'verify': 'አረጋግጥ',
      'resendOtp': 'OTP እንደገና ላክ',
      'forgotPassword': 'የይለፍ ቃል ረሳህ?',
      'forgotPasswordTitle': 'የይለፍ ቃል ረሳሁ',
      'resetPassword': 'የይለፍ ቃል ዳግም አስጀምር',
      'logout': 'ውጣ',
      'settings': 'ቅንብሮች',
      'notifications': 'ማሳወቂያዎች',
      'language': 'ቋንቋ',
      'english': 'እንግሊዝኛ',
      'amharic': 'አማርኛ',
      'dataSaver': 'ዳታ ቆጣቢ',
      'dataSaverHint': 'ቪዲዮ በራስ አይጫንም፤ ለመጫን ነካ',
      'privacy': 'ግላዊነት',
      'preferences': 'ምርጫዎች',
      'pushNotifications': 'የግፊት ማሳወቂያዎች',
      'privateProfile': 'የግል መገለጫ',
      'incognitoMode': 'ስውር ሁነታ',
      'hideFromSearch': 'ከደንበኛ ፍለጋ ደብቅ',
      'trustSafety': 'እምነት እና ደህንነት',
      'changePassword': 'የይለፍ ቃል ቀይር',
      'wallet': 'ዋሌት',
      'subscriptions': 'የእኔ ምዝገባዎች',
      'following': 'የምከተላቸው',
      'followers': 'ተከታዮች',
      'forYou': 'ለአንተ',
      'tips': 'ጠቃሚ ምክሮች',
      'editProfile': 'መገለጫ አርትዕ',
      'creatorDashboard': 'የፈጣሪ ዳሽቦርድ',
      'goLive': 'ቀጥታ ስርጭት ጀምር',
      'live': 'ቀጥታ',
      'liveBadge': 'ቀጥታ',
      'search': 'ፈልግ',
      'markAllRead': 'ሁሉንም አንብብ',
      'noNotifications': 'ማሳወቂያ የለም',
      'save': 'አስቀምጥ',
      'cancel': 'ሰርዝ',
      'submit': 'አስገባ',
      'retry': 'እንደገና ሞክር',
      'tryAgain': 'እንደገና ሞክር',
      'continueLabel': 'ቀጥል',
      'loading': 'በመጫን ላይ...',
      'unlock': 'ክፈት',
      'subscribe': 'ተመዝገብ',
      'tapToLoadVideo': 'ቪዲዮ ለመጫን ነካ',
      'paidMessage': 'የተከፈለ መልዕክት',
      'unlockMessage': 'መልዕክት ክፈት',
      'customRequests': 'ልዩ ጥያቄዎች',
      'requestInbox': 'የጥያቄ መግቢያ',
      'newRequest': 'አዲስ ጥያቄ',
      'contentCalendar': 'የይዘት ቀን መቁጠሪያ',
      'creatorOnboarding': 'የፈጣሪ ማረጋገጫ',
      'giftSubscriptions': 'የስጦታ ምዝገባዎች',
      'redeemGift': 'ስጦታ ተቀበል',
      'myGifts': 'የእኔ ስጦታዎች',
      'month': 'ወር',
      'week': 'ሳምንት',
      'rising': 'እየጨመሩ',
      'creators': 'ፈጣሪዎች',
      'trending': 'ታዋቂ',
      'all': 'ሁሉም',
      'videos': 'ቪዲዮዎች',
      'images': 'ምስሎች',
      'content': 'ይዘት',
      'rtmpIngest': 'RTMP ግቤት',
      'playbackUrl': 'የመልሶ ማጫወት URL',
      'streamKey': 'የስትሪም ቁልፍ',
      'copy': 'ቅዳ',
      'endStream': 'ስርጭት አቁም',
      'startStreaming': 'ስርጭት ጀምር',
      'settingsSaved': 'ቅንብሮች ተቀምጠዋል',
      'typeMessage': 'መልዕክት ጻፍ...',
      'comments': 'አስተያየቶች',
      'addComment': 'አስተያየት ጨምር',
      'noContent': 'ይዘት የለም። ፈጣሪዎችን ተከተል!',
      'noContentYet': 'ይዘት የለም',
      'accept': 'ተቀበል',
      'decline': 'ውድቅ',
      'counter': 'ተቃራኒ ዋጋ',
      'deliver': 'አድርስ',
      'offeredPrice': 'የቀረበ ዋጋ',
      'description': 'መግለጫ',
      'identity': 'መታወቂያ',
      'payout': 'ክፍያ',
      'guidelines': 'መመሪያዎች',
      'status': 'ሁኔታ',
      'redeem': 'ተቀበል',
      'createGift': 'ስጦታ ፍጠር',
      'giftCode': 'የስጦታ ኮድ',
      'recipientPhone': 'የተቀባይ ስልክ',
      'plan': 'እቅድ',
      'planId': 'የእቅድ መለያ',
      'studio': 'የቀጥታ ስቱዲዮ',
      'watchLive': 'ቀጥታ ተመልከት',
      'unsupportedCapture': 'የስክሪንሾት ማወቂያ በዚህ መሳሪያ አይገኝም',
      'required': 'አስፈላጊ',
      'min6Chars': 'ቢያንስ 6 ቁምፊዎች',
      'enterOtp': 'OTP አስገባ',
      'enterPhone': 'ስልክ ቁጥር አስገባ',
      'otpSent': 'OTP ተልኳል',
      'failedSendOtp': 'OTP መላክ አልተሳካም',
      'loginFailed': 'መግባት አልተሳካም',
      'otpLoginFailed': 'በOTP መግባት አልተሳካም',
      'otpVerifyFailed': 'OTP ማረጋገጥ አልተሳካም',
      'mustBe18': 'ቢያንስ 18 ዓመት መሆን አለብህ',
      'mustBe18Hint': 'ፋኖራን ለመጠቀም ቢያንስ 18 ዓመት መሆን አለብህ',
      'fillAllFields': 'ሁሉንም መስኮች በትክክል ሙላ',
      'registrationFailed': 'ምዝገባ አልተሳካም',
      'step1Phone': 'ደረጃ 1፡ ስልክ ቁጥር',
      'step2Otp': 'ደረጃ 2፡ OTP አረጋግጥ',
      'step3Dob': 'ደረጃ 3፡ የትውልድ ቀን',
      'step4Account': 'ደረጃ 4፡ የመለያ ዝርዝሮች',
      'phoneHint251': 'ስልክ (+251...)',
      'selectDob': 'የትውልድ ቀን ምረጥ',
      'firstName': 'ስም',
      'lastName': 'የአባት ስም',
      'username': 'የተጠቃሚ ስም',
      'bio': 'ስለ እኔ',
      'checkEmailReset': 'የዳግም ማስጀመሪያ መመሪያዎችን በኢሜይልህ ተመልከት።',
      'backToLogin': 'ወደ መግቢያ ተመለስ',
      'enterEmailReset': 'የዳግም ማስጀመሪያ አገናኝ ለመቀበል ኢሜይልህን አስገባ።',
      'sendResetLink': 'የዳግም ማስጀመሪያ አገናኝ ላክ',
      'passwordResetSuccess': 'የይለፍ ቃል በተሳካ ሁኔታ ተቀይሯል',
      'newPassword': 'አዲስ የይለፍ ቃል',
      'currentPassword': 'አሁን ያለ የይለፍ ቃል',
      'updatePassword': 'የይለፍ ቃል አዘምን',
      'passwordChanged': 'የይለፍ ቃል ተቀይሯል',
      'verifyEmail': 'ኢሜይል አረጋግጥ',
      'emailVerified': 'ኢሜይል ተረጋግጧል!',
      'verificationFailed': 'ማረጋገጥ አልተሳካም',
      'failed': 'አልተሳካም',
      'emailNotVerified': 'ኢሜይል አልተረጋገጠም',
      'verificationEmailSent': 'የማረጋገጫ ኢሜይል ተልኳል',
      'profileUpdated': 'መገለጫ ተዘምኗል',
      'reportSubmitted': 'ሪፖርት ተልኳል',
      'submitReport': 'ሪፖርት አስገባ',
      'submitReportAction': 'ሪፖርት ላክ',
      'type': 'አይነት',
      'reason': 'ምክንያት',
      'spam': 'አላስፈላጊ',
      'harassment': 'ብስጭት',
      'scam': 'ማጭበርበር',
      'other': 'ሌላ',
      'blockedUsers': 'የታገዱ ተጠቃሚዎች',
      'noBlockedUsers': 'የታገዱ ተጠቃሚዎች የሉም',
      'unblock': 'አታግድ',
      'myReports': 'የእኔ ሪፖርቶች',
      'noReports': 'ሪፖርት የለም',
      'searchHint': 'ፈጣሪዎችን ወይም ይዘት ፈልግ...',
      'searchEmpty': 'ፈጣሪዎችን እና ይዘት ፈልግ',
      'noResults': 'ውጤት አልተገኘም',
      'notFollowingYet': 'ማንንም እየተከተልክ አይደለም',
      'noConversations': 'ውይይቶች የሉም',
      'unknown': 'ያልታወቀ',
      'pin': 'ፒን',
      'noLiveStreams': 'አሁን ቀጥታ ስርጭት የለም',
      'liveStream': 'ቀጥታ ስርጭት',
      'streamTitle': 'የስርጭት ርዕስ',
      'rtmpHint':
          'ከላይ ካለው የግቤት URL ጋር RTMP ኢንኮደር (OBS ወዘተ) ተጠቀም። አድናቂዎች በHLS ይመለከታሉ።',
      'hlsUnavailable': 'የHLS መልሶ ማጫወት URL ገና አይገኝም።',
      'availableBalance': 'ያለ ቀሪ ሂሳብ',
      'telebirr': 'ቴሌብር',
      'cbe': 'ሲቢኢ',
      'walletPin': 'የዋሌት ፒን',
      'pinIsSet': 'ፒን ተቀምጧል',
      'setYourPin': 'ፒንህን አስቀምጥ',
      'linkAccounts': 'መለያዎችን አገናኝ',
      'transactions': 'ግብይቶች',
      'recent': 'የቅርብ ጊዜ',
      'pinSet': 'ፒን ተቀምጧል',
      'setWalletPin': 'የዋሌት ፒን አስቀምጥ',
      'confirmPin': 'ፒን አረጋግጥ',
      'savePin': 'ፒን አስቀምጥ',
      'telebirrLinked': 'ቴሌብር ተገናኝቷል',
      'cbeLinked': 'ሲቢኢ ተገናኝቷል',
      'phoneNumber': 'ስልክ ቁጥር',
      'linkTelebirr': 'ቴሌብር አገናኝ',
      'accountNumber': 'የመለያ ቁጥር',
      'linkCbe': 'ሲቢኢ አገናኝ',
      'enterWalletPin': 'የ4-አሃዝ የዋሌት ፒንህን አስገባ',
      'topupTelebirr': 'በቴሌብር ሙላ',
      'topupCbe': 'በሲቢኢ ሙላ',
      'amountEtb': 'መጠን (ብር)',
      'confirmTopup': 'መሙላት አረጋግጥ',
      'topupConfirmed': 'መሙላት ተረጋግጧል!',
      'goToWallet': 'ወደ ዋሌት ሂድ',
      'completePaymentHint': 'ክፍያውን በመተግበሪያህ አጠናቅቅ፣ ከዚያ እዚህ አረጋግጥ።',
      'confirmPayment': 'ክፍያ አረጋግጥ',
      'noTransactions': 'ግብይቶች የሉም',
      'subscriptionPaused': 'ምዝገባ ባለበት ቆሟል',
      'noActiveSubscriptions': 'ንቁ ምዝገባዎች የሉም',
      'subscription': 'ምዝገባ',
      'pause': 'አቁም',
      'sent': 'ተልኳል',
      'received': 'ተቀብሏል',
      'noTipsSent': 'የተላኩ ጠቃሚ ምክሮች የሉም',
      'noTipsReceived': 'የተቀበሉ ጠቃሚ ምክሮች የሉም',
      'giftRedeemed': 'ስጦታ ተቀብሏል',
      'requestPaymentDone': 'የጥያቄ ክፍያ ተጠናቋል',
      'pay': 'ክፈል',
      'creatorId': 'የፈጣሪ መለያ',
      'contentId': 'የይዘት መለያ',
      'totalEarnings': 'ጠቅላላ ገቢ',
      'contentViews': 'የይዘት እይታዎች',
      'createContent': 'ይዘት ፍጠር',
      'manageContent': 'ይዘት አስተዳድር',
      'subscribers': 'ደንበኞች',
      'subscriptionPlans': 'የምዝገባ እቅዶች',
      'earnings': 'ገቢ',
      'massMessage': 'ጅምላ መልዕክት',
      'contentBundles': 'የይዘት ጥቅሎች',
      'audienceInsights': 'የታዳሚ ግንዛቤዎች',
      'referralProgram': 'የሪፈራል ፕሮግራም',
      'unfollow': 'አትከተል',
      'follow': 'ተከተል',
      'message': 'መልዕክት',
      'customRequest': 'ልዩ ጥያቄ',
      'subscribed': 'ተመዝግበዋል!',
      'contentCreated': 'ይዘት ተፈጥሯል',
      'becomeCreator': 'ይዘት ለማስቀመጥ ፈጣሪ ሁን',
      'applicationSubmitted': 'ማመልከቻ ተልኳል',
      'applyCreator': 'ፈጣሪ ለመሆን አመልክት',
      'title': 'ርዕስ',
      'image': 'ምስል',
      'video': 'ቪዲዮ',
      'audio': 'ድምጽ',
      'access': 'መዳረሻ',
      'free': 'ነፃ',
      'payPerView': 'በእይታ ክፍያ',
      'subscribersOnly': 'ለደንበኞች ብቻ',
      'priceEtb': 'ዋጋ (ብር)',
      'attachMedia': 'ሚዲያ አያይዝ',
      'fileSelected': 'ፋይል ተመርጧል',
      'publish': 'አትም',
      'noSubscribersYet': 'ገና ደንበኞች የሉም',
      'subscriber': 'ደንበኛ',
      'newPlan': 'አዲስ እቅድ',
      'name': 'ስም',
      'noPlansYet': 'እቅዶች የሉም',
      'thisMonth': 'በዚህ ወር',
      'tipsReceived': 'የተቀበሉ ጠቃሚ ምክሮች',
      'enterMessageContent': 'የመልዕክት ይዘት አስገባ',
      'messageSent': 'መልዕክት ተልኳል',
      'sendToSubscribers': 'ለደንበኞችህ መልዕክት ላክ',
      'messageLabel': 'መልዕክት',
      'writeMessageHint': 'መልዕክትህን ጻፍ...',
      'priceOptional': 'ዋጋ (አማራጭ)',
      'freeMessageHint': '0 = ነፃ መልዕክት',
      'audience': 'ታዳሚ',
      'allSubscribers': 'ሁሉም ደንበኞች',
      'newSubscribers': 'አዲስ (ባለፉት 7 ቀናት)',
      'loyalSubscribers': 'ታማኝ (3+ ወራት)',
      'sendBlast': 'ጅምላ ላክ',
      'newBundle': 'አዲስ ጥቅል',
      'contentIdsHint': 'የይዘት መለያዎች (በኮማ የተለዩ)',
      'deleteBundle': 'ጥቅል ይሰረዝ?',
      'delete': 'ሰርዝ',
      'noBundlesYet': 'ጥቅሎች የሉም',
      'items': 'ንጥሎች',
      'sales': 'ሽያጮች',
      'activeSubscribers': 'ንቁ ደንበኞች',
      'tipsRevenue30d': 'የጠቃሚ ምክር ገቢ (30 ቀን)',
      'bestContentType': 'ምርጥ የይዘት አይነት',
      'topContent': 'ከፍተኛ ይዘት',
      'views': 'እይታዎች',
      'churnReasons': 'የመውጣት ምክንያቶች',
      'copied': 'ተቀድቷል',
      'yourReferralCode': 'የሪፈራል ኮድህ',
      'copyReferralLink': 'የሪፈራል አገናኝ ቅዳ',
      'totalBonus': 'ጠቅላላ ቦነስ',
      'qualifiedReferrals': 'ብቁ ሪፈራሎች',
      'referrals': 'ሪፈራሎች',
      'creator': 'ፈጣሪ',
      'idType': 'የመታወቂያ አይነት',
      'idFrontUrl': 'የመታወቂያ ፊት URL',
      'idBackUrl': 'የመታወቂያ ጀርባ URL',
      'selfieUrl': 'የሰልፊ URL',
      'method': 'ዘዴ',
      'account': 'መለያ',
      'acceptGuidelines': 'የፈጣሪ መመሪያዎችን እቀበላለሁ',
      'add': 'ጨምር',
      'createStory': 'ታሪክ ፍጠር',
      'selectImage': 'ምስል ምረጥ',
      'imageUploaded': 'ምስል ተሰቅሏል',
      'caption': 'መግለጫ',
      'postStory': 'ታሪክ አትም',
      'noTrendingContent': 'ታዋቂ ይዘት የለም',
      'lockedContent': 'የተቆለፈ ይዘት',
      'insufficientBalance': 'በቂ የዋሌት ቀሪ ሂሳብ የለም',
      'unlocked': 'ተከፍቷል!',
      'unlockBundle': 'ጥቅል ክፈት',
      'unlockContent': 'ይዘት ክፈት',
      'cancelAnytime': 'በማንኛውም ጊዜ ሰርዝ ወይም አቁም',
      'oneTimeUnlock': 'አንድ ጊዜ ክፈት — ለዘላለም የአንተ',
      'fanoraWallet': 'ፋኖራ ዋሌት',
      'payFromBalance': 'ከቀሪ ሂሳብ ክፈል',
      'securePayment': 'ደህንነቱ የተጠበቀ ክፍያ · የመድረክ ክፍያ በቅድሚያ ይታያል',
      'confirm': 'አረጋግጥ',
      'fan': 'አድናቂ',
      'wishlist': 'የተቀመጡ',
      'wishlistEmpty': 'የተቀመጠ ይዘት የለም',
      'uploaded': 'ተሰቅሏል',
      'tapToUpload': 'ለመስቀል ነካ',
      'idFront': 'የመታወቂያ ፊት',
      'idBackOptional': 'የመታወቂያ ጀርባ (አማራጭ)',
      'verificationSelfie': 'የማረጋገጫ ሰልፊ',
      'faydaId': 'ፋይዳ መታወቂያ',
      'kebeleId': 'ቀበሌ መታወቂያ',
      'passport': 'ፓስፖርት',
      'idBack': 'የመታወቂያ ጀርባ',
      'neutralSelfie': 'ገለልተኛ የፊት ፎቶ',
      'livenessChallenge': 'የሚመራ የፊት እንቅስቃሴ ምርመራ',
      'livenessAdvisory':
          'ሶስት ግልጽ ፎቶዎችን በቅደም ተከተል አንሳ። ይህ ምርመራ ግምገማን ይደግፋል፤ ፍጹም የማጭበርበር መከላከያ ወይም የመንግሥት ሰነድ ማረጋገጫ አይደለም።',
      'lookStraight': 'በገለልተኛ ፊት ቀጥ ብለህ ተመልከት',
      'blinkNaturally': 'በተፈጥሮ ዓይንህን ጨፍንና ክፈት',
      'turnHead': 'ራስህን ወደ አንድ ጎን አዙር',
      'startChallenge': 'የሶስት ፎቶ ምርመራ ጀምር',
      'retryChallenge': 'ሶስቱንም ፎቶዎች እንደገና አንሳ',
      'challengeCancelled': 'የፎቶ ምርመራው ተሰርዟል። እንደገና ሞክር።',
      'uploadFailed': 'ምስሉን መስቀል አልተሳካም',
      'completeIdentityImages':
          'የመታወቂያውን ሁለቱንም ጎኖች፣ ገለልተኛ የፊት ፎቶ እና ሶስቱንም የሚመሩ ፎቶዎች ስቀል።',
      'saveAndAnalyze': 'መታወቂያውን አስቀምጥና ተንትን',
      'automatedAnalysis': 'ራስ-ሰር ትንተና',
      'faceSimilarity': 'የፊት ተመሳሳይነት',
      'livenessScore': 'የህይወት ምልክት ውጤት',
      'ocrSummary': 'አመላካች የመታወቂያ ጽሑፍ ማጠቃለያ',
      'automatedChecks': 'ራስ-ሰር ምርመራዎች',
      'analysisAdvisory': 'እነዚህ ራስ-ሰር ውጤቶች አመላካች ብቻ ናቸው፤ ስህተት ሊኖራቸው ይችላል።',
      'manualReviewNotice': 'የማንነት መረጃህ አሁንም በሰው ግምገማ ሊያስፈልገው ይችላል።',
      'retryAnalysis': 'ትንተናውን እንደገና ሞክር',
      'analysisRequired':
          'በሰው የሚደረግ አማራጭ ካልተፈቀደ በስተቀር ከማስገባትህ በፊት ራስ-ሰር ትንተናውን አጠናቅቅ።',
    },
  };

  String _t(String key) =>
      _localizedValues[locale.languageCode]?[key] ??
      _localizedValues['en']![key] ??
      key;

  String get appName => _t('appName');
  String get home => _t('home');
  String get explore => _t('explore');
  String get create => _t('create');
  String get messages => _t('messages');
  String get profile => _t('profile');
  String get login => _t('login');
  String get register => _t('register');
  String get email => _t('email');
  String get password => _t('password');
  String get phone => _t('phone');
  String get otp => _t('otp');
  String get sendOtp => _t('sendOtp');
  String get verifyOtp => _t('verifyOtp');
  String get verify => _t('verify');
  String get resendOtp => _t('resendOtp');
  String get forgotPassword => _t('forgotPassword');
  String get forgotPasswordTitle => _t('forgotPasswordTitle');
  String get resetPassword => _t('resetPassword');
  String get logout => _t('logout');
  String get settings => _t('settings');
  String get notifications => _t('notifications');
  String get language => _t('language');
  String get english => _t('english');
  String get amharic => _t('amharic');
  String get dataSaver => _t('dataSaver');
  String get dataSaverHint => _t('dataSaverHint');
  String get privacy => _t('privacy');
  String get preferences => _t('preferences');
  String get pushNotifications => _t('pushNotifications');
  String get privateProfile => _t('privateProfile');
  String get incognitoMode => _t('incognitoMode');
  String get hideFromSearch => _t('hideFromSearch');
  String get trustSafety => _t('trustSafety');
  String get changePassword => _t('changePassword');
  String get wallet => _t('wallet');
  String get subscriptions => _t('subscriptions');
  String get following => _t('following');
  String get followers => _t('followers');
  String get forYou => _t('forYou');
  String get tips => _t('tips');
  String get editProfile => _t('editProfile');
  String get creatorDashboard => _t('creatorDashboard');
  String get goLive => _t('goLive');
  String get live => _t('live');
  String get liveBadge => _t('liveBadge');
  String get search => _t('search');
  String get markAllRead => _t('markAllRead');
  String get noNotifications => _t('noNotifications');
  String get save => _t('save');
  String get cancel => _t('cancel');
  String get submit => _t('submit');
  String get retry => _t('retry');
  String get tryAgain => _t('tryAgain');
  String get continueLabel => _t('continueLabel');
  String get loading => _t('loading');
  String get unlock => _t('unlock');
  String get subscribe => _t('subscribe');
  String get tapToLoadVideo => _t('tapToLoadVideo');
  String get paidMessage => _t('paidMessage');
  String get unlockMessage => _t('unlockMessage');
  String get customRequests => _t('customRequests');
  String get requestInbox => _t('requestInbox');
  String get newRequest => _t('newRequest');
  String get contentCalendar => _t('contentCalendar');
  String get creatorOnboarding => _t('creatorOnboarding');
  String get giftSubscriptions => _t('giftSubscriptions');
  String get redeemGift => _t('redeemGift');
  String get myGifts => _t('myGifts');
  String get month => _t('month');
  String get week => _t('week');
  String get rising => _t('rising');
  String get creators => _t('creators');
  String get trending => _t('trending');
  String get all => _t('all');
  String get videos => _t('videos');
  String get images => _t('images');
  String get content => _t('content');
  String get rtmpIngest => _t('rtmpIngest');
  String get playbackUrl => _t('playbackUrl');
  String get streamKey => _t('streamKey');
  String get copy => _t('copy');
  String get endStream => _t('endStream');
  String get startStreaming => _t('startStreaming');
  String get settingsSaved => _t('settingsSaved');
  String get typeMessage => _t('typeMessage');
  String get comments => _t('comments');
  String get addComment => _t('addComment');
  String get noContent => _t('noContent');
  String get noContentYet => _t('noContentYet');
  String get accept => _t('accept');
  String get decline => _t('decline');
  String get counter => _t('counter');
  String get deliver => _t('deliver');
  String get offeredPrice => _t('offeredPrice');
  String get description => _t('description');
  String get identity => _t('identity');
  String get payout => _t('payout');
  String get guidelines => _t('guidelines');
  String get status => _t('status');
  String get redeem => _t('redeem');
  String get createGift => _t('createGift');
  String get giftCode => _t('giftCode');
  String get recipientPhone => _t('recipientPhone');
  String get plan => _t('plan');
  String get planId => _t('planId');
  String get studio => _t('studio');
  String get watchLive => _t('watchLive');
  String get unsupportedCapture => _t('unsupportedCapture');
  String get requiredField => _t('required');
  String get min6Chars => _t('min6Chars');
  String get enterOtp => _t('enterOtp');
  String get enterPhone => _t('enterPhone');
  String get otpSent => _t('otpSent');
  String get failedSendOtp => _t('failedSendOtp');
  String get loginFailed => _t('loginFailed');
  String get otpLoginFailed => _t('otpLoginFailed');
  String get otpVerifyFailed => _t('otpVerifyFailed');
  String get mustBe18 => _t('mustBe18');
  String get mustBe18Hint => _t('mustBe18Hint');
  String get fillAllFields => _t('fillAllFields');
  String get registrationFailed => _t('registrationFailed');
  String get step1Phone => _t('step1Phone');
  String get step2Otp => _t('step2Otp');
  String get step3Dob => _t('step3Dob');
  String get step4Account => _t('step4Account');
  String get phoneHint251 => _t('phoneHint251');
  String get selectDob => _t('selectDob');
  String get firstName => _t('firstName');
  String get lastName => _t('lastName');
  String get username => _t('username');
  String get bio => _t('bio');
  String get checkEmailReset => _t('checkEmailReset');
  String get backToLogin => _t('backToLogin');
  String get enterEmailReset => _t('enterEmailReset');
  String get sendResetLink => _t('sendResetLink');
  String get passwordResetSuccess => _t('passwordResetSuccess');
  String get newPassword => _t('newPassword');
  String get currentPassword => _t('currentPassword');
  String get updatePassword => _t('updatePassword');
  String get passwordChanged => _t('passwordChanged');
  String get verifyEmail => _t('verifyEmail');
  String get emailVerified => _t('emailVerified');
  String get verificationFailed => _t('verificationFailed');
  String get failed => _t('failed');
  String get emailNotVerified => _t('emailNotVerified');
  String get verificationEmailSent => _t('verificationEmailSent');
  String get profileUpdated => _t('profileUpdated');
  String get reportSubmitted => _t('reportSubmitted');
  String get submitReport => _t('submitReport');
  String get submitReportAction => _t('submitReportAction');
  String get type => _t('type');
  String get reason => _t('reason');
  String get spam => _t('spam');
  String get harassment => _t('harassment');
  String get scam => _t('scam');
  String get other => _t('other');
  String get blockedUsers => _t('blockedUsers');
  String get noBlockedUsers => _t('noBlockedUsers');
  String get unblock => _t('unblock');
  String get myReports => _t('myReports');
  String get noReports => _t('noReports');
  String get searchHint => _t('searchHint');
  String get searchEmpty => _t('searchEmpty');
  String get noResults => _t('noResults');
  String get notFollowingYet => _t('notFollowingYet');
  String get noConversations => _t('noConversations');
  String get unknown => _t('unknown');
  String get pin => _t('pin');
  String get noLiveStreams => _t('noLiveStreams');
  String get liveStream => _t('liveStream');
  String get streamTitle => _t('streamTitle');
  String get rtmpHint => _t('rtmpHint');
  String get hlsUnavailable => _t('hlsUnavailable');
  String get availableBalance => _t('availableBalance');
  String get telebirr => _t('telebirr');
  String get cbe => _t('cbe');
  String get walletPin => _t('walletPin');
  String get pinIsSet => _t('pinIsSet');
  String get setYourPin => _t('setYourPin');
  String get linkAccounts => _t('linkAccounts');
  String get transactions => _t('transactions');
  String get recent => _t('recent');
  String get pinSet => _t('pinSet');
  String get setWalletPin => _t('setWalletPin');
  String get confirmPin => _t('confirmPin');
  String get savePin => _t('savePin');
  String get telebirrLinked => _t('telebirrLinked');
  String get cbeLinked => _t('cbeLinked');
  String get phoneNumber => _t('phoneNumber');
  String get linkTelebirr => _t('linkTelebirr');
  String get accountNumber => _t('accountNumber');
  String get linkCbe => _t('linkCbe');
  String get enterWalletPin => _t('enterWalletPin');
  String get topupTelebirr => _t('topupTelebirr');
  String get topupCbe => _t('topupCbe');
  String get amountEtb => _t('amountEtb');
  String get confirmTopup => _t('confirmTopup');
  String get topupConfirmed => _t('topupConfirmed');
  String get goToWallet => _t('goToWallet');
  String get completePaymentHint => _t('completePaymentHint');
  String get confirmPayment => _t('confirmPayment');
  String get noTransactions => _t('noTransactions');
  String get subscriptionPaused => _t('subscriptionPaused');
  String get noActiveSubscriptions => _t('noActiveSubscriptions');
  String get subscription => _t('subscription');
  String get pause => _t('pause');
  String get sent => _t('sent');
  String get received => _t('received');
  String get noTipsSent => _t('noTipsSent');
  String get noTipsReceived => _t('noTipsReceived');
  String get giftRedeemed => _t('giftRedeemed');
  String get requestPaymentDone => _t('requestPaymentDone');
  String get pay => _t('pay');
  String get creatorId => _t('creatorId');
  String get contentId => _t('contentId');
  String get totalEarnings => _t('totalEarnings');
  String get contentViews => _t('contentViews');
  String get createContent => _t('createContent');
  String get manageContent => _t('manageContent');
  String get subscribers => _t('subscribers');
  String get subscriptionPlans => _t('subscriptionPlans');
  String get earnings => _t('earnings');
  String get massMessage => _t('massMessage');
  String get contentBundles => _t('contentBundles');
  String get audienceInsights => _t('audienceInsights');
  String get referralProgram => _t('referralProgram');
  String get unfollow => _t('unfollow');
  String get follow => _t('follow');
  String get message => _t('message');
  String get customRequest => _t('customRequest');
  String get subscribed => _t('subscribed');
  String get contentCreated => _t('contentCreated');
  String get becomeCreator => _t('becomeCreator');
  String get applicationSubmitted => _t('applicationSubmitted');
  String get applyCreator => _t('applyCreator');
  String get title => _t('title');
  String get image => _t('image');
  String get video => _t('video');
  String get audio => _t('audio');
  String get access => _t('access');
  String get free => _t('free');
  String get payPerView => _t('payPerView');
  String get subscribersOnly => _t('subscribersOnly');
  String get priceEtb => _t('priceEtb');
  String get attachMedia => _t('attachMedia');
  String get fileSelected => _t('fileSelected');
  String get publish => _t('publish');
  String get noSubscribersYet => _t('noSubscribersYet');
  String get subscriber => _t('subscriber');
  String get newPlan => _t('newPlan');
  String get name => _t('name');
  String get noPlansYet => _t('noPlansYet');
  String get thisMonth => _t('thisMonth');
  String get tipsReceived => _t('tipsReceived');
  String get enterMessageContent => _t('enterMessageContent');
  String get messageSent => _t('messageSent');
  String get sendToSubscribers => _t('sendToSubscribers');
  String get messageLabel => _t('messageLabel');
  String get writeMessageHint => _t('writeMessageHint');
  String get priceOptional => _t('priceOptional');
  String get freeMessageHint => _t('freeMessageHint');
  String get audience => _t('audience');
  String get allSubscribers => _t('allSubscribers');
  String get newSubscribers => _t('newSubscribers');
  String get loyalSubscribers => _t('loyalSubscribers');
  String get sendBlast => _t('sendBlast');
  String get newBundle => _t('newBundle');
  String get contentIdsHint => _t('contentIdsHint');
  String get deleteBundle => _t('deleteBundle');
  String get delete => _t('delete');
  String get noBundlesYet => _t('noBundlesYet');
  String get items => _t('items');
  String get sales => _t('sales');
  String get activeSubscribers => _t('activeSubscribers');
  String get tipsRevenue30d => _t('tipsRevenue30d');
  String get bestContentType => _t('bestContentType');
  String get topContent => _t('topContent');
  String get views => _t('views');
  String get churnReasons => _t('churnReasons');
  String get copied => _t('copied');
  String get yourReferralCode => _t('yourReferralCode');
  String get copyReferralLink => _t('copyReferralLink');
  String get totalBonus => _t('totalBonus');
  String get qualifiedReferrals => _t('qualifiedReferrals');
  String get referrals => _t('referrals');
  String get creator => _t('creator');
  String get idType => _t('idType');
  String get idFrontUrl => _t('idFrontUrl');
  String get idBackUrl => _t('idBackUrl');
  String get selfieUrl => _t('selfieUrl');
  String get method => _t('method');
  String get account => _t('account');
  String get acceptGuidelines => _t('acceptGuidelines');
  String get add => _t('add');
  String get createStory => _t('createStory');
  String get selectImage => _t('selectImage');
  String get imageUploaded => _t('imageUploaded');
  String get caption => _t('caption');
  String get postStory => _t('postStory');
  String get noTrendingContent => _t('noTrendingContent');
  String get lockedContent => _t('lockedContent');
  String get insufficientBalance => _t('insufficientBalance');
  String get unlocked => _t('unlocked');
  String get unlockBundle => _t('unlockBundle');
  String get unlockContent => _t('unlockContent');
  String get cancelAnytime => _t('cancelAnytime');
  String get oneTimeUnlock => _t('oneTimeUnlock');
  String get fanoraWallet => _t('fanoraWallet');
  String get payFromBalance => _t('payFromBalance');
  String get securePayment => _t('securePayment');
  String get confirm => _t('confirm');
  String get fan => _t('fan');
  String get wishlist => _t('wishlist');
  String get wishlistEmpty => _t('wishlistEmpty');
  String get uploaded => _t('uploaded');
  String get tapToUpload => _t('tapToUpload');
  String get idFront => _t('idFront');
  String get idBackOptional => _t('idBackOptional');
  String get verificationSelfie => _t('verificationSelfie');
  String get faydaId => _t('faydaId');
  String get kebeleId => _t('kebeleId');
  String get passport => _t('passport');
  String get idBack => _t('idBack');
  String get neutralSelfie => _t('neutralSelfie');
  String get livenessChallenge => _t('livenessChallenge');
  String get livenessAdvisory => _t('livenessAdvisory');
  String get lookStraight => _t('lookStraight');
  String get blinkNaturally => _t('blinkNaturally');
  String get turnHead => _t('turnHead');
  String get startChallenge => _t('startChallenge');
  String get retryChallenge => _t('retryChallenge');
  String get challengeCancelled => _t('challengeCancelled');
  String get uploadFailed => _t('uploadFailed');
  String get completeIdentityImages => _t('completeIdentityImages');
  String get saveAndAnalyze => _t('saveAndAnalyze');
  String get automatedAnalysis => _t('automatedAnalysis');
  String get faceSimilarity => _t('faceSimilarity');
  String get livenessScore => _t('livenessScore');
  String get ocrSummary => _t('ocrSummary');
  String get automatedChecks => _t('automatedChecks');
  String get analysisAdvisory => _t('analysisAdvisory');
  String get manualReviewNotice => _t('manualReviewNotice');
  String get retryAnalysis => _t('retryAnalysis');
  String get analysisRequired => _t('analysisRequired');

  String otpSentDev(String code) => '${_t('otpSent')} (dev: $code)';
  String shareContent(String title) => locale.languageCode == 'am'
      ? '$titleን በፋኖራ ተመልከት'
      : 'Check out $title on Fanora';
  String subscribeTo(String name) =>
      locale.languageCode == 'am' ? 'ለ$name ተመዝገብ' : 'Subscribe to $name';
  String confirmAmount(String amount) => '${_t('confirm')} — $amount';
  String payAmount(String amount) => '${_t('pay')} $amount';
  String fromPerMonth(String amount) =>
      locale.languageCode == 'am' ? 'ከ$amount/ወር' : 'From $amount/mo';
  String contentCount(int n) => '${_t('content')} ($n)';
  String itemsSales(int itemCount, int salesCount) =>
      '$itemCount ${_t('items')} · $salesCount ${_t('sales')}';
  String itemsIncluded(int n) =>
      locale.languageCode == 'am' ? '$n ንጥሎች ተካተዋል' : '$n items included';
  String viewsLabel(Object count) => '$count ${_t('views')}';
  String createdGift(String code) =>
      locale.languageCode == 'am' ? '$code ተፈጥሯል' : 'Created $code';
  String labelCopied(String label) => '$label ${_t('copied')}';
  String stepProgress(int current, int total) => locale.languageCode == 'am'
      ? 'ደረጃ $current/$total'
      : 'Step $current/$total';
  String capturingStep(int step, String instruction) =>
      locale.languageCode == 'am'
      ? 'ፎቶ $step/3፦ $instruction'
      : 'Photo $step/3: $instruction';
  String sentAmount(String amount) => '${_t('sent')}: $amount';
  String receivedAmount(String amount) => '${_t('received')}: $amount';
  String planSubtitle(String planName) => '$planName — ${_t('cancelAnytime')}';
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => ['en', 'am'].contains(locale.languageCode);

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(AppLocalizations(locale));
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
