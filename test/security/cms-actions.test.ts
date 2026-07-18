import { describe, it, expect } from "vitest";
import { updateSettingsSchema, upsertTestimonialSchema, upsertPartnerSchema, upsertFaqSchema, upsertPlanSchema } from "@/lib/validations/cms-schemas";

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

  it("should reject invalid FAQ payload", () => {
    const payload = {
      question: "a", // Too short
      answer: "b", // Too short
      display_order: "not-a-number",
      is_active: "true"
    };
    const result = upsertFaqSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("should reject Plan with invalid theme or malicious button_url", () => {
    const payload = {
      name: "Plan",
      price_text: "Free",
      subtitle: "Sub",
      theme: "blue", // Invalid theme (only dark or green allowed)
      features: ["A"],
      button_text: "Click",
      button_url: "javascript:alert(1)",
      display_order: 0,
      is_active: true
    };
    const result = upsertPlanSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
