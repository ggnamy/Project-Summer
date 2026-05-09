import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.desc}>
          This page doesn&apos;t exist or was moved. Let&apos;s get you back on track.
        </p>
        <Link to="/" className={styles.btn}>Go Home</Link>
      </div>
    </main>
  )
}
