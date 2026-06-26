import React from "react";
import { BrandTitle } from "../BrandTitle";
import { BrandCard } from "../BrandCard";
import { TextAnimation } from "../TextAnimation";

// Maps the compositionId (from templateMeta) to the React component for live preview.
export const COMPONENTS: Record<string, React.FC<any>> = {
  BrandTitle,
  BrandCard,
  TextAnimation,
};
