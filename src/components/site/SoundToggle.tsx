"use client";
import { Volume2, VolumeX } from "lucide-react";
import { setSound, useSound } from "./prefs";
import { T } from "./T";

export function SoundToggle() {
  const on = useSound();
  return (
    <button type="button" className="soundbtn" aria-pressed={on} onClick={() => setSound(!on)}>
      {on ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      <T k={on ? "sound.on" : "sound.off"} />
    </button>
  );
}
