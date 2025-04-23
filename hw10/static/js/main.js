$(function(){
  $('#submit-btn').click(()=>{
    const sel=$('input[name=answer]:checked').val();
    if(!sel)return alert('Please select an option.');
    $.post(`/submit_quiz/${page}`,{answer:sel},r=>{
      $('#feedback').html(r.correct?'<span class="text-success">CORRECT</span>':'<span class="text-danger">WRONG</span>');
    });
  });
  $('#next-btn').click(()=>window.location.href=`/quiz/${page+1}`);
  $('#back-btn').click(()=>window.location.href=`/quiz/${page-1}`);
});