import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Input } from '../components/ui.jsx';

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Input type={show ? 'text' : 'password'} {...props} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
        <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
      </button>
    </div>
  );
}
