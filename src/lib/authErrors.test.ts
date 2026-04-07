import { describe, it, expect } from "vitest";
import { getLoginErrorMessage, getSignupErrorMessage } from "./authErrors";

describe("authErrors", () => {
  describe("getLoginErrorMessage", () => {
    it("maps invalid credentials error", () => {
      expect(getLoginErrorMessage("Invalid login credentials")).toBe(
        "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
    });

    it("maps email not confirmed error", () => {
      expect(getLoginErrorMessage("Email not confirmed")).toBe(
        "يرجى تأكيد البريد الإلكتروني الخاص بك"
      );
    });

    it("maps rate limit error", () => {
      expect(getLoginErrorMessage("Rate limit exceeded")).toBe(
        "لقد تجاوزت الحد المسموح به من المحاولات، يرجى المحاولة لاحقاً"
      );
    });

    it("falls back for unknown login errors", () => {
      expect(getLoginErrorMessage("unexpected error")).toBe("خطأ في تسجيل الدخول");
    });
  });

  describe("getSignupErrorMessage", () => {
    it("maps already registered variation", () => {
      expect(getSignupErrorMessage("User already registered")).toBe(
        "هذا البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول."
      );
    });

    it("maps already exists variation", () => {
      expect(getSignupErrorMessage("Email already exists")).toBe(
        "هذا البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول."
      );
    });

    it("maps password length errors", () => {
      expect(getSignupErrorMessage("Password should be at least 6 characters")).toBe(
        "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      );
    });

    it("maps invalid email error", () => {
      expect(getSignupErrorMessage("Invalid email")).toBe("صيغة البريد الإلكتروني غير صحيحة");
    });

    it("maps signup rate limit error", () => {
      expect(getSignupErrorMessage("Rate limit exceeded")).toBe(
        "تم تجاوز الحد المسموح من المحاولات، يرجى المحاولة لاحقاً"
      );
    });

    it("falls back for unknown signup errors", () => {
      expect(getSignupErrorMessage("unexpected")).toBe(
        "تعذر إنشاء الحساب حالياً، يرجى المحاولة مجدداً"
      );
    });
  });
});
