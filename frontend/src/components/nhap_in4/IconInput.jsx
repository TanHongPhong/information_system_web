import { useEffect } from "react";
import feather from "feather-icons";

export function IconInput({ icon, unit, ...props }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [icon]);
  return (
    <div className="field">
      <i className="icon" data-feather={icon} />
      <input {...props} />
      {unit ? <span className="unit">{unit}</span> : null}
    </div>
  );
}

export function IconSelect({ icon, children, ...props }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [icon]);
  return (
    <div className="field">
      <i className="icon" data-feather={icon} />
      <select {...props}>{children}</select>
    </div>
  );
}

export function IconTextarea({ icon, ...props }) {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, [icon]);
  return (
    <div className="field field-note">
      <i className="icon" data-feather={icon} />
      <textarea {...props} />
    </div>
  );
}
