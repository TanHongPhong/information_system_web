import React from "react";

export default function CargoLocalStyles() {
  return (
    <style>{`
      .field{ position:relative }
      .field .icon{ position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#94a3b8 }
      .field input,.field select,.field textarea{
        width:100%; padding:.625rem .875rem; padding-left:2.25rem;
        border-radius:.75rem; border:1px solid #e2e8f0; background:#fff;
        outline:none; transition: box-shadow .15s, border-color .15s;
      }
      .field textarea{ min-height:110px; padding-left:2.25rem }
      .field input:focus,.field select:focus,.field textarea:focus{
        border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15);
      }
      .label{ font-size:14px; font-weight:600; color:#1d4ed8 }
      .help{ font-size:12px; color:#64748b; margin-top:.25rem }
      .unit{ position:absolute; right:.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:13px }
      .required::after{ content:" *"; color:#ef4444 }
      .field-note .icon{ top:1rem; transform:none; }
      .link-brand{ color:#1d4ed8 !important; }
      .link-brand:hover{ color:#1e40af !important; }

      .stepper li{ display:flex; align-items:center; }
      .stepper .done, .stepper .active{ color:#1d4ed8; }
      .stepper .upcoming{ color:#60a5fa; }
      .stepper .badge{ width:1.5rem; height:1.5rem; display:grid; place-items:center; border-radius:9999px; margin-right:.5rem; }
      .stepper .badge-done, .stepper .badge-active{ border:2px solid #1d4ed8; color:#1d4ed8; }
      .stepper .badge-upcoming{ border:2px solid #93c5fd; color:#60a5fa; }

      .section-title{ color:#1d4ed8 !important; }
      .btn-primary{ background:#1d4ed8; color:#fff; border:0 !important; }
      .btn-primary:hover{ background:#1e40af; }
      .btn-reset{ appearance:none; -webkit-appearance:none; border:0; }
      .shadow-soft{ box-shadow:0 12px 40px rgba(2,6,23,.08); }
      .btn-brand{ background:#2563eb; color:#fff; }
      .btn-brand:hover{ background:#1d4ed8; }
    `}</style>
  );
}
