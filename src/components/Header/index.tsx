import Link from 'next/link'
import styles from './header.module.scss'
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <div className={commonStyles.postContainer}>
      <header className={styles.headerContainer}>
        <Link href="/">
          <img src="/images/Logo.svg" alt="logo" />
        </Link>
      </header>
    </div>
  )
}
