import styles from './header.module.scss'
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <div className={commonStyles.postContainer}>
      <header className={styles.headerContainer}>
        <img src="/images/Logo.svg" alt="logo" />
      </header>
    </div>
  )
}
