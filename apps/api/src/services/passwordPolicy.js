import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 12;

export function passwordPolicyIssues(password) {
  const value = String(password || "");
  const issues = [];

  if (value.length < PASSWORD_MIN_LENGTH) issues.push(`minimal ${PASSWORD_MIN_LENGTH} karakter`);
  if (value.length > 128) issues.push("maksimal 128 karakter");
  if (!/[a-z]/.test(value)) issues.push("huruf kecil");
  if (!/[A-Z]/.test(value)) issues.push("huruf besar");
  if (!/\d/.test(value)) issues.push("angka");

  return issues;
}

export const securePasswordSchema = z.string().superRefine((password, context) => {
  const issues = passwordPolicyIssues(password);
  if (issues.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Password harus memiliki ${issues.join(", ")}`
    });
  }
});
