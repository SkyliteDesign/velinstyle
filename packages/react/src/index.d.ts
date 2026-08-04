/**
 * AUTO-GENERATED — run: node scripts/generate-react-wrappers.mjs
 */
import type { ComponentType, CSSProperties, ReactNode, Ref } from 'react';

/**
 * Props accepted by every wrapper. Scalars become attributes, booleans become
 * presence attributes, objects and arrays are assigned as element properties,
 * and `onVelin*` handlers are bound as custom-event listeners.
 */
export interface VelinComponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLElement>;
  [prop: string]: unknown;
}

export interface VelinComponent extends ComponentType<VelinComponentProps> {
  /** Custom element tag rendered by this wrapper. */
  tagName: string;
}

export declare function createVelinComponent(tag: string): VelinComponent;
export declare const VELIN_TAGS: readonly string[];

export declare function isVelinEventProp(name: string): boolean;
export declare function velinEventName(propName: string): string;
export declare function componentNameForTag(tag: string): string;
export declare function splitProps(props: Record<string, unknown>): {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  attributes: Record<string, string | number>;
  properties: Record<string, unknown>;
  booleans: Record<string, boolean>;
  listeners: Record<string, EventListener>;
  reactProps: Record<string, unknown>;
};
export declare function applyVelinProps(
  el: Element,
  parts: { properties?: Record<string, unknown>; booleans?: Record<string, boolean> },
): void;
export declare function bindVelinListeners(
  el: Element,
  listeners: Record<string, EventListener>,
): () => void;

export declare const VelinAccordion: VelinComponent;
export declare const VelinAnnouncer: VelinComponent;
export declare const VelinBottomNav: VelinComponent;
export declare const VelinCalendar: VelinComponent;
export declare const VelinCarousel: VelinComponent;
export declare const VelinCodeBlock: VelinComponent;
export declare const VelinCollapse: VelinComponent;
export declare const VelinCombobox: VelinComponent;
export declare const VelinCommand: VelinComponent;
export declare const VelinCopy: VelinComponent;
export declare const VelinCountdown: VelinComponent;
export declare const VelinCounter: VelinComponent;
export declare const VelinDataTable: VelinComponent;
export declare const VelinDialog: VelinComponent;
export declare const VelinDrawer: VelinComponent;
export declare const VelinDropdown: VelinComponent;
export declare const VelinEmail: VelinComponent;
export declare const VelinEmptyState: VelinComponent;
export declare const VelinFileDropzone: VelinComponent;
export declare const VelinFormSummary: VelinComponent;
export declare const VelinIcon: VelinComponent;
export declare const VelinLightbox: VelinComponent;
export declare const VelinLiveDot: VelinComponent;
export declare const VelinMenubar: VelinComponent;
export declare const VelinModal: VelinComponent;
export declare const VelinOtpInput: VelinComponent;
export declare const VelinPasswordStrength: VelinComponent;
export declare const VelinPersist: VelinComponent;
export declare const VelinPopover: VelinComponent;
export declare const VelinProgressRing: VelinComponent;
export declare const VelinRating: VelinComponent;
export declare const VelinScrollTop: VelinComponent;
export declare const VelinScrollspy: VelinComponent;
export declare const VelinSearch: VelinComponent;
export declare const VelinSecureField: VelinComponent;
export declare const VelinSegmentedControl: VelinComponent;
export declare const VelinSheet: VelinComponent;
export declare const VelinSparkline: VelinComponent;
export declare const VelinStepper: VelinComponent;
export declare const VelinTabs: VelinComponent;
export declare const VelinThemeToggle: VelinComponent;
export declare const VelinToast: VelinComponent;
export declare const VelinTooltip: VelinComponent;
