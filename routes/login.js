const express = require('express');
const router = express.Router();
const Database = require('../Database');

const config = require('../config');
	
//Variaveis para armazenar os dados do formulário
	var email, senha;

	var senhaBanco = 0;

//Variavel para armazenar os dados que virão do banco


router.post('/', (req, res, next) => {

	//INICIO - Pegando valores do form de login
	email = req.body.email;
	senha = req.body.senha;
	//FIM - Pegando valores do form de login

	console.log(`Email: ${email}, Senha: ${senha}`);

	verificarLogin(email, res, req).then(existe => { // Função para verificar se existe algum login com o email digitado
		logar = existe; // <-- Armazena o resultado que foi buscado da função verificar login, caso seja true pode logar caso n seja, usuário n encontrado
		console.log('Logar:', logar);
			
			if(senhaBanco == 0){ // Verifica se a senha vinda do banco n é nula
				next; // Caso seja, ele pela todo resto e manda uma mensagem de erro para o cliente
			}

			if(senhaBanco === senha){ //  Compara a senha desencriptada do banco, com a senha que o usuário digitou

				// Caso de true, usuário logado e redirecionado para tela Home do sistema interno

				console.log("correto");
				res.status(200).send('ok');
				// res.json(dadosUsuarios); // Envia um objeto json para o html, com as informações do cliente, para utilizarmos nas sessões
			}else{ // Caso a senha digitada n seja a identica a do banco, um erro de senha incorreta é lançado ao cliente;
				console.log("erro");
				res.status(200).send('erro1');
			}

		
	});

});

//Função para verificar o login do usuário
function verificarLogin(email, res, req) {
	// stringSql para verificar se existe um usuário cadastrado com o email digitado pelo usuário
    let querystring = `SELECT * FROM formularioCadastro WHERE email = '${email}'`;

    return new Promise((resolve, reject) => { // Função para executar o select na tabela tbUsuario
        Database.query(querystring).then(results => { // Função que executa o select
                let existe = results.recordsets[0].length > 0; // Caso exista um registro com esse email, é retornado e colocado com true na variavel existe

                if(existe > 0){ // Caso Existe seja true executa as linhas abaixo
                	results = results.recordsets[0]; // Armazena o retorno na variavel results
	                senhaBanco = results[0].senha; // Pega a senha cadastrada no registro encontrado e a coloca na variavel global
	              
                }

				resolve(results);

            }).catch(error => {
                reject(error);
            });
        }); 
}





//não mexer
module.exports = router;