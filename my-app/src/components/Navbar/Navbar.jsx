import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import styles from './Navbar.module.css'

const links = [
  { to: '/',         label: 'Home'         },
  { to: '/analyzer', label: 'Analyzer'     },
  { to: '/tryon',    label: 'Color Quiz'   },
  { to: '/looks',    label: 'Beauty Guide' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.logo} onClick={() => setOpen(false)}>
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

        <button
          className={styles.hamburger}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className={[styles.bar, open ? styles.bar1Open : ''].join(' ')} />
          <span className={[styles.bar, open ? styles.bar2Open : ''].join(' ')} />
          <span className={[styles.bar, open ? styles.bar3Open : ''].join(' ')} />
        </button>
      </nav>

      <div
        className={[styles.mobileMenu, open ? styles.mobileMenuOpen : ''].join(' ')}
        aria-hidden={!open}
      >
        <ul className={styles.mobileLinks}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [styles.mobileLink, isActive ? styles.mobileLinkActive : ''].join(' ')
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
