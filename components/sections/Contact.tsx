"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { SOCIAL_LINKS } from "@/lib/constants";
import { FiGithub, FiLinkedin, FiMail, FiMapPin, FiSend, FiCheck, FiAlertCircle } from "react-icons/fi";
import type { ContactFormData, ApiResponse } from "@/types";

const iconMap: Record<string, React.ReactNode> = {
  FiGithub: <FiGithub size={18} />,
  FiLinkedin: <FiLinkedin size={18} />,
  FiMail: <FiMail size={18} />,
};

type FormStatus = "idle" | "submitting" | "success" | "error";
type FormErrors = Partial<Record<keyof ContactFormData, string>>;

const INITIAL_FORM: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type FormWithHoneypot = ContactFormData & { honeypot: string };

// Mirrors the validation contract enforced server-side in app/api/contact/route.ts.
// Keep these in sync with that file — it is the source of truth.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN_LENGTH = 10;
const FIELD_MAX_LENGTH: Record<"name" | "subject" | "message", number> = {
  name: 100,
  subject: 200,
  message: 4000,
};
const FIELD_ORDER: (keyof ContactFormData)[] = ["name", "email", "subject", "message"];

function validateForm(form: ContactFormData): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required.";
  } else if (form.name.length > FIELD_MAX_LENGTH.name) {
    errors.name = `Name must be ${FIELD_MAX_LENGTH.name} characters or fewer.`;
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(form.email)) {
    errors.email = "Please provide a valid email address.";
  }

  if (!form.subject.trim()) {
    errors.subject = "Subject is required.";
  } else if (form.subject.length > FIELD_MAX_LENGTH.subject) {
    errors.subject = `Subject must be ${FIELD_MAX_LENGTH.subject} characters or fewer.`;
  }

  if (!form.message.trim()) {
    errors.message = "Message is required.";
  } else if (form.message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters.`;
  } else if (form.message.length > FIELD_MAX_LENGTH.message) {
    errors.message = `Message must be ${FIELD_MAX_LENGTH.message} characters or fewer.`;
  }

  return errors;
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  maxLength,
  error,
}: {
  label: string;
  name: keyof ContactFormData;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {label}
        {required && <span style={{ color: "var(--accent)" }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="input-field rounded-lg border px-4 py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          backgroundColor: "var(--surface-elevated)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      />
      {error && (
        <p id={errorId} className="text-xs" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState<FormWithHoneypot>({ ...INITIAL_FORM, honeypot: "" });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name as keyof ContactFormData]) return prev;
      const next = { ...prev };
      delete next[name as keyof ContactFormData];
      return next;
    });
  };

  const onHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, honeypot: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus("idle");
      setErrorMsg("");
      const firstInvalidField = FIELD_ORDER.find((field) => validationErrors[field]);
      if (firstInvalidField) {
        document.getElementById(firstInvalidField)?.focus();
      }
      return;
    }

    setErrors({});
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: ApiResponse = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setForm({ ...INITIAL_FORM, honeypot: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.message ?? "Something went wrong. Please try again.");
      }
    } catch (_err) {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionTitle
          label="Contact"
          title="Get in Touch"
          description="Whether you have a research opportunity, an interesting engineering problem, or just want to say hello — I'd love to hear from you."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Let&apos;s work together
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                I&apos;m currently open to full-time AI/ML engineering roles and research
                positions. I&apos;m also MSCA-eligible and interested in PhD/postdoc opportunities
                in the EU later this year.
              </p>
            </div>

            {/* Location & availability */}
            <div className="space-y-3">
              {[
                {
                  icon: <FiMapPin size={16} />,
                  label: "Location",
                  value: "Bradford, UK (Open to relocation)",
                },
                {
                  icon: <FiMail size={16} />,
                  label: "Email",
                  value: "hammadahmad9999@hotmail.com",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                      backgroundColor: "var(--accent-muted)",
                      borderColor: "rgba(99,102,241,0.2)",
                      color: "var(--accent)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {item.label}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <p className="text-xs uppercase tracking-widest font-mono mb-3"
                style={{ color: "var(--text-muted)" }}>
                Find me online
              </p>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target={link.platform !== "Email" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-200 hover:scale-110"
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--accent-muted)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--surface)";
                    }}
                  >
                    {iconMap[link.icon]}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border p-6 space-y-4"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="Jane Smith"
                  maxLength={FIELD_MAX_LENGTH.name}
                  error={errors.name}
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="jane@example.com"
                  error={errors.email}
                />
              </div>
              <InputField
                label="Subject"
                name="subject"
                value={form.subject}
                onChange={onChange}
                required
                placeholder="Research collaboration / Job opportunity / ..."
                maxLength={FIELD_MAX_LENGTH.subject}
                error={errors.subject}
              />

              {/* Textarea */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="message"
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Message <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  required
                  rows={5}
                  maxLength={FIELD_MAX_LENGTH.message}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? "message-error" : undefined}
                  placeholder="Tell me about the opportunity or project..."
                  className="input-field rounded-lg border px-4 py-2.5 text-sm outline-none resize-none transition-all duration-200"
                  style={{
                    backgroundColor: "var(--surface-elevated)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
                {errors.message && (
                  <p id="message-error" className="text-xs" style={{ color: "#ef4444" }}>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Honeypot — hidden from real users, traps bots */}
              <input
                type="text"
                name="honeypot"
                value={form.honeypot}
                onChange={onHoneypotChange}
                aria-hidden="true"
                tabIndex={-1}
                autoComplete="off"
                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
              />

              {/* Status announcement — persistent in the DOM so assistive tech is
                  subscribed to this live region before its content ever changes. */}
              <div role="status" aria-live="polite">
                {status === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
                    style={{
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10b981",
                    }}
                  >
                    <FiCheck size={15} />
                    Message sent! I&apos;ll get back to you within a day or two.
                  </motion.div>
                )}
                {status === "error" && (
                  <motion.div
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#ef4444",
                    }}
                  >
                    <FiAlertCircle size={15} />
                    {errorMsg}
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, var(--accent), #4f46e5)",
                  boxShadow: "0 4px 16px var(--accent-glow)",
                }}
              >
                {status === "submitting" ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend size={15} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
