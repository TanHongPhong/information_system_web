import React from "react";

export default function TransportLocalStyles() {
  return (
    <style>{`
      /* Một chút CSS mảnh cho timeline & bar */
      .tl-dot { width:10px; height:10px; border-radius:9999px; background:#BFD1F2; box-shadow:0 0 0 2px #EDF2FF; }
      .tl-dot--active { background:#2F6FE4; box-shadow:0 0 0 3px #DCE7FF; }

      .lm-sep { position:absolute; top:8px; bottom:8px; width:2px;
        background:repeating-linear-gradient(to bottom, rgba(0,0,0,.25) 0 6px, transparent 6px 12px);
        opacity:.45; pointer-events:none; transform:translateX(-1px);
      }
      .lm-sep--25 { left:25%; } .lm-sep--50 { left:50%; } .lm-sep--75 { left:75%; }
    `}</style>
  );
}
