import styles from './layout.module.css';
import { QuizProvider } from './sky/context/QuizContext';
import GoogleAnalytics from './GoogleAnalytics';
import TopBar from './TopBar';
import '@/app/globals.css';

/* ───────── 뷰포트 메타 ───────── */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta
          property="og:image"
          content="https://korea-sky-planner.com/sky/presentation.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>

      <body>
        {/* ───── Google Analytics: 한 번만 로드 ───── */}
        <GoogleAnalytics />

        <QuizProvider>
          <TopBar />
          <main className={styles.content}>{children}</main>
        </QuizProvider>
      </body>
    </html>
  );
}
