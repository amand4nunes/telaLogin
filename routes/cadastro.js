const express = require('express');
const router = express.Router();
const Database = require('../Database');
const isNull = require('../script').isNull;
// const Cryptr = require('cryptr');
const config = require('../config');
// const cryptr = new Cryptr(config.security.key);


router.post('/', (req, res, next) => {

	
    var nome = req.body.nome;
    var email = req.body.email;
    var senha = req.body.senha;

    console.log(nome,email,senha);

    criarUsuario(nome,email,senha,res)
	

});


// Função para criar usuario
// Prestar muita atenção na ordem de chamada das funções dentro desta função
// a ordem de chamada delas é essencial para o funcionamento correto dos inserts
// por conta das chaves estrangeiras do banco de dados.
function criarUsuario(nome, email, senha, res){ 
	
	verificarLogin(email, res).then(feito => { //<-- Primeiro é chamada a função de verificar se já existe o email ou o cpf
		// A variavel FEITO é onde íra vir a resposta da função verificarLogin
		criar = !feito; // <-- Aqui estamos colocando o contrário da resposta que veio da função verificarLogin para ver se o cadastro poderá ser feito 
		console.log('Criar:', criar);

        if(criar){
            let string = `insert into formularioCadastro values ('${nome}', '${email}', '${senha}')`;
            Database.query(string).then(results =>{
                res.status(200).send('ok');
            });
        }else{
            res.status(200).send('erro');
        }

	});

}



// Função para verfificar se o email já foi cadastrado
function verificarLogin(email, res) {
	// Abaixo está a stringSql para verificar se existe algum email ou cpf/cnpj que seja igual ao que o usuário está tentanto criar
    let querystring = `SELECT * FROM formularioCadastro where email = '${email}';`;
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