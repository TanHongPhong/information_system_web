import React from "react";

export default function CargoLocalStyles() {
  return (
    <style>
      {`
        .cargo-form label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .cargo-form input[type="text"],
        .cargo-form input[type="number"],
        .cargo-form select,
        .cargo-form textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .cargo-form input[type="text"]:focus,
        .cargo-form input[type="number"]:focus,
        .cargo-form select:focus,
        .cargo-form textarea:focus {
          border-color: #2563eb;
        }

        .cargo-form .error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .cargo-form .required:after {
          content: "*";
          color: #dc2626;
          margin-left: 0.25rem;
        }
      `}
    </style>
  );
}
