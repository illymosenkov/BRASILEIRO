function links(items){
  return '<div class="chips course-links">'+items.map(([id,title])=>'<button class="chip" data-go="'+id+'">'+title+'</button>').join('')+'</div>';
}
Bora.afterPage=s=>{
  if(s==='home'){
    const p=ensureCalendar();
    const daily=$('view').querySelector('.daily');if(daily)daily.outerHTML=dailyCard(p);
    if(state.practice&&!state.practice.finished&&!state.practice.date)$('view').querySelector('.daily')?.insertAdjacentHTML('afterend','<button class="btn secondary wide" data-resume-practice>Продолжить свободную тренировку</button>');
  }
  if(s==='profile')$('view').querySelector('.backup-card')?.insertAdjacentHTML('beforebegin',measuredStats());
  if(s==='home'||s==='profile')$('view').querySelector('.content')?.insertAdjacentHTML('afterbegin',links([['calendar','Учебный план'],['blocks','Короткие темы'],['grammar','Спряжения'],['reviews','Повторения'],['weak','Слабые слова'],['preferences','Настройки']]));
};
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&state&&state.calendarDay!==localDay()&&['home','calendar'].includes(screen))go(screen);
});
state=bootStorage();
go('home');
