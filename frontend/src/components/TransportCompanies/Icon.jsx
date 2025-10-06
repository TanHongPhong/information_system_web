import React from "react";

export default function Icon({ name, className = "w-4 h-4" }) {
  return <i data-feather={name} className={className} />;
}
