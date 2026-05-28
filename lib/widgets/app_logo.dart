import 'package:flutter/material.dart';

import '../utils/app_constants.dart';

class AppLogo extends StatelessWidget {
  final double size;

  const AppLogo({super.key, this.size = 96});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        AppConstants.appLogoAsset,
        width: size,
        height: size,
        fit: BoxFit.contain,
      ),
    );
  }
}
