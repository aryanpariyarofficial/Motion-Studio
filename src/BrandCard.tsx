import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { poppins } from "./fonts";

export type BrandCardProps = {
  name: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  durationInSeconds: number;
  logoSrc?: string | null;
  bgColor?: string;
  primaryColor?: string;
  accentColor?: string;
  textColor?: string;
  fontScale?: number;
  fontWeight?: number;
  contactWidth?: number; // max width of the contact text, in em (× font size)
};

const rampAfter = (frame: number, start: number, len: number) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// ---------- vector AASHRAY-style logo (used when no logo is uploaded) ----------
const LogoMark: React.FC<{ size: number; primary: string; accent: string; bg: string }> = ({
  size,
  primary,
  accent,
  bg,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const circumference = 2 * Math.PI * 78;
  const ringDraw = interpolate(frame, [0, 22], [circumference, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const roof = spring({ frame: frame - 8, fps, config: { damping: 14, mass: 0.7 } });
  const roofY = interpolate(roof, [0, 1], [-70, 0]);
  const roofOpacity = interpolate(frame, [8, 16], [0, 1], { extrapolateRight: "clamp" });
  const house = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const houseOpacity = interpolate(frame, [14, 22], [0, 1], { extrapolateRight: "clamp" });
  const win = spring({ frame: frame - 26, fps, config: { damping: 11, mass: 0.6, stiffness: 150 } });
  const live = rampAfter(frame, 38, 16);
  const floatY = Math.sin(frame * 0.05) * 6 * live;
  const breathe = 1 + Math.sin(frame * 0.05) * 0.012 * live;

  return (
    <div style={{ transform: `translateY(${floatY}px) scale(${breathe})` }}>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <circle
          cx="100"
          cy="100"
          r="78"
          stroke={primary}
          strokeWidth="15"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.82} ${circumference}`}
          strokeDashoffset={ringDraw}
          transform="rotate(-90 100 100)"
        />
        <g opacity={roofOpacity} transform={`translate(0 ${roofY})`}>
          <path d="M34 102 L100 50 L166 102" stroke={accent} strokeWidth="24" strokeLinejoin="round" strokeLinecap="round" />
        </g>
        <g opacity={houseOpacity} transform={`translate(100 124) scale(${house}) translate(-100 -124)`}>
          <path d="M64 152 L64 100 L100 72 L136 100 L136 152 Z" fill={primary} />
        </g>
        <g transform={`translate(100 120) scale(${win}) translate(-100 -120)`}>
          <rect x="82" y="102" width="36" height="36" rx="3" fill={bg} />
          <rect x="85" y="105" width="13.5" height="13.5" fill={accent} />
          <rect x="101.5" y="105" width="13.5" height="13.5" fill={accent} />
          <rect x="85" y="121.5" width="13.5" height="13.5" fill={accent} />
          <rect x="101.5" y="121.5" width="13.5" height="13.5" fill={accent} />
        </g>
      </svg>
    </div>
  );
};

// uploaded logo with a clean reveal
const UploadedLogo: React.FC<{ src: string; size: number }> = ({ src, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const live = rampAfter(frame, 38, 16);
  const floatY = Math.sin(frame * 0.05) * 6 * live;
  return (
    <div style={{ transform: `translateY(${floatY}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`, opacity }}>
      <Img src={src} style={{ width: size, height: size, objectFit: "contain" }} />
    </div>
  );
};

// ---------- contact icons ----------
const PinIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame * 0.09) * 2.2;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `translateY(${bob}px)` }}>
      <path d="M12 2c-3.3 0-6 2.7-6 6 0 4.5 6 13 6 13s6-8.5 6-13c0-3.3-2.7-6-6-6z" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="8.2" r="2.4" stroke={c} strokeWidth="1.8" />
    </svg>
  );
};
const MailIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => {
  const frame = useCurrentFrame();
  const rock = Math.sin(frame * 0.07) * 3;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rock}deg)` }}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M4 7l8 5.5L20 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
};
const PhoneIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => {
  const frame = useCurrentFrame();
  const cyc = frame % 90;
  const env = cyc < 28 ? Math.sin((cyc / 28) * Math.PI) : 0;
  const rot = Math.sin(frame * 1.4) * 11 * env;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ transform: `rotate(${rot}deg)`, transformOrigin: "center" }}>
      <circle cx="12" cy="12" r="10.5" stroke={c} strokeWidth="1.6" />
      <path
        d="M8.2 6.7c.3 0 .6.2.7.5l.8 1.9c.1.3.05.6-.15.85l-.9 1c.7 1.4 1.85 2.55 3.25 3.25l1-.9c.25-.2.55-.25.85-.15l1.9.8c.3.1.5.4.5.7v2.1c0 .4-.35.75-.75.7C9.9 18.6 5.4 14.1 4.9 8.45 4.85 8.05 5.2 7.7 5.6 7.7h2.6z"
        fill={c}
      />
    </svg>
  );
};

const ContactRow: React.FC<{
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: number;
  fontSize: number;
  color: string;
  maxW: number;
}> = ({ icon, children, delay, fontSize, color, maxW }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.7 } });
  const opacity = interpolate(frame - delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(s, [0, 1], [50, 0]);
  const iconScale = spring({ frame: frame - delay, fps, config: { damping: 9, mass: 0.5, stiffness: 160 } });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.7, opacity, transform: `translateX(${x}px)` }}>
      <div style={{ flexShrink: 0, display: "flex", transform: `scale(${iconScale})` }}>{icon}</div>
      <div style={{ fontFamily: poppins, fontWeight: 600, fontSize, color, lineHeight: 1.15, maxWidth: maxW, overflowWrap: "break-word", wordBreak: "break-word" }}>
        {children}
      </div>
    </div>
  );
};

export const BrandCard: React.FC<BrandCardProps> = ({
  name,
  tagline,
  location,
  email,
  phone,
  logoSrc,
  bgColor = "#F1EBE1",
  primaryColor = "#0E3A33",
  accentColor = "#E8491F",
  textColor = "#0E3A33",
  fontScale = 1,
  fontWeight = 800,
  contactWidth = 22,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // stack vertically for both portrait AND square frames (row only for wide/landscape)
  const portrait = height >= width * 0.98;
  const base = Math.min(width, height);

  const logoSize = base * (portrait ? 0.4 : 0.42);
  const iconSize = Math.round(base * 0.045);
  const contactFont = Math.round(base * 0.03 * fontScale);
  const contactMaxW = contactFont * contactWidth;
  const nameSize = Math.round(base * 0.085 * fontScale);
  const taglineSize = Math.round(base * 0.028 * fontScale);

  const nameChars = name.split("");
  const underline = spring({ frame: frame - 44, fps, config: { damping: 18, stiffness: 110 } });
  const taglineWords = tagline.split(" ");
  const divider = spring({ frame: frame - 46, fps, config: { damping: 20 } });

  const nameFloat = Math.sin(frame * 0.05 + 0.6) * 3 * rampAfter(frame, 46, 16);
  const contactsFloat = Math.sin(frame * 0.045 + 1.2) * 3 * rampAfter(frame, 84, 16);

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: 0.5,
          backgroundImage: `radial-gradient(${primaryColor}12 1.5px, transparent 1.6px)`,
          backgroundSize: "26px 26px",
          backgroundPosition: `${(frame * 0.3) % 26}px ${(frame * 0.2) % 26}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 15% 20%, ${accentColor}10, transparent 40%), radial-gradient(circle at 85% 85%, ${primaryColor}12, transparent 45%)`,
        }}
      />

      <AbsoluteFill
        style={{
          flexDirection: portrait ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: portrait ? height * 0.04 : width * 0.06,
          padding: `${portrait ? height * 0.08 : 0}px ${width * 0.07}px`,
        }}
      >
        {/* logo + name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
          {logoSrc ? (
            <UploadedLogo src={logoSrc} size={logoSize} />
          ) : (
            <LogoMark size={logoSize} primary={primaryColor} accent={accentColor} bg={bgColor} />
          )}

          <div style={{ position: "relative", marginTop: base * 0.02, transform: `translateY(${nameFloat}px)` }}>
            <div style={{ display: "flex", fontFamily: poppins, fontWeight, fontSize: nameSize, letterSpacing: 2, color: primaryColor, lineHeight: 1 }}>
              {nameChars.map((ch, i) => {
                const d = 28 + i * 3;
                const sp = spring({ frame: frame - d, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } });
                const o = interpolate(frame - d, [0, 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ty = interpolate(sp, [0, 1], [38, 0]);
                return (
                  <span key={i} style={{ display: "inline-block", opacity: o, transform: `translateY(${ty}px)` }}>
                    {ch === " " ? " " : ch}
                  </span>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                bottom: -base * 0.012,
                height: Math.max(5, base * 0.006),
                borderRadius: 999,
                backgroundColor: accentColor,
                transform: `scaleX(${underline})`,
                transformOrigin: "left center",
              }}
            />
          </div>

          <div
            style={{
              marginTop: base * 0.035,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.2em 0.3em",
              maxWidth: portrait ? width * 0.8 : width * 0.34,
              transform: `translateY(${nameFloat}px)`,
            }}
          >
            {taglineWords.map((w, i) => {
              const d = 46 + i * 4;
              const o = interpolate(frame - d, [0, 9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const sp = spring({ frame: frame - d, fps, config: { damping: 200 } });
              const ty = interpolate(sp, [0, 1], [16, 0]);
              return (
                <span key={i} style={{ fontFamily: poppins, fontWeight: 700, fontSize: taglineSize, letterSpacing: 1, color: textColor, opacity: o, transform: `translateY(${ty}px)` }}>
                  {w}
                </span>
              );
            })}
          </div>
        </div>

        {/* divider */}
        {portrait ? (
          <div style={{ height: 3, width: `${interpolate(divider, [0, 1], [0, 60])}%`, borderRadius: 999, background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 3, height: `${interpolate(divider, [0, 1], [0, 56])}%`, borderRadius: 999, background: `linear-gradient(${primaryColor}, ${accentColor})`, flexShrink: 0 }} />
        )}

        {/* contacts */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: base * 0.045, transform: `translateY(${contactsFloat}px)` }}>
          <ContactRow icon={<PinIcon s={iconSize} c={primaryColor} />} delay={48} fontSize={contactFont} color={textColor} maxW={contactMaxW}>
            {location}
          </ContactRow>
          <ContactRow icon={<MailIcon s={iconSize} c={primaryColor} />} delay={60} fontSize={contactFont} color={textColor} maxW={contactMaxW}>
            {email}
          </ContactRow>
          <ContactRow icon={<PhoneIcon s={iconSize} c={primaryColor} />} delay={72} fontSize={contactFont} color={textColor} maxW={contactMaxW}>
            {phone}
          </ContactRow>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
