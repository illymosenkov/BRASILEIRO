function links(items){
  return '<div class="chips course-links">'+items.map(([id,title])=>'<button class="chip" data-go="'+id+'">'+title+'</button>').join('')+'</div>';
}
Bora.afterPage=s=>{
  if(s==='home'||s==='profile')$('view').querySelector('.content')?.insertAdjacentHTML('afterbegin',links([['grammar','Спряжения'],['reviews','Повторения'],['weak','Слабые слова'],['preferences','Настройки']]));
};
go('home');
