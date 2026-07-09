'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <div className={styles.bar}>
      <Link href="/" className={styles.homeLink}>
        <span className={styles.arrow}>←</span>
        <span className={styles.divider} />
        <span className={styles.siteName}>✦ 스카이 플래너</span>
      </Link>
    </div>
  );
}
