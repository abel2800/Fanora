class UserModel {
  UserModel({
    required this.id,
    required this.username,
    required this.email,
    this.firstName,
    this.lastName,
    this.profileImage,
    this.coverImage,
    this.bio,
    this.phoneNumber,
    this.dateOfBirth,
    this.isCreator = false,
    this.isVerified = false,
    this.isEmailVerified = false,
    this.role,
    this.followersCount,
    this.followingCount,
    this.isFollowing,
    this.creatorStatus,
  });

  final String id;
  final String username;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? profileImage;
  final String? coverImage;
  final String? bio;
  final String? phoneNumber;
  final String? dateOfBirth;
  final bool isCreator;
  final bool isVerified;
  final bool isEmailVerified;
  final String? role;
  final int? followersCount;
  final int? followingCount;
  final bool? isFollowing;
  final String? creatorStatus;

  String get displayName {
    final fn = firstName ?? '';
    final ln = lastName ?? '';
    final full = '$fn $ln'.trim();
    return full.isNotEmpty ? full : username;
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      firstName: json['firstName']?.toString(),
      lastName: json['lastName']?.toString(),
      profileImage: json['profileImage']?.toString(),
      coverImage: json['coverImage']?.toString(),
      bio: json['bio']?.toString(),
      phoneNumber: json['phoneNumber']?.toString(),
      dateOfBirth: json['dateOfBirth']?.toString(),
      isCreator: json['isCreator'] == true,
      isVerified: json['isVerified'] == true,
      isEmailVerified: json['isEmailVerified'] == true,
      role: json['role']?.toString(),
      followersCount: _toInt(json['followersCount']),
      followingCount: _toInt(json['followingCount']),
      isFollowing: json['isFollowing'] as bool?,
      creatorStatus: json['creatorStatus']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'username': username,
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'bio': bio,
        'phoneNumber': phoneNumber,
        'profileImage': profileImage,
        'coverImage': coverImage,
      };

  static int? _toInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse(v.toString());
  }
}
