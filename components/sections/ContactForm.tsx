"use client";

import { useState } from "react";
import { FiSend, FiCheck, FiAlertCircle } from "react-icons/fi";
import type { ContactFormData, ApiResponse } from "@/types";

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
// Keep these in sync with that file - it is the source of truth.
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
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
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
        className="input-field rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm outline-none transition-all duration-200"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--text-primary)",
        }}
      />
      {error && (
        <p id={errorId} className="text-xs" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border p-6 sm:p-8"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
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
          className="input-field resize-none rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm outline-none transition-all duration-200"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--text-primary)",
          }}
        />
        {errors.message && (
          <p id="message-error" className="text-xs" style={{ color: "var(--danger)" }}>
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot - hidden from real users, traps bots */}
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

      {/* Status announcement - persistent in the DOM so assistive tech is
          subscribed to this live region before its content ever changes. */}
      <div role="status" aria-live="polite">
        {status === "success" && (
          <div
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--success) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)",
              color: "var(--success)",
            }}
          >
            <FiCheck size={15} />
            Message sent! I&apos;ll get back to you within a day or two.
          </div>
        )}
        {status === "error" && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--danger) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--danger) 30%, transparent)",
              color: "var(--danger)",
            }}
          >
            <FiAlertCircle size={15} />
            {errorMsg}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-opacity hover:opacity-90 focus-visible:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {status === "submitting" ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
  );
}
