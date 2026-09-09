"use client";
import { useRef, useState } from "react";
import { AdminForm } from "./form";
import { saveTemplate } from "@/app/admin/actions";
import {
  renderTemplate,
  templateVariables,
  validateTemplate,
  type TemplateKey,
} from "@/lib/domain";
export function TemplateEditor({
  templateKey,
  body,
  sample,
}: {
  templateKey: TemplateKey;
  body: string;
  sample: Record<string, string>;
}) {
  const [value, setValue] = useState(body);
  const ref = useRef<HTMLTextAreaElement>(null);
  let warning = "";
  try {
    validateTemplate(templateKey, value);
  } catch (error) {
    warning = (error as Error).message;
  }
  function insert(variable: string) {
    const start = ref.current?.selectionStart ?? value.length;
    const end = ref.current?.selectionEnd ?? start;
    const placeholder = `{${variable}}`;
    setValue(value.slice(0, start) + placeholder + value.slice(end));
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(
        start + placeholder.length,
        start + placeholder.length,
      );
    });
  }
  return (
    <AdminForm action={saveTemplate} label="Save message">
      <input type="hidden" name="key" value={templateKey} />
      <label className="admin-label">
        Prefilled message
        <textarea
          ref={ref}
          className="field"
          name="body"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={4000}
          required
          rows={6}
        />
      </label>
      <div className="placeholder-buttons">
        {templateVariables[templateKey].map((v) => (
          <button
            key={v}
            type="button"
            className="button button-secondary"
            onClick={() => insert(v)}
          >{`{${v}}`}</button>
        ))}
      </div>
      {warning && (
        <p className="notice error" role="status">
          {warning}
        </p>
      )}
      <div className="message-preview">
        <strong>Message preview</strong>
        <p className="preserve-lines">{renderTemplate(value, sample)}</p>
      </div>
    </AdminForm>
  );
}
