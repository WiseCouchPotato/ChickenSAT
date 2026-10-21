import { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, Check, ChevronRight, CircleAlert, Egg, Eye, EyeOff, Flame, Home, ImagePlus, LogOut, Menu, NotebookPen, Plus, Settings2, Sparkles, Target, X, Calculator, Grip, Share2, Volume2, Lock } from 'lucide-react';
import './styles.css';
import './overrides.css';

const API = '/api';
const domains = [
  'Algebra',
  'Advanced Math',
  'Problem-Solving & Data Analysis',
  'Geometry & Trigonometry'
];
const domainTopics = {
  'Advanced Math': [
    { category: 'Functions', topics: ['Plugging into a function', 'Intercepts of a function', 'Solving for x given y', 'Table Regressions', 'Function Transformations', 'Stretched & Compressed Functions', 'Custom Regressions', 'Radical Models'] },
    { category: 'Exponential Growth', topics: ['Exponent Rules', 'Exponential vs Linear Growth', 'Exponential Function Structure', 'Shifting Exponents', 'Constant & Coefficient', 'Points on Exponential Function', 'Fractional Exponents', 'Exponential Growth Rate'] },
    { category: 'Quadratics & Polynomials', topics: ['Factoring', 'Integer Factors', 'Evaluating all Potential Factors', 'Two Ways to Factor', 'Factors of a Quartic', 'Number of Solutions to Quadratic', 'Analyzing Quadratic Solutions', 'System of Quadratic and Horizontal Line', 'One Real Quadratic Solution', 'Quadratics with No Solution', 'Sum of Quadratic Solutions', 'Product of Quadratic Solutions', 'Interpreting Quadratic Functions', 'Quadratic Applications', 'Factored Form', 'Vertex Form', 'Lowest Possible Sum', 'Polynomial Solutions', 'Polynomial Functions', 'Rational Functions'] }
  ],
  Algebra: [
    { category: 'Systems of Equations & Inequalities', topics: ['System of Equations', 'Algebraic Systems of Equations', 'Lines in terms of real numbers', 'English to Math', 'Inequalities', 'Consecutive odd/even integers', 'Inequalities Graphically', 'Systems of Inequalities', 'System of Equation & Inequality', 'Algebra with Desmos'] },
    { category: 'Single Variable Equations', topics: ['Single Variable Equations with a Constant', 'Rearranging Terms', 'Simple Equivalent Expressions', 'Exotic Equivalent Expressions', 'One Variable in Disguise', 'Number of Solutions', 'Equivalent for all x'] },
    { category: 'Linear Functions', topics: ['Slope', 'Linear Functions', 'Linear Word Problems', 'Interpreting Y-Intercept', 'Standard Form Equation', 'Constants in Linear Functions', 'Standard Form - Infinite Solutions', 'Parallel Lines', 'Perpendicular Lines'] }
  ],
  'Problem-Solving & Data Analysis': [
    { category: 'Rates & Units', topics: ['Rate of change', 'Ratios', 'Fill x times', 'Unit Conversion', 'Square units', 'Scaled Figures', 'Unit Conversion with Rates', 'Extracting Key Information', 'Percentages', 'Reverse Percentage Example', 'Hard Percentages', 'Mixtures'] },
    { category: 'Statistics', topics: ['Reading a Chart', 'Interpreting Graphs', 'Scatterplots', 'Probability', 'Conditional Probability', 'Probability with Percentages', 'Mean, Median, Range', 'Mean vs. Median', 'Mean Analysis', 'Standard Deviation', 'Scaling Data', 'Box Plots', 'Sampling', 'Margin of Error'] }
  ],
  'Geometry & Trigonometry': [
    { category: 'Angles & Triangles', topics: ['Angle Properties', 'Total Interior Angles', 'Radians', 'Unit Circle', 'Triangle Sides', 'Sine, Cosine, Tangent', 'Solving sin/cos/tan', 'Cofunction Identity Geometrically', 'Cofunction Identity Algebraically', 'Congruence', 'Similarity', 'Proving Similarity & Congruence', 'Triangle in a Triangle', 'Altitudes', 'Isosceles Triangles', 'Equilateral Triangles'] },
    { category: 'Circles', topics: ['Arc Length', 'Inscribed Angle Theorem', 'Line Tangent to Circle', 'Quadrilateral from Tangent Lines', 'Standard Form of a Circle', 'Interpreting Standard Form of a Circle', 'General Form of a Circle', 'Circle with Constants', 'Making a Circle'] },
    { category: 'Area, Surface Area, Volume', topics: ['Perimeter', 'Area', 'Squares & Circles', 'Area from Points', 'Volume', 'Density', 'Scaling Figures', 'Prism Surface Area', 'Similar 3D Figures', 'Sphere Enclosures', 'Pyramids & Surface Area', 'Cones'] }
  ]
};
const topicQuestionSampleIds = {
  'Functions': ['adv-2'],
  'Exponential Growth': ['adv-3', 'data-1'],
  'Quadratics & Polynomials': ['adv-1', 'adv-5'],
  'Systems of Equations & Inequalities': ['alg-2', 'alg-3'],
  'Single Variable Equations': ['alg-1', 'alg-4', 'adv-4'],
  'Linear Functions': ['alg-5', 'alg-1'],
  'Rates & Units': ['data-2', 'data-4'],
  'Statistics': ['data-3', 'data-5'],
  'Angles & Triangles': ['geo-2', 'geo-4'],
  'Circles': ['geo-3'],
  'Area, Surface Area, Volume': ['geo-1', 'geo-5']
};
const topicSpecificSampleIds = {
  Percentages: 'data-1',
  'Reverse Percentage Example': 'data-1',
  'Hard Percentages': 'data-1',
  Mixtures: 'data-4'
};
const dailyGreetings = [
  'Nice to see you!',
  'Welcome back!',
  'Ready to crush some questions?',
  'Let’s keep the momentum going!'
];
const initialAvatar = { body: '#F4C95D', shirt: '#7D9D86', shoes: '#E47B5D', shirtStyle: 'crew', shirtPattern: 'none', decal: 'none' };

function Chick({ body, shirt, shoes, shirtStyle = 'crew', shirtPattern = 'none', decal = 'none', small = false }) {
  const shirtClipId = `shirt-clip-${useId().replace(/:/g, '')}`;
  return <svg className={`chick-svg ${small ? 'chick-small' : ''}`} viewBox="0 0 180 190" role="img" aria-label="ChickenSAT chick mascot">
    <defs><clipPath id={shirtClipId}><path d="M59 115 Q90 141 122 115 L126 142 Q90 166 55 142Z" /></clipPath></defs>
    <ellipse cx="90" cy="174" rx="48" ry="7" fill="#2E342B" opacity=".08" />
    <path d="M67 31 C58 12 75 13 82 26 C86 7 103 9 103 28 C119 14 130 29 113 39" fill="#E78C65" stroke="#2E342B" strokeWidth="3" strokeLinejoin="round" />
    <path d="M38 89 C29 61 48 34 76 30 C106 24 133 45 137 73 C145 108 126 143 92 146 C59 147 42 125 38 89Z" fill={body} stroke="#2E342B" strokeWidth="3.5" />
    <path d="M42 86 C22 74 19 97 39 112" fill={body} stroke="#2E342B" strokeWidth="3.5" strokeLinecap="round" />
    <ellipse cx="71" cy="79" rx="4.5" ry="6" fill="#2E342B" /><ellipse cx="109" cy="79" rx="4.5" ry="6" fill="#2E342B" />
    <path d="M83 91 L99 91 L91 101Z" fill="#E78C65" stroke="#2E342B" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M59 115 Q90 141 122 115 L126 142 Q90 166 55 142Z" fill={shirt} stroke="#2E342B" strokeWidth="3.5" strokeLinejoin="round" />
    {shirtStyle === 'stripes' && <g clipPath={`url(#${shirtClipId})`} stroke="#F9F4E8" strokeWidth="4"><path d="M62 122 L118 122" /><path d="M59 133 L121 133" /><path d="M64 144 L116 144" /></g>}
    {shirtPattern === 'dots' && <g clipPath={`url(#${shirtClipId})`} fill="#F9F4E8"><circle cx="72" cy="128" r="2.3" /><circle cx="90" cy="137" r="2.3" /><circle cx="108" cy="127" r="2.3" /><circle cx="75" cy="146" r="2.3" /><circle cx="110" cy="146" r="2.3" /></g>}
    {shirtPattern === 'stars' && <g clipPath={`url(#${shirtClipId})`} fill="#F9F4E8"><path d="m74 124 1.7 4 4.3.3-3.3 2.7 1.1 4.2-3.8-2.3-3.7 2.3 1-4.2-3.2-2.7 4.2-.3z" /><path d="m105 137 1.7 4 4.3.3-3.3 2.7 1.1 4.2-3.8-2.3-3.7 2.3 1-4.2-3.2-2.7 4.2-.3z" /></g>}
    {shirtStyle === 'pocket' && <path d="M98 124 Q105 127 112 124 L111 136 Q105 139 99 136Z" fill="none" stroke="#2E342B" strokeWidth="1.8" />}
    {decal === 'chick' && <g clipPath={`url(#${shirtClipId})`} fill="#F9F4E8"><circle cx="87" cy="132" r="6" /><circle cx="84" cy="130" r="1" fill="#2E342B" /><circle cx="90" cy="130" r="1" fill="#2E342B" /><path d="m86 133 3 0-1.5 2z" fill="#E78C65" /></g>}
    {decal === 'lightning' && <path d="m94 122-8 12h6l-3 9 10-13h-6l3-8Z" fill="#F9F4E8" stroke="#2E342B" strokeWidth="1" strokeLinejoin="round" />}
    <path d="M73 157 L70 168 M109 157 L112 168" stroke="#2E342B" strokeWidth="4" strokeLinecap="round" />
    <path d="M58 169 Q69 163 80 170 L78 178 L57 178Z M101 170 Q112 163 123 169 L124 178 L102 178Z" fill={shoes} stroke="#2E342B" strokeWidth="3" strokeLinejoin="round" />
  </svg>;
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'same-origin',
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'The request could not be completed.');
    error.needsVerification = Boolean(data.needsVerification);
    throw error;
  }
  return data;
}

function App() {
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [studyData, setStudyData] = useState({ bookmarks: [], notes: { folders: [{ id: 'general', name: 'General' }], notes: [] }, attempts: [] });
  const [page, setPage] = useState('Home');
  const [showLandingScreen, setShowLandingScreen] = useState(false);
  const [dailyGreeting] = useState(() => dailyGreetings[Math.floor(Math.random() * dailyGreetings.length)]);
  const [dailyXpGoal, setDailyXpGoal] = useState(15);
  const [authMode, setAuthMode] = useState('login');
  const [authStep, setAuthStep] = useState('form');
  const [authEmail, setAuthEmail] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [avatar, setAvatar] = useState(initialAvatar);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [topicSidebarOpen, setTopicSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notesData, setNotesData] = useState({ folders: [{ id: 'general', name: 'General' }], notes: [] });
  const [noteEditorId, setNoteEditorId] = useState(null);
  const [noteDraft, setNoteDraft] = useState(null);
  const [selectedNoteFolder, setSelectedNoteFolder] = useState('all');
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');

  useEffect(() => {
    Promise.all([
      request('/questions'),
      request('/session')
    ]).then(([questionData, session]) => {
      setQuestions(questionData.questions);
      if (session.authenticated) {
        setProfile(session.profile);
        setAvatar(session.profile.avatar);
        return Promise.all([request('/activity'), request('/study-data')]);
      }
      return null;
    }).then(data => {
      if (data) {
        setActivity(data[0]);
        setStudyData(data[1]);
        setNotesData(data[1].notes);
      }
    })
      .catch(error => setAuthError(error.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    const savedGoal = Number(localStorage.getItem(`chickensat-daily-xp-goal-${profile.id}`));
    if (Number.isFinite(savedGoal) && savedGoal >= 5 && savedGoal <= 100) setDailyXpGoal(savedGoal);
  }, [profile?.id]);

  useEffect(() => {
    if (!['verify', 'reset'].includes(authStep)) return undefined;
    const updateCountdown = () => setResendCountdown(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [authStep, resendAt]);

  const notify = message => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2800);
  };

  async function finishSignIn(nextProfile) {
    setProfile(nextProfile);
    setAvatar(nextProfile.avatar);
    setAuthStep('form');
    setAuthError('');
    setPage('Home');
    const [days, savedStudyData] = await Promise.all([request('/activity'), request('/study-data')]);
    setActivity(days);
    setStudyData(savedStudyData);
    setNotesData(savedStudyData.notes);
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');
    const data = new FormData(event.currentTarget);
    const email = ['verify', 'reset'].includes(authStep) ? authEmail : String(data.get('email') || '').trim();
    try {
      if (authStep === 'verify') {
        const result = await request('/auth/verify', { method: 'POST', body: JSON.stringify({ email, code: data.get('code') }) });
        await finishSignIn(result.profile);
        notify('Email verified. Your account is ready!');
      } else if (authStep === 'forgot') {
        const result = await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
        setAuthEmail(email);
        setResendAt(Date.now() + (result.retryAfterSeconds || 0) * 1000);
        setAuthStep('reset');
        setAuthMessage(result.message);
      } else if (authStep === 'reset') {
        const result = await request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, code: data.get('code'), password: data.get('password') }) });
        setAuthStep('form');
        setAuthMode('login');
        setAuthMessage(result.message);
      } else if (authMode === 'signup') {
        const result = await request('/auth/signup', { method: 'POST', body: JSON.stringify({ name: data.get('name'), email, password: data.get('password') }) });
        setAuthEmail(email);
        setAuthStep('verify');
        setResendAt(Date.now() + (result.retryAfterSeconds || 0) * 1000);
        setAuthMessage(`${result.message} In local development, check the API terminal.`);
      } else {
        const result = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: data.get('password') }) });
        await finishSignIn(result.profile);
      }
    } catch (error) {
      if (error.needsVerification) {
        setAuthEmail(email);
        setAuthStep('verify');
        try {
          const result = await request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
          setResendAt(Date.now() + (result.retryAfterSeconds || 0) * 1000);
          setAuthMessage(`Your email is not verified. ${result.message} In local development, check the API terminal.`);
        } catch (resendError) {
          setAuthError(`${error.message} ${resendError.message}`);
        }
      } else {
        setAuthError(error.message);
      }
    }
  }

  async function resendCode() {
    setAuthError('');
    try {
      const result = await request('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: authEmail }) });
      setResendAt(Date.now() + (result.retryAfterSeconds || 0) * 1000);
      setAuthMessage(`${result.message} In local development, check the API terminal.`);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function resendPasswordCode() {
    setAuthError('');
    try {
      const result = await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: authEmail }) });
      setResendAt(Date.now() + 60_000);
      setAuthMessage(result.message);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function signOut() {
    try {
      await request('/auth/logout', { method: 'POST' });
      setProfile(null);
      setActivity([]);
      setStudyData({ bookmarks: [], notes: { folders: [{ id: 'general', name: 'General' }], notes: [] }, attempts: [] });
      setNotesData({ folders: [{ id: 'general', name: 'General' }], notes: [] });
      setNoteEditorId(null);
      setNoteDraft(null);
      setAuthMode('login');
      setPage('Home');
      setAuthMessage('You have signed out.');
    } catch (error) {
      notify(error.message);
    }
  }

  async function saveAvatar() {
    try {
      const result = await request('/profile', { method: 'PATCH', body: JSON.stringify({ avatar }) });
      setProfile(result);
      setAvatar(result.avatar);
      notify('Your chick’s new look is saved.');
    } catch (error) {
      notify(error.message);
    }
  }

  async function submitAttempt(questionId, answer) {
    const result = await request('/attempts', { method: 'POST', body: JSON.stringify({ questionId, answer }) });
    setProfile(result.profile);
    setActivity(await request('/activity'));
    setStudyData(current => ({ ...current, attempts: [...current.attempts, { questionId, correct: result.correct, date: new Date().toISOString().slice(0, 10) }] }));
    return result;
  }

  async function toggleBookmark(questionId) {
    const bookmarked = !studyData.bookmarks.includes(questionId);
    try {
      const result = await request('/bookmarks', { method: 'PUT', body: JSON.stringify({ questionId, bookmarked }) });
      setStudyData(current => ({ ...current, bookmarks: result.bookmarks }));
      notify(bookmarked ? 'Question bookmarked.' : 'Bookmark removed.');
    } catch (error) {
      notify(error.message);
    }
  }

  async function saveNotes(nextNotes = notesData) {
    try {
      const result = await request('/notes', { method: 'PUT', body: JSON.stringify({ notes: nextNotes }) });
      setNotesData(result.notes);
      setStudyData(current => ({ ...current, notes: result.notes }));
      return result.notes;
    } catch (error) {
      notify(error.message);
      return null;
    }
  }

  function createNote() {
    const folderId = selectedNoteFolder === 'all' ? notesData.folders[0]?.id || 'general' : selectedNoteFolder;
    const note = { id: `note-${crypto.randomUUID()}`, title: '', body: '', folderId, images: [], updatedAt: Date.now() };
    setNoteDraft(note);
    setNoteEditorId(note.id);
  }

  async function saveAndCloseNote() {
    if (!noteDraft) return;
    const next = {
      ...notesData,
      notes: notesData.notes.some(note => note.id === noteDraft.id)
        ? notesData.notes.map(note => note.id === noteDraft.id ? noteDraft : note)
        : [...notesData.notes, noteDraft]
    };
    if (!await saveNotes(next)) return;
    setNoteEditorId(null);
    setNoteDraft(null);
    notify('Note saved.');
  }

  async function createNoteFolder(event) {
    event.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    if (notesData.folders.some(folder => folder.name.toLowerCase() === name.toLowerCase())) {
      notify('A folder with that name already exists.');
      return;
    }
    const folder = { id: `folder-${crypto.randomUUID()}`, name };
    const next = { ...notesData, folders: [...notesData.folders, folder] };
    if (!await saveNotes(next)) return;
    setNewFolderName('');
    setSelectedNoteFolder(folder.id);
  }

  async function renameSelectedFolder(event) {
    event.preventDefault();
    const name = renameFolderName.trim();
    if (!name || selectedNoteFolder === 'all') return;
    if (notesData.folders.some(folder => folder.id !== selectedNoteFolder && folder.name.toLowerCase() === name.toLowerCase())) {
      notify('A folder with that name already exists.');
      return;
    }
    const next = {
      ...notesData,
      folders: notesData.folders.map(folder => folder.id === selectedNoteFolder ? { ...folder, name } : folder)
    };
    if (!await saveNotes(next)) return;
    setRenameFolderName('');
  }

  async function uploadNoteImage(event) {
    const file = event.target.files?.[0];
    if (!file || !noteDraft) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 1_000_000) {
      notify('Choose a PNG, JPEG, or WebP image up to 1 MB.');
      event.target.value = '';
      return;
    }
    if (noteDraft.images.length >= 5) {
      notify('A note can contain up to five images.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setNoteDraft(current => current ? ({ ...current, images: [...current.images, reader.result] }) : current);
    };
    reader.onerror = () => notify('Could not read that image.');
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function openQuestion(question) {
    setSelectedDomain(question.domain);
    setSelectedQuestionId(question.id);
    navigate('Question Bank');
  }

  function navigate(nextPage) {
    setPage(nextPage);
    setShowLandingScreen(false);
    setMobileNavOpen(false);
  }

  if (loading) return <div className="loading-screen"><Logo /><div className="loader" /><p>Warming up the incubator…</p></div>;
  if (!profile) return <AuthScreen
    authMode={authMode}
    setAuthMode={mode => { setAuthMode(mode); setAuthStep('form'); setAuthError(''); setAuthMessage(''); }}
    authStep={authStep}
    authEmail={authEmail}
    setAuthEmail={setAuthEmail}
    authError={authError}
    authMessage={authMessage}
    resendCountdown={resendCountdown}
    onSubmit={submitAuth}
    onResend={resendCode}
    onResendPassword={resendPasswordCode}
    onForgotPassword={() => { setAuthStep('forgot'); setAuthError(''); setAuthMessage(''); }}
  />;

  const isLanding = showLandingScreen;
  const domainFocus = page === 'Question Bank' && Boolean(selectedDomain) && !isLanding;
  return <div className={`app-shell ${isLanding ? 'app-shell-landing' : ''} ${domainFocus ? 'domain-study-mode' : ''}`}>
    {!isLanding && <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><button className="brand-home" onClick={() => { setShowLandingScreen(true); setMobileNavOpen(false); }} aria-label="Open ChickenSAT starting screen"><Logo /></button><button className="drawer-close icon-btn" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <div className="workspace-label">YOUR STUDY SPACE</div>
      <nav>
        <NavButton label="Home" icon={Home} page={page} setPage={navigate} />
        <NavButton label="Question Bank" icon={BookOpen} page={page} onClick={() => { setSelectedDomain(''); setSelectedQuestionId(''); navigate('Question Bank'); }} />
        <NavButton label="Bookmarks" icon={Bookmark} page={page} setPage={navigate} />
        <NavButton label="Wrong Questions" icon={CircleAlert} page={page} setPage={navigate} />
        <NavButton label="Notes" icon={NotebookPen} page={page} setPage={navigate} />
        <NavButton label="Pricing" icon={Sparkles} page={page} setPage={navigate} />
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-streak"><div className="streak-icon"><Flame size={19} /></div><div><strong>{profile.streak}-day streak</strong><span>Your practice, saved</span></div></div>
      <button className="profile-mini" onClick={() => navigate('My Profile')}>
        <div className="mini-avatar"><Chick small {...avatar} /></div><div className="mini-details"><strong>{profile.name}</strong><span>{profile.email}</span></div><Settings2 size={17} className="muted-icon" />
      </button>
      <button className="signout-button" onClick={signOut}><LogOut size={16} /> Sign out</button>
    </aside>}
    {mobileNavOpen && <button className="drawer-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation" />}
    <main className="main-area">
      {isLanding
        ? <header className="landing-header"><button className="landing-profile" onClick={() => navigate('My Profile')} aria-label={`Open ${profile.name}'s profile`}><span className="top-avatar"><Chick small {...avatar} /></span><span>{profile.name}</span><ChevronRight size={15} /></button></header>
        : <header className="topbar"><button className="mobile-nav-toggle icon-btn" onClick={() => selectedDomain && page === 'Question Bank' ? setTopicSidebarOpen(open => !open) : setMobileNavOpen(true)} aria-label={selectedDomain && page === 'Question Bank' ? 'Toggle topic navigation' : 'Open navigation'}><Menu size={21} /></button><button className="breadcrumb breadcrumb-home" onClick={() => navigate('Home')}><span>ChickenSAT</span><ChevronRight size={14} /><strong>{page}</strong>{selectedDomain && page === 'Question Bank' && <><ChevronRight size={14} /><strong>{selectedDomain}</strong></>}</button><div className="top-actions"><div className="streak-pill"><Flame size={16} /><strong>{profile.streak}</strong><span>day streak</span></div><button className="top-avatar" onClick={() => navigate('My Profile')} aria-label="Open profile"><Chick small {...avatar} /></button></div></header>}
      <div className="page-content">
        {isLanding && <HomePage avatar={avatar} onPractice={() => { setSelectedDomain(''); setSelectedQuestionId(''); navigate('Question Bank'); }} onPricing={() => navigate('Pricing')} onDashboard={() => navigate('Home')} />}
        {!isLanding && page === 'Home' && <HomeDashboard profile={profile} greeting={dailyGreeting} questions={questions} dailyXpGoal={dailyXpGoal} onSetDailyXpGoal={value => { setDailyXpGoal(value); localStorage.setItem(`chickensat-daily-xp-goal-${profile.id}`, String(value)); }} onOpenQuestion={openQuestion} onPractice={() => { setSelectedDomain(''); setSelectedQuestionId(''); navigate('Question Bank'); }} />}
        {!isLanding && page === 'Question Bank' && <QuestionBank questions={questions} attempts={studyData.attempts} bookmarks={studyData.bookmarks} selectedDomain={selectedDomain} setSelectedDomain={value => { setSelectedDomain(value); setTopicSidebarOpen(true); }} selectedQuestionId={selectedQuestionId} setSelectedQuestionId={setSelectedQuestionId} topicSidebarOpen={topicSidebarOpen} setTopicSidebarOpen={setTopicSidebarOpen} onAttempt={submitAttempt} onToggleBookmark={toggleBookmark} onBack={() => { setSelectedQuestionId(''); if (!selectedDomain) setPage('Home'); }} notify={notify} />}
        {!isLanding && page === 'Bookmarks' && <QuestionCollection title="Bookmarks" subtitle="Questions you’ve saved for review." icon={Bookmark} questions={questions.filter(question => studyData.bookmarks.includes(question.id))} onOpen={openQuestion} emptyText="Bookmark a question and it will be waiting here." />}
        {!isLanding && page === 'Wrong Questions' && <QuestionCollection title="Wrong questions" subtitle="Questions you’ve answered incorrectly. Keep practicing." icon={CircleAlert} questions={questions.filter(question => studyData.attempts.some(attempt => attempt.questionId === question.id && !attempt.correct))} onOpen={openQuestion} emptyText="No missed questions yet. Your incorrect answers will appear here." />}
        {!isLanding && page === 'Notes' && <NotesPage notesData={notesData} selectedFolder={selectedNoteFolder} setSelectedFolder={setSelectedNoteFolder} newFolderName={newFolderName} setNewFolderName={setNewFolderName} renameFolderName={renameFolderName} setRenameFolderName={setRenameFolderName} onCreateFolder={createNoteFolder} onRenameFolder={renameSelectedFolder} onCreateNote={createNote} onOpenNote={note => { setNoteDraft({ ...note }); setNoteEditorId(note.id); }} />}
        {!isLanding && page === 'Pricing' && <PricingPage onPractice={() => { setSelectedDomain(''); setSelectedQuestionId(''); navigate('Question Bank'); }} />}
        {!isLanding && page === 'My Profile' && <ProfilePage profile={profile} activity={activity} avatar={avatar} setAvatar={setAvatar} onSaveAvatar={saveAvatar} />}
      </div>
      {!isLanding && <footer className="page-footer"><span>© 2026 ChickenSAT</span><span>Your progress is private to your account.</span></footer>}
    </main>
    {noteEditorId && noteDraft && <NoteEditor note={noteDraft} setNote={setNoteDraft} onSaveExit={saveAndCloseNote} onClose={() => { setNoteEditorId(null); setNoteDraft(null); }} onUploadImage={uploadNoteImage} />}
    {toast && <div className="toast"><Check size={17} />{toast}</div>}
  </div>;
}

function Logo() {
  return <div className="brand"><div className="brand-mark"><Chick small {...initialAvatar} /></div><span>Chicken<span className="brand-sat">SAT</span></span></div>;
}

function NavButton({ label, icon: Icon, page, setPage, onClick }) {
  return <button className={`nav-item ${page === label ? 'active' : ''}`} onClick={onClick || (() => setPage(label))}><Icon size={19} /><span>{label}</span></button>;
}

function AuthScreen({ authMode, setAuthMode, authStep, authEmail, setAuthEmail, authError, authMessage, resendCountdown, onSubmit, onResend, onResendPassword, onForgotPassword }) {
  const isLogin = authStep === 'form' && authMode === 'login';
  const heading = authStep === 'verify'
    ? 'Check your email.'
    : authStep === 'forgot'
      ? 'Reset your password.'
      : authStep === 'reset'
        ? 'Choose a new password.'
        : authMode === 'signup'
          ? 'Create your account.'
          : 'Welcome back.';
  const description = authStep === 'verify'
    ? `Enter the six-digit code sent to ${authEmail}.`
    : authStep === 'forgot'
      ? 'Enter your account email and we’ll send a reset code if it matches a verified account.'
      : authStep === 'reset'
        ? `Enter the reset code sent to ${authEmail} and choose a new password.`
        : 'Sign in or create an account to save your practice and progress.';

  return <main className="auth-layout">
    <section className="auth-card">
      <Logo />
      <div className="auth-heading"><span className="eyebrow">YOUR PERSONAL STUDY SPACE</span><h1>{heading}</h1><p>{description}</p></div>
      {authStep === 'form' && <div className="auth-tabs"><button className={authMode === 'login' ? 'selected' : ''} onClick={() => setAuthMode('login')}>Sign in</button><button className={authMode === 'signup' ? 'selected' : ''} onClick={() => setAuthMode('signup')}>Create account</button></div>}
      <form className="auth-form" onSubmit={onSubmit} key={`${authStep}-${authMode}`}>
        {authStep === 'verify' ? <>
          <label>Email address<input type="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required autoComplete="email" /></label>
          <label>Verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength="6" maxLength="6" placeholder="6 digits" required /></label>
          <button className="btn-primary auth-submit" type="submit">Verify email <ChevronRight size={17} /></button>
          <button className="auth-link" type="button" onClick={onResend} disabled={resendCountdown > 0}>{resendCountdown ? `Send a new code in ${resendCountdown}s` : 'Send a new code'}</button>
          <button className="auth-link" type="button" onClick={() => setAuthMode('login')}>Back to sign in</button>
        </> : authStep === 'forgot' ? <>
          <label>Email address<input name="email" type="email" autoComplete="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required /></label>
          <button className="btn-primary auth-submit" type="submit">Send reset code <ChevronRight size={17} /></button>
          <button className="auth-link" type="button" onClick={() => setAuthMode('login')}>Back to sign in</button>
        </> : authStep === 'reset' ? <>
          <label>Email address<input name="email" type="email" value={authEmail} readOnly /></label>
          <label>Reset code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength="6" maxLength="6" placeholder="6 digits" required /></label>
          <PasswordField name="password" label="New password" autoComplete="new-password" minLength={12} helper="Use at least 12 characters." />
          <button className="btn-primary auth-submit" type="submit">Update password <Check size={17} /></button>
          <button className="auth-link" type="button" onClick={onResendPassword} disabled={resendCountdown > 0}>{resendCountdown ? `Send a new code in ${resendCountdown}s` : 'Send a new reset code'}</button>
          <button className="auth-link" type="button" onClick={() => setAuthMode('login')}>Back to sign in</button>
        </> : <>
          {authMode === 'signup' && <label>Your name<input name="name" autoComplete="name" maxLength="60" required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" value={authEmail} onChange={event => setAuthEmail(event.target.value)} required /></label>
          <PasswordField name="password" label="Password" autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={authMode === 'signup' ? 12 : undefined} helper={authMode === 'signup' ? 'Use at least 12 characters.' : undefined} />
          <button className="btn-primary auth-submit" type="submit">{authMode === 'signup' ? 'Create account' : 'Sign in'} <ChevronRight size={17} /></button>
          {isLogin && <button className="auth-link forgot-password-link" type="button" onClick={onForgotPassword}>Forgot password?</button>}
        </>}
      </form>
      {(authError || authMessage) && <p className={`auth-feedback ${authError ? 'error' : ''}`} role="status">{authError || authMessage}</p>}
      <p className="auth-privacy">Your practice history is only saved to your account after you sign in.</p>
    </section>
  </main>;
}

function PasswordField({ name, label, autoComplete, minLength, helper }) {
  const [visible, setVisible] = useState(false);
  return <label>{label}<span className="password-input-wrap">
    <input name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} minLength={minLength} maxLength="128" required />
    <button className="password-visibility" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
      {visible ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  </span>{helper && <small>{helper}</small>}</label>;
}

function HomePage({ avatar, onPractice, onPricing, onDashboard }) {
  return <section className="landing-hero">
    <div className="landing-mascot"><div className="landing-sun" /><Chick {...avatar} /></div>
    <div className="landing-brand">Chicken<span>SAT</span></div>
    <p className="landing-tagline">A little practice. A lot more confidence.</p>
    <div className="landing-actions">
      <button className="btn-primary landing-primary" onClick={onPractice}>Scramble <ChevronRight size={18} /></button>
      <button className="btn-secondary landing-secondary" onClick={onPricing}>Go Grade A <Sparkles size={17} /></button>
    </div>
    <button className="landing-dashboard-link" onClick={onDashboard}><Home size={15} /> Back to your dashboard</button>
  </section>;
}

function HomeDashboard({ profile, greeting, questions, dailyXpGoal, onSetDailyXpGoal, onOpenQuestion, onPractice }) {
  const [goalSettingsOpen, setGoalSettingsOpen] = useState(false);
  const question = questions.length
    ? questions[(new Date().getFullYear() * 372 + (new Date().getMonth() + 1) * 31 + new Date().getDate()) % questions.length]
    : null;
  const dailyXp = profile.dailyXp || 0;
  const progress = Math.min(100, Math.round((dailyXp / dailyXpGoal) * 100));
  return <section className="home-dashboard">
    <header className="dashboard-greeting"><div><span className="eyebrow">YOUR STUDY SPACE</span><h1>Hey, {profile.name}<span className="period">.</span></h1><p>{greeting}</p></div><button className="btn-secondary dashboard-practice-link" onClick={onPractice}><BookOpen size={16} /> Practice</button></header>
    <article className="qotd-card">
      <header><div><span className="eyebrow">A LITTLE PRACTICE, EVERY DAY</span><h2>Question of the Day</h2></div><div className="qotd-actions">
        <button type="button" aria-label="Bookmark question (coming soon)" title="Coming soon" disabled><Bookmark size={17} /></button>
        <button type="button" aria-label="Share question (coming soon)" title="Coming soon" disabled><Share2 size={17} /></button>
        <button type="button" aria-label="Read question aloud (coming soon)" title="Coming soon" disabled><Volume2 size={17} /></button>
      </div></header>
      {question ? <div className="qotd-content"><div className="question-meta"><span>{question.domain}</span><span>{question.difficulty}</span></div><p>{question.prompt}</p><button className="btn-primary" onClick={() => onOpenQuestion(question)}>Try today’s question <ChevronRight size={17} /></button></div>
        : <div className="qotd-content"><p>Questions are loading. Please check back in a moment.</p></div>}
      <footer><span>One focused question is a great start.</span><Egg size={22} /></footer>
    </article>
    <section className="daily-xp-card" aria-label="Daily XP goal">
      <div className="daily-xp-heading"><div><span className="eyebrow">KEEP YOUR MOMENTUM</span><h2>Today’s streak progress</h2><p>Earn {Math.max(0, dailyXpGoal - dailyXp)} more XP to meet today’s goal.</p></div>
        <div className="goal-settings-wrap"><button className="goal-settings-button" aria-label="Change daily XP goal" aria-expanded={goalSettingsOpen} onClick={() => setGoalSettingsOpen(open => !open)}><Settings2 size={18} /></button>
          {goalSettingsOpen && <div className="goal-settings-popover"><label htmlFor="daily-xp-goal">Daily XP goal</label><div><input id="daily-xp-goal" type="number" min="5" max="100" step="5" value={dailyXpGoal} onChange={event => { const next = Number(event.target.value); if (Number.isFinite(next) && next >= 5 && next <= 100) onSetDailyXpGoal(next); }} /><span>XP (5–100)</span></div><p>Choose a small, achievable daily target.</p></div>}
        </div>
      </div>
      <div className="daily-xp-progress"><div className="daily-xp-track"><span style={{ width: `${progress}%` }} /></div><div className="daily-xp-count"><strong>{dailyXp}</strong><span> / {dailyXpGoal} XP</span><span>{progress >= 100 ? 'Goal reached!' : `${progress}%`}</span></div></div>
    </section>
  </section>;
}

function PricingPage({ onPractice }) {
  const plans = [
    { name: 'Free Fledgling', price: '$0', period: 'forever', description: 'A friendly place to start.', features: ['Practice all four math domains', 'Save questions and notes', 'Track your practice progress'], available: true },
    { name: 'Cluck Plus', price: '$8', period: 'per month', description: 'For steady, focused practice.', features: ['Everything in Free Fledgling', 'More guided practice tools', 'Detailed skill review'], featured: true },
    { name: 'Golden Rooster', price: '$15', period: 'per month', description: 'Your full SAT Math study companion.', features: ['Everything in Cluck Plus', 'Personalized practice plans', 'Advanced progress insights'] }
  ];
  return <>
    <div className="pricing-heading"><span className="eyebrow">FIND YOUR PERCH</span><h1>Go Grade A.</h1><p>Choose the amount of support that feels right for you.</p></div>
    <div className="pricing-grid">{plans.map(plan => <article className={`pricing-card ${plan.featured ? 'pricing-featured' : ''}`} key={plan.name}>
      {plan.featured && <span className="pricing-badge">MOST POPULAR</span>}
      <h2>{plan.name}</h2><p>{plan.description}</p><div className="pricing-price"><strong>{plan.price}</strong><span>{plan.period}</span></div>
      <ul>{plan.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul>
      <button className={plan.featured ? 'btn-primary' : 'btn-secondary'} onClick={onPractice} disabled={!plan.available}>{plan.available ? 'Start practicing' : 'Coming soon'}</button>
    </article>)}</div>
    <p className="pricing-disclaimer">Payments are not enabled yet. Plans and prices are a preview; no purchase will be made.</p>
  </>;
}

function StatCard({ icon: Icon, label, value, foot, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19} /></div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><span className="stat-foot">{foot}</span></div>;
}

const domainDescriptions = {
  Algebra: 'Linear equations, inequalities, and systems.',
  'Advanced Math': 'Equivalent expressions, quadratics, and functions.',
  'Problem-Solving & Data Analysis': 'Ratios, rates, percentages, and statistics.',
  'Geometry & Trigonometry': 'Area, volume, triangles, and circles.'
};

function QuestionBank({ questions, attempts, bookmarks, selectedDomain, setSelectedDomain, selectedQuestionId, setSelectedQuestionId, topicSidebarOpen, setTopicSidebarOpen, onAttempt, onToggleBookmark, onBack, notify }) {
  const attemptedIds = new Set(attempts.map(attempt => attempt.questionId));
  if (!selectedDomain) return <>
    <div className="page-intro"><div><div className="eyebrow">PRACTICE AND TRACK YOUR WORK</div><h1>Math domains<span className="period">.</span></h1><p>Choose a domain to browse its topics and practice problems.</p></div><div className="bank-total"><strong>{questions.length}</strong><span>sample questions</span></div></div>
    <div className="domain-tiles">{domains.map((domain, index) => {
      const domainQuestions = questions.filter(question => question.domain === domain);
      const done = domainQuestions.filter(question => attemptedIds.has(question.id)).length;
      const topicCount = domainTopics[domain].reduce((total, category) => total + category.topics.length, 0);
      return <button className={`domain-tile domain-tile-${index}`} key={domain} onClick={() => setSelectedDomain(domain)}>
        <span className="domain-tile-index">0{index + 1}</span><span className="domain-tile-count">{topicCount} topics</span>
        <h2>{domain}</h2><p>{domainDescriptions[domain]}</p>
        <span className="domain-tile-progress">{done} of {domainQuestions.length} sample questions attempted <ChevronRight size={16} /></span>
      </button>;
    })}</div>
  </>;

  const domainQuestions = questions.filter(question => question.domain === selectedDomain);
  const questionIndex = domainQuestions.findIndex(question => question.id === selectedQuestionId);
  const selectedQuestion = domainQuestions[questionIndex];
  const categories = domainTopics[selectedDomain] || [];
  function getTopicSample(topic, category, topicIndex) {
    const specificSample = topicSpecificSampleIds[topic];
    if (specificSample) {
      const match = domainQuestions.find(question => question.id === specificSample);
      if (match) return match;
    }
    const candidates = (topicQuestionSampleIds[category] || []).map(id => domainQuestions.find(question => question.id === id)).filter(Boolean);
    return candidates[topicIndex % Math.max(candidates.length, 1)] || domainQuestions[topicIndex % Math.max(domainQuestions.length, 1)];
  }
  function openTopic(topic, category, topicIndex) {
    const chosen = getTopicSample(topic, category, topicIndex);
    if (chosen) setSelectedQuestionId(chosen.id);
    else notify(`Practice questions for ${topic} are coming soon.`);
  }

  return <div className={`domain-browser ${topicSidebarOpen ? '' : 'domain-browser-topic-nav-closed'}`}>
    {topicSidebarOpen && <aside className="topic-sidebar">
      <div className="topic-sidebar-header"><button className="topic-back-button" onClick={() => { setSelectedQuestionId(''); setSelectedDomain(''); }}><ArrowLeft size={15} /> All domains</button><button className="topic-sidebar-close" onClick={() => setTopicSidebarOpen(false)} aria-label="Collapse topic navigation"><Menu size={18} /></button></div>
      <h2>{selectedDomain}</h2><p>TOPICS</p>
      <nav>{categories.map((category, categoryIndex) => <a key={category.category} href={`#topic-category-${categoryIndex}`}><span>{String(categoryIndex + 1).padStart(2, '0')}</span>{category.category}</a>)}</nav>
      <div className="topic-sidebar-footer">{domainQuestions.length} sample questions in this domain</div>
    </aside>}
    <div className="domain-browser-main">
      {selectedQuestion ? <QuestionView
        key={selectedQuestion.id}
        question={selectedQuestion}
        index={questionIndex}
        total={domainQuestions.length}
        isBookmarked={bookmarks.includes(selectedQuestion.id)}
        onToggleBookmark={() => onToggleBookmark(selectedQuestion.id)}
        onBack={() => setSelectedQuestionId('')}
        onNavigate={nextIndex => setSelectedQuestionId(domainQuestions[nextIndex].id)}
        onAttempt={onAttempt}
        notify={notify}
      /> : <>
        <header className="domain-browser-heading"><div><span className="eyebrow">TOPIC LIBRARY</span><h1>{selectedDomain}</h1><p>Choose a topic to open a related sample question. More questions will be added to each topic.</p></div><span className="domain-browser-total">{categories.reduce((sum, category) => sum + category.topics.length, 0)} topics</span></header>
        <div className="topic-category-list">{categories.map((category, categoryIndex) => {
          return <section className="topic-category-card" id={`topic-category-${categoryIndex}`} key={category.category}>
            <header><span className="topic-category-number">{String(categoryIndex + 1).padStart(2, '0')}</span><h2>{category.category}</h2><span>{category.topics.length} topics</span></header>
            <div className="topic-list">{category.topics.map((topic, topicIndex) => {
              const related = getTopicSample(topic, category.category, topicIndex);
              return <button key={topic} className="topic-row" onClick={() => openTopic(topic, category.category, topicIndex)}>
                <span className="topic-row-title">{topic}</span><span className="topic-row-problem">{related ? `Sample · ${related.skill}` : 'Practice'}</span><ChevronRight size={16} />
              </button>;
            })}</div>
          </section>;
        })}</div>
      </>}
    </div>
  </div>;
}

function QuestionView({ question, index, total, isBookmarked, onToggleBookmark, onBack, onNavigate, onAttempt, notify }) {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState('');
  const [calculatorPosition, setCalculatorPosition] = useState({ x: Math.max(16, window.innerWidth - 500), y: 120 });
  const [calculatorWidth, setCalculatorWidth] = useState(420);
  const [dockWidth, setDockWidth] = useState(Math.min(430, Math.round(window.innerWidth * 0.4)));
  const [calculatorDragging, setCalculatorDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const floatingWindowRef = useRef(null);

  useEffect(() => {
    if (!calculatorDragging) return undefined;
    const move = event => {
      const width = floatingWindowRef.current?.getBoundingClientRect().width || calculatorWidth;
      const height = floatingWindowRef.current?.getBoundingClientRect().height || 360;
      const x = Math.max(8, Math.min(window.innerWidth - width - 8, event.clientX - dragOffset.current.x));
      const y = Math.max(8, Math.min(window.innerHeight - Math.min(height, 100), event.clientY - dragOffset.current.y));
      setCalculatorPosition({ x, y });
      if (event.clientX >= window.innerWidth - 32) {
        setCalculatorMode('docked');
        setCalculatorDragging(false);
      }
    };
    const stop = () => setCalculatorDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, [calculatorDragging, calculatorWidth]);

  async function checkAnswer() {
    if (!selected || submitting || result) return;
    setSubmitting(true);
    try {
      setResult(await onAttempt(question.id, selected));
    } catch (error) {
      notify(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return <div className={`question-layout ${calculatorMode === 'docked' ? 'question-layout-docked' : ''}`}>
   <article className="question-view">
    <header className="question-view-header"><button className="back-link" onClick={onBack}><ArrowLeft size={16} /> {question.domain}</button><div className="question-view-actions"><button className={`calculator-toggle ${calculatorMode ? 'calculator-active' : ''}`} onClick={() => setCalculatorMode(mode => mode ? '' : 'floating')} aria-label={calculatorMode ? 'Close graphing calculator' : 'Open graphing calculator'} aria-pressed={Boolean(calculatorMode)}><Calculator size={19} /><span>{calculatorMode ? 'Calculator open' : 'Calculator'}</span></button><button className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`} onClick={onToggleBookmark} aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark question'} aria-pressed={isBookmarked}><Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} /><span>{isBookmarked ? 'Saved' : 'Bookmark'}</span></button></div></header>
    <div className="question-view-content">
      <div className="question-meta"><span>QUESTION {index + 1} OF {total}</span><span>{question.skill}</span><span>{question.difficulty}</span></div>
      <h1>{question.prompt}</h1>
      <div className="choice-list">{question.choices.map((choice, choiceIndex) => <label className={`choice-option ${selected === choice ? 'choice-selected' : ''}`} key={choice}><input type="radio" name={question.id} value={choice} checked={selected === choice} disabled={Boolean(result)} onChange={() => setSelected(choice)} /><span className="choice-letter">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span></label>)}</div>
      {!result ? <button className="btn-primary check-answer" onClick={checkAnswer} disabled={!selected || submitting}>{submitting ? 'Checking…' : 'Check answer'} <Check size={16} /></button> : <div className={`answer-feedback ${result.correct ? 'correct' : 'incorrect'}`}><strong>{result.correct ? 'Correct!' : `Not quite. The answer is ${result.answer}.`}</strong><p>{result.explanation}</p></div>}
    </div>
    <footer className="question-navigation"><span>{index + 1} / {total}</span><div><button className="btn-secondary" onClick={() => onNavigate(index - 1)} disabled={index === 0}><ArrowLeft size={16} /> Back</button><button className="btn-primary" onClick={() => onNavigate(index + 1)} disabled={index === total - 1}>Next <ArrowRight size={16} /></button></div></footer>
   </article>
   {calculatorMode === 'docked' && <div className="calculator-dock" style={{ flexBasis: `${dockWidth}px` }}>
     <button className="calculator-divider" aria-label="Resize calculator panel" onPointerDown={event => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={event => { if (event.buttons === 1) setDockWidth(Math.max(280, Math.min(window.innerWidth * 0.65, window.innerWidth - event.clientX))); }} />
     <CalculatorPanel onUndock={() => { setCalculatorPosition({ x: Math.max(8, window.innerWidth - dockWidth - 24), y: 100 }); setCalculatorMode('floating'); }} onClose={() => setCalculatorMode('')} />
   </div>}
   {calculatorMode === 'floating' && <section ref={floatingWindowRef} className={`calculator-floating${calculatorDragging ? ' calculator-dragging' : ''}`} style={{ left: calculatorPosition.x, top: calculatorPosition.y, width: calculatorWidth }} aria-label="Floating Desmos graphing calculator">
     <header className="calculator-floating-header" onPointerDown={event => { if (event.target.closest('button')) return; dragOffset.current = { x: event.clientX - calculatorPosition.x, y: event.clientY - calculatorPosition.y }; setCalculatorDragging(true); }}>
       <span><Grip size={15} /> Graphing calculator</span><div><button onClick={() => setCalculatorMode('docked')} aria-label="Dock calculator to the right">Dock right</button><button onClick={() => setCalculatorMode('')} aria-label="Close calculator"><X size={17} /></button></div>
     </header>
     <CalculatorPanel />
   </section>}
  </div>;
}

function CalculatorPanel({ onUndock, onClose }) {
  return <div className="calculator-panel">
    <iframe title="Interactive Desmos graphing calculator" src="https://www.desmos.com/calculator?embed" loading="lazy" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
    <p className="calculator-note">Interactive Desmos calculator. Third-party privacy terms apply.{onUndock && <button onClick={onUndock}>Undock</button>}{onClose && <button onClick={onClose} aria-label="Close calculator"><X size={15} /></button>}</p>
  </div>;
}

function QuestionCollection({ title, subtitle, icon: Icon, questions, onOpen, emptyText }) {
  return <>
    <div className="page-intro"><div><div className="eyebrow">YOUR STUDY SPACE</div><h1><Icon size={25} /> {title}<span className="period">.</span></h1><p>{subtitle}</p></div><div className="bank-total"><strong>{questions.length}</strong><span>questions</span></div></div>
    {questions.length ? <div className="collection-question-list">{questions.map((question, index) => <button className="collection-question-row" key={question.id} onClick={() => onOpen(question)}>
      <span className="collection-question-number">{String(index + 1).padStart(2, '0')}</span><span className="collection-question-details"><strong>{question.skill}</strong><small>{question.domain} · {question.difficulty}</small></span><ChevronRight size={17} />
    </button>)}</div> : <div className="empty-state"><div className="empty-egg"><Egg size={30} /></div><h3>Nothing here yet.</h3><p>{emptyText}</p></div>}
  </>;
}

function NotesPage({ notesData, selectedFolder, setSelectedFolder, newFolderName, setNewFolderName, renameFolderName, setRenameFolderName, onCreateFolder, onRenameFolder, onCreateNote, onOpenNote }) {
  const visibleNotes = notesData.notes.filter(note => selectedFolder === 'all' || note.folderId === selectedFolder);
  const activeFolder = notesData.folders.find(folder => folder.id === selectedFolder);
  return <>
    <div className="page-intro"><div><div className="eyebrow">YOUR PRIVATE STUDY SPACE</div><h1>Notes<span className="period">.</span></h1><p>Keep formulas, reminders, and visual study guides together.</p></div><button className="btn-primary" onClick={onCreateNote}><Plus size={17} /> New note</button></div>
    <section className="notes-organizer">
      <div className="notes-folders">
        <label htmlFor="notes-folder-filter">Folder</label>
        <select id="notes-folder-filter" value={selectedFolder} onChange={event => { setSelectedFolder(event.target.value); setRenameFolderName(''); }}>
          <option value="all">All notes</option>
          {notesData.folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
        </select>
        <form onSubmit={onCreateFolder}><input aria-label="New folder name" maxLength={60} value={newFolderName} onChange={event => setNewFolderName(event.target.value)} placeholder="New folder name" /><button className="btn-secondary" type="submit" disabled={!newFolderName.trim()}><Plus size={15} /> Add folder</button></form>
        {activeFolder && <form onSubmit={onRenameFolder}><input aria-label="Rename selected folder" maxLength={60} value={renameFolderName} onChange={event => setRenameFolderName(event.target.value)} placeholder={`Rename ${activeFolder.name}`} /><button className="btn-secondary" type="submit" disabled={!renameFolderName.trim()}>Rename</button></form>}
      </div>
      {visibleNotes.length
        ? <div className="notes-grid">{visibleNotes.map(note => <button className="note-summary-card" key={note.id} onClick={() => onOpenNote(note)}>
          <span className="note-summary-folder">{notesData.folders.find(folder => folder.id === note.folderId)?.name || 'General'}</span>
          <strong>{note.title.trim() || 'Untitled note'}</strong>
          <span className="note-summary-body">{note.body || 'No note text yet.'}</span>
          {note.images.length > 0 && <span className="note-image-preview">{note.images.slice(0, 3).map((image, index) => <img src={image} alt="" key={`${note.id}-image-${index}`} />)}</span>}
          <span className="note-summary-date">Updated {new Date(note.updatedAt || Date.now()).toLocaleDateString()}</span>
        </button>)}</div>
        : <div className="empty-state"><NotebookPen size={26} className="notes-heading-icon" /><h3>{selectedFolder === 'all' ? 'Your notes start here.' : 'No notes in this folder yet.'}</h3><p>Create a note to collect ideas, formulas, and images.</p><button className="btn-secondary" onClick={onCreateNote}><Plus size={16} /> Create a note</button></div>}
    </section>
  </>;
}

function NoteEditor({ note, setNote, onSaveExit, onClose, onUploadImage }) {
  const bodyRef = useRef(null);
  function insertMarkdown(prefix, suffix = prefix) {
    const input = bodyRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = note.body.slice(start, end) || 'text';
    const body = `${note.body.slice(0, start)}${prefix}${selected}${suffix}${note.body.slice(end)}`;
    setNote(current => ({ ...current, body }));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  }
  return <div className="note-editor-backdrop" role="presentation">
    <section className="note-editor" role="dialog" aria-modal="true" aria-labelledby="note-editor-title">
      <header className="note-editor-header"><div><span className="eyebrow">YOUR PRIVATE STUDY SPACE</span><h2 id="note-editor-title">Edit note</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close note editor"><X size={20} /></button></header>
      <div className="note-editor-content">
        <label className="note-title-field">Title<input value={note.title} maxLength={120} onChange={event => setNote(current => ({ ...current, title: event.target.value }))} placeholder="Give this note a title" /></label>
        <div className="note-formatting">
          <button type="button" onClick={() => insertMarkdown('**')} aria-label="Bold selected text"><strong>B</strong></button>
          <button type="button" onClick={() => insertMarkdown('_')} aria-label="Italicize selected text"><em>I</em></button>
          <button type="button" onClick={() => insertMarkdown('## ', '')} aria-label="Add a heading">H</button>
          <button type="button" onClick={() => insertMarkdown('- ', '')} aria-label="Add a list item">List</button>
          <label className="note-image-upload"><ImagePlus size={16} /> Add image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUploadImage} /></label>
          <span>Formatting uses simple Markdown</span>
        </div>
        <textarea ref={bodyRef} className="note-body-editor" value={note.body} maxLength={50000} onChange={event => setNote(current => ({ ...current, body: event.target.value }))} placeholder="Write your notes here…" />
        <section className="note-body-preview"><span>Preview</span>{renderNoteBody(note.body)}</section>
        {note.images.length > 0 && <div className="note-editor-images">{note.images.map((image, index) => <div className="note-editor-image" key={`${note.id}-editor-image-${index}`}><img src={image} alt={`Note attachment ${index + 1}`} /><button type="button" onClick={() => setNote(current => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Remove image ${index + 1}`}><X size={15} /></button></div>)}</div>}
      </div>
      <footer className="note-editor-footer"><span>{note.body.length.toLocaleString()} / 50,000 characters · {note.images.length} / 5 images</span><div><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" onClick={onSaveExit}>Save &amp; Exit <Check size={16} /></button></div></footer>
    </section>
  </div>;
}

function renderNoteBody(body) {
  const renderInline = (text, keyPrefix) => text.split(/(\*\*.+?\*\*|_.+?_)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_')) return <em key={`${keyPrefix}-${index}`}>{part.slice(1, -1)}</em>;
    return part;
  });
  const lines = body.split('\n');
  if (!body.trim()) return <p className="note-preview-empty">A formatted preview will appear here.</p>;
  return <div className="note-preview-content">{lines.map((line, index) => {
    if (line.startsWith('## ')) return <h3 key={index}>{renderInline(line.slice(3), `heading-${index}`)}</h3>;
    if (line.startsWith('- ')) return <div className="note-preview-list-item" key={index}>• {renderInline(line.slice(2), `list-${index}`)}</div>;
    return <p key={index}>{renderInline(line, `line-${index}`)}</p>;
  })}</div>;
}

function ProfilePage({ profile, activity, avatar, setAvatar, onSaveAvatar }) {
  return <>
    <div className="page-intro"><div><div className="eyebrow">ACCOUNT & CHICKEN CUSTOMIZER</div><h1>My profile<span className="period">.</span></h1><p>Manage your study identity and see how far you’ve come.</p></div></div>
    <section className="profile-hero"><div className="profile-avatar-bg"><Chick {...avatar} /></div><div className="profile-hero-text"><span className="eyebrow">YOUR STUDY ACCOUNT</span><h2>{profile.name}</h2><p>{profile.email}</p><div className="profile-tags"><span>{profile.level}</span><span>{profile.xp} XP</span><span>{profile.membership}</span></div></div></section>
    <section className="profile-highlight-stats">
      <article><div className="stat-icon purple"><Target size={19} /></div><span>Predicted SAT score</span><strong>{profile.estimatedScore || '—'}</strong><small>{profile.estimatedScore ? 'Current estimate' : 'Not enough practice data for a reliable estimate yet.'}</small></article>
      <article><div className="stat-icon orange"><Flame size={19} /></div><span>Current daily streak</span><strong>{profile.streak} <small>days</small></strong><small>Keep practicing daily to protect your streak.</small></article>
    </section>
    <AvatarCustomizer avatar={avatar} setAvatar={setAvatar} xp={profile.xp} onSave={onSaveAvatar} />
    <section className="stats-grid profile-stats"><StatCard icon={BookOpen} label="Questions answered" value={profile.questionsSolved} foot="Lifetime attempts" tone="green" /><StatCard icon={Check} label="Accuracy" value={`${profile.accuracy}%`} foot="Correct answers / attempts" tone="purple" /><StatCard icon={Sparkles} label="Experience" value={`${profile.xp} XP`} foot={profile.level} tone="yellow" /></section>
    <section className="content-card activity-card"><div className="section-heading"><div><span className="eyebrow">LITTLE BY LITTLE</span><h2>Your practice rhythm</h2><p>Answered questions, last seven days</p></div></div><div className="activity-chart">{activity.map(day => <div className="activity-column" key={day.day}><span className="bar-value">{day.count}</span><div className="bar-track"><div className="bar" style={{ height: `${Math.min(100, day.count / Math.max(1, ...activity.map(item => item.count)) * 100)}%` }} /></div><span className="bar-day">{day.day}</span></div>)}</div></section>
  </>;
}

function AvatarCustomizer({ avatar, setAvatar, xp, onSave }) {
  const update = (key, value) => setAvatar(current => ({ ...current, [key]: value }));
  const colors = {
    body: ['#F4C95D', '#F2B9A8', '#FFF0D5', '#C8D5BE', '#B9C6E4'],
    shirt: [
      { color: '#7D9D86', requiredXp: 0 }, { color: '#E47B5D', requiredXp: 0 }, { color: '#7E8DBD', requiredXp: 0 },
      { color: '#D99ECA', requiredXp: 0 }, { color: '#2E342B', requiredXp: 0 }, { color: '#F0D46D', requiredXp: 0 },
      { color: '#4A5C8A', requiredXp: 250 }, { color: '#C76876', requiredXp: 500 }, { color: '#5A7961', requiredXp: 750 }
    ],
    shoes: ['#E47B5D', '#2E342B', '#6B86A8', '#F7F1E5']
  };
  return <section className="avatar-customizer content-card" aria-labelledby="custom-title">
    <header className="avatar-customizer-heading"><div><div className="eyebrow">MAKE IT YOURS</div><h2 id="custom-title">Style your chick<span className="period">.</span></h2><p>Earn XP to unlock new colors, patterns, and decals.</p></div><span className="avatar-xp-badge"><Sparkles size={15} /> {xp} XP</span></header>
    <div className="avatar-customizer-body">
      <div className="custom-preview"><div className="preview-sun" /><Chick {...avatar} /><span>YOUR CHICK</span></div>
      <div className="custom-options">
        <ColorPicker label="Feather color" colors={colors.body} selected={avatar.body} onSelect={value => update('body', value)} />
        <ColorPicker label="Shirt color" colors={colors.shirt} selected={avatar.shirt} onSelect={value => update('shirt', value)} xp={xp} />
        <UnlockPicker label="Shirt cut" options={[['crew', 'Classic', 0], ['pocket', 'Pocket', 100], ['stripes', 'Stripes', 200]]} selected={avatar.shirtStyle} xp={xp} onSelect={value => update('shirtStyle', value)} />
        <UnlockPicker label="Fabric pattern" options={[['none', 'Solid', 0], ['dots', 'Dots', 400], ['stars', 'Stars', 700]]} selected={avatar.shirtPattern || 'none'} xp={xp} onSelect={value => update('shirtPattern', value)} />
        <UnlockPicker label="Shirt decal" options={[['none', 'None', 0], ['chick', 'Chick', 500], ['lightning', 'Lightning', 900]]} selected={avatar.decal || 'none'} xp={xp} onSelect={value => update('decal', value)} />
        <ColorPicker label="Shoes" colors={colors.shoes} selected={avatar.shoes} onSelect={value => update('shoes', value)} />
      </div>
    </div>
    <footer className="avatar-customizer-footer"><span>Items with a lock show the XP needed to unlock them.</span><button className="btn-primary" onClick={onSave}>Save my chick <Check size={16} /></button></footer>
  </section>;
}

function ColorPicker({ label, colors, selected, onSelect, xp = Infinity }) {
  return <div className="option-group"><label>{label}</label><div className="color-options">{colors.map(item => {
    const option = typeof item === 'string' ? { color: item, requiredXp: 0 } : item;
    const locked = option.requiredXp > xp;
    return <button type="button" key={option.color} aria-label={`${label}: ${option.color}${locked ? `, unlocks at ${option.requiredXp} XP` : ''}`} aria-pressed={selected === option.color} aria-disabled={locked} title={locked ? `Unlock at ${option.requiredXp} XP` : option.color} className={`color-swatch ${selected === option.color ? 'swatch-active' : ''} ${locked ? 'swatch-locked' : ''}`} style={{ background: option.color }} onClick={() => !locked && onSelect(option.color)}>{locked && <Lock size={12} />}</button>;
  })}</div>{colors.some(item => typeof item !== 'string' && item.requiredXp > xp) && <small className="unlock-hint">Earn XP to unlock more colors.</small>}</div>;
}

function UnlockPicker({ label, options, selected, xp, onSelect }) {
  return <div className="option-group"><label>{label}</label><div className="style-options">{options.map(([value, name, requiredXp]) => {
    const locked = requiredXp > xp;
    return <button type="button" key={value} className={`${selected === value ? 'style-active' : ''} ${locked ? 'style-locked' : ''}`} aria-disabled={locked} title={locked ? `Unlock at ${requiredXp} XP` : name} onClick={() => !locked && onSelect(value)}>{name}{locked && <span><Lock size={11} /> {requiredXp} XP</span>}</button>;
  })}</div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
