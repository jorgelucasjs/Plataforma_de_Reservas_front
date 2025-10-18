/**
 * Accessibility utilities and helpers
 * 
 * This file contains utilities for improving accessibility compliance
 * including ARIA helpers, keyboard navigation, and screen reader support.
 */

// ARIA role definitions
export const ariaRoles = {
  // Navigation roles
  navigation: 'navigation',
  main: 'main',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  
  // Interactive roles
  button: 'button',
  link: 'link',
  menuitem: 'menuitem',
  menu: 'menu',
  menubar: 'menubar',
  tab: 'tab',
  tabpanel: 'tabpanel',
  tablist: 'tablist',
  
  // Form roles
  form: 'form',
  group: 'group',
  radiogroup: 'radiogroup',
  
  // Content roles
  article: 'article',
  heading: 'heading',
  list: 'list',
  listitem: 'listitem',
  
  // Status roles
  alert: 'alert',
  status: 'status',
  log: 'log',
  
  // Widget roles
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  tooltip: 'tooltip',
  
  // Landmark roles
  search: 'search',
  region: 'region'
} as const;

// Common ARIA attributes
export const ariaAttributes = {
  // Labels and descriptions
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  describedby: 'aria-describedby',
  
  // States
  expanded: 'aria-expanded',
  selected: 'aria-selected',
  checked: 'aria-checked',
  pressed: 'aria-pressed',
  hidden: 'aria-hidden',
  disabled: 'aria-disabled',
  
  // Properties
  haspopup: 'aria-haspopup',
  controls: 'aria-controls',
  owns: 'aria-owns',
  current: 'aria-current',
  live: 'aria-live',
  atomic: 'aria-atomic',
  
  // Relationships
  setsize: 'aria-setsize',
  posinset: 'aria-posinset',
  level: 'aria-level'
} as const;

// Live region politeness levels
export const liveRegionPoliteness = {
  off: 'off',
  polite: 'polite',
  assertive: 'assertive'
} as const;

// Keyboard navigation keys
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const;

/**
 * Generates a unique ID for accessibility purposes
 */
export function generateA11yId(prefix = 'a11y'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates ARIA attributes for form field associations
 */
export function createFieldAriaAttributes(
  labelId?: string,
  descriptionId?: string,
  errorId?: string
) {
  const attributes: Record<string, string> = {};
  
  if (labelId) {
    attributes[ariaAttributes.labelledby] = labelId;
  }
  
  const describedByIds: string[] = [];
  if (descriptionId) describedByIds.push(descriptionId);
  if (errorId) describedByIds.push(errorId);
  
  if (describedByIds.length > 0) {
    attributes[ariaAttributes.describedby] = describedByIds.join(' ');
  }
  
  return attributes;
}

/**
 * Creates ARIA attributes for expandable/collapsible content
 */
export function createExpandableAriaAttributes(
  isExpanded: boolean,
  controlsId?: string
) {
  const attributes: Record<string, string | boolean> = {
    [ariaAttributes.expanded]: isExpanded
  };
  
  if (controlsId) {
    attributes[ariaAttributes.controls] = controlsId;
  }
  
  return attributes;
}

/**
 * Creates ARIA attributes for menu items
 */
export function createMenuItemAriaAttributes(
  hasSubmenu: boolean = false,
  isSelected: boolean = false
) {
  const attributes: Record<string, string | boolean> = {
    role: ariaRoles.menuitem
  };
  
  if (hasSubmenu) {
    attributes[ariaAttributes.haspopup] = 'menu';
  }
  
  if (isSelected) {
    attributes[ariaAttributes.selected] = true;
  }
  
  return attributes;
}

/**
 * Creates ARIA attributes for buttons with states
 */
export function createButtonAriaAttributes(
  label?: string,
  isPressed?: boolean,
  controls?: string,
  expanded?: boolean
) {
  const attributes: Record<string, string | boolean> = {};
  
  if (label) {
    attributes[ariaAttributes.label] = label;
  }
  
  if (isPressed !== undefined) {
    attributes[ariaAttributes.pressed] = isPressed;
  }
  
  if (controls) {
    attributes[ariaAttributes.controls] = controls;
  }
  
  if (expanded !== undefined) {
    attributes[ariaAttributes.expanded] = expanded;
  }
  
  return attributes;
}

/**
 * Creates ARIA attributes for live regions
 */
export function createLiveRegionAriaAttributes(
  politeness: keyof typeof liveRegionPoliteness = 'polite',
  atomic: boolean = false
) {
  return {
    [ariaAttributes.live]: liveRegionPoliteness[politeness],
    [ariaAttributes.atomic]: atomic
  };
}

/**
 * Handles keyboard navigation for lists and menus
 */
export function handleArrowKeyNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) {
  const { loop = true, orientation = 'vertical', onSelect } = options;
  
  let newIndex = currentIndex;
  
  switch (event.key) {
    case keyboardKeys.ARROW_DOWN:
      if (orientation === 'vertical') {
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      }
      break;
      
    case keyboardKeys.ARROW_UP:
      if (orientation === 'vertical') {
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      }
      break;
      
    case keyboardKeys.ARROW_RIGHT:
      if (orientation === 'horizontal') {
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      }
      break;
      
    case keyboardKeys.ARROW_LEFT:
      if (orientation === 'horizontal') {
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      }
      break;
      
    case keyboardKeys.HOME:
      event.preventDefault();
      newIndex = 0;
      break;
      
    case keyboardKeys.END:
      event.preventDefault();
      newIndex = items.length - 1;
      break;
      
    case keyboardKeys.ENTER:
    case keyboardKeys.SPACE:
      event.preventDefault();
      onSelect?.(currentIndex);
      return currentIndex;
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
    return newIndex;
  }
  
  return currentIndex;
}

/**
 * Manages focus trap for modals and dialogs
 */
export class FocusTrap {
  private container: HTMLElement;
  private focusableElements: HTMLElement[] = [];
  private firstFocusableElement: HTMLElement | null = null;
  private lastFocusableElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstFocusableElement = this.focusableElements[0] || null;
    this.lastFocusableElement = 
      this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousActiveElement = document.activeElement;
    this.updateFocusableElements();
    
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
    
    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== keyboardKeys.TAB) return;

    if (this.focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Announces text to screen readers
 */
export function announceToScreenReader(
  message: string,
  politeness: keyof typeof liveRegionPoliteness = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', liveRegionPoliteness[politeness]);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Checks if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  
  return !(
    element.hasAttribute('aria-hidden') ||
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.hidden
  );
}

/**
 * Gets the accessible name of an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }
  
  // Check associated label
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || '';
    }
  }
  
  // Fall back to text content
  return element.textContent || '';
}