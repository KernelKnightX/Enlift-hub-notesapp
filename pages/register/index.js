import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  Coffee, ArrowRight, ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, MapPin,
  Calendar as CalIcon, GraduationCap, AlertCircle, Loader2, CheckCircle2, Sparkles
} from 'lucide-react';

const EXAM_TYPES = [
  { value: 'UPSC_CSE_PRELIMS', label: 'UPSC CSE — Prelims' },
  { value: 'UPSC_CSE_MAINS',   label: 'UPSC CSE — Mains'   },
  { value: 'UPSC_CAPF',        label: 'UPSC CAPF (AC)'     },
  { value: 'UPSC_CDS',         label: 'UPSC CDS'           },
  { value: 'UPSC_IFOS',        label: 'UPSC IFoS'          },
  { value: 'UPSC_ESE',         label: 'UPSC ESE'           },
  { value: 'OTHER',            label: 'Other UPSC exam'    },
];

const TARGET_YEARS = ['2026', '2027', '2028', '2029'];

export default function RegisterPage() {
  const { user, signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phoneNumber: '',
    city: '', dateOfBirth: '', examType: '', targetYear: '',
  });

  useEffect(() => {
    if (user) router.push('/student-desk/dashboard');
  }, [user, router]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.email, form.password, {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        city: form.city,
        dateOfBirth: form.dateOfBirth,
        examType: form.examType,
        targetYear: form.targetYear,
      });
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const canStep1 = form.fullName && form.email && form.password && form.password.length >= 6;
  const canSubmit = canStep1 && form.examType && form.targetYear;

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="register-page">
      {/* LEFT visual */}
      <div className="hidden lg:flex flex-col p-10 xl:p-14 relative overflow-hidden"
           style={{ background: 'var(--color-primary)', color: 'var(--color-bg)' }}>
        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: 'var(--color-bg)', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Coffee size={18} strokeWidth={1.6} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-[20px]">Notes Cafe</span>
            <span className="text-[10px] font-mono mt-0.5" style={{ color: '#B7BFB8', letterSpacing: '0.16em' }}>EDITORIAL · UPSC</span>
          </div>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-[520px] relative z-10">
          <div className="chip" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-bg)', borderColor: 'rgba(255,255,255,0.15)' }}>
            <Sparkles size={11} /> Free forever · No card required
          </div>
          <h1 className="font-serif mt-6" style={{ fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em', fontWeight: 460 }}>
            Begin the<br />
            <em style={{ fontStyle: 'italic', color: 'var(--color-accent)' }}>quiet ascent</em>.
          </h1>
          <p className="mt-6 text-[15.5px] leading-[1.7]" style={{ color: '#B7BFB8' }}>
            One editorial platform. Every UPSC preparation tool. Set up your account in two minutes and start with today&apos;s brief.
          </p>

          <ul className="mt-14 flex flex-col gap-4">
            {[
              'Daily editorial current affairs, delivered at 7:15 IST',
              '10 years of PYQs, filterable & downloadable',
              'Mock tests calibrated to actual UPSC difficulty',
              'A weekly planner that respects your time',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px]" style={{ color: 'var(--color-bg)' }}>
                <CheckCircle2 size={17} strokeWidth={1.6} style={{ color: 'var(--color-accent)', marginTop: 2 }} />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(178,90,61,0.18), transparent 70%)',
          filter: 'blur(18px)', pointerEvents: 'none'
        }} />
      </div>

      {/* RIGHT form */}
      <div className="flex flex-col p-6 md:p-10 xl:p-14 relative">
        <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--color-primary)', color: 'var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Coffee size={17} strokeWidth={1.6} />
          </div>
          <span className="font-serif text-[19px]">Notes Cafe</span>
        </Link>

        <Link href="/" className="hidden lg:inline-flex items-center gap-2 text-[13px] self-start"
              style={{ color: 'var(--color-ink-muted)' }}>
          <ArrowLeft size={14} strokeWidth={1.5} /> Back to homepage
        </Link>

        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
            className="w-full max-w-[460px]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="eyebrow">Create account</div>
              <div className="flex items-center gap-1.5 ml-auto">
                <StepDot active={step >= 1} label="1" />
                <div style={{ width: 24, height: 1, background: step >= 2 ? 'var(--color-primary)' : 'var(--color-border)' }} />
                <StepDot active={step >= 2} label="2" />
              </div>
            </div>

            <h2 className="font-serif" style={{ fontSize: 40, letterSpacing: '-0.02em', fontWeight: 460, lineHeight: 1.05 }}>
              {step === 1 ? 'Your details.' : 'Your prep, tuned.'}
            </h2>
            <p className="mt-3 text-[14.5px]" style={{ color: 'var(--color-ink-muted)' }}>
              {step === 1
                ? <>Already registered? <Link href="/login" className="underline" style={{ color: 'var(--color-primary)', fontWeight: 600 }} data-testid="go-to-login">Sign in instead</Link>.</>
                : <>Tell us which exam you&apos;re preparing for so we can tailor the dashboard.</>}
            </p>

            <form onSubmit={submit} className="mt-10 flex flex-col gap-5" data-testid="register-form">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg text-[13px]"
                     style={{ background: '#FCE9E5', color: 'var(--color-danger)', border: '1px solid #F1C7BE' }}>
                  <AlertCircle size={15} strokeWidth={1.6} className="mt-0.5" /> <span>{error}</span>
                </div>
              )}

              {step === 1 && (
                <>
                  <Field label="Full name" icon={User}>
                    <input type="text" required value={form.fullName} onChange={e => set('fullName', e.target.value)}
                           placeholder="Priya Sharma" data-testid="reg-name"
                           className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3" />
                  </Field>
                  <Field label="Email" icon={Mail}>
                    <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                           placeholder="you@example.com" data-testid="reg-email"
                           className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3" />
                  </Field>
                  <Field label="Password (min 6 characters)" icon={Lock}
                         rightAction={<button type="button" onClick={() => setShowPass(s => !s)} data-testid="reg-toggle-pw"
                                              style={{ color: 'var(--color-ink-muted)' }}>
                             {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                          </button>}>
                    <input type={showPass ? 'text' : 'password'} required minLength={6}
                           value={form.password} onChange={e => set('password', e.target.value)}
                           placeholder="Choose a strong password" data-testid="reg-password"
                           className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-10" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Phone (optional)" icon={Phone}>
                      <input type="tel" value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)}
                             placeholder="+91 · 98xxxxxxxx" data-testid="reg-phone"
                             className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3" />
                    </Field>
                    <Field label="City (optional)" icon={MapPin}>
                      <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                             placeholder="Delhi" data-testid="reg-city"
                             className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3" />
                    </Field>
                  </div>

                  <button type="button" disabled={!canStep1}
                          onClick={() => setStep(2)}
                          className="btn btn-primary justify-center mt-2"
                          style={{ opacity: canStep1 ? 1 : 0.5, cursor: canStep1 ? 'pointer' : 'not-allowed' }}
                          data-testid="reg-next">
                    Continue <ArrowRight size={15} />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Date of birth (optional)" icon={CalIcon}>
                    <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                           data-testid="reg-dob"
                           className="w-full bg-transparent outline-none text-[15px] py-3 pl-11 pr-3" />
                  </Field>

                  <div>
                    <span className="block text-[12px] font-medium mb-2" style={{ color: 'var(--color-ink-muted)' }}>Target examination</span>
                    <div className="grid grid-cols-2 gap-2" data-testid="reg-exams">
                      {EXAM_TYPES.map(x => (
                        <button key={x.value} type="button" onClick={() => set('examType', x.value)}
                                className="text-left px-3.5 py-3 rounded-xl text-[13.5px]"
                                style={{
                                  border: `1px solid ${form.examType === x.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  background: form.examType === x.value ? 'var(--color-primary-tint)' : 'var(--color-surface)',
                                  color: form.examType === x.value ? 'var(--color-primary)' : 'var(--color-ink)',
                                  fontWeight: form.examType === x.value ? 600 : 500,
                                  transition: 'background-color .15s ease, border-color .15s ease, color .15s ease'
                                }}>
                          {x.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[12px] font-medium mb-2" style={{ color: 'var(--color-ink-muted)' }}>Target year</span>
                    <div className="flex flex-wrap gap-2" data-testid="reg-years">
                      {TARGET_YEARS.map(y => (
                        <button key={y} type="button" onClick={() => set('targetYear', y)}
                                className="px-4 py-2 rounded-full text-[13px]"
                                style={{
                                  border: `1px solid ${form.targetYear === y ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                  background: form.targetYear === y ? 'var(--color-primary)' : 'var(--color-surface)',
                                  color: form.targetYear === y ? 'var(--color-bg)' : 'var(--color-ink)',
                                  fontWeight: 600,
                                  transition: 'background-color .15s ease, color .15s ease, border-color .15s ease'
                                }}>
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn btn-ghost">
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button type="submit" disabled={loading || !canSubmit}
                            className="btn btn-primary justify-center flex-1"
                            style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                            data-testid="reg-submit">
                      {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> :
                        <>Create account <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </>
              )}
            </form>

            <div className="hairline-t mt-14 pt-6 text-[12px] flex items-center justify-between"
                 style={{ color: 'var(--color-ink-faint)' }}>
              <span>By continuing you agree to our Terms</span>
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
      <div className="relative rounded-xl"
           style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <Icon size={16} strokeWidth={1.5} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--color-ink-muted)', pointerEvents: 'none'
        }} />
        {children}
        {rightAction && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{rightAction}</div>}
      </div>
    </label>
  );
}

function StepDot({ active, label }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 999,
      background: active ? 'var(--color-primary)' : 'var(--color-surface)',
      color: active ? 'var(--color-bg)' : 'var(--color-ink-muted)',
      border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
      transition: 'background-color .2s ease, color .2s ease, border-color .2s ease'
    }}>{label}</div>
  );
}
