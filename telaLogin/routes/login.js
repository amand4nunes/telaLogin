const express = require('express');
const router = express.Router();
const Database = require('../Database');
// const Cryptr = require('cryptr');
const config = require('../config');
// const cryptr = new Cryptr(config.security.key);
	
//Variaveis para armazenar os dados do formulário
	var email, senha;

// Variavel para armazenar o id do usuario que virá do banco para logar na session
	var dadosUsuarios, idUsuario;

//Variavel para armazenar os dados que virão do banco
	var senhaBanco = 0, logradouro, cep, numero, complemento;
	var telefones = [];

router.post('/', (req, res, next) => {

	//INICIO - Pegando valores do form de login
	email = req.body.email;
	senha = req.body.senha;
	//FIM - Pegando valores do form de login

	console.log(`Email: ${email}, Senha: ${senha}`);

	verificarLogin(email, res, req).then(existe => { // Função para verificar se existe algum login com o email digitado
		logar = existe; // <-- Armazena o resultado que foi buscado da função verificar login, caso seja true pode logar caso n seja, usuário n encontrado
		console.log('Logar:', logar);
		// console.log('Senha banco:', senhaBanco);
			
			if(senhaBanco == 0){ // Verifica se a senha vinda do banco n é nula
				next; // Caso seja, ele pela todo resto e manda uma mensagem de erro para o cliente
			}else{ // Caso contrario desencripta a senha e recoloca ela na mesma variavel
				senhaBanco = cryptr.decrypt(senhaBanco);	
			}

			if(senhaBanco === senha){ //  Compara a senha desencriptada do banco, com a senha que o usuário digitou

				// Caso de true, usuário logado e redirecionado para tela Home do sistema interno

				console.log("correto");
				res.json(dadosUsuarios); // Envia um objeto json para o html, com as informações do cliente, para utilizarmos nas sessões
			}else{ // Caso a senha digitada n seja a identica a do banco, um erro de senha incorreta é lançado ao cliente;
				console.log("erro");
				res.status(200).send('erro1');
			}

		
	});

});

//Função para verificar o login do usuário
function verificarLogin(email, res, req) {
	// stringSql para verificar se existe um usuário cadastrado com o email digitado pelo usuário
    let querystring = `SELECT * FROM tbUsuario WHERE emailusuario = '${email}'`;

    return new Promise((resolve, reject) => { // Função para executar o select na tabela tbUsuario
        Database.query(querystring).then(results => { // Função que executa o select
                let existe = results.recordsets[0].length > 0; // Caso exista um registro com esse email, é retornado e colocado com true na variavel existe

                if(existe > 0){ // Caso Existe seja true executa as linhas abaixo
                	results = results.recordsets[0]; // Armazena o retorno na variavel results
	                senhaBanco = results[0].senhaUsuario; // Pega a senha cadastrada no registro encontrado e a coloca na variavel global
	                idUsuario = results[0].codUsuario; //Pega o codUsuario cadastrado no registro e o coloca na variavel global
	                // console.log(results[0].codUsuario);
	                // console.log(results[0].nomeUsuario);

	                selectEndereco().then(enderecoResult => { // Chama a função para buscar o endereço do usuário que está logando

	                	selectTelefone().then(telefoneResult => { // Chama a função para buscar o telefone do usuário que está logando
	                		
	                		// Cria um objeto json com todas as informações pessoais do usuario que está logando, para colocalas na página perfil perfil

	                		dadosUsuarios = {
			                	"codUsuario": results[0].codUsuario,
			                	"nomeUsuario": results[0].nomeUsuario,
								"cpf": results[0].cpf_cnpjUsuario,
								"emailUsuario": results[0].emailUsuario,
								"telefones": telefones,
								"cep": cep,
								"logradouro": logradouro,
								"numero": numero,
								"complemento": complemento
			                };

			                console.log(dadosUsuarios);

			                resolve(results); //Retorna os dados para quem chamou a função
	                	});

	                });

                }

                

            }).catch(error => {
                reject(error);
            });
        }); 
}

// Função para buscar o endereço do usuário que está logando
function selectEndereco(){

	return new Promise((resolve, reject) => {
		// StringSql de select para buscar o endereço do usuário
		let selectEndereco = `select cep, logradouro, numero, complemento from tbEndereco inner join tbUsuario on fkEndereco = codEndereco where codUsuario = '${idUsuario}'`;
        
        Database.query(selectEndereco).then(resEndereco => { // Função que exexuta a query com a stringSql acima
        	resEndereco = resEndereco.recordsets[0]; //Armazena os dados buscados em uma varivel
        	cep = resEndereco[0].cep; // Registra as informações do CEP em uma variavel global
        	logradouro = resEndereco[0].logradouro; // Registra as informações do logradouro em uma variavel global
        	numero = resEndereco[0].numero; // Registra as informações do numero em uma variavel global
        	complemento = resEndereco[0].complemento; // Registra as informações do complemento em uma variavel global

        	console.log("Endereço encontrado");

        	resolve(resEndereco); // Retorna as informações para quem chamou a função
        }).catch(error => {
        	reject(error);
        });
	});
}

//Função para buscar o telefone do usuário
function selectTelefone(){
	return new Promise((resolve, reject) => {
		//StringSql para buscar o telefone do usuário que está logando
		let selectTelefone = `select * from tbTelefone where fkUsuario = ${idUsuario}`;
        Database.query(selectTelefone).then(resTelefone => { // Função para executar a query com a string acima
        	// let i = resTelefone.recordsets[0].length;
        	resTelefone = resTelefone.recordsets[0]; // Armazena os dados buscados em uma variavel
        	let x = resTelefone.length; // Armazena a quantidade de registros de telefones tem no id do usuario que está logando
        	
        	for(i = 0; i < x; i++){ // <-- For para inserir todos os telefones do usuário em um vetor
        		// console.log(resTelefone[i].numTelefone);

        		telefones.push(resTelefone[i].numTelefone); // Coloca os telefones dentro do vetor telefones

        	}

        	console.log("Telefone encontrado");
        	resolve(resTelefone); // <-- Retorna as informações para quem chamou a função
        }).catch(error => {
        	reject(error); // <-- Retorna o erro para quem chamou a função
        });
	});
}

//Não mexa nessa linha
module.exports = router;