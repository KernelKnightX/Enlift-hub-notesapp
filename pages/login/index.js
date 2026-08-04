import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
  Coffee, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { user, login, forgotPassword } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/student-desk/dashboard');
  }, [user, router]);

  const submitLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await forgotPassword(email);
      setInfo('If an account exists, a reset email is on its way.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="login-page">
      {/* LEFT: editorial visual */}
      <div className="hidden lg:flex flex-col p-10 xl:p-14 relative overflow-hidden"
           style={{ background: 'var(--color-ink)', color: 'var(--color-bg)' }}>
        <Link href="/" className="flex items-center gap-2.5 relative z-10" data-testid="login-logo">
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-accent)', color: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Coffee size={18} strokeWidth={1.6} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[20px]">Notes Cafe</span>
            <span className="text-[10px] font-mono mt-0.5" style={{ color: '#8A9993', letterSpacing: '0.16em' }}>EDITORIAL · UPSC</span>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-[520px] relative z-10">
          <div className="chip" style={{ background: 'rgba(178,90,61,0.15)', color: '#E8A889', borderColor: 'rgba(178,90,61,0.35)' }}>
            <Sparkles size={11} /> Issue 07 · Winter 2026
          </div>
          <h1 className="font-serif mt-6" style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 460 }}>
            Welcome back to the<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>quiet room</em>.
          </h1>
          <p className="mt-6 text-[15.5px] leading-[1.7]" style={{ color: '#B7BFB8' }}>
            Your notes, mocks, and reading list are exactly where you left them. Sign back in and pick up the brief.
          </p>

          <blockquote className="mt-14 pl-5" style={{ borderLeft: '2px solid var(--color-accent)' }}>
            <p className="font-serif italic text-[19px] leading-[1.5]">
              &ldquo;Finally, a UPSC platform that reads like a good newspaper instead of shouting like a coaching flyer.&rdquo;
            </p>
            <footer className="mt-4 text-[12.5px]" style={{ color: '#8A9993' }}>
              — Meera K., Delhi · CSE 2026 aspirant
            </footer>
          </blockquote>
        </div>

        {/* Decorative bg */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: 460, height: 460,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(178,90,61,0.14), transparent 70%)',
          filter: 'blur(20px)', pointerEvents: 'none'
        }} />
      </div>

      {/* RIGHT: form */}
      <div className="flex flex-col p-6 md:p-10 xl:p-14 relative">
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: 'var(--color-primary)', color: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><Coffee size={17} strokeWidth={1.6} /></div>
          <span className="font-serif text-[19px]">Notes Cafe</span>
        </Link>

        <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-[13px] self-start"
              style={{ color: 'var(--color-ink-muted)' }} data-testid="back-home">
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to homepage
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
            className="w-full max-w-[420px]"
          >
            {mode === 'login' ? (
              <>
                <div className="eyebrow mb-3">Sign in</div>
                <h2 className="font-serif" style={{ fontSize: 40, letterSpacing: '-0.02em', fontWeight: 460, lineHeight: 1.05 }}>
                  Good to see you again.
                </h2>
                <p className="mt-3 text-[14.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                  New here? <button onClick={() => router.push('/register')} className="underline" style={{ color: 'var(--color-primary)', fontWeight: 600 }} data-testid="go-to-register">Create an account</button>.
                </p>

                <form onSubmit={submitLogin} className="mt-10 flex flex-col gap-5" data-testid="login-form">
                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg text-[13px]"
                         data-testid="login-error"
                         style={{ background: '#FCE9E5', color: 'var(--color-danger)', border: '1px solid #F1C7BE' }}>
                      <AlertCircle size={15} strokeWidth={1.6} className="mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Field label="Email" icon={Mail}>
                    <input
                      type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="login-email"
                      className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3"
                      style={{ color: 'var(--color-ink)' }}
                    />
                  </Field>

                  <Field label="Password" icon={Lock}
                         rightAction={
                           <button type="button" onClick={() => setShowPass(s => !s)}
                                   style={{ color: 'var(--color-ink-muted)' }} data-testid="toggle-password">
                             {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                           </button>
                         }>
                    <input
                      type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Your password"
                      data-testid="login-password"
                      className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-10"
                      style={{ color: 'var(--color-ink)' }}
                    />
                  </Field>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
                      <input type="checkbox" className="accent-[var(--color-primary)]" />
                      Remember this device
                    </label>
                    <button type="button" onClick={() => setMode('forgot')}
                            className="text-[13px] font-medium" style={{ color: 'var(--color-primary)' }}
                            data-testid="forgot-password">
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary justify-center mt-2"
                          data-testid="login-submit">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> :
                      <>Sign in <ArrowRight size={15} /></>}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="eyebrow mb-3">Forgot password</div>
                <h2 className="font-serif" style={{ fontSize: 40, letterSpacing: '-0.02em', fontWeight: 460, lineHeight: 1.05 }}>
                  We&apos;ll send you a link.
                </h2>
                <p className="mt-3 text-[14.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                  Enter the email on your account and check your inbox in a minute.
                </p>

                <form onSubmit={submitForgot} className="mt-10 flex flex-col gap-5" data-testid="forgot-form">
                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg text-[13px]"
                         style={{ background: '#FCE9E5', color: 'var(--color-danger)', border: '1px solid #F1C7BE' }}>
                      <AlertCircle size={15} strokeWidth={1.6} className="mt-0.5" /> <span>{error}</span>
                    </div>
                  )}
                  {info && (
                    <div className="flex items-start gap-2 p-3 rounded-lg text-[13px]"
                         style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)', border: '1px solid rgba(27,59,43,0.2)' }}>
                      <Sparkles size={14} strokeWidth={1.6} className="mt-0.5" /> <span>{info}</span>
                    </div>
                  )}

                  <Field label="Email" icon={Mail}>
                    <input type="email" required
                           value={email} onChange={e => setEmail(e.target.value)}
                           placeholder="you@example.com"
                           className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3"
                           data-testid="forgot-email"
                           style={{ color: 'var(--color-ink)' }} />
                  </Field>

                  <button type="submit" disabled={loading} className="btn btn-primary justify-center"
                          data-testid="forgot-submit">
                    {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> :
                      <>Send reset link <ArrowRight size={15} /></>}
                  </button>
                  <button type="button" onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                          className="text-[13.5px] mt-2" style={{ color: 'var(--color-ink-muted)' }}
                          data-testid="back-to-login">
                    ← Back to sign in
                  </button>
                </form>
              </>
            )}

            <div className="hairline-t mt-14 pt-6 text-[12px] flex items-center justify-between"
                 style={{ color: 'var(--color-ink-faint)' }}>
              <span>Protected by Firebase Auth</span>
              <span className="font-mono">v 2026.1</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children, rightAction }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium mb-2" style={{ color: 'var(--color-ink-muted)' }}>{label}</span>
      <div className="relative rounded-xl transition-colors"
           style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <Icon size={16} strokeWidth={1.5} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-ink-muted)', pointerEvents: 'none'
        }} />
        {children}
        {rightAction && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightAction}
          </div>
        )}
      </div>
    </label>
  );
}
