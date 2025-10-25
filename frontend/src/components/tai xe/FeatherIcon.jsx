import { useEffect, useRef } from "react";
import feather from "feather-icons";

/** Dùng tên icon của Feather (vd: 'truck','more-horizontal'...). */
const NAME_ALIAS = { "badge-check": "check-circle" };

export default function FeatherIcon({ name, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const key = NAME_ALIAS[name] || name;
    const svg = feather.icons[key]?.toSvg({ class: className });
    if (ref.current) ref.current.innerHTML = svg || "";
  }, [name, className]);
  return <span aria-hidden="true" ref={ref} />;
}
