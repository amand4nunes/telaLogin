function validar_cad(nome,key){
   
    if (nome == "amanda" && key == "amarelo") {
    window.location = "index.html";
  }
  else{
    alert("Dados incorretos, tente novamente");
  }
}
function cadastrar(){ 
    var dados = $("#cad").serialize();
    console.log(dados);
    $.ajax({
        url:"../cadastro",
        type:"post",
        data: dados

    }).done(function(resposta){
        if(resposta== 'ok'){
            
            window.location = "login.html";

        }
        else{
            alert("Usuario existente");
        }
    });
   }
   function voltar(){
       window.location = "login.html";
   }