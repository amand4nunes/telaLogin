const express = require('express');
const router = express.Router();
const Database = require('../Database');
const isNull = require('../script').isNull;
// const Cryptr = require('cryptr');
const config = require('../config');
// const cryptr = new Cryptr(config.security.key);

	//INICIO - Variaveis de last inserted id
	var lastId, idEnderecoUsuario, idEnderecoGalpao, idUsuario;
	//FIM - Variaveis de last inserted id

	// INICIO - Variaveis que receberão os valores do formulário
	var nome, razao, telefone, email, senha, confSenha, cpf_cpnj, cep, rua, estado, cidade, numero, complemento, apelidoGalpao, tamanhoGalpao, qtdAr, cepGalpao, logradouro, estadoGalpao, cidadeGalpao, numeroGalpao, complementoGalpao;
	// FIM - Variaveis que receberão os valores do formulário

router.post('/', (req, res, next) => {

	//INICIO - Pegando valores dos campos de cadastro 
	nome = req.body.nome;
	razao = req.body.razao;
	email = req.body.email;
	senha = req.body.senha;
	confSenha = req.body.confirmar_senha;
	cpf_cpnj = req.body.cpf;
	cep = req.body.cep;
	rua = req.body.rua;
	estado = req.body.estado;
	cidade = req.body.cidade;
	numero = req.body.numero;
	complemento = req.body.complemento;
	apelidoGalpao = req.body.apelidoGalpao;
	tamanhoGalpao = req.body.tamanho;
	qtdAr = req.body.qtd_ar;
	cepGalpao = req.body.cepGalpao;
	logradouro = req.body.ruaGalpao;
	estadoGalpao = req.body.estadoGalpao;
	cidadeGalpao = req.body.cidadeGalpao;
	numeroGalpao = req.body.numeroGalpao;
	complementoGalpao = req.body.complementoGalpao;
	telefone = req.body.telefone;
	//FIM - Pegando valores dos campos de cadastro

	// Mostrando os valores no console do node
	console.log(`name: ${nome}, razao social: ${razao}, telefone: ${telefone}, email: ${email}, senha: ${senha}, confSenha: ${confSenha}, cpf cnpj: ${cpf_cpnj}, cep: ${cep}, rua: ${rua}, estado: ${estado}, cidade:${cidade}, numero: ${numero}, complemento: ${complemento}, Apelido do Galpão: ${apelidoGalpao}, tamanho galpão: ${tamanhoGalpao}, qtd ar: ${qtdAr}, CEP galpão: ${cepGalpao}, Logradouro Galpão: ${logradouro}, estado Galpão: ${estadoGalpao}, cidade galpão: ${cidadeGalpao}, numero do galpao: ${numeroGalpao}, complemento galpao: ${complementoGalpao}`);

	// Chamando função que iniciará inserts em cadeia
	criarUsuario(cpf_cpnj, nome, razao, email, senha, res);
	

});

// Função para criar endereço do usuario
function criarEndereco(cep, estado, cidade, logradouro, numero, complemento, res){

	return new Promise((resolve, reject) => {
		let querystring = `INSERT INTO tbEndereco values ('${cep}', '${estado}', '${cidade}', '${logradouro}', '${numero}', '${complemento}')`;
		Database.query(querystring).then(results => {
			resolve(results);		
			console.log("Endereço criado!");
		}).catch(error => {
			res.status(200).send('erro1');
			console.error(error);
			reject(error);
		});	

	});

}

// Função para pegar o ultimo id inserido de uma tabela especifica.
// A tabela especifica é chamada pelo parametro tabela da função.
// Ela serve para identificar qual a tabela que estamos procurando o ultimo Identity
function getLastId(tabela, res){

	return new Promise((resolve, reject) => {
		Database.query(`SELECT IDENT_CURRENT('${tabela}') as 'lastId'`).then(results => {
			results = results.recordsets[0];
			lastId = results[0].lastId;
			console.log(`Ultimo id da tabela ${tabela} é: ${lastId}`);
			resolve(results);
		}).catch(error => {
			reject(results);
			console.log(error);
		});
	});

}

// Função para criar usuario
// Prestar muita atenção na ordem de chamada das funções dentro desta função
// a ordem de chamada delas é essencial para o funcionamento correto dos inserts
// por conta das chaves estrangeiras do banco de dados.
function criarUsuario(cpf, nomeUsuario, razao, email, senha, res){ 
	
	verificarLogin(email, cpf, res).then(feito => { //<-- Primeiro é chamada a função de verificar se já existe o email ou o cpf
		// A variavel FEITO é onde íra vir a resposta da função verificarLogin
		criar = !feito; // <-- Aqui estamos colocando o contrário da resposta que veio da função verificarLogin para ver se o cadastro poderá ser feito 
		console.log('Criar:', criar);

		if(criar){ // <-- Neste If entramos na condiçaõ que íra validar se o cadastro poderá ser feito, caso seja true então efetuaremos o cadastro
			let tipoIden; // <--Esta variavel ira armazenar o tipoIdentificação do usuário, que será determinado pelo CPF ou CNPJ

			if(cpf.length > 11){ // <-- Aqui se oq tiver no campo de CPF/CNPJ for == a 11 coloca o tipoIden como PF caso contrario como PJ
				tipoIden = 'PF';
			}else{
				tipoIden = 'PJ';
			}

			//Após isso precisamos criar o endereço primeiro pq o usuário precisa da chave estrangeira do endereço
			return new Promise((resolve, reject) => { //<-- Chamamos mais uma função promise para validar as próximas inserções do banco

				criarEndereco(cep, estado, cidade, rua, numero, complemento, res).then(existe => { //<-- Então chamamos está função para crar o endereço
					// Caso a criação endereço de certo, ele irá para essa proxima função
					getLastId('tbEndereco', res).then(feito => { // <-- Esta função serve para recuperar o ultimo id identity da tabela tbendereco
						// Caso a recuperação do id da tabela tbEndereço de certo, ele segue abaixo
						let senhaEncriptada = cryptr.encrypt(senha); // <-- Encripta a senha para n ficar visivel a senha original no banco de dados

						idEnderecoUsuario = Number(lastId); // <-- Coloca o id que buscamos mais acima do endereço em uma variavel global para outras funções usarem

						// Esta linha abaixo é a qury de inserção de usuário no banco de dados
						let querystring = `INSERT INTO tbUsuario values ('${cpf}', '${tipoIden}', '${nomeUsuario}', '${razao}', '${email}', '${senhaEncriptada}', CURRENT_TIMESTAMP, '${idEnderecoUsuario}')`;

						Database.query(querystring).then(results => { // <-- Esta linha chama a função do arquivo Database que insere dados no banco de acordo com a stringSql escrita na variavel querystring
							// Caso a inserção de certo, continua as linhas abaixo
							resolve(results); // <-- Devolve as informações para quem chamou a função
							console.log("Usuário criado!");

							// Abaixo chamamos novamente a função getLastId para recuperar o Id da tabela tbUsuario
							//Usaremos esse id para criar o telefone dele
							getLastId('tbUsuario', res).then(feito => { // <-- Função que retorna o lastId com a tabela tbUsuario como parametro 
								//Caso o select do id de certo, continua as linhas abaixo
								idUsuario = Number(lastId); // <-- Coloca o id buscado na função acima na variavel global para outras funções usarem

								// Após a criação do usuario, é criado o registro do telefone dele
								criarTelefone(telefone, res).then(telCriado => { // <-- Função para criar o telefone do usuario
									// Caso a criação do telefone de certo, continua as linhas de baixo
									criarGalpao(tamanhoGalpao, qtdAr, res); // <-- Função para criar o galpão do usuário

									//Aqui é finalizado as chamadas de inserções das tabelas,
									//Se tudo deu certo até aqui, todas as informações foram inseridas e o usuário, seu endereço, seu telefone e seu galpão
									//estão cadastrados no banco de dados e prontos para uso.
								});

							});
						}).catch(error => { // <-- Caso alguma das funções acima de erro, é aqui que o erro é tratado e mostrado de forma 'amigável' ao usuário
							res.status(200).send('erro1'); // <-- Está função retorna o erro para a pagina html que será tratada lá
							console.error(error); // <-- Mostra o erro no console
							reject(error); // <-- Retorna o erro para quem chamou a função
						});
						
					});
				});

			});
		}else{
			res.status(200).send('erro2'); // <-- Aqui é o retorno para o html da mensagem de email e cpf/cnpj já foram cadastrados
			// console.error(error);
			// reject(error);
		}
	});

}

//Função para criar galpão
function criarGalpao(tamanhoGalpao, qtdAr, res){

	// Para criar um galpão, é necessário criar o endereço dele primeiro, por isso é chamada a função criarEndereco 
	criarEndereco(cepGalpao, estadoGalpao, cidadeGalpao, logradouro, numeroGalpao, complementoGalpao, res).then(feito => { // Caso de certo continua as linhas de baixo
		//Após isso é chamada a função para pegar o id do endereço do galpão
		getLastId('tbEndereco', res).then(feito => { // Caso de certo continua as linhas de baixo
			idEnderecoGalpao = Number(lastId); // <-- Coloca o id do endereço do galpão em uma variavel global

			return new Promise((resolve, reject) => { // É chamada a função para inserir os dados do galpão no banco
				// Abaixo está a stringSql de inserção
				let querystring = `INSERT INTO tbGalpao values ('${apelidoGalpao}', '${tamanhoGalpao}', '${qtdAr}', '${idEnderecoGalpao}', '${idUsuario}')`;
				Database.query(querystring).then(results => { // <-- Função para inserir os dados

					// Caso a inserção de certo, galpão criado, e continua as lihas abaixo.

					console.log("Galpão criado!");
					resolve(results); // Retorna as informações para quem as chamou

					//A criação do galpão é a última, isso significa que se ele foi criado com sucesso, as operações terminaram aqui
					//E a unica coisa que falta é mandar ao usuario que o 'login' dele foi criado com sucesso.
					res.status(200).send('ok'); //Esta função manda ao usuário a informação que está 'ok', e lá no html é feita a mensagem 'bonita' para ele.
				}).catch(error => { // <-- Caso ocorra algum erro, ele é tratado aqui
					res.status(200).send('erro1'); // <-- O erro é enviado para o html e tratado amigavelmente lá
					console.error(error);
					reject(error); // Retorna o erro para quem chamou a função
				});	
			});
		});
	});
}

// função para criar telefone do usuário
function criarTelefone(telefone, res){

	let querystring = `INSERT INTO tbTelefone values ('${telefone}', '${idUsuario}')`; // <-- StringSql para inserção do telefone do usuario

	return new Promise((resolve, reject) => {
		Database.query(querystring).then(results => { // <-- Função que executa a inserção do telefone, caso de certo continua as linhas abaixo
			resolve(results); // <-- Retorna o resultado para quem chamou a função
			console.log("Telefone Criado!");
		}).catch(error => { // <-- Pega e trata se der algum erro 
			console.error(error);
			reject(error); // <-- Retorna o erro para quem chamou
		});
	});

}

// Função para verfificar se o email já foi cadastrado
function verificarLogin(email, documento, res) {
	// Abaixo está a stringSql para verificar se existe algum email ou cpf/cnpj que seja igual ao que o usuário está tentanto criar
    let querystring = `SELECT * FROM tbUsuario where emailusuario = '${email}' or cpf_cnpjusuario = '${documento}';`;
    return new Promise((resolve, reject) => { 
        Database.query(querystring).then(results => {// É chamada a função para verificar esses dados
        	// Caso ela de certo, continua as linhas abaixo
                let existe = results.recordsets[0].length > 0; // Caso oq vier do select no banco tiver como indice maior que 0, isso significa que há dados iguais ao que estão nos campos digitados pelo cliente
                
                resolve(existe); // Retorna as informações para quem chamou a função
                console.log("Informações verificadas!");
            }).catch(error => {// <-- Pega e trata se der algum erro 
                reject(error);// <-- Retorna o erro para quem chamou
            });
        });
}

module.exports = router;