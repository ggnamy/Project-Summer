import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const links = [
  { to: '/',        label: 'Home'      },
  { to: '/analyzer', label: 'Analyzer' },
  { to: '/tryon',   label: 'Try-On'   },
  { to: '/looks',   label: 'Beauty Guide' },
]

export default function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>AuraColor</span>
        </NavLink>

        <ul className={styles.links}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [styles.link, isActive ? styles.active : ''].join(' ')
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
