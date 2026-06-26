import React from "react";
import { BrandTitle } from "../BrandTitle";
import { BrandCard } from "../BrandCard";
import { TextAnimation } from "../TextAnimation";
import { Captions } from "../Captions";
import { OfferCard } from "../OfferCard";
import { LowerThird } from "../LowerThird";
import { ReviewCard } from "../ReviewCard";
import { TypingList } from "../TypingList";

// Maps the compositionId (from templateMeta) to the React component for live preview.
export const COMPONENTS: Record<string, React.FC<any>> = {
  BrandTitle,
  BrandCard,
  TextAnimation,
  Captions,
  OfferCard,
  LowerThird,
  ReviewCard,
  TypingList,
};
