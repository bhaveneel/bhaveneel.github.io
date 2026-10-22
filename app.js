const STORAGE_KEY = 'safesignal-field-project-v1';

const preQuestions = [
  {topic:'PHISHING & LINKS',scenario:'A message says your college email will be disabled in 10 minutes unless you sign in at “campus-verify.example”.',text:'What is the safest next step?',options:['Tap the link quickly so your account stays active.','Open your college’s known website or app and check there.','Reply with your student ID to confirm it is you.','Forward the message to classmates to ask if it is real.'],answer:1,explanation:'Urgency and an unfamiliar web address are warning signs. Check using a known official channel instead of the message link.'},
  {topic:'PHISHING & LINKS',scenario:'A social media account that looks like your friend asks you to urgently send money. The writing feels unusual.',text:'How should you verify the request?',options:['Send a small amount first.','Ask for their birthday in the chat.','Contact your friend through a different, known channel.','Trust it because the profile photo is familiar.'],answer:2,explanation:'A profile can be impersonated or compromised. Verify an unusual request through a separate contact method you already trust.'},
  {topic:'PASSWORDS & MFA',scenario:'You have several accounts and currently use the same password for all of them.',text:'Which change best reduces the risk from one exposed password?',options:['Change it slightly on each site, like adding “1”.','Use a unique password for each account and turn on MFA.','Share the password with a friend for safekeeping.','Change passwords only after you hear about a breach.'],answer:1,explanation:'Unique passwords limit password reuse, and multi-factor authentication adds another layer if a password is stolen.'},
  {topic:'PASSWORDS & MFA',scenario:'A classmate messages you asking for the one-time code that just arrived on your phone, saying they need it to help you log in.',text:'What should you do?',options:['Send the code if the classmate knows your name.','Share only the first few digits.','Do not share it; verify the situation through an official channel.','Post it in the class group so someone can help.'],answer:2,explanation:'Keep one-time codes private. A legitimate support person should not need you to send them your authentication code.'},
  {topic:'UPI & PAYMENT SAFETY',scenario:'A buyer says they are sending you money and asks you to enter your UPI PIN to “accept” it.',text:'What is the safest response?',options:['Enter the PIN if the amount looks correct.','Decline. You do not need a UPI PIN to receive money.','Share an OTP instead of the PIN.','Scan a QR code they sent to confirm receipt.'],answer:1,explanation:'CERT-In advises that you do not need a UPI PIN or OTP to receive money. Never enter a PIN to accept incoming funds.'},
  {topic:'UPI & PAYMENT SAFETY',scenario:'You notice a payment you did not make. You still have the transaction notification.',text:'What should you do first?',options:['Wait a few days to see if it reverses.','Post your bank details online to warn others.','Contact your bank or payment provider and report promptly via 1930 / cybercrime.gov.in.','Reply to the caller who says they can refund it for a fee.'],answer:2,explanation:'Act promptly: contact your bank or payment provider, and report online financial fraud in India via 1930 or cybercrime.gov.in.'}
];

const postQuestions = [
  {topic:'PHISHING & LINKS',scenario:'You receive an unexpected “scholarship approved” email. It asks you to sign in through a shortened link before midnight.',text:'What is the safest way to check whether it is genuine?',options:['Use the link because it has your name.','Go to the scholarship provider through its official site or a known contact.','Reply with your date of birth to confirm eligibility.','Open it on a public computer instead.'],answer:1,explanation:'Shortened links and deadlines can hide a scam. Verify the offer using a known official site or contact.'},
  {topic:'PHISHING & LINKS',scenario:'A message from a familiar-looking delivery service says a small fee is needed to release a parcel. You were not expecting a message.',text:'Which action is safest?',options:['Use the message link and pay the small amount.','Check delivery status in the official app or website you open yourself.','Send your card details by reply.','Trust it if the logo looks correct.'],answer:1,explanation:'Logos can be copied. Check directly in the official app or site, rather than using an unexpected payment link.'},
  {topic:'PASSWORDS & MFA',scenario:'You want to improve security for your email and social accounts.',text:'Which plan gives you better protection?',options:['Use one memorable password everywhere.','Use unique long passwords, a password manager or passkeys, and MFA where available.','Save your password in a shared class document.','Turn off MFA because it takes extra time.'],answer:1,explanation:'Unique passwords help contain exposure. A password manager or passkey and MFA can make sign-ins safer and easier.'},
  {topic:'PASSWORDS & MFA',scenario:'A pop-up on a website says “Your account is at risk—tell our agent the verification code to secure it.”',text:'What should you do with the code?',options:['Share it because the pop-up uses security language.','Read it only if the agent knows your email address.','Keep it private and contact the service using its official app or site.','Send it after changing your password.'],answer:2,explanation:'Security language can be used to pressure people. Do not share authentication codes; check your account through official channels.'},
  {topic:'UPI & PAYMENT SAFETY',scenario:'Someone says they sent money to you by mistake and asks you to scan a QR code to return it.',text:'How should you handle this?',options:['Scan it and enter your UPI PIN to receive the refund.','Check your payment app directly and contact your bank/provider if needed.','Share an OTP so they can reverse the transfer.','Install the app they recommend.'],answer:1,explanation:'A QR code or PIN action may authorize a payment. Check your own app and use your bank or payment provider’s official support.'},
  {topic:'UPI & PAYMENT SAFETY',scenario:'A caller pretends to be bank support and says your money will disappear unless you act now and install a screen-sharing app.',text:'What should you do?',options:['Install it so the caller can protect your account.','Share your OTP but not your PIN.','End the call, contact your bank using a trusted number, and report the fraud promptly if money is lost.','Move your money to the account they provide.'],answer:2,explanation:'Pressure, requests for codes and remote access are serious red flags. Call your bank using a trusted number; report financial cyber fraud in India via 1930 or cybercrime.gov.in.'}
];

const views = {
  home: document.getElementById('home-view'),
  quiz: document.getElementById('quiz-view'),
  lesson: document.getElementById('lesson-view'),
  results: document.getElementById('results-view')
};
const $ = id => document.getElementById(id);
let state = loadState();
let phase = 'pre';
let questionIndex = 0;
let selectedIndex = null;
let answeredCurrent = false;

function loadState(){
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && ['pre','lesson','post','results'].includes(parsed.stage)) return parsed;
  } catch (_) { /* Start fresh if local browser storage is unavailable. */ }
  return {stage:'home',preAnswers:[],postAnswers:[]};
}
function saveState(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* The activity still works for this visit. */ }
}
function showView(name){
  Object.entries(views).forEach(([key,view])=>{view.hidden=key!==name;});
  $('reset-button').hidden=name==='home';
  if(name!=='home') window.scrollTo({top:0,behavior:'smooth'});
}
function beginQuiz(which){
  phase=which;
  questionIndex=(which==='pre'?state.preAnswers:state.postAnswers).length;
  selectedIndex=null; answeredCurrent=false;
  state.stage=which; saveState(); renderQuestion(); showView('quiz');
}
function activeQuestions(){return phase==='pre'?preQuestions:postQuestions;}
function renderQuestion(){
  const questions=activeQuestions(), q=questions[questionIndex];
  selectedIndex=null; answeredCurrent=false;
  $('quiz-kicker').textContent=phase==='pre'?'BEFORE THE LESSON':'AFTER THE LESSON';
  $('quiz-heading').textContent=phase==='pre'?'Quick knowledge check':'Put it into practice';
  $('quiz-step').textContent=`Question ${questionIndex+1} of ${questions.length}`;
  $('question-number').textContent=String(questionIndex+1).padStart(2,'0');
  $('quiz-aside-copy').textContent=phase==='pre'?'Go with what you would do in real life. There are no trick questions.':'Choose the safest next step. You’ll see a short explanation after each answer.';
  $('quiz-aside-label').textContent=phase==='pre'?'BASELINE CHECK':'PRACTICE CHECK';
  $('topic-tag').textContent=q.topic; $('question-text').textContent=q.text;
  const scenario=$('question-scenario'); scenario.textContent=q.scenario; scenario.hidden=!q.scenario;
  $('progress-fill').style.width=`${(questionIndex/questions.length)*100}%`;
  $('progress-fill').setAttribute('aria-valuenow',String(questionIndex));
  const options=$('options'); options.replaceChildren();
  q.options.forEach((label,index)=>{
    const button=document.createElement('button'); button.type='button'; button.className='option'; button.setAttribute('aria-pressed','false');
    const letter=document.createElement('span'); letter.className='option-letter'; letter.textContent=String.fromCharCode(65+index);
    const text=document.createElement('span'); text.textContent=label; button.append(letter,text);
    button.addEventListener('click',()=>selectAnswer(index)); options.append(button);
  });
  $('feedback').hidden=true; $('feedback').className='feedback'; $('feedback').textContent='';
  $('select-hint').textContent='Choose one answer to continue'; $('next-button').disabled=true;
  $('next-button').textContent=questionIndex===questions.length-1?(phase==='pre'?'Continue to the guide':'See my results')+' →':'Continue →';
}
function selectAnswer(index){
  if(answeredCurrent)return;
  selectedIndex=index;
  const buttons=[...$('options').querySelectorAll('.option')];
  buttons.forEach((button,i)=>{button.classList.toggle('selected',i===index);button.setAttribute('aria-pressed',String(i===index));});
  $('next-button').disabled=false;
  if(phase==='post'){
    answeredCurrent=true;
    const q=activeQuestions()[questionIndex], correct=index===q.answer;
    buttons.forEach((button,i)=>{button.disabled=true;if(i===q.answer)button.classList.add('correct');else if(i===index&&!correct)button.classList.add('incorrect');});
    const feedback=$('feedback'); feedback.hidden=false; feedback.classList.toggle('wrong',!correct);
    feedback.innerHTML=`<strong>${correct?'That’s the safer choice.':'A safer choice would be different.'}</strong>${q.explanation}`;
    $('select-hint').textContent=correct?'Correct answer':'Review the explanation, then continue';
  }
}
function nextQuestion(){
  if(selectedIndex===null)return;
  const q=activeQuestions()[questionIndex];
  if(phase==='pre') state.preAnswers[questionIndex]=selectedIndex===q.answer;
  else state.postAnswers[questionIndex]=selectedIndex===q.answer;
  saveState();
  if(questionIndex<activeQuestions().length-1){questionIndex++;renderQuestion();return;}
  $('progress-fill').style.width='100%';
  $('progress-fill').setAttribute('aria-valuenow',String(activeQuestions().length));
  if(phase==='pre'){
    state.stage='lesson';saveState();showView('lesson');
  }else{
    state.stage='results';saveState();renderResults();showView('results');
  }
}
function score(answers){return answers.filter(Boolean).length;}
function renderResults(){
  const before=score(state.preAnswers||[]),after=score(state.postAnswers||[]),total=preQuestions.length;
  const beforePct=Math.round(before/total*100),afterPct=Math.round(after/total*100),gain=afterPct-beforePct;
  $('before-score').textContent=`${beforePct}%`; $('after-score').textContent=`${afterPct}%`;
  $('before-count').textContent=`${before} of ${total} correct`; $('after-count').textContent=`${after} of ${total} correct`;
  $('before-bar').style.width=`${beforePct}%`; $('after-bar').style.width=`${afterPct}%`;
  $('score-gain').textContent=`${gain>0?'+':''}${gain}`;
  $('score-caption').textContent=gain>0?'More correct answers after the guide.':gain<0?'Review the guide tips and try again.':'Your score was the same in both check-ins.';
}
function downloadAnonymousScore(){
  const before=score(state.preAnswers||[]),after=score(state.postAnswers||[]),total=preQuestions.length;
  const beforePct=Math.round(before/total*100),afterPct=Math.round(after/total*100);
  const rows=[
    'before_correct,before_total,after_correct,after_total,score_change_percentage_points',
    `${before},${total},${after},${total},${afterPct-beforePct}`
  ];
  const blob=new Blob([rows.join('\n')+'\n'],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='safe-signal-anonymous-score.csv';
  document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function reset(){
  state={stage:'home',preAnswers:[],postAnswers:[]};
  try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* The current page still resets. */ }
  showView('home');
}
function resume(){
  if(state.stage==='pre'){beginQuiz('pre');return;}
  if(state.stage==='lesson'){showView('lesson');return;}
  if(state.stage==='post'){beginQuiz('post');return;}
  if(state.stage==='results'){renderResults();showView('results');return;}
  showView('home');
}

$('start-button').addEventListener('click',()=>beginQuiz('pre'));
$('next-button').addEventListener('click',nextQuestion);
$('posttest-button').addEventListener('click',()=>beginQuiz('post'));
$('again-button').addEventListener('click',reset);
$('export-button').addEventListener('click',downloadAnonymousScore);
$('reset-button').addEventListener('click',reset);
document.querySelectorAll('[data-home]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();reset();}));
resume();
