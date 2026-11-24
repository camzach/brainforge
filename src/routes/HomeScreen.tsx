import { Link } from "@tanstack/react-router";
import styles from "./HomeScreen.module.css";

export function HomeScreen() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>BrainForge</h1>
        <p className={styles.tagline}>
          Learn to recognise cards by their parts.
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.body}>
            <h2>Well of Memory</h2>
            <p>
              Practice your card recognition and recall. Get prepared for
              sealed!
            </p>
          </div>
          <div className={styles.actions}>
            <Link to="/practice/setup" className="btn btn-primary">
              Start challenge
            </Link>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.body}>
            <h2>Library Access</h2>
            <p>
              Browse the full card pool before you challenge yourself. Filter by
              expansion, house, and type.
            </p>
          </div>
          <div className={styles.actions}>
            <Link to="/viewer" className="btn btn-secondary">
              Open viewer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
