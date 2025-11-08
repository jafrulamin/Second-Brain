'use client';

import styles from '@/styles/chat.module.css';

interface HeaderBarProps {
  onOpenSettings: () => void;
}

export default function HeaderBar({ onOpenSettings }: HeaderBarProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Second Brain</h1>
      <div className={styles.headerActions}>
        <button
          type="button"
          onClick={onOpenSettings}
          className={styles.inputButton}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}

