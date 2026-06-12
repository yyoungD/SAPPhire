import { useState } from 'react';

function MoreHorizontalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

export default function ActionMenu({ open, onOpenChange, items = [], className = '', label = '관리 메뉴' }) {
  const [openSubmenuKey, setOpenSubmenuKey] = useState(null);

  const closeMenu = () => {
    onOpenChange(false);
    setOpenSubmenuKey(null);
  };

  const handleToggle = (event) => {
    event.stopPropagation();
    if (open) {
      closeMenu();
      return;
    }
    onOpenChange(true);
  };

  const handleItemClick = (event, item) => {
    event.stopPropagation();
    if (item.disabled) return;

    if (item.children?.length) {
      const itemKey = item.key || item.label;
      setOpenSubmenuKey((current) => (current === itemKey ? null : itemKey));
      return;
    }

    item.onClick?.(event);
    if (item.closeOnClick !== false) {
      closeMenu();
    }
  };

  const handleChildClick = (event, child) => {
    event.stopPropagation();
    if (child.disabled) return;

    child.onClick?.(event);
    if (child.closeOnClick !== false) {
      closeMenu();
    }
  };

  return (
    <span className={`action-menu ${className}`}>
      <button
        type="button"
        className="company-job-card-menu-trigger"
        aria-label={label}
        aria-expanded={open}
        onClick={handleToggle}
      >
        <MoreHorizontalIcon />
      </button>
      {open && (
        <span className="company-job-card-menu-list">
          {items.map((item) => {
            const itemKey = item.key || item.label;
            const isSubmenuOpen = openSubmenuKey === itemKey;

            return (
              <span className="action-menu-item" key={itemKey}>
                <button
                  type="button"
                  className={item.children?.length ? `has-submenu ${item.className || ''}` : item.className || ''}
                  disabled={item.disabled}
                  aria-expanded={item.children?.length ? isSubmenuOpen : undefined}
                  onClick={(event) => handleItemClick(event, item)}
                >
                  {item.label}
                </button>
                {item.children?.length && isSubmenuOpen && (
                  <span className="action-submenu-list">
                    {item.children.map((child) => (
                      <button
                        type="button"
                        key={child.key || child.label}
                        className={child.className || ''}
                        disabled={child.disabled}
                        onClick={(event) => handleChildClick(event, child)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      )}
    </span>
  );
}
