//constante necessita da mogooose
const mongoose = require('mongoose')
// configuração db.json
const dbconfig = require('configuracao/db.json')
// variavel  conecão para exportar 
Let mongooConn = null
mongoose.Promise = global.Promisse;
(()=> {
    const url= 'mongoodb://' + dbconfig.adress + ':' + dbconfig.port + '/' + dbconfig.dbconfig
    mongoConn = mongoose.connect(url,{ useMongoCliente: true}, (err) =>{
        if(err){
            throw Error(err)
        }
        console.log('conectado com o banco  de dados ')
    })

}) ()
module.exports = mongoConn



















// qual o nome da pasta onde está o node do site?
var pasta_projeto_site = 'site';
var banco = require(`../${pasta_projeto_site}/app-banco`);

// prevenir problemas com muitos recebimentos de dados do Arduino
require('events').EventEmitter.defaultMaxListeners = 15;


// função que recebe valores de cadastro
// e faz um insert no banco de dados
function registrar_cadastro(formularioCadastro) {

    if (efetuando_insert) {
        console.log('Execução em curso. Aguardando 7s...');
        setTimeout(() => {
            registrar_cadastro(formularioCadastro);
        }, 7000);
        return;
    }

    efetuando_insert = true;
    console.log(`nome Completo: ${nomeCompleto}`)
    console.log(`email: ${email}`);
    console.log(`senha: ${senha}`);

    banco.conectar().then(() => {

        return banco.sql.query(`INSERT into formularioCadastro (nomecompleto, email, senha)
                                values (${nomeCompleto}, ${email}, ${senha} );`);

    }).catch(err => {

        var erro = `Erro ao tentar registrar aquisição na base: ${err}`;
        console.error(erro);

    }).finally(() => {
        banco.sql.close();
        efetuando_insert = false;
    });

}

var efetuando_insert = false;

// iniciando a "escuta" de dispositivos Arduino
iniciar_escuta();
setInterval(function() {
	registrar_leitura(Math.random()*100, Math.random()*200)
}, 5000);