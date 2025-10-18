import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  FocusTrap, 
  handleArrowKeyNavigation, 
  announceToScreenReader,
  generateA11yId,
  keyboardKeys
} from '../utils/accessibility';

/**
 * Hook for managing focus traps in modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isActive) {
      focusTrapRef.current = new FocusTrap(containerRef.current);
      focusTrapRef.current.activate();
    } else {
      focusTrapRef.current?.deactivate();
      focusTrapRef.current = null;
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing keyboard navigation in lists and menus
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number, item: T) => void;
    initialIndex?: number;
  } = {}
) {
  const { loop = true, orientation = 'vertical', onSelect, initialIndex = 0 } = options;
  const currentIndexRef = useRef(initialIndex);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    const newIndex = handleArrowKeyNavigation(
      event,
      items,
      currentIndexRef.current,
      {
        loop,
        orientation,
        onSelect: (index) => {
          currentIndexRef.current = index;
          onSelect?.(index, items[index]);
        }
      }
    );

    currentIndexRef.current = newIndex;
  }, [items, loop, orientation, onSelect]);

  const focusItem = useCallback((index: number) => {
    if (items[index]) {
      items[index].focus();
      currentIndexRef.current = index;
    }
  }, [items]);

  const getCurrentIndex = useCallback(() => currentIndexRef.current, []);

  return {
    handleKeyDown,
    focusItem,
    getCurrentIndex
  };
}

/**
 * Hook for managing ARIA live regions and announcements
 */
export function useAnnouncements() {
  const announce = useCallback((
    message: string, 
    politeness: 'polite' | 'assertive' = 'polite'
  ) => {
    announceToScreenReader(message, politeness);
  }, []);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceLoading = useCallback((message: string = 'Loading') => {
    announce(message, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading
  };
}

/**
 * Hook for generating stable accessibility IDs
 */
export function useA11yId(prefix?: string) {
  const idRef = useRef<string>();
  
  if (!idRef.current) {
    idRef.current = generateA11yId(prefix || 'a11y');
  }
  
  return idRef.current;
}

/**
 * Hook for managing expandable/collapsible content accessibility
 */
export function useExpandable(initialExpanded: boolean = false) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const triggerId = useA11yId('expandable-trigger');
  const contentId = useA11yId('expandable-content');

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const triggerProps = {
    id: triggerId,
    'aria-expanded': isExpanded,
    'aria-controls': contentId,
    onClick: toggle,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === keyboardKeys.ENTER || event.key === keyboardKeys.SPACE) {
        event.preventDefault();
        toggle();
      }
    }
  };

  const contentProps = {
    id: contentId,
    'aria-labelledby': triggerId,
    hidden: !isExpanded
  };

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    triggerProps,
    contentProps
  };
}

/**
 * Hook for managing modal/dialog accessibility
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const modalRef = useFocusTrap(isOpen);
  const titleId = useA11yId('modal-title');
  const descriptionId = useA11yId('modal-description');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === keyboardKeys.ESCAPE && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const modalProps = {
    ref: modalRef,
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId
  };

  const titleProps = {
    id: titleId
  };

  const descriptionProps = {
    id: descriptionId
  };

  return {
    modalProps,
    titleProps,
    descriptionProps
  };
}

/**
 * Hook for managing form field accessibility
 */
export function useFormField(
  fieldId?: string,
  options: {
    description?: string;
    error?: string;
    required?: boolean;
  } = {}
) {
  const { description, error, required } = options;
  
  const generatedId = useA11yId('field');
  const id = fieldId || generatedId;
  const labelId = useA11yId('field-label');
  const descriptionId = description ? useA11yId('field-description') : undefined;
  const errorId = error ? useA11yId('field-error') : undefined;

  const describedByIds = [descriptionId, errorId].filter(Boolean);

  const fieldProps = {
    id,
    'aria-labelledby': labelId,
    'aria-describedby': describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
    'aria-required': required,
    'aria-invalid': !!error
  };

  const labelProps = {
    id: labelId,
    htmlFor: id
  };

  const descriptionProps = descriptionId ? {
    id: descriptionId
  } : undefined;

  const errorProps = errorId ? {
    id: errorId,
    role: 'alert',
    'aria-live': 'polite'
  } : undefined;

  return {
    fieldProps,
    labelProps,
    descriptionProps,
    errorProps
  };
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipToMain = useCallback(() => {
    const mainElement = document.querySelector('main, [role="main"]') as HTMLElement;
    if (mainElement) {
      mainElement.focus();
      mainElement.scrollIntoView();
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const navElement = document.querySelector('nav, [role="navigation"]') as HTMLElement;
    if (navElement) {
      navElement.focus();
      navElement.scrollIntoView();
    }
  }, []);

  return {
    skipToMain,
    skipToNavigation
  };
}