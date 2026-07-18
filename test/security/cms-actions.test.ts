import { describe, it, expect } from "vitest";
import { updateSettingsSchema, upsertTestimonialSchema, upsertPartnerSchema } from "@/lib/validations/cms-schemas";

describe("CMS Actions Zod Gatekeeper (Security)", () => {
  it("should reject malicious updateSettings payload", () => {
    const payload = {
      hero_headline: "Venda mais",
      hero_subtitle: "Subtitulo ok",
      seo_title: "SEO OK",
      base_users: -100, // Invalid: negative
      base_catalogs: "not-a-number", // Invalid: string
    };

    const result = updateSettingsSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject SQL injection in Testimonial text", () => {
    // Note: Zod doesn't natively block SQL injection, but length limits and typing help. 
    // Here we ensure it rejects extremely long payloads that might be buffer overflows or massive injections.
    const payload = {
      name: "User",
      initials: "US",
      color: "bg-red-500",
      text: "a".repeat(2000), // Exceeds 1000 limit
      stars: 5,
      is_active: true
    };

    const result = upsertTestimonialSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject malicious URL in Partner image", () => {
    const payload = {
      name: "Fake Partner",
      image_url: "javascript:alert(1)", // Invalid URL format (Zod url requires http/https typically or standard valid URLs, depending on zod config, but at minimum it rejects raw JS injections if strict)
      is_active: true
    };

    const result = upsertPartnerSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
