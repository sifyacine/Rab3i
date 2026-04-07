export const getLoginErrorMessage = (message: string): string => {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  }

  if (normalized.includes("email not confirmed")) {
    return "يرجى تأكيد البريد الإلكتروني الخاص بك";
  }

  if (normalized.includes("rate limit")) {
    return "لقد تجاوزت الحد المسموح به من المحاولات، يرجى المحاولة لاحقاً";
  }

  return "خطأ في تسجيل الدخول";
};

export const getSignupErrorMessage = (message: string): string => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("user already registered") ||
    normalized.includes("already been registered") ||
    normalized.includes("already exists")
  ) {
    return "هذا البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول.";
  }

  if (normalized.includes("password") && normalized.includes("6")) {
    return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  }

  if (normalized.includes("invalid email")) {
    return "صيغة البريد الإلكتروني غير صحيحة";
  }

  if (normalized.includes("rate limit")) {
    return "تم تجاوز الحد المسموح من المحاولات، يرجى المحاولة لاحقاً";
  }

  return "تعذر إنشاء الحساب حالياً، يرجى المحاولة مجدداً";
};
