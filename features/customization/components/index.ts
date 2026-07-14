// Studio components
export { default as CustomizationStudio } from "./studio/CustomizationStudio";
export { default as CustomizationLanding } from "./studio/CustomizationLanding";
export { default as SizeSelector } from "./studio/SizeSelector";
export { default as AddOnToggleCards } from "./studio/AddOnToggleCards";
export { default as MessageCardInput } from "./studio/MessageCardInput";
export { default as CustomizationSummary } from "./studio/CustomizationSummary";

// Request components
export { ProposalView } from "./request/ProposalView";
export { CustomRequestForm } from "./request/CustomRequestForm";

// Re-export types consumed by pages
export type { StudioProductData } from "@/features/customization/types";
export type { ProposalViewProps } from "@/features/customization/types";