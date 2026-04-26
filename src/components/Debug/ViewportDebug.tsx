import React, { useEffect, useState } from 'react';

export function ViewportDebug() {
  const [w, setW] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [clientW, setClientW] = useState<number>(typeof document !== 'undefined' ? document.documentElement.clientWidth : 0);
  const [md, setMd] = useState<boolean>(typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : false);
  const [overflow, setOverflow] = useState<string>(typeof document !== 'undefined' ? document.body.style.overflow : '');
  const [reflowClass, setReflowClass] = useState<boolean>(typeof document !== 'undefined' ? document.documentElement.classList.contains('rb-force-reflow') : false);
  const [ts, setTs] = useState<number>(Date.now());

  useEffect(() => {
    const on = () => {
      setW(window.innerWidth);
      setClientW(document.documentElement.clientWidth);
      setMd(window.matchMedia('(min-width: 768px)').matches);
      setOverflow(document.body.style.overflow);
      setReflowClass(document.documentElement.classList.contains('rb-force-reflow'));
      setTs(Date.now());
    };
    on();
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    const intr = setInterval(on, 1000);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
      clearInterval(intr);
    };
  }, []);

  // show only when debug requested via ?debug=1 or localStorage.debugResponsive === '1'
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const enabled = params.get('debug') === '1' || (typeof localStorage !== 'undefined' && localStorage.getItem('debugResponsive') === '1');
  if (!enabled) return null;

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 99999, background: 'rgba(0,0,0,0.7)', color: 'white', padding: 8, borderRadius: 8, fontSize: 12, lineHeight: '1.2', minWidth: 180 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Viewport Debug</div>
      <div>path: {typeof window !== 'undefined' ? window.location.pathname : ''}</div>
      <div>innerWidth: {w}px</div>
      <div>clientWidth: {clientW}px</div>
      <div>matches md (&gt;=768): {md ? 'yes' : 'no'}</div>
      <div>body.overflow: "{overflow || ''}"</div>
      <div>rb-force-reflow: {reflowClass ? 'active' : 'no'}</div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.9 }}>ts: {new Date(ts).toLocaleTimeString()}</div>
      <div style={{ marginTop: 6 }}>
        <button onClick={() => { if (typeof localStorage !== 'undefined') { localStorage.setItem('debugResponsive', '1'); window.location.reload(); } }} style={{ padding: '4px 6px', fontSize: 11, marginRight: 6 }}>Enable</button>
        <button onClick={() => { if (typeof localStorage !== 'undefined') { localStorage.removeItem('debugResponsive'); window.location.reload(); } }} style={{ padding: '4px 6px', fontSize: 11 }}>Disable</button>
      </div>
    </div>
  );
}
