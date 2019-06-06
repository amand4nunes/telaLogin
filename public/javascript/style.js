function validar_cad( ){
    var dados = $("#logar").serialize(); //controle de formulario
    console.log(dados);
    $.ajax({ //ponte servidor 
        url:"../login",
        type:"post",
        data: dados//chamando arquivo externo de configuração

    }).done(function(resposta){
        if(resposta== 'ok'){
            
            window.location = "index.html";

        }
        else{
            alert("senha ou email incorretos");
        }
    });
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