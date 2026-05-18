import * as React from 'react';

function wc(tag) {
  return React.forwardRef(function VelinElement(props, ref) {
    return React.createElement(tag, { ...props, ref }, props.children);
  });
}

export const VelinDialog = wc('velin-dialog');
export const VelinModal = wc('velin-modal');
export const VelinDrawer = wc('velin-drawer');
export const VelinSheet = wc('velin-sheet');
export const VelinThemeToggle = wc('velin-theme-toggle');
export const VelinCombobox = wc('velin-combobox');
export const VelinBottomNav = wc('velin-bottom-nav');
export const VelinSegmentedControl = wc('velin-segmented-control');
export const VelinRating = wc('velin-rating');
export const VelinMenubar = wc('velin-menubar');
export const VelinCommand = wc('velin-command');
export const VelinAnnouncer = wc('velin-announcer');
