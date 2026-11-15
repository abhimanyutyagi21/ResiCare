import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { resolved, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle focus-ring" title="Toggle dark mode" aria-label="Toggle dark mode">
      <Icon name={resolved === 'dark' ? 'sun' : 'moon'} size={17} />
    </button>
  );
}
